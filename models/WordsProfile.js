const mongoose = require("mongoose");

const CategoriesSchema = new mongoose.Schema({
    collections: {
        type: [String],
        default: [],
    },
    difficulties: {
        type: [String],
        default: [],
    },
    languages: {
        type: [String],
        default: [],
    },
});

const WordsProfileSchema = new mongoose.Schema({
    words: {
        type: Array,
        default: [],
    },
    categories: {
        type: CategoriesSchema,
        default: {
            collections: [],
            difficulties: [],
            languages: [],
        },
    },
    profileName: {
        type: String,
        required: [true, "Profile must have a name!"],
        unique: true,
        maxLength: 20,
    },
});

module.exports = mongoose.model("WordsProfile", WordsProfileSchema);
