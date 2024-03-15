const { Router } = require("express");
const router = Router();
const friendsControllers = require("../controllers/friendsControllers")

router.post("/add", friendsControllers.sendFriendReqPost);
router.post("/accept-request", friendsControllers.handleFriendReqPost);
router.delete("/delete-friend",friendsControllers.removeFriendDelete )


module.exports = router;
