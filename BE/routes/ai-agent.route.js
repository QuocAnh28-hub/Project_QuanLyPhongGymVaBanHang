
const express = require("express");
const router = express.Router();

const AiAgentController = require("../controllers/ai-agent.controller");

router.post("/chat", AiAgentController.chat);

module.exports = router;
