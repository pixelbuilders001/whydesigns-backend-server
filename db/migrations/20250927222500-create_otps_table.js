"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("otps", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      purpose: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      identifier: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      otp: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      consumedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex("otps", ["userId", "purpose"], {
      name: "otps_userid_purpose_unique",
      unique: true,
    });

    await queryInterface.addIndex("otps", ["purpose"], {
      name: "otps_purpose_idx",
    });

    await queryInterface.addIndex("otps", ["expiresAt"], {
      name: "otps_expiresat_idx",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("otps");
  },
};
