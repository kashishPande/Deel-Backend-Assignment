const express = require("express");
const router = express.Router();

const { getBestProfession, getBestClients } = require("../controllers/profileController");

router.get("/best-profession", getBestProfession);
router.get("/best-clients", getBestClients);
module.exports = router;
