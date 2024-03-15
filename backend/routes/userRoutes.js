const { Router } = require("express");
const router = Router();
const userControllers = require("../controllers/userControllers")

router.patch("/patch-settings", userControllers.updateUserInfoPatch);
router.post("/password-reset", userControllers.resetPasswordPost);

module.exports = router;
