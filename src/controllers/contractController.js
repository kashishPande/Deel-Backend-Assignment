const { Profile, Contract } = require("../models/index");
const { Op } = require("sequelize");
const sequelize = require("../config/database");
const errorMapper = require("../mappers/error");

const getContractById = async (req, res) => {
  const { id } = req.params;
  const profileId = req.profile.id;
  const type = req.profile.type;

  try {
    const includeProfile = {
      client: {
        model: Profile,
        as: "Client",
        where: { id: profileId },
        required: true,
      },
      contractor: {
        model: Profile,
        as: "Contractor",
        where: { id: profileId },
        required: true,
      },
    };
    const contract = await Contract.findOne({
      where: { id },
      include: [includeProfile[type]],
    });

    if (!contract) {
      return res
        .status(404)
        .send("Contract not found or you do not have access");
    }

    res.json(contract);
  } catch (error) {
    const errMsg = "Error fetching All Unpaid Jobs:";
    errorMapper(res, error, errMsg);
  }
};

const getAllNonTerminatedContracts = async (req, res) => {
  const profileId = req.profile.id;
  try {
    const contracts = await Contract.findAll({
      where: {
        [Op.or]: [{ ClientId: profileId }, { contractorId: profileId }],
        status: { [Op.ne]: "terminated" },
      },
    });

    res.json(contracts);
  } catch (error) {
    const errMsg = "Error fetching All Unpaid Jobs:";
    errorMapper(res, error, errMsg);
  }
};

module.exports = { getAllNonTerminatedContracts, getContractById };
