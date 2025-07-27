const uuid = require("uuid");
const HttpError = require("../models/http-error");

const DUMMY_PLACES = [
  {
    id: "p1",
    title: "Empire State Building",
    description: "A famous skyscraper in New York City.",
    address: "20 W 34th St, New York, NY 10001",
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
    address: "Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France",
    location: {
      lat: 48.858844,
      lng: 2.294351,
    },
    creator: "u2",
  },
  // {
  //     id: "p3",
  //     title: "Colosseum",
  //     description: "An ancient amphitheater in Rome, Italy.",
  //     address: "Piazza del Colosseo, 1, 00184 Roma RM, Italy",
  //     location: {
  //     lat: 41.890251,
  //     lng: 12.492373,
  //     },
  //     creator: "u1",
  // },
];

const getPlaceById = (req, res, next) => {
  const placeId = req.params.pid;
  const place = DUMMY_PLACES.find((p) => p.id === placeId);
  if (!place) {
    throw new HttpError("Could not find a place for the provided id.", 404);
  }

  res.json({ message: "Fetching place success!", place });
};

const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const places = DUMMY_PLACES.filter((p) => p.creator === userId);
  if (places.length === 0) {
    return next(
      new HttpError("Could not find places for the provided user id.", 404)
    );
  }

  res.json({ message: "Fetching places for user success!", places });
};

const createPlace = (req, res, next) => {
  const { title, description, location, address, creator } = req.body;
  const newPlace = {
    id: uuid.v4(),
    title,
    description,
    location,
    address,
    creator,
  };
  DUMMY_PLACES.push(newPlace);
  res
    .status(201)
    .json({ message: "Place created successfully!", place: newPlace });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
