require("dotenv").config();
const { generateWords } = require("../games/alias");
const { findUser } = require("../controllers/user");
const { joinGame, leaveAllGames, leaveGame } = require("../controllers/game");

module.exports = (io) => {
    io.on("connection", (socket) => {
        socket.on("join_room", async (body) => {
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
                io.to(game._id.toString()).emit("game_state", game);
                // io.to(socket.id).emit("game_state", game);
            }
        });

        socket.on("disconnecting", () => {
            const rooms = Array.from(socket.rooms);

            for (let i = 0; i < rooms.length; i++) {
                io.to(rooms[i]).emit("player_left", socket.data._id);
            }

            leaveAllGames(socket.data.userId);
        });

        socket.on("leave_room", ({ userId, gameId }) => {
            if (!gameId) {
                return;
            }
            socket.leave(gameId);
            io.to(gameId).emit("player_left", socket.data._id);

            if (!userId) {
                return;
            }

            leaveGame({ userId, gameId });
        });

        socket.on("start_round", (gameId) => {
            console.log("first");
            const words = generateWords();
            io.to(gameId).emit("round_started", { words });
        });
    });
};
