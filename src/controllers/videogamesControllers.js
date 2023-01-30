require("dotenv").config();
const axios = require('axios');
const { API_KEY } = process.env;
const { Videogame, Generos } = require("../db");

//************************ HELPER FUNCTIONS ***********************************

const createGame = (game) => {
  let description;
  let platforms;
  let genres;
  if(game.description){
    description = game.description.replace(/<[^>]*>/g, "");
  }
  else{
    description = game.description;
  }
  if(game.platforms){
     platforms = game.platforms.map((platform) => platform.platform.name)
      .filter(platform => platform != null).join(', ');
  }
  else{
    platforms = game.platforms;
  }
  if(game.genres){
     genres = game.genres.map((genre) => genre.name)
      .filter(genre => genre != null).join(', ');
  }
  else{
    genres = game.genres;
  }

  
  let fetchGame = {
    id: game.id,
    name: game.name,
    image: game.background_image,
    description: description,
    rating: game.rating,
    released: game.released,
    platforms: platforms,
    genres: genres,
  }
  return fetchGame;
};

const transGenres = (gameJson) => {

  gameJson.genres = gameJson.generos.map((genre) => genre.name)
    .filter(p => p != null)
    .join(', ')

  delete gameJson.generos;

  return gameJson
};

//*********************** CONTROLLERS *****************************************

const getVideogames = async () => {
  let videogames = [];
  let rawgAPI = `https://api.rawg.io/api/games?key=${API_KEY}`;

  for (let i = 0; i < 5; i++) {
    let page = (await axios.get(rawgAPI)).data;

    page.results.forEach((game) => {

      const fetchGame = createGame(game);
      fetchGame.source = 'rawgApi'
      videogames.push(fetchGame);
    });

    rawgAPI = page.next;
  }

  const videogamesDB = await Videogame.findAll({
    include: {
      model: Generos,
      attributes: ['name'],
      through: {
        attributes: [],
      }
    }
  });

  let gamesJson = videogamesDB.map((game) => game.toJSON());

  gamesJson.forEach((gameJson) => {
    let gameReady = transGenres(gameJson);
    gameReady.source = 'DB'

    videogames.push(gameReady);
  });

  return videogames;
};

const findVideogame = async (name) => {
  const videogames = [];
  const videogameDB = await Videogame.findOne({
    where: {
      name: name,
    },
    include: {
      model: Generos,
      attributes: ['name'],
      through: {
        attributes: [],
      }
    }
  });

  let videogameAPI =
    await axios .get(`https://api.rawg.io/api/games?search=${name}&key=${API_KEY}&page_size=20`);

  console.log(videogameAPI);
  const videogamesData = videogameAPI.data.results;
  videogamesData.forEach((game) => {

    const fetchGame = createGame(game);
    fetchGame.source = 'rawgApi'
    videogames.push(fetchGame);
  });

  if (videogameDB) {
    let gameJson = videogameDB.toJSON();
    let gameReady = transGenres(gameJson);
    gameReady.source = 'DB'
    videogames.pop();
    videogames.unshift(gameReady);
    return videogames;
  }
  else {
    return videogames;
  }
};

const getVideogameById = async (id) => {
  if (id.includes("tag")) {
    const videogame = await Videogame.findByPk(id, {
      include: {
        model: Generos,
        attributes: ['name'],
        through: {
          attributes: [],
        }
      }
    });

    let gameJson = videogame.toJSON();
    let gameReady = transGenres(gameJson);

    return gameReady;
  }
  else {
    const videogameAPI = await axios
      .get(`https://api.rawg.io/api/games/${id}?key=${API_KEY}`);

    const gameInfo = videogameAPI.data;

    const newGame = createGame(gameInfo);

    return newGame;
  }
};

const createVideogame = async (name, image, description,
  released, rating, platforms, genres) => {

  let platformsString;
  if(platforms){
    platformsString = platforms.join(', ')
  }

  let newVideogame = await Videogame.create({
    name, image, description, released, rating,
    platforms: platformsString
  });

  await newVideogame.addGeneros(genres);

  return newVideogame;
};


module.exports = {
  getVideogames,
  findVideogame,
  createVideogame,
  getVideogameById
};
