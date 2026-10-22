
import { authenticatedFetch, baseUrl } from '@/lib/account-api';

export type AiChatResponse = {
  success: boolean;
  conversationId: string;
  answer: string;
  message?: string;
};

export async function sendAiMessage(
  message: string,
  conversationId?: string | null
): Promise<AiChatResponse> {
  const controller = new AbortController();

  // Giới hạn thời gian chờ API.
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await authenticatedFetch(
      `${baseUrl}/ai-agent/chat`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim(),
          ...(conversationId ? { conversationId } : {}),
        }),
        signal: controller.signal,
      }
    );

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        data?.message ||
          `Không thể gửi câu hỏi đến AI Agent (HTTP ${response.status}).`
      );
    }

    if (
      !data ||
      data.success !== true ||
      typeof data.answer !== 'string' ||
      typeof data.conversationId !== 'string'
    ) {
      throw new Error('Dữ liệu trả về từ AI Agent không hợp lệ.');
    }

    return data as AiChatResponse;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('AI phản hồi quá lâu. Bạn vui lòng thử lại.');
    }

    if (error instanceof TypeError) {
      throw new Error(
        'Không thể kết nối Backend. Hãy kiểm tra mạng và địa chỉ máy chủ.'
      );
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
