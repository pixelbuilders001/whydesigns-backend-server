import {
  AlreadyExistsError,
  NotFoundError,
  BadRequestError,
} from "../../../../error";
import { validatePayloadSchema } from "../../../../utils/zod";
import { IBookingRepository } from "../repository/bookingRepository";
import {
  BookingSchema,
  BookingUpdateSchema,
  BookingFilterSchema,
  BookingValidation,
  BookingUpdateValidation,
  BookingFilterValidation,
} from "./validation";
import { addMinutes, isBefore, isAfter, parseISO } from "date-fns";
import { googleCalendarService } from "../../../../adapters/google-calendar/GoogleCalendarService";

export default class BookingService {
  private bookingRepository: IBookingRepository;

  constructor(bookingRepository: IBookingRepository) {
    this.bookingRepository = bookingRepository;
  }

  async create(payload: BookingValidation) {
    console.log("data", payload);
    const data = validatePayloadSchema(BookingSchema, payload);

    // Parse the session date
    const sessionDate = parseISO(data.sessionDate);

    // Validate that the session date is in the future
    if (isBefore(sessionDate, new Date())) {
      throw new BadRequestError("Session date must be in the future");
    }

    // Check if counselor is available at this time
    const conflictingBooking =
      await this.bookingRepository.findByCounselorAndDate(
        data.counselorId,
        sessionDate
      );

    if (conflictingBooking) {
      throw new BadRequestError("Counselor is not available at this time slot");
    }

    // Check if user already has a booking at this time
    const userConflictingBooking =
      await this.bookingRepository.findByUserAndDate(data.userId, sessionDate);

    if (userConflictingBooking) {
      throw new BadRequestError("You already have a booking at this time");
    }

    // Create the booking with parsed date
    const created = await this.bookingRepository.create({
      ...data,
      sessionDate,
      status: "pending",
    });

    // Try to create Google Calendar event for the booking
    try {
      const endTime = addMinutes(sessionDate, data.duration);

      const calendarEvent = await googleCalendarService.createEvent({
        summary: `Counseling Session with Counselor`,
        description: `Counseling session booking\n\nBooking ID: ${
          created.id
        }\nDuration: ${data.duration} minutes\nNotes: ${
          data.notes || "No additional notes"
        }`,
        start: {
          dateTime: sessionDate.toISOString(),
          timeZone: "UTC", // You might want to make this configurable
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: "UTC",
        },
        attendees: [
          // You might want to add counselor and user emails here
          // { email: 'counselor@example.com', displayName: 'Counselor Name' },
          // { email: 'user@example.com', displayName: 'User Name' },
        ],
      });

      // Update the booking with the Google Calendar event ID
      await this.bookingRepository.update(created.id, {
        googleEventId: calendarEvent,
        meetingLink: `https://calendar.google.com/calendar/event?eid=${calendarEvent}`, // Or use a proper meeting link
      });

      // Fetch the updated booking
      const updatedBooking = await this.bookingRepository.getById(created.id);
      return updatedBooking;
    } catch (error) {
      console.error("Failed to create Google Calendar event:", error);
      // Don't fail the booking creation if calendar event creation fails
      return created;
    }
  }

  async update(
    id: number,
    payload: BookingUpdateValidation,
    userId?: number,
    userRole?: string
  ) {
    const booking = await this.bookingRepository.getById(id);
    if (!booking) throw new NotFoundError("Booking not found");

    // Check if user has permission to update this booking
    if (userRole !== "admin" && booking.userId !== userId) {
      throw new BadRequestError("You can only update your own bookings");
    }

    const data = validatePayloadSchema(BookingUpdateSchema, payload);

    // If updating session date, validate availability
    if (data.sessionDate) {
      const newSessionDate = parseISO(data.sessionDate);

      // Validate that the new session date is in the future
      if (isBefore(newSessionDate, new Date())) {
        throw new BadRequestError("New session date must be in the future");
      }

      // Check for conflicts with the new date
      const conflictingBooking =
        await this.bookingRepository.findByCounselorAndDate(
          booking.counselorId,
          newSessionDate
        );

      // Allow updating if it's the same booking or no conflict
      if (conflictingBooking && conflictingBooking.id !== id) {
        throw new BadRequestError(
          "Counselor is not available at the new time slot"
        );
      }

      // Check if user has other bookings at this time
      const userConflictingBooking =
        await this.bookingRepository.findByUserAndDate(
          booking.userId,
          newSessionDate
        );

      if (userConflictingBooking && userConflictingBooking.id !== id) {
        throw new BadRequestError("You already have a booking at this time");
      }

      data.sessionDate = newSessionDate.toISOString();
    }

    // If updating duration, validate it doesn't conflict with adjacent bookings
    if (data.duration && data.sessionDate) {
      // data.sessionDate could be a string (original input) or Date object (after parsing)
      const sessionDate =
        typeof data.sessionDate === "string"
          ? parseISO(data.sessionDate)
          : data.sessionDate;
      const endTime = addMinutes(sessionDate, data.duration);

      // Check for overlapping bookings
      const overlappingBookings =
        await this.bookingRepository.findBookingsInDateRange(
          booking.counselorId,
          sessionDate,
          endTime
        );

      // Filter out the current booking
      const conflictingBookings = overlappingBookings.filter(
        (b) => b.id !== id
      );

      if (conflictingBookings.length > 0) {
        throw new BadRequestError(
          "New duration conflicts with existing bookings"
        );
      }
    }

    // Update Google Calendar event if date/duration changed
    if ((data.sessionDate || data.duration) && booking.googleEventId) {
      try {
        const sessionDate = data.sessionDate || booking.sessionDate;
        const duration = data.duration || booking.duration;
        const sessionDateObj =
          typeof sessionDate === "string" ? parseISO(sessionDate) : sessionDate;
        const endTime = addMinutes(sessionDateObj, duration);

        await googleCalendarService.updateEvent(booking.googleEventId, {
          start: {
            dateTime: sessionDateObj.toISOString(),
            timeZone: "UTC",
          },
          end: {
            dateTime: endTime.toISOString(),
            timeZone: "UTC",
          },
        });
      } catch (error) {
        console.error("Failed to update Google Calendar event:", error);
      }
    }

    const updated = await this.bookingRepository.update(id, data as any);
    return updated;
  }

