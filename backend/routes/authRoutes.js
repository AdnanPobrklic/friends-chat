const { Router } = require("express");
const router = Router();
const authControllers = require("../controllers/authControllers")

router.post("/sign-up", authControllers.signUpPost);
router.post("/login", authControllers.logInPost);
router.post("/log-out", authControllers.logOutPost);
router.get("/check-auth", authControllers.checkIfAuthenticated)

module.exports = router;
