import React, { useState, useRef, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from "react-native";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
}

interface AppSupportModalProps {
  visible: boolean;
  onClose: () => void;
}

// Common starter questions to guide the user
const QUICK_QUESTIONS = [
  "How do I upload an outfit?",
  "How does Virtual Try-On work?",
  "Why am I getting 'No matching outfits'?",
  "How are cultural styles separated?",
];

// Backend endpoint for app support
const API_URL = "http://127.0.0.1:8001/app-help";

const INITIAL_MESSAGES: Message[] = [
  {
    id: "initial-welcome",
    sender: "bot",
    text: "Hi! I am your in-app guide. Ask me anything about how to use the closet, outfit recommendations, or virtual try-on!",
  },
];

export const AppSupportModal: React.FC<AppSupportModalProps> = ({
  visible,
  onClose,
}) => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleClose = () => {
    setMessages(INITIAL_MESSAGES);
    setInputText("");
    setLoading(false);
    onClose();
  };
  // 2. Alternatively, ensure fresh state whenever the modal is opened
  useEffect(() => {
    if (!visible) {
      setMessages(INITIAL_MESSAGES);
      setInputText("");
      setLoading(false);
    }
  }, [visible]);
  // Auto-scroll to the latest message whenever messages change
  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } 
  }, [messages, visible]);

  const handleSendMessage = async (queryToSend?: string) => {
    const text = (queryToSend || inputText).trim();
    if (!text || loading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }

      const data = await response.json();

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: data.answer || "I could not retrieve an answer at this time.",
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      const errorMessage: Message = {
        id: `err-${Date.now()}`,
        sender: "bot",
        text: "Sorry, I am having trouble connecting to the support service. Please ensure the backend is running.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessageItem = ({ item }: { item: Message }) => {
    const isUser = item.sender === "user";
    return (
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.botBubble,
        ]}
      >
        <Text style={[styles.messageText, isUser ? styles.userText : styles.botText]}>
          {item.text}
        </Text>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardContainer}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.helpIcon}>ⓘ</Text>
              <Text style={styles.headerTitle}>App Help & Guide</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeIcon}>×</Text>
            </TouchableOpacity>
          </View>

          {/* Chat Messages */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessageItem}
            contentContainerStyle={styles.messageList}
          />

          {/* Loading Indicator */}
          {loading && (
            <View style={styles.typingIndicatorContainer}>
              <ActivityIndicator size="small" color="#555" />
              <Text style={styles.typingText}>Guide is thinking...</Text>
            </View>
          )}

          {/* Predefined Quick Question Pills */}
          <View style={styles.quickQuestionsContainer}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={QUICK_QUESTIONS}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.questionChip}
                  onPress={() => handleSendMessage(item)}
                  disabled={loading}
                >
                  <Text style={styles.questionChipText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>

          {/* Text Input Row */}
          <View style={styles.inputBar}>
            <TextInput
              style={styles.textInput}
              placeholder="Ask about app features..."
              placeholderTextColor="#888"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={() => handleSendMessage()}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                !inputText.trim() || loading ? styles.sendButtonDisabled : {},
              ]}
              onPress={() => handleSendMessage()}
              disabled={!inputText.trim() || loading}
            >
              <Text style={styles.sendIcon}>↑</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9FB",
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
    backgroundColor: "#FFFFFF",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  helpIcon: {
    fontSize: 24,
    color: "#111",
  },
  closeIcon: {
    fontSize: 24,
    color: "#333",
  },
  sendIcon: {
    fontSize: 20,
    color: "#fff",
  },
  closeButton: {
    padding: 6,
  },
  messageList: {
    padding: 16,
    gap: 12,
  },
  messageBubble: {
    maxWidth: "82%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#111111",
    borderBottomRightRadius: 2,
  },
  botBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: "#E5E5E7",
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: "#FFFFFF",
  },
  botText: {
    color: "#1F1F1F",
  },
  typingIndicatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  typingText: {
    fontSize: 13,
    color: "#777",
  },
  quickQuestionsContainer: {
    maxHeight: 44,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  questionChip: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCDCE0",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    justifyContent: "center",
  },
  questionChipText: {
    fontSize: 13,
    color: "#333",
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EAEAEA",
    gap: 10,
  },
  textInput: {
    flex: 1,
    height: 42,
    backgroundColor: "#F1F1F4",
    borderRadius: 21,
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#111",
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#CCC",
  },
});