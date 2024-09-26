const errorMapper = (res, error, msg) => {
  if (error.name === "SequelizeDatabaseError") {
    console.error("Database error occurred:", error.message, error.stack);
    return res
      .status(500)
      .json({ error: "Database error occurred. Please try again later." });
  } else if (error.name === "SequelizeValidationError") {
    console.error("Validation error:", error.message, error.errors);
    return res.status(400).json({
      error: "Validation error",
      details: error.errors.map((e) => e.message),
    });
  } else {
    // General error handling
    console.error(msg, error.message, error.stack);
    return res
      .status(500)
      .json({ error: "Internal server error. Please try again later." });
  }
};
module.exports = errorMapper;
