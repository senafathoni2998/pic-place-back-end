const express = require("express");

const router = express.Router();

const DUMMY_PLACES = [
  {
    id: "p1",
    title: "Empire State Building",
    description: "A famous skyscraper in New York City.",
    location: {
      lat: 40.748817,
      lng: -73.985428,
    },
    creator: "u1",
  },
  {
    id: "p2",
    title: "Eiffel Tower",
    description: "An iconic landmark in Paris, France.",
    location: {
      lat: 48.858844,
      lng: 2.294351,
    },
    creator: "u2",
  },
];

router.get("/:pid", (req, res, next) => {
  const placeId = req.params.pid;
  const place = DUMMY_PLACES.find((p) => p.id === placeId);
  if (!place) {
    return res.status(404).json({ message: "Place not found!" });
  }

  res.json({ message: "Fetching place success!", place });
});

router.get("/user/:uid", (req, res, next) => {
  const userId = req.params.uid;
  const places = DUMMY_PLACES.filter((p) => p.creator === userId);
  if (places.length === 0) {
    return res.status(404).json({ message: "No places found for this user!" });
  }

  res.json({ message: "Fetching places for user success!", places });
});

module.exports = router;
