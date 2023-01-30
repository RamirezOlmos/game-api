const { Router } = require('express');
const {
  getVideogames,
  findVideogame,
  createVideogame,
  getVideogameById
} = require("../controllers/videogamesControllers.js");

const videogamesRouter = Router();

videogamesRouter.get('/', async (req, res) => {
  const { name } = req.query;
  let videogames;
  try {
    if (name) videogames = await findVideogame(name);
    else videogames = await getVideogames();
    res.status(200).json(videogames);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

videogamesRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
  console.log(id);

  try {
    const videogame = await getVideogameById(id);
    res.status(200).json(videogame);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

videogamesRouter.post("/", async (req, res) => {
  try {
    const { name, image, description, 
            released, rating, platforms, genres  } = req.body;

    const newVideogame = await createVideogame(name, image, description, 
                                          released, rating, platforms, genres);
    res.status(200).json(newVideogame);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = videogamesRouter;
