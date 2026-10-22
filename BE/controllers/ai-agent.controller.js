
const AiAgentService = require("../services/ai-agent.service");

const AiAgentController = {
  chat: async (req, res) => {
    try {
      const message = String(req.body?.message || "").trim();
      const conversationId = req.body?.conversationId || null;

      if (!message) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng nhập nội dung câu hỏi."
        });
      }

      if (message.length > 3000) {
        return res.status(400).json({
          success: false,
          message: "Câu hỏi không được vượt quá 3000 ký tự."
        });
      }

      const result = await AiAgentService.chat({
        message,
        conversationId,
        accountId: req.auth.TaiKhoanID
      });

      return res.status(200).json({
        success: true,
        conversationId: result.conversationId,
        answer: result.answer
      });
    } catch (error) {
      console.error("===== AI AGENT CONTROLLER ERROR =====");
      console.error("Message:", error.message);
      console.error("Stack:", error.stack);
      console.error("=====================================");

      return res.status(500).json({
        success: false,
        message: error.message.includes("Cuộc trò chuyện")
          ? error.message
          : "AI Agent hiện không thể xử lý yêu cầu. Vui lòng thử lại."
      });
    }
  }
};

module.exports = AiAgentController;
