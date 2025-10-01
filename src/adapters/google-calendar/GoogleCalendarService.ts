import { google, calendar_v3 } from "googleapis";

interface GoogleCalendarEvent {
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
}

interface CalendarEvent {
  id: string;
  summary: string;
  start: string;
  end: string;
}

export class GoogleCalendarService {
  private auth: any;
  private calendar: calendar_v3.Calendar;

  constructor() {
    // Initialize Google Auth using service account
    this.auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/calendar"],
    });

    this.calendar = google.calendar({ version: "v3", auth: this.auth });
  }

  async createEvent(eventData: GoogleCalendarEvent): Promise<string> {
    try {
      const response = await this.calendar.events.insert({
        calendarId: "primary", // Use the primary calendar
        requestBody: {
          summary: eventData.summary,
          description: eventData.description,
          start: eventData.start,
          end: eventData.end,
          attendees: eventData.attendees,
          status: "confirmed",
          visibility: "default",
        },
      });

      return response.data.id!;
    } catch (error) {
      console.error("Error creating Google Calendar event:", error);
      throw new Error("Failed to create calendar event");
    }
  }

  async updateEvent(eventId: string, eventData: Partial<GoogleCalendarEvent>): Promise<void> {
    try {
      await this.calendar.events.update({
        calendarId: "primary",
        eventId: eventId,
        requestBody: eventData,
      });
    } catch (error) {
      console.error("Error updating Google Calendar event:", error);
      throw new Error("Failed to update calendar event");
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    try {
      await this.calendar.events.delete({
        calendarId: "primary",
        eventId: eventId,
      });
    } catch (error) {
      console.error("Error deleting Google Calendar event:", error);
      throw new Error("Failed to delete calendar event");
    }
  }

  async getEvent(eventId: string): Promise<CalendarEvent | null> {
    try {
      const response = await this.calendar.events.get({
        calendarId: "primary",
        eventId: eventId,
      });

      if (!response.data) {
        return null;
      }

      return {
        id: response.data.id!,
        summary: response.data.summary || "",
        start: response.data.start?.dateTime || "",
        end: response.data.end?.dateTime || "",
      };
    } catch (error) {
      console.error("Error getting Google Calendar event:", error);
      return null;
    }
  }
}

export const googleCalendarService = new GoogleCalendarService();
