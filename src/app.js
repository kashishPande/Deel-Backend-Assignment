const express = require("express");
const bodyParser = require("body-parser");
const getProfile = require("./middleware/getProfile");
const adminRoutes = require("./routes/adminRoutes");
const balanceRoutes = require("./routes/balanceRoutes");
const contractRoutes = require("./routes/contractRoutes");

const jobRoutes = require("./routes/jobRoutes");

const app = express();

app.use(bodyParser.json());
app.use(getProfile); // Apply profile middleware globally

app.use("/contracts", contractRoutes);
app.use("/jobs", jobRoutes);
app.use("/admin", adminRoutes);
app.use("/balances", balanceRoutes);

module.exports = app;
