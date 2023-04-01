require("dotenv").config();
const { cards } = require("../cards/cards");
const { findUser } = require("../controllers/user");
const { joinGame } = require("../controllers/game");

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

            const game = await joinGame({ userId, gameId, user });
            if (game && user) {
                socket.join(game._id.toString());
                socket.broadcast.to(game._id.toString()).emit("player_joined", {
                    username: user.username,
                    _id: user._id,
                });

                io.to(socket.id).emit("game_state", game);
            }
        });

        socket.on("disconnect", () => {
            console.log(socket.rooms);
        });
    });
};
