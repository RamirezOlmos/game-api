require("dotenv").config();
const axios = require('axios');
const { API_KEY } = process.env;
const { Generos } = require("../db");

const getGenre = async () => {
  const genresAPI = await axios.
    get(`https://api.rawg.io/api/genres?key=${API_KEY}`)

  genresAPI.data.results.forEach((genre) => {
    Generos.findOrCreate({
      where: {
        name: genre.name
      }
    });
  });

  const genresDB = await Generos.findAll();
  return genresDB;
};


module.exports = {
  getGenre,
};

