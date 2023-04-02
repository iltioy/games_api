const User = require("../models/User");
const { v4 } = require("uuid");

const register = async (req, res) => {
    const { username } = req.body;

    if (!username) {
        res.status(400).send("Username is required");
        return;
    }

    const id = await v4();

    const user = await User.create({
        username,
        userId: id,
    });

    res.status(200).json({ user });
};

const login = async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        res.status(400).send("Name is required");
        return;
    }

    const user = await User.findOne({
        userId,
    });

    if (!user) {
        res.status(400).send("User not found");
        return;
    }

    res.status(200).json({ user });
};

const findUser = async (userId) => {
    const user = await User.findOne({
        userId,
    });

    if (!user) {
        return false;
    }

    return user;
};

module.exports = { register, login, findUser };
