const User = require("../models/User");
const Game = require("../models/Game");
const { BadRequestError } = require("../errors");
const _ = require("lodash");

const createGame = async (req, res) => {
    const game = await Game.create({
        gameType: "alias",
    });

    if (!game) {
        throw new BadRequestError("Could't create a game");
    }

    res.status(200).json({ game });
};

const joinGame = async ({ userId, gameId, user }) => {
    if (!userId || !gameId || !user) {
        return false;
    }

    const game = await Game.findOne({
        _id: gameId,
    });
    console.log(game.playersIds);

    if (!game) {
        return false;
    }

    if (game.playersIds.includes(userId)) {
        return game;
    }

    const uniquePlayerIds = _.uniq(game.playersIds);

    game.playersIds.push(userId);
    game.players.push(user);
    const newGame = await game.save();
    return newGame;
};

module.exports = { createGame, joinGame };
