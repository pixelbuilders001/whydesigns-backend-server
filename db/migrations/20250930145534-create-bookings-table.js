'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable("bookings", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userid: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      counselorid: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'counselors',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      sessiondate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Duration in minutes',
      },
      status: {
        type: Sequelize.ENUM('pending', 'confirmed', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      meetinglink: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      googleeventid: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Google Calendar event ID for integration',
      },
      createdat: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedat: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // Add indexes for better query performance
    await queryInterface.addIndex('bookings', ['userid'], {
      name: 'bookings_userid_idx'
    });

    await queryInterface.addIndex('bookings', ['counselorid'], {
      name: 'bookings_counselorid_idx'
    });

    await queryInterface.addIndex('bookings', ['sessiondate'], {
      name: 'bookings_sessiondate_idx'
    });

    await queryInterface.addIndex('bookings', ['status'], {
      name: 'bookings_status_idx'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable("bookings");
  }
};
