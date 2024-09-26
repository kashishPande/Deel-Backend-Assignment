const express = require("express");
const  depositMoney  = require("../controllers/balanceController");
const router = express.Router();

router.post("/deposit/:userId", depositMoney);

module.exports = router;
