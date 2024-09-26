const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');

class Profile extends Sequelize.Model {}
Profile.init(
  {
    firstName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    profession: {
      type: Sequelize.STRING,
      allowNull: false
    },
    balance:{
      type:Sequelize.DECIMAL(12,2),
      defaultValue: 0.00, // Default balance to zero
      allowNull: false,
    },
    type: {
      type: Sequelize.ENUM('client', 'contractor'),
      allowNull: false, // Ensure that type is required
    }
  },
  {
    sequelize,
    modelName: 'Profile'
  }
);

module.exports = Profile;
