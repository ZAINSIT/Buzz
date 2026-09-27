import React, { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import { getMessages } from "../services/api";

const BASE_URL = "http://10.0.2.2:3000";

export default function ChatScreen({ route }) {
  const { matchId, matchedName } = route.params;
  const { token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const socketRef = useRef(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    loadMessages();
    connectSocket();
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  const loadMessages = async () => {
    const data = await getMessages(token, matchId);
    if (data.messages) setMessages(data.messages);
  };

  const connectSocket = () => {
    socketRef.current = io(BASE_URL, { auth: { token } });

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join_match", matchId);
    });

    socketRef.current.on("new_message", (msg) => {
      setMessages(prev => [...prev, msg]);
    });
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    socketRef.current.emit("send_message", { matchId, message: input.trim() });
    setInput("");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.header}>{matchedName}</Text>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        renderItem={({ item }) => (
          <View style={styles.messageBubble}>
            <Text style={styles.messageText}>{item.message || item.encrypted_content}</Text>
            <Text style={styles.messageTime}>
              {new Date(item.sent_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </Text>
          </View>
        )}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { fontSize: 22, fontWeight: "bold", color: "#6C47FF", padding: 24, paddingTop: 60, borderBottomWidth: 0.5, borderBottomColor: "#eee" },
  messageBubble: { backgroundColor: "#EEE9FF", margin: 8, padding: 12, borderRadius: 16, maxWidth: "80%", alignSelf: "flex-start" },
  messageText: { fontSize: 15, color: "#222" },
  messageTime: { fontSize: 11, color: "#888", marginTop: 4 },
  inputRow: { flexDirection: "row", padding: 12, borderTopWidth: 0.5, borderTopColor: "#eee", gap: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: "#ddd", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15 },
  sendButton: { backgroundColor: "#6C47FF", borderRadius: 20, paddingHorizontal: 20, justifyContent: "center" },
  sendText: { color: "#fff", fontWeight: "600" }
});
