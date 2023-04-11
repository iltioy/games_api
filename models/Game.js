const mongoose = require("mongoose");

const GameStateSchema = new mongoose.Schema({
    playersTurn: {
        type: Number,
        defalut: 0,
    },
    playersTurnIds: {
        type: [String],
        default: [],
    },
    playersReady: {
        type: [String],
        default: [],
    },
    scores: {
        type: Array,
        default: [],
    },
    lastWordIndex: {
        type: Number,
        default: 0,
    },
});

const GameSchema = new mongoose.Schema(
    {
        gameStatus: {
            type: String,
            enum: ["not started", "playing", "ended", "break"],
            default: "not started",
        },
        gameState: {
            type: GameStateSchema,
            default: {
                playersTurn: 0,
                playersTurnIds: [],
                playersReady: [],
                scores: [],
            },
        },
        gameStack: {
            type: Array,
            default: [],
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
