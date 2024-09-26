const { Op } = require("sequelize");
const sequelize = require("../config/database");
const errorMapper = require("../mappers/error");
const jobMapper = require("../mappers/jobMapper");

const { Profile, Job, Contract } = require("../models/index");

const payJobId = async (req, res) => {
  const { job_id } = req.params;
  const clientId = req.profile.id;

  const transaction = await sequelize.transaction();
  try {
    const job = await Job.findOne({
      where: { id: job_id },
      include: [{ model: Contract, where: { ClientId: clientId } }],
      lock: transaction.LOCK.UPDATE, // Lock contractor balance for update
      transaction,
    });

    if (!job) {
      await transaction.rollback();
      return res.status(404).json({ error: "Job not found" });
    }

    if (job.paid) {
      await transaction.rollback();
      return res.status(400).json({ error: "Job already paid" });
    }

    const client = await Profile.findOne({
      where: { id: clientId },
      lock: transaction.LOCK.UPDATE, // Lock contractor balance for update
      transaction,
    });
    const contractor = await Profile.findOne({
      where: { id: job.Contract.dataValues.ContractorId },
      lock: transaction.LOCK.UPDATE, // Lock contractor balance for update
      transaction,
    });

    if (client.balance < job.price) {
      await transaction.rollback();
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // Deduct from client and add to contractor
    client.balance -= job.price;
    contractor.balance += job.price;

    // Mark job as paid
    job.paid = true;
    job.paymentDate = new Date();

    // Save all changes in transaction
    await client.save({ transaction });
    await contractor.save({ transaction });
    await job.save({ transaction });

    await transaction.commit();
    res.json({ message: "Payment successful" });
  } catch (error) {
    await transaction.rollback();
    const errMsg = "Error while paying for Job :";
    errorMapper(res, error, errMsg);
  }
};

const getAllUnpaidJobs = async (req, res) => {
  const clientId = req.profile.id;

  try {
    let jobs = await Job.findAll({
      where: {
        paid: false,
      },
      include: [
        {
          model: Contract,
          where: {
            [Op.or]: [{ ClientId: clientId }, { ContractorId: clientId }],
            status: "in_progress",
          },
        },
      ],
    });
    if (jobs.length === 0) {
      return res.status(404).json({ error: "No unpaid jobs found." });
    }
    const formattedJobs = jobs.map((job) => jobMapper(job)).filter(Boolean);
    res.json(formattedJobs);
  } catch (error) {
    const errMsg = "Error fetching All Unpaid Jobs:";
    errorMapper(res, error, errMsg);
  }
};

module.exports = {
  payJobId,
  getAllUnpaidJobs,
};
