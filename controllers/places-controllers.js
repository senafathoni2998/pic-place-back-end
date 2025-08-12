const uuid = require("uuid");
const fs = require("fs");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const { getCoordsForAddress } = require("../util/location");
const Place = require("../models/place");
const User = require("../models/user");
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

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    return next(new HttpError("Fetching place failed, please try again.", 500));
  }

  if (!place) {
    return next(
      new HttpError("Could not find a place for the provided id.", 404)
    );
  }

  res.json({
    message: "Fetching place success!",
    place: place.toObject({ getters: true }),
  });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let userWithPlaces;
  try {
    userWithPlaces = await User.findById(userId).populate("places");
  } catch (err) {
    return next(
      new HttpError("Fetching places failed, please try again.", 500)
    );
  }
  // const places = DUMMY_PLACES.filter((p) => p.creator === userId);
  if (!userWithPlaces || userWithPlaces.places.length === 0) {
    return next(
      new HttpError("Could not find places for the provided user id.", 404)
    );
  }

  res.json({
    message: "Fetching places for user success!",
    places: userWithPlaces.places.map((place) =>
      place.toObject({ getters: true })
    ),
  });
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
    console.error(err);
    return next(
      new HttpError("Could not find location for the specified address.", 422)
    );
  }

  const newPlace = new Place({
    title,
    description,
    location,
    address,
    creator,
    imageUrl: req.file.path,
  });

  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    return next(new HttpError("Failed to find user.", 500));
  }

  if (!user) {
    return next(new HttpError("Could not find user for provided id.", 404));
  }

  console.log(user);

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await newPlace.save({ session: sess });
    user.places.push(newPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.error(err);
    return next(new HttpError("Creating place failed, please try again.", 500));
  }

  res
    .status(201)
    .json({ message: "Place created successfully!", place: newPlace });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const placeId = req.params.pid;
  const { title, description } = req.body;
  // const placeIndex = DUMMY_PLACES.findIndex((p) => p.id === placeId);
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    return next(new HttpError("Fetching place failed, please try again.", 500));
  }

  if (!place) {
    return next(
      new HttpError("Could not find a place for the provided id.", 404)
    );
  }

  const updatedPlace = {
    ...place.toObject({ getters: true }),
    title,
    description,
  };

  try {
    await place.updateOne(updatedPlace);
  } catch (err) {
    return next(new HttpError("Updating place failed, please try again.", 500));
  }

  res
    .status(200)
    .json({ message: "Place updated successfully!", place: updatedPlace });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId).populate("creator");
  } catch (err) {
    return next(new HttpError("Deleting place failed, please try again.", 500));
  }

  if (!place) {
    return next(
      new HttpError("Could not find a place for the provided id.", 404)
    );
  }

  console.log("PLACE", place);
  const imagePath = place.imageUrl;

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.deleteOne({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    return next(new HttpError("Deleting place failed, please try again.", 500));
  }

  console.log("IMAGE", imagePath);
  fs.unlink(imagePath, (err) => console.log(err));

  res.status(200).json({ message: "Place deleted successfully!" });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
