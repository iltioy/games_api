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

    try {
        const game = await Game.findOne({
            _id: gameId,
        });
        // console.log(game.playersIds);

        if (!game) {
            return false;
        }

        if (game.playersIds.includes(userId)) {
            return game;
        }

        const uniquePlayerIds = _.uniq(game.playersIds);

        if (uniquePlayerIds?.length >= game.maxPlayers) {
            return false;
        }

        game.playersIds.push(userId);
        game.players.push(user);
        const newGame = await game.save();
        return newGame;
    } catch (error) {
        return false;
    }
};

const leaveAllGames = async (playerId) => {
    try {
        const games = await Game.updateMany(
            { playersIds: playerId },
            {
                $pullAll: {
                    playersIds: [playerId],
                },
                $pull: {
                    players: { userId: playerId },
                },
            },
            { new: true, multi: true }
        );

        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
};

const leaveGame = async ({ userId: playerId, gameId }) => {
    try {
        const games = await Game.updateOne(
            { _id: gameId },
            {
                $pullAll: {
                    playersIds: [playerId],
                },
                $pull: {
                    players: { userId: playerId },
                },
            },
            { new: true, multi: true }
        );

        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
};

const startGame = async ({ userId, gameId }) => {
    try {
        const game = await Game.findOne({ _id: gameId });

        if (!game) {
            return false;
        }

        const isUserInGame = game.playersIds.includes(userId);

        if (isUserInGame) {
            game.gameStatus = "playing";
            await game.save();
            return game;
        } else {
            return false;
        }
    } catch (err) {
        return false;
    }
};

module.exports = {
    createGame,
    joinGame,
    leaveAllGames,
    leaveGame,
    startGame,
};
