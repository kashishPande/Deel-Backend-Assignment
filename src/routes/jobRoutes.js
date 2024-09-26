const express = require("express");
const router = express.Router();
const { payJobId, getAllUnpaidJobs } = require("../controllers/jobController");

router.post("/:job_id/pay", payJobId);
router.get("/unpaid", getAllUnpaidJobs);

module.exports = router;
