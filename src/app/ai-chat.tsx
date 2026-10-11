
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useParkourTheme } from "@/contexts/parkour-theme";

const LIGHT_COLORS = {
  background: "#F8FAF8",
  text: "#242424",
  muted: "#77756F",
  gold: "#D4AF37",
  card: "#F3F6F3",
  green: "#344238",
  white: "#FFFFFF",
  border: "#E1E7E1",
  avatar: "#E8EEE8",
  userBubble: "#344238",
  userText: "#FFFFFF",
  inputArea: "#FFFFFF",
  input: "#F8FAF8",
  sendText: "#242424",
};

const DARK_COLORS = {
  background: "#101827",
  text: "#FFFFFF",
  muted: "#AAB4C4",
  gold: "#D4AF37",
  card: "#202B3C",
  green: "#D4AF37",
  white: "#FFFFFF",
  border: "#354358",
  avatar: "#354358",
  userBubble: "#394C42",
  userText: "#FFFFFF",
  inputArea: "#182335",
  input: "#202B3C",
  sendText: "#242424",
};

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://parking-backend-vlx5.onrender.com";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

export default function AIChat() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const { isDark } = useParkourTheme();

  const COLORS = isDark ? DARK_COLORS : LIGHT_COLORS;
  const styles = createStyles(COLORS);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text:
        "Hi! I'm your Parkour AI Assistant. 🚗\n\n" +
        "Ask me about UCF parking, garages, permits, " +
        "accessibility, or getting around campus!",
    },
  ]);

  const sendMessage = async () => {
    const question = input.trim();

    if (!question || loading) return;

    const userMessage: Message = {
      id: `${Date.now()}-user`,
      role: "user",
      text: question,
    };

    setMessages((previous) => [...previous, userMessage]);
    setInput("");
    setLoading(true);

    try {
const response = await fetch(`${API_URL}/api/chat`, {
          method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
  message: question,
  user_type: "student",
}),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to get a response.");
      }

      const assistantMessage: Message = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        text: data.reply || "I couldn't generate a response.",
      };

      setMessages((previous) => [
        ...previous,
        assistantMessage,
      ]);
    } catch (error) {
      const errorMessage: Message = {
        id: `${Date.now()}-error`,
        role: "assistant",
        text:
          "Sorry, I'm having trouble connecting right now. " +
          "Please try again in a moment.",
      };

      setMessages((previous) => [...previous, errorMessage]);
      console.error("Parkour chat error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={COLORS.text}
            />
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text style={styles.title}>Parkour AI</Text>
            <Text style={styles.subtitle}>
              Your UCF parking assistant
            </Text>
          </View>

          <View style={styles.aiIcon}>
            <Ionicons
              name="sparkles"
              size={22}
              color={COLORS.green}
            />
          </View>
        </View>

        {/* CHAT MESSAGES */}
        <ScrollView
          ref={scrollRef}
          style={styles.chatArea}
          contentContainerStyle={styles.messages}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() =>
            scrollRef.current?.scrollToEnd({ animated: true })
          }
        >
          {messages.map((message) => {
            const isUser = message.role === "user";

            return (
              <View
                key={message.id}
                style={[
                  styles.messageRow,
                  isUser ? styles.userRow : styles.assistantRow,
                ]}
              >
                {!isUser && (
                  <View style={styles.avatar}>
                    <Ionicons
                      name="sparkles"
                      size={17}
                      color={COLORS.green}
                    />
                  </View>
                )}

                <View
                  style={[
                    styles.bubble,
                    isUser
                      ? styles.userBubble
                      : styles.assistantBubble,
                  ]}
                >
                  <Text
                    selectable
                    style={[
                      styles.messageText,
                      isUser && styles.userMessageText,
                    ]}
                  >
                    {message.text}
                  </Text>
                </View>
              </View>
            );
          })}

          {loading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={COLORS.green} />
              <Text style={styles.loadingText}>
                Parkour is thinking...
              </Text>
            </View>
          )}
        </ScrollView>

        {/* INPUT */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask about UCF parking..."
            placeholderTextColor={COLORS.muted}
            selectionColor={COLORS.gold}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={2000}
            editable={!loading}
            accessibilityLabel="Message Parkour AI"
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              (!input.trim() || loading) && styles.disabledButton,
            ]}
            onPress={sendMessage}
            disabled={!input.trim() || loading}
            accessibilityRole="button"
            accessibilityLabel="Send message"
          >
            <Ionicons
              name="send"
              size={20}
              color={COLORS.sendText}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.disclaimer}>
          AI responses may be inaccurate. Verify official UCF
          parking rules before relying on them.
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(COLORS: typeof LIGHT_COLORS) {
  return StyleSheet.create({
    flex: {
      flex: 1,
    },

    container: {
      flex: 1,
      backgroundColor: COLORS.background,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
      gap: 14,
    },

    headerText: {
      flex: 1,
    },

    title: {
      fontSize: 20,
      fontWeight: "800",
      color: COLORS.text,
    },

    subtitle: {
      fontSize: 12,
      color: COLORS.muted,
      marginTop: 3,
    },

    aiIcon: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor: COLORS.card,
      alignItems: "center",
      justifyContent: "center",
    },

    chatArea: {
      flex: 1,
    },

    messages: {
      padding: 17,
      paddingBottom: 25,
      gap: 17,
    },

    messageRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 8,
    },

    userRow: {
      justifyContent: "flex-end",
    },

    assistantRow: {
      justifyContent: "flex-start",
    },

    avatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: COLORS.avatar,
      alignItems: "center",
      justifyContent: "center",
    },

    bubble: {
      maxWidth: "82%",
      borderRadius: 17,
      paddingHorizontal: 15,
      paddingVertical: 12,
    },

    userBubble: {
      backgroundColor: COLORS.userBubble,
      borderBottomRightRadius: 5,
    },

    assistantBubble: {
      backgroundColor: COLORS.card,
      borderWidth: 1,
      borderColor: COLORS.border,
      borderBottomLeftRadius: 5,
    },

    messageText: {
      fontSize: 14,
      lineHeight: 21,
      color: COLORS.text,
    },

    userMessageText: {
      color: COLORS.userText,
    },

    loadingRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingLeft: 40,
    },

    loadingText: {
      fontSize: 13,
      color: COLORS.muted,
    },

    inputContainer: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 10,
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 8,
      borderTopWidth: 1,
      borderTopColor: COLORS.border,
      backgroundColor: COLORS.inputArea,
    },

    input: {
      flex: 1,
      minHeight: 46,
      maxHeight: 110,
      borderWidth: 1,
      borderColor: COLORS.border,
      borderRadius: 15,
      paddingHorizontal: 14,
      paddingVertical: 11,
      color: COLORS.text,
      backgroundColor: COLORS.input,
      fontSize: 14,
    },

    sendButton: {
      backgroundColor: COLORS.gold,
      width: 46,
      height: 46,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },

    disabledButton: {
      opacity: 0.5,
    },

    disclaimer: {
      fontSize: 10,
      textAlign: "center",
      color: COLORS.muted,
      paddingHorizontal: 18,
      paddingBottom: 8,
      backgroundColor: COLORS.inputArea,
    },
  });
}
