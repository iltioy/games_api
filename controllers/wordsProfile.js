const WordsProfile = require("../models/WordsProfile");
const { BadRequestError } = require("../errors");

const createProfile = async (req, res) => {
    const { words, categories, profileName } = req.body;

    if (!profileName) {
        throw new BadRequestError("Profile name required");
    }

    const profile = await WordsProfile.create({
        words,
        categories,
        profileName,
    });

    if (!profile) {
        throw new BadRequestError("Something went wrong");
    }

    res.status(200).json(profile);
};

const getProfile = async (req, res) => {
    const { profileName } = req.params;

    if (!profileName) {
        throw new BadRequestError("Profile name required");
    }

    const profile = await WordsProfile.findOne({
        profileName,
    });

    if (!profile) {
        throw new BadRequestError("Couldn't find a profile with this name");
    }

    res.status(200).json(profile);
};

module.exports = { createProfile, getProfile };
