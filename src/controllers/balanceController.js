const { Profile, Job, Contract } = require("../models/index");
const { Op } = require("sequelize");
const sequelize = require("../config/database");

const depositMoney = async (req, res) => {
  const { userId } = req.params;
  const { amount } = req.body;
  if (!amount) {
    return res.status(404).json({ message: "Deposit Amount not found" });
  }
  // Start a transaction
  const transaction = await sequelize.transaction();
  try {
    const client = await Profile.findOne({
      where: { id: userId, type: "client" },
      lock: transaction.LOCK.UPDATE, // Lock the client row to prevent concurrent writes
      transaction,
    });

    if (!client) {
      await transaction.rollback();
      return res.status(404).json({ message: "Client not found" });
    }

    /**Get the total unpaid jobs for the client*/
    const unpaidJobs = await Job.findAll({
      where: {
        paid: false,
      },
      include: [
        {
          model: Contract,
          where: {
            clientId: userId,
            status: "in_progress",
          },
        },
      ],
      transaction,
    });
    // Calculate the total unpaid job amount
    const totalUnpaidAmount = unpaidJobs.reduce(
      (total, job) => total + parseFloat(job.price),
      0
    );
    // Calculate the deposit limit (25% of total unpaid job amount)
    const depositLimit = totalUnpaidAmount * 0.25;
    // Validate the deposit amount
    if (amount > depositLimit) {
      return res.status(400).json({
        message: `You can only deposit up to 25% of your unpaid jobs amount. Maximum deposit allowed is ${depositLimit.toFixed(
          2
        )}`,
      });
    }

    //Update the client's balance
    client.balance += parseFloat(amount);
    await client.save({ transaction });
    await transaction.commit();

    // Respond with the updated balance
    res.status(200).json({
      message: "Deposit successful",
      updatedBalance: client.balance,
    });
  } catch (error) {
    await transaction.rollback();
    const errMsg = "Error Depositing money";
    errorMapper(res, error, errMsg);
  }
};

module.exports = depositMoney;
