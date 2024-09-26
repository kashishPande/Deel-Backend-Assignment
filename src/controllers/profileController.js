const { Profile, Job, Contract } = require("../models/index");
const { Op } = require("sequelize");
const sequelize = require("../config/database");
const errorMapper = require("../mappers/error");
const { clientMapper } = require("../mappers/profileMapper");

const getBestProfession = async (req, res) => {
  const { start, end } = req.query;
  console.log("start ", new Date(start));
  console.log("end ", new Date(end));
  try {
    const professions = await Job.findAll({
      where: {
        paid: true, // Only consider paid jobs
        paymentDate: {
          [Op.gte]: new Date(start),
          [Op.lte]: new Date(end), // Filter by payment date range
        },
      },
      include: [
        {
          model: Contract,
          include: [
            {
              model: Profile,
              as: "Contractor",
              attributes: ["profession"],
            },
          ],
        },
      ],
      attributes: [],
      group: ["Contract.Contractor.profession"],
      order: [[sequelize.fn("sum", sequelize.col("price")), "DESC"]], // Sort by the sum of payments
      raw: true,
      limit: 1, // Get the top profession
      // Sum up the total earnings for each profession
      attributes: [
        [sequelize.col("Contract.Contractor.profession"), "profession"],
        [sequelize.fn("sum", sequelize.col("price")), "total_earned"],
      ],
    });

    if (professions.length > 0) {
      res.status(200).json({
        profession: professions[0].profession,
        totalEarned: professions[0].total_earned,
      });
    } else {
      res
        .status(404)
        .json({ message: "No professions found in the given date range" });
    }
  } catch (error) {
    const errMsg = "Error fetching Best Profession:";
    errorMapper(res, error, errMsg);
  }
};

const getBestClients = async (req, res) => {
  const { start, end, limit = 2 } = req.query;

  // Validate the required parameters
  if (!start || !end) {
    return res
      .status(400)
      .json({ error: "Both startDate and endDate are required" });
  }

  try {
    const bestClients = await Job.findAll({
      where: {
        paid: true, // Only consider paid jobs
        paymentDate: {
          [Op.gte]: new Date(start),
          [Op.lte]: new Date(end), // Filter by payment date range
        },
      },
      include: [
        {
          model: Contract,
          include: [
            {
              model: Profile,
              as: "Client",
              attributes: ["firstName", "lastName", "id"],
            },
          ],
        },
      ],
      group: ["Contract.Client.id"],
      order: [[sequelize.fn("sum", sequelize.col("price")), "DESC"]], // Sort by the sum of payments
      raw: true,
      limit: parseInt(limit), // Get the top clients
      // Sum up the total earnings for each client
      attributes: [
        [sequelize.col("Contract.Client.firstName"), "firstName"],
        [sequelize.col("Contract.Client.lastName"), "lastName"],
        [sequelize.col("Contract.Client.id"), "id"],
        [sequelize.fn("sum", sequelize.col("price")), "paid"],
        "paymentDate",
      ],
    });

    if (bestClients.length > 0) {
      const formattedBestClients = bestClients
        .map((client) => clientMapper(client))
        .filter(Boolean);
      res.status(200).json(formattedBestClients);
    } else {
      res
        .status(404)
        .json({ message: "No Clients found in the given date range" });
    }
  } catch (error) {
    const errMsg = "Error fetching Best Clients:";
    errorMapper(res, error, errMsg);
  }
};

module.exports = {
  getBestProfession,
  getBestClients,
};
