const jobMapper = (job) => {
  if (!job || !job.dataValues) {
    return null; // or handle as you see fit
  }

  const { dataValues } = job;
  return {
    id: dataValues.id,
    description: dataValues.description,
    price: parseFloat(dataValues.price).toFixed(2),
    status: dataValues.paid ? "Paid" : "Unpaid",
    contractId: dataValues.ContractId,
  };
};

module.exports = jobMapper;
