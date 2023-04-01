const router = require("express").Router();

const { createGame } = require("../controllers/game");

router.get("/create", createGame);

module.exports = router;
