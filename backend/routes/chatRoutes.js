const { Router } = require("express");
const router = Router();
const chatControllers = require("../controllers/chatControllers")

router.get("/get-messages", chatControllers.chatGet);
router.get("/get-unread", chatControllers.unreadMessagesFromGet);
router.delete("/clear-chat", chatControllers.clearChatDelete);


module.exports = router;
