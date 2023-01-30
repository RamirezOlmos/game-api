const { Router } = require('express');
const {
  getGenre,
} = require("../controllers/genreContollers.js");

const genreRouter = Router();

genreRouter.get('/', async (req, res) => {
  try {
    const genres = await getGenre();
    res.status(200).json(genres);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


module.exports = genreRouter;
