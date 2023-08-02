// IMPORTANDO MONGOOSE E SCHEMA
const mongoose = require("mongoose");
const { Schema } = mongoose;

// CRIANDO SCHEMA
const userSchema = new Schema(
  {
    name: String,
    email: String,
    password: String,
    profileImage: String,
    bio: String,
  },
  {
    timestamps: true,
  }
);

// CRIANDO MODEL UTLIZANDO O SCHEMA ACIMA
const User = mongoose.model("User", userSchema);

module.exports = User;
