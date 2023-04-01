const mongoose = require("mongoose");

const GameSchema = new mongoose.Schema(
    {
        gameStatus: {
            type: String,
            enum: ["not started", "playing", "ended"],
            default: "not started",
        },
        gameState: {
            type: Array,
            default: [],
        },
        gameType: {
            type: String,
        },
        playersIds: {
            type: Array,
            default: [],
        },
        players: {
            type: Array,
            default: [],
        },
        maxPlayers: {
            type: Number,
            default: 4,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Game", GameSchema);
