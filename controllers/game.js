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
            game.gameStatus = "break";

            const turnId = game.gameState.playersTurn;
            const numOfPlayers = _.uniq(game.playersIds).length;

            game.gameState.playersTurnIds = [];

            game.gameState.playersTurnIds.push(
                game.players[turnId % numOfPlayers]._id
            );
            game.gameState.playersTurnIds.push(
                game.players[(turnId + 1) % numOfPlayers]._id
            );

            await game.save();
            return game;
        } else {
            return false;
        }
    } catch (err) {
        return false;
    }
};

const ready = async ({ _id, gameId }) => {
    try {
        const game = await Game.findOne({ _id: gameId });

        if (!game) {
            return false;
        }

        game.gameState.playersReady.push(_id);
        await game.save();

        return game;
    } catch (err) {
        console.log(err);
        return false;
    }
};

const startRound = async ({ gameId }) => {
    try {
        const game = await Game.findOne({ _id: gameId });
    } catch (error) {}
};

const endRound = async ({ gameId }) => {
    try {
        const game = await Game.findOne({ _id: gameId });
        if (!game) {
            return false;
        }
        if (game.gameStatus !== "playing") {
            return false;
        }

        game.gameState.playersTurn += 1;
        const turnId = game.gameState.playersTurn;
        const numOfPlayers = _.uniq(game.playersIds).length;

        game.gameState.prevPlayersIds = game.gameState.playersTurnIds;

        game.gameState.playersTurnIds = [];

        game.gameState.playersTurnIds.push(
            game.players[turnId % numOfPlayers]._id
        );
        game.gameState.playersTurnIds.push(
            game.players[(turnId + 1) % numOfPlayers]._id
        );
        game.gameState.playersReady = [];
        game.gameStatus = "break";

        await game.save();

        return game;
    } catch (error) {
        console.log(error);
    }
};

module.exports = {
    createGame,
    joinGame,
    leaveAllGames,
    leaveGame,
    startGame,
    ready,
    startRound,
    endRound,
};
