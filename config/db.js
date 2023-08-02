const mongoose = require("mongoose");
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;

const conn = async () => {
  try {
    const dbConn = await mongoose.connect(
      `mongodb+srv://${dbUser}:${dbPassword}@cluster0.xr6ksii.mongodb.net/?retryWrites=true&w=majority`
    );

    console.log("conectou!");
    return dbConn;
  } catch (error) {
    console.log(error);
    console.log("nao conseguiu conexão com o DB");
  }
};

conn();
module.exports = conn;
