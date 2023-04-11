require("dotenv").config();
const { generateWords } = require("../games/alias");
const { findUser } = require("../controllers/user");
const {
    joinGame,
    leaveAllGames,
    leaveGame,
    startGame,
    ready,
    startRound,
    endRound,
} = require("../controllers/game");
const _ = require("lodash");
const Game = require("../models/Game");

module.exports = (io) => {
    io.on("connection", (socket) => {
        socket.on("join_room", async (body) => {
            try {
                if (!body) {
                    return;
                }
                const { userId, gameId } = body;
                const user = await findUser(userId);
                if (!user) {
                    return;
                }

                socket.data._id = user?._id.toString();
                socket.data.userId = user?.userId.toString();

                const game = await joinGame({ userId, gameId, user });
                if (game && user) {
                    socket.join(game._id.toString());
                    // socket.broadcast.to(game._id.toString()).emit("player_joined", {
                    //     username: user.username,
                    //     _id: user._id,
                    // });

                    // io.to(socket.id).emit("game_state", game);
                    io.to(game._id.toString()).emit("game_state", {
                        players: game.players,
                        gameStatus: game.gameStatus,
                        gameState: game.gameState,
                        gameType: game.gameType,
                        maxPlayers: game.maxPlayers,
                        gameStack: game.gameStack,
                        _id: game._id,
                    });
                    // io.to(socket.id).emit("game_state", game);
                }
            } catch (err) {
                console.log(err);
            }
        });

        socket.on("disconnecting", () => {
            try {
                const rooms = Array.from(socket.rooms);

                for (let i = 0; i < rooms.length; i++) {
                    io.to(rooms[i]).emit("player_left", {
                        playerId: socket.data._id,
                    });
                }

                leaveAllGames(socket.data.userId);
            } catch (err) {
                console.log(err);
            }
        });

        socket.on("leave_room", ({ userId, gameId }) => {
            try {
                if (!gameId) {
                    return;
                }
                socket.leave(gameId);
                io.to(gameId).emit("player_left", {
                    playerId: socket.data._id,
                    game_id: gameId,
                });

                if (!userId) {
                    return;
                }

                leaveGame({ userId, gameId });
            } catch (err) {
                console.log(err);
            }
        });

        socket.on("start_round", async (gameId) => {
            try {
                if (!gameId) return;

                const game = await Game.findOne({ _id: gameId });
                game.gameStatus = "playing";
                console.log(game);
                await game.save();
            } catch (err) {
                console.log(err);
            }
        });

        socket.on("start_game", async ({ gameId, userId }) => {
            try {
                if (!userId || !gameId) {
                    return;
                }
                const game = await startGame({ userId, gameId });

                const numOfPlayers = _.uniq(game.playersIds).length;
                if (game) {
                    io.to(gameId).emit("game_started", {
                        _id: game._id,
                        players: game.players,
                        playersTurn: game.gameState.playersTurn,
                        numOfPlayers: numOfPlayers,
                        playersTurnIds: game.gameState.playersTurnIds,
                    });
                }
            } catch (err) {
                console.log(err);
            }
        });

        socket.on("player_ready", async ({ _id, gameId }) => {
            try {
                if (!_id || !gameId) {
                    return;
                }

                const game = await ready({ _id, gameId });

                if (game && game.gameState) {
                    io.to(gameId).emit("player_ready", { _id, gameId });

                    const { gameState } = game;

                    const playersTurnsIds = _.uniq(gameState.playersTurnIds);
                    const playersReady = _.uniq(gameState.playersReady);

                    if (playersReady.length === playersTurnsIds.length) {
                        const words = generateWords();
                        const game = await Game.findOne({ _id: gameId });
                        if (!game) {
                            return;
                        }

                        game.gameStack = words;
                        game.gameStatus = "playing";
                        await game.save();
                        io.to(gameId).emit("round_started", { words, gameId });
                    }
                }
            } catch (err) {
                console.log(err);
            }
        });

        socket.on("next_word", async (body) => {
            try {
                if (body && body.gameId) {
                    socket.broadcast
                        .to(body.gameId)
                        .emit("next_word", { gameId: body.gameId });

                    if (body.wordIndex) {
                        const game = await Game.findOne({ _id: body.gameId });
                        if (!game) {
                            return;
                        }
                        if (game.gameState.lastWordIndex !== body.wordIndex) {
                            game.gameState.lastWordIndex = body.wordIndex;
                            await game.save();
                        }
                    }
                }
            } catch (err) {
                console.log(err);
            }
        });

        socket.on("round_ended", async (body) => {
            try {
                if (!body.gameId) {
                    return;
                }

                const game = await endRound({ gameId: body.gameId });

                if (!game) return false;

                io.to(body.gameId).emit("round_ended", {
                    _id: game._id,
                    players: game.players,
                    playersTurn: game.gameState.playersTurn,
                    playersTurnIds: game.gameState.playersTurnIds,
                });
            } catch (error) {
                console.log(error);
            }
        });
    });
};
