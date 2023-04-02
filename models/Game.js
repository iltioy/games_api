const mongoose = require("mongoose");

const GameStateSchema = new mongoose.Schema({
    playersTurn: {
        type: Number,
        defalut: 0,
    },
    scores: {
        type: Array,
        default: [],
    },
});

const GameSchema = new mongoose.Schema(
    {
        gameStatus: {
            type: String,
            enum: ["not started", "playing", "ended"],
            default: "not started",
        },
        gameState: {
            type: GameStateSchema,
            default: {
                playersTurn: 0,
                scores: [],
            },
        },
        gameType: {
            type: String,
        },
        playersIds: {
            type: [String],
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
