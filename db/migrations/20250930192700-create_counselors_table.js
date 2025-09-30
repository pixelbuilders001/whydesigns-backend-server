"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("counselors", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      fullname: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      yearsofexperience: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      bio: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      avatarurl: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      specialties: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: [],
      },
      isactive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      rating: {
        type: Sequelize.DECIMAL(3, 2),
        allowNull: true,
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

    await queryInterface.addIndex("counselors", ["fullname"], {
      name: "counselors_fullname_idx",
    });
    await queryInterface.addIndex("counselors", ["isactive"], {
      name: "counselors_isactive_idx",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("counselors");
  },
};
