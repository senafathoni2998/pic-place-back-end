const uuid = require("uuid");
const { validationResult } = require("express-validator");
const { getCoordsForAddress } = require("../util/location");
const Place = require("../models/place");
const HttpError = require("../models/http-error");

/**
 * An array of place objects representing famous landmarks.
 *
 * @constant
 * @type {Array<Object>}
 * @property {string} id - Unique identifier for the place.
 * @property {string} title - Name of the place.
 * @property {string} description - Brief description of the place.
 * @property {string} address - Physical address of the place.
 * @property {Object} location - Geographic coordinates of the place.
 * @property {number} location.lat - Latitude of the place.
 * @property {number} location.lng - Longitude of the place.
 * @property {string} creator - Identifier of the user who created the place entry.
 */
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

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  const place = await Place.findById(placeId);
  // const place = DUMMY_PLACES.find((p) => p.id === placeId);
  if (!place) {
    throw new HttpError("Could not find a place for the provided id.", 404);
  }

  res.json({ message: "Fetching place success!", place });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  const places = await Place.find({ creator: userId });
  // const places = DUMMY_PLACES.filter((p) => p.creator === userId);
  if (!places || places.length === 0) {
    return next(
      new HttpError("Could not find places for the provided user id.", 404)
    );
  }

  res.json({ message: "Fetching places for user success!", places });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { title, description, address, creator } = req.body;

  let location;

  try {
    const coordinates = await getCoordsForAddress(address);
    location = {
      lat: coordinates.lat,
      lng: coordinates.lng,
    };
  } catch (err) {
    return next(
      new HttpError("Could not find location for the specified address.", 422)
    );
  }

  // const newPlace = {
  //   id: uuid.v4(),
  //   title,
  //   description,
  //   location,
  //   address,
  //   creator,
  // };

  const newPlace = new Place({
    title,
    description,
    location,
    address,
    creator,
  });

  // DUMMY_PLACES.push(newPlace);
  try {
    await newPlace.save();
    res
      .status(201)
      .json({ message: "Place created successfully!", place: newPlace });
  } catch (err) {
    return next(new HttpError("Creating place failed, please try again.", 500));
  }
};

const updatePlace = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }
  const placeId = req.params.pid;
  const { title, description, location, address } = req.body;
  const placeIndex = DUMMY_PLACES.findIndex((p) => p.id === placeId);
  if (placeIndex < 0) {
    return next(
      new HttpError("Could not find a place for the provided id.", 404)
    );
  }

  const updatedPlace = {
    ...DUMMY_PLACES[placeIndex],
    title,
    description,
    location,
    address,
  };

  DUMMY_PLACES[placeIndex] = updatedPlace;
  res
    .status(200)
    .json({ message: "Place updated successfully!", place: updatedPlace });
};

const deletePlace = (req, res, next) => {
  const placeId = req.params.pid;
  const placeIndex = DUMMY_PLACES.findIndex((p) => p.id === placeId);
  if (placeIndex < 0) {
    return next(
      new HttpError("Could not find a place for the provided id.", 404)
    );
  }

  DUMMY_PLACES.splice(placeIndex, 1);
  res.status(200).json({ message: "Place deleted successfully!" });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
