const Photo = require("../models/Photo");
const User = require("../models/User");
const mongoose = require("mongoose");

// INSERT A PHOTO, WITH AN USER RELATED TO IT / FOTO COM USER RELACIONADO A TAL
const insertPhoto = async (req, res) => {
  const { title } = req.body;
  const image = req.file.filename;

  const reqUser = req.user;

  const user = await User.findById(reqUser._id);

  // Create a photo
  const newPhoto = await Photo.create({
    image,
    title,
    userId: user._id,
    userName: user.name,
  });

  // IF PHOTO WAS CREATED SUCCESSFULLY, RETURN DATA / SE FOTO FOI CRIADA COM SUCESSO, RETORNAR DATA
  if (!newPhoto) {
    res.status(422).json({
      errors: ["Houve um problema, por favor tente novamente mais tarde."],
    });
  }

  res.status(201).json(newPhoto);
};

//REMOVE A PHOTO FROM DB
const deletePhoto = async (req, res) => {
  const { id } = req.params;

  const reqUser = req.user;

  try {
    const photo = await Photo.findById(new mongoose.Types.ObjectId(id));

    //CHECK IF PHOTO EXISTS
    if (!photo) {
      res.status(404).json({ errors: ["Foto não encontrada!"] });
      return;
    }

    //CHECK IF PHOTO BELONGS TO USER
    if (!photo.userId.equals(reqUser._id)) {
      res.status(422).json({
        errors: ["Ocorreu um erro, por favor tente novamente mais tarde."],
      });
      return;
    }

    await Photo.findByIdAndDelete(photo._id);

    res
      .status(200)
      .json({ id: photo._id, message: "Foto excluída com sucesso." });
  } catch (error) {
    res.status(404).json({ errors: ["Foto não encontrada!"] });
    return;
  }
};

//GET ALL PHOTOS
const getAllPhotos = async (req, res) => {
  const photos = await Photo.find({})
    .sort([["createdAt", -1]])
    .exec();

  return res.status(200).json(photos);
};

//GET ALL PHOTOS FROM USER
const getUserPhotos = async (req, res) => {
  const { id } = req.params;

  const photos = await Photo.find({ userId: id })
    .sort([["createdAt", -1]])
    .exec();
  return res.status(200).json(photos);
};

// GET PHOTO BY ID
const getPhotoById = async (req, res) => {
  const { id } = req.params;

  try {
    const photo = await Photo.findById(id);

    // IF CHECK FOTO EXISTS
    if (!photo) {
      res.status(404).json({ errors: ["Foto não encontrada!"] });
      return;
    }

    res.status(200).json(photo);
  } catch (error) {
    res.status(404).json({ errors: ["Foto não encontrada!"] });
  }
};

// UPDATE A PHOTO
const updatePhoto = async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  const reqUser = req.user;
  const photo = await Photo.findById(id);

  //CHECK IF PHOTO EXISTS
  if (!photo) {
    res.status(404).json({ errors: ["Foto não encontrada."] });
    return;
  }

  // CHECK IF PHOTO BELONGS TO USER / CHECAR SE A FOTO PERTENCE AO USER
  if (!photo.userId.equals(reqUser._id)) {
    res.status(422).json({
      errors: ["Ocorreu um erro, por favor tente novamente mais tarde."],
    });
    return;
  }

  if (title) {
    photo.title = title;
  }

  await photo.save();

  res.status(200).json({ photo, message: "Foto atualizada com sucesso." });
};

// LIKE FUNCTIONALITY / FUNÇÃO DE LIKE DA FOTO
const likePhoto = async (req, res) => {
  const { id } = req.params;

  const reqUser = req.user;

  const photo = await Photo.findById(id);

  // Check if photo exists
  if (!photo) {
    res.status(404).json({ errors: ["Foto não encontrada!"] });
    return;
  }

  // Check if user already liked the photo
  if (photo.likes.includes(reqUser._id)) {
    res.status(422).json({ errors: ["Você já curtiu esta foto."] });
    return;
  }

  // Put user id in array of likes
  photo.likes.push(reqUser._id);

  await photo.save();

  res.status(200).json({
    photoId: id,
    userId: reqUser._id,
    message: "A foto foi curtida!",
  });
};

// DESLIKE FUNCTIONALITY / FUNÇÃO DE DESLIKE DA FOTO
const deslikePhoto = async (req, res) => {
  const { id } = req.params;
  const reqUser = req.user;

  const photo = await Photo.findById(id);

  // CHECK IF PHOTO EXISTS
  if (!photo) {
    res.status(404).json({ errors: ["Foto não encontrada."] });
    return;
  }

  const indice = photo.likes.indexOf(reqUser._id);

  // IF PHOTO INCLUDE USERID, DELETE LIKE.
  if (photo.likes.includes(reqUser._id)) {
    photo.likes.splice(indice, 1);
  }

  await photo.save();

  return res.status(200).json({
    photoId: id,
    userId: reqUser._id,
    message: "A foto foi descurtida!",
  });
};

//COMEMENT FUNCTIONALITY / FUNÇÃO DE COMENTAR NA FOTO
const commentPhoto = async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;

  const reqUser = req.user;

  const user = await User.findById(reqUser._id);

  const photo = await Photo.findById(id);

  //CHECK IF PHOTO EXISTS
  if (!photo) {
    res.status(400).json({ errors: ["Foto não encontrada."] });
    return;
  }

  //PUT COMMENT IN THE ARRAY OF COMMENTS
  const userComment = {
    comment,
    userName: user.name,
    userImage: user.profileImage,
    userId: user._id,
  };

  photo.comments.push(userComment);

  await photo.save();
  res.status(200).json({
    comment: userComment,
    message: "O comentário foi adicionado com sucesso.",
  });
};

//SEARCH PHOTOS BY TITLE
const searchPhotos = async (req, res) => {
  const { q } = req.query;

  const photos = await Photo.find({ title: new RegExp(q, "i") }).exec();

  res.status(200).json(photos);
};

module.exports = {
  insertPhoto,
  deletePhoto,
  getAllPhotos,
  getUserPhotos,
  getPhotoById,
  updatePhoto,
  likePhoto,
  deslikePhoto,
  commentPhoto,
  searchPhotos,
};