  async confirmBooking(id: number, counselorId?: number, userRole?: string) {
    const booking = await this.bookingRepository.getById(id);
    if (!booking) throw new NotFoundError("Booking not found");

    // Only counselor or admin can confirm bookings
    if (userRole !== "admin" && booking.counselorId !== counselorId) {
      throw new BadRequestError(
        "Only the assigned counselor can confirm this booking"
      );
    }

    if (booking.status !== "pending") {
      throw new BadRequestError("Only pending bookings can be confirmed");
    }

    // If there's no meeting link, generate one or use the calendar link
    let meetingLink = booking.meetingLink;
    if (!meetingLink && booking.googleEventId) {
      meetingLink = `https://calendar.google.com/calendar/event?eid=${booking.googleEventId}`;
    }

    const updated = await this.bookingRepository.update(id, {
      status: "confirmed",
      meetingLink: meetingLink || "Meeting link will be provided by counselor",
    });

    return updated;
  }

  async cancelBooking(
    id: number,
    userId?: number,
    counselorId?: number,
    userRole?: string
  ) {
    const booking = await this.bookingRepository.getById(id);
    if (!booking) throw new NotFoundError("Booking not found");

    // Only the booking owner, assigned counselor, or admin can cancel
    const canCancel =
      userRole === "admin" ||
      booking.userId === userId ||
      booking.counselorId === counselorId;

    if (!canCancel) {
      throw new BadRequestError(
        "You don't have permission to cancel this booking"
      );
    }

    if (booking.status === "completed") {
      throw new BadRequestError("Completed bookings cannot be cancelled");
    }

    // Delete the Google Calendar event when cancelling
    if (booking.googleEventId) {
      try {
        await googleCalendarService.deleteEvent(booking.googleEventId);
      } catch (error) {
        console.error("Failed to delete Google Calendar event:", error);
      }
    }

    const updated = await this.bookingRepository.update(id, {
      status: "cancelled",
      googleEventId: undefined, // Remove the event ID since the event is deleted
    });

    return updated;
  }

  async getById(id: number, userId?: number, userRole?: string) {
    const booking = await this.bookingRepository.getById(id);
    if (!booking) throw new NotFoundError("Booking not found");

    // Check if user has permission to view this booking
    if (userRole !== "admin" && booking.userId !== userId) {
      throw new BadRequestError("You can only view your own bookings");
    }

    return booking;
  }

  async list(
    limit: number,
    page: number,
    filterQuery: any,
    userId?: number,
    userRole?: string
  ) {
    const filter = validatePayloadSchema(BookingFilterSchema, filterQuery);

    // If not admin, only show user's own bookings
    if (userRole !== "admin" && userId) {
      filter.userId = userId;
    }

    return this.bookingRepository.list(limit, page, filter as any);
  }

  async delete(id: number, userId?: number, userRole?: string) {
    const booking = await this.bookingRepository.getById(id);
    if (!booking) throw new NotFoundError("Booking not found");

    // Check if user has permission to delete this booking
    if (userRole !== "admin" && booking.userId !== userId) {
      throw new BadRequestError("You can only delete your own bookings");
    }

    // Don't allow deletion of confirmed or completed bookings
    if (booking.status === "confirmed" || booking.status === "completed") {
      throw new BadRequestError(
        "Cannot delete confirmed or completed bookings"
      );
    }

    // Delete the Google Calendar event if it exists
    if (booking.googleEventId) {
      try {
        await googleCalendarService.deleteEvent(booking.googleEventId);
      } catch (error) {
        console.error("Failed to delete Google Calendar event:", error);
      }
    }

    const deleted = await this.bookingRepository.delete(id);
    if (!deleted) throw new NotFoundError("Booking not found");
    return deleted;
  }

  async completeBooking(id: number, counselorId?: number, userRole?: string) {
    const booking = await this.bookingRepository.getById(id);
    if (!booking) throw new NotFoundError("Booking not found");

    // Only counselor or admin can complete bookings
    if (userRole !== "admin" && booking.counselorId !== counselorId) {
      throw new BadRequestError(
        "Only the assigned counselor can complete this booking"
      );
    }

    if (booking.status !== "confirmed") {
      throw new BadRequestError("Only confirmed bookings can be completed");
    }

    const updated = await this.bookingRepository.update(id, {
      status: "completed",
    });
    return updated;
  }

  async getUpcomingBookings(
    counselorId?: number,
    userId?: number,
    userRole?: string
  ) {
    // If not admin, only show user's own bookings or counselor's bookings
    if (userRole !== "admin") {
      if (userId) {
        return this.bookingRepository.findUpcomingBookings(undefined, userId);
      }
      if (counselorId) {
        return this.bookingRepository.findUpcomingBookings(counselorId);
      }
    }

    return this.bookingRepository.findUpcomingBookings(counselorId, userId);
  }
}
