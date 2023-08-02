// REQUISITANDO MODEL DO USER
const User = require("../models/User");

const mongoose = require("mongoose");

// IMPORTANDO OS TOKENS DE VALIDAÇÃO
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const jwtSecret = process.env.JWT_SECRET;

// CRIANDO USER TOKEN
const generateToken = (id) => {
  return jwt.sign({ id }, jwtSecret, {
    expiresIn: "7d",
  });
};

// REGISTRAR USER E LOGIN
const register = async (req, res) => {
  const { name, email, password } = req.body;

  // CHECK SE USER EXISTE
  const user = await User.findOne({ email });

  if (user) {
    res.status(422).json({ errors: ["Por favor, utilize outro e-mail."] });
    return;
  }

  // GENERATE PASSWORD HASH
  const salt = await bcrypt.genSalt();
  const passwordHash = await bcrypt.hash(password, salt);

  //CREATE USER
  const newUser = await User.create({
    name,
    email,
    password: passwordHash,
  });

  // IF USER WAS CREATED SUCCESSFULLY, RETURN THE TOKEN
  if (!newUser) {
    res.status(422).json({
      errors: ["Houve um erro, por favor tente novamente mais tarde."],
    });
    return;
  }

  res.status(201).json({
    _id: newUser._id,
    token: generateToken(newUser._id),
  });
};

// Login do usuário - sign user in
const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  // CHECK IF USER EXISTS
  if (!user) {
    res.status(404).json({ errors: ["Usuário não encontrado."] });
    return;
  }

  // CHECK IF PASSWORD MATCHES
  if (!(await bcrypt.compare(password, user.password))) {
    res.status(422).json({ errors: ["Senha inválida."] });
    return;
  }

  // RETURN USER WITH TOKEN
  res.status(201).json({
    _id: user._id,
    profileImage: user.profileImage,
    token: generateToken(user._id),
  });
};

// GET CURRENT LOGGED IN USER - ACESSAR PERFIL USER
const getCurrentUser = async (req, res) => {
  const user = req.user;

  res.status(200).json(user);
};

// UPDATE AN USER
const update = async (req, res) => {
  const { name, password, bio } = req.body;

  let profileImage = null;

  if (req.file) {
    profileImage = req.file.filename;
  }

  const reqUser = req.user;

  const user = await User.findById(reqUser._id).select("-password");

  if (name) {
    user.name = name;
  }

  if (password) {
    // GENERATE PASSWORD HASH
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    user.password = passwordHash;
  }

  if (profileImage) {
    user.profileImage = profileImage;
  }

  if (bio) {
    user.bio = bio;
  }

  await user.save();

  res.status(200).json(user);
};

// GET USER BY ID
const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(new mongoose.Types.ObjectId(id)).select(
      "-password"
    );
    // CHECK IF USER EXISTS
    if (!user) {
      res.status(404).json({ errors: ["Usuário não encontrado."] });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ errors: ["Usuário não encontrado."] });
    return;
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  update,
  getUserById,
};
