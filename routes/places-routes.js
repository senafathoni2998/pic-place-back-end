const express = require("express");

const router = express.Router();

router.get("/", (req, res, next) => {
  res.json({ message: "Fetching place success!" });
});

module.exports = router;
