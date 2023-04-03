const router = require("express").Router();
const { createProfile, getProfile } = require("../controllers/wordsProfile");

router.post("/create", createProfile);
router.get("/get/:profileName", getProfile);

module.exports = router;
