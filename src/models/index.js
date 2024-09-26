// src/models/index.js
const Profile = require("./Profile");
const Contract = require("./Contract");
const Job = require("./Job");

// Association
Profile.hasMany(Contract, { foreignKey: "ClientId", as: "ClientContracts" });
Profile.hasMany(Contract, {
  foreignKey: "ContractorId",
  as: "ContractorContracts",
});
Contract.belongsTo(Profile, { foreignKey: "ClientId", as: "Client" });
Contract.belongsTo(Profile, { foreignKey: "ContractorId", as: "Contractor" });
Contract.hasMany(Job, { foreignKey: "ContractId" });
Job.belongsTo(Contract, { foreignKey: "ContractId" });

module.exports = {
  Profile,
  Contract,
  Job,
};
