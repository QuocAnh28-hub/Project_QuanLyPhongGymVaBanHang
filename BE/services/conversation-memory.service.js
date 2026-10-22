
const { randomUUID } = require("crypto");

const conversations = new Map();

const MAX_MESSAGES = 20;

function createConversation(accountId) {
  if (!accountId) {
    throw new Error("Không xác định được tài khoản.");
  }

  const conversationId = randomUUID();

  conversations.set(conversationId, {
    accountId: String(accountId),
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date()
  });

  return conversationId;
}

function getConversation(conversationId, accountId) {
  const conversation = conversations.get(conversationId);

  if (!conversation) return null;

  if (conversation.accountId !== String(accountId)) {
    return null;
  }

  return conversation;
}

function getConversationHistory(conversationId, accountId) {
  const conversation = getConversation(conversationId, accountId);

  if (!conversation) return null;

  return conversation.messages.map(({ role, text }) => ({
    role,
    text
  }));
}

function saveMessage(conversationId, accountId, role, text) {
  const conversation = getConversation(conversationId, accountId);

  if (!conversation) {
    throw new Error("Không tìm thấy cuộc trò chuyện.");
  }

  if (!["user", "model"].includes(role)) {
    throw new Error("Vai trò tin nhắn không hợp lệ.");
  }

  conversation.messages.push({
    role,
    text: String(text),
    createdAt: new Date()
  });

  if (conversation.messages.length > MAX_MESSAGES) {
    conversation.messages = conversation.messages.slice(-MAX_MESSAGES);
  }

  conversation.updatedAt = new Date();
}

function deleteConversation(conversationId, accountId) {
  const conversation = getConversation(conversationId, accountId);

  if (!conversation) return false;

  conversations.delete(conversationId);
  return true;
}

module.exports = {
  createConversation,
  getConversation,
  getConversationHistory,
  saveMessage,
  deleteConversation
};
