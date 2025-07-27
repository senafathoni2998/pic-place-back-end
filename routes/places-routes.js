const express = require("express");

const router = express.Router();

const placesControllers = require("../controllers/places-controllers");

router.get("/:pid", placesControllers.getPlaceById);

router.get("/user/:uid", placesControllers.getPlacesByUserId);

router.patch("/:pid", placesControllers.updatePlace);

router.delete("/:pid", placesControllers.deletePlace);

router.post("/", placesControllers.createPlace);

module.exports = router;
