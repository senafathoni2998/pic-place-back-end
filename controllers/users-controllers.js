const HttpError = require("../models/http-error");
const uuid = require("uuid");

const USERS = [
  {
    id: "u1",
    name: "Max Schwarz",
    email: "max.schwarz@example.com",
    password: "max123",
    image:
      "https://images.pexels.com/photos/839011/pexels-photo-839011.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
    places: 3,
  },
];

const getUsers = (req, res, next) => {
  const filteredUsers = USERS.map(({ password, ...user }) => user);
  res.status(200).json({ users: filteredUsers });
};

const signup = (req, res, next) => {
  const { name, email, password } = req.body;
  const hasUser = USERS.find((u) => u.email === email);
  if (hasUser) {
    return next(
      new HttpError("User exists already, please login instead.", 422)
    );
  }
  const newUser = {
    id: uuid.v4(),
    name,
    email,
    password,
    image:
      "https://images.pexels.com/photos/839011/pexels-photo-839011.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
    places: 0,
  };
  USERS.push(newUser);

  const { password: _, ...userWithoutPassword } = newUser;

  res
    .status(201)
    .json({ message: "User created successfully!", user: userWithoutPassword });
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  const identifiedUser = USERS.find(
    (u) => u.email === email && u.password === password
  );

  if (!identifiedUser) {
    return next(
      new HttpError("Invalid credentials, could not log you in.", 401)
    );
  }

  const { password: _, ...userWithoutPassword } = identifiedUser;

  res
    .status(200)
    .json({ message: "Logged in successfully!", user: userWithoutPassword });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
