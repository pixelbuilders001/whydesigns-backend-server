'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'gender', {
      type: Sequelize.ENUM('male', 'female', 'other'),
      allowNull: true,
      comment: 'User gender field'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'gender');
  }
};
