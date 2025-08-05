const HttpError = require("../models/http-error");
const User = require("../models/user");
const { validationResult } = require("express-validator");

/**
 * Fetches all users from the database, excluding their passwords.
 * Responds with a list of users or an error if fetching fails.
 */
const getUsers = async (req, res, next) => {
  let users; // Will hold the list of users fetched from the database
  try {
    //* Find all users, exclude the 'password' field from the result
    users = await User.find({}, "-password");
  } catch (err) {
    //* If an error occurs during database operation, forward an error to the error handler
    return next(
      new HttpError("Fetching users failed, please try again later.", 500)
    );
  }
  if (!users) {
    //* If no users are found, forward a 404 error
    return next(new HttpError("No users found.", 404));
  }
  //* Respond with the list of users, converting each to a plain JS object with getters applied
  res
    .status(200)
    .json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }
  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (err) {
    return next(new HttpError("Signing up failed, please try again.", 500));
  }

  if (existingUser) {
    return next(
      new HttpError("User exists already, please login instead.", 422)
    );
  }

  let newUser = new User({
    name,
    email,
    password,
    image:
      "https://images.pexels.com/photos/839011/pexels-photo-839011.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
    places: [],
  });

  try {
    await newUser.save();
  } catch (err) {
    return next(new HttpError("Signing up failed, please try again.", 500));
  }

  const { password: _, ...userWithoutPassword } = newUser.toObject({
    getters: true,
  });

  res
    .status(201)
    .json({ message: "User created successfully!", user: userWithoutPassword });
};

const login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }
  const { email, password } = req.body;

  let identifiedUser;
  try {
    identifiedUser = await User.findOne({ email, password });
  } catch (err) {
    return next(new HttpError("Logging in failed, please try again.", 500));
  }

  if (!identifiedUser || identifiedUser.password !== password) {
    return next(
      new HttpError("Invalid credentials, could not log you in.", 401)
    );
  }

  const { password: _, ...userWithoutPassword } = identifiedUser.toObject({
    getters: true,
  });

  res
    .status(200)
    .json({ message: "Logged in successfully!", user: userWithoutPassword });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
