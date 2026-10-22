import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { sendAiMessage } from '@/lib/ai-agent-api';

type ChatMessage = {
  id: string;
  role: 'user' | 'model';
  text: string;
};

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'model',
  text:
    'Xin chào! Tôi là QA-Gym AI, trợ lý tư vấn của phòng tập.\n\n' +
    'Tôi có thể hỗ trợ bạn tìm hiểu về gói tập, sản phẩm, thông tin đăng ký và lịch sử check-in. Bạn cần hỗ trợ gì?',
};

const SUGGESTIONS = [
  'Phòng Gym hiện có những gói tập nào?',
  'Gói nào có thời hạn dài nhất?',
  'Tôi đã đăng ký gói tập nào?',
  'Phòng Gym có những sản phẩm gì?',
];

export default function AiChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    WELCOME_MESSAGE,
  ]);

  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const listRef = useRef<FlatList<ChatMessage>>(null);

  async function handleSend(text?: string) {
    const question = (text ?? input).trim();

    if (!question || loading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: question,
    };

    setMessages((previous) => [...previous, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const result = await sendAiMessage(
        question,
        conversationId
      );

      setConversationId(result.conversationId);

      const aiMessage: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: result.answer,
      };

      setMessages((previous) => [...previous, aiMessage]);
    } catch (error) {
      const errorText =
        error instanceof Error
          ? error.message
          : 'Đã xảy ra lỗi khi kết nối AI Agent.';

      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'model',
        text: errorText,
      };

      setMessages((previous) => [...previous, errorMessage]);
    } finally {
      setLoading(false);
    }
  }

  function handleNewConversation() {
    if (loading) return;

    setConversationId(null);
    setInput('');
    setMessages([
      {
        ...WELCOME_MESSAGE,
        id: `welcome-${Date.now()}`,
      },
    ]);
  }

  function renderMessage({ item }: { item: ChatMessage }) {
    const isUser = item.role === 'user';

    return (
      <View
        style={[
          styles.messageRow,
          isUser ? styles.userRow : styles.aiRow,
        ]}
      >
        {!isUser && (
          <View style={styles.botAvatar}>
            <Ionicons name="sparkles" size={17} color="#101210" />
          </View>
        )}

        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.aiBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isUser && styles.userMessageText,
            ]}
          >
            {item.text}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="#f4f7ee" />
          </Pressable>

          <View style={styles.headerAvatar}>
            <Ionicons name="sparkles" size={21} color="#101210" />
          </View>

          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>QA-Gym AI</Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.headerSubtitle}>
                Trợ lý tư vấn trực tuyến
              </Text>
            </View>
          </View>

          <Pressable
            style={styles.newChatButton}
            onPress={handleNewConversation}
            disabled={loading}
          >
            <Ionicons name="add" size={24} color="#c3ff00" />
          </Pressable>
        </View>

        {/* CHAT */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() =>
            listRef.current?.scrollToEnd({ animated: true })
          }
          ListHeaderComponent={
            <View style={styles.dateLabel}>
              <Text style={styles.dateLabelText}>
                TRÒ CHUYỆN VỚI QA-GYM AI
              </Text>
            </View>
          }
        />

        {/* GỢI Ý CÂU HỎI */}
        {messages.length === 1 && !loading && (
          <View style={styles.suggestionSection}>
            <Text style={styles.suggestionTitle}>
              Bạn có thể hỏi tôi
            </Text>

            <View style={styles.suggestionList}>
              {SUGGESTIONS.map((suggestion) => (
                <Pressable
                  key={suggestion}
                  style={styles.suggestionButton}
                  onPress={() => handleSend(suggestion)}
                >
                  <Text style={styles.suggestionText}>
                    {suggestion}
                  </Text>
                  <Ionicons
                    name="arrow-up-outline"
                    size={15}
                    color="#c3ff00"
                  />
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* ĐANG TRẢ LỜI */}
        {loading && (
          <View style={styles.typingRow}>
            <ActivityIndicator size="small" color="#c3ff00" />
            <Text style={styles.typingText}>
              QA-Gym AI đang trả lời...
            </Text>
          </View>
        )}

        {/* Ô NHẬP */}
        <View style={styles.inputArea}>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.textInput}
              placeholder="Nhập câu hỏi của bạn..."
              placeholderTextColor="#858b80"
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={3000}
              editable={!loading}
            />

            <Pressable
              style={[
                styles.sendButton,
                (!input.trim() || loading) && styles.sendDisabled,
              ]}
              onPress={() => handleSend()}
              disabled={!input.trim() || loading}
            >
              <Ionicons
                name="send"
                size={18}
                color="#101210"
              />
            </Pressable>
          </View>

          <Text style={styles.footerText}>
            QA-Gym AI có thể cung cấp thông tin chưa chính xác.
            Vui lòng kiểm tra lại khi cần thiết.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#101210',
  },

  container: {
    flex: 1,
    backgroundColor: '#101210',
    width: '100%',
    maxWidth: 540,
    alignSelf: 'center',
  },

  header: {
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#292e27',
    gap: 10,
  },

  backButton: {
    width: 30,
    height: 42,
    justifyContent: 'center',
  },

  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#c3ff00',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerInfo: {
    flex: 1,
  },

  headerTitle: {
    color: '#f4f7ee',
    fontSize: 16,
    fontWeight: '800',
  },

  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },

  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#4edea3',
  },

  headerSubtitle: {
    color: '#929b8e',
    fontSize: 11,
  },

  newChatButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#414a32',
    alignItems: 'center',
    justifyContent: 'center',
  },

  chatContent: {
    padding: 16,
    paddingBottom: 22,
  },

  dateLabel: {
    alignItems: 'center',
    marginBottom: 20,
  },

  dateLabelText: {
    color: '#778071',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
  },

  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },

  userRow: {
    justifyContent: 'flex-end',
  },

  aiRow: {
    justifyContent: 'flex-start',
  },

  botAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#c3ff00',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  messageBubble: {
    maxWidth: '82%',
    borderRadius: 15,
    paddingHorizontal: 13,
    paddingVertical: 11,
  },

  userBubble: {
    backgroundColor: '#c3ff00',
    borderBottomRightRadius: 4,
  },

  aiBubble: {
    backgroundColor: '#20251f',
    borderWidth: 1,
    borderColor: '#343c30',
    borderBottomLeftRadius: 4,
  },

  messageText: {
    color: '#e8eee2',
    fontSize: 14,
    lineHeight: 21,
  },

  userMessageText: {
    color: '#172000',
    fontWeight: '500',
  },

  suggestionSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },

  suggestionTitle: {
    color: '#c3ff00',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 9,
  },

  suggestionList: {
    gap: 8,
  },

  suggestionButton: {
    minHeight: 40,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#3b4532',
    backgroundColor: '#1c211b',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  suggestionText: {
    color: '#dce4d5',
    fontSize: 12,
    flex: 1,
    marginRight: 8,
  },

  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 9,
  },

  typingText: {
    color: '#9da795',
    fontSize: 12,
  },

  inputArea: {
    paddingHorizontal: 13,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 8 : 12,
    borderTopWidth: 1,
    borderTopColor: '#292e27',
    backgroundColor: '#151914',
  },

  inputBox: {
    minHeight: 48,
    maxHeight: 120,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#242a22',
    borderWidth: 1,
    borderColor: '#414a32',
    borderRadius: 24,
    paddingLeft: 16,
    paddingRight: 6,
  },

  textInput: {
    flex: 1,
    color: '#f4f7ee',
    fontSize: 14,
    maxHeight: 100,
    paddingVertical: 10,
  },

  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 20,
    backgroundColor: '#c3ff00',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sendDisabled: {
    opacity: 0.4,
  },

  footerText: {
    color: '#727b6d',
    fontSize: 9,
    textAlign: 'center',
    marginTop: 8,
  },
});
