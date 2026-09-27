import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";
import { getMatches } from "../services/api";

export default function MatchesScreen({ navigation }) {
  const { token } = useAuth();
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    const data = await getMatches(token);
    if (data.matches) {
      setMatches(data.matches);
    }
  };

  if (matches.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>No matches yet</Text>
        <Text style={styles.emptySubtitle}>Keep swiping to find study partners!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Matches</Text>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.matchCard}
            onPress={() => navigation.navigate("Chat", { matchId: item.id, matchedName: item.matched_name })}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.matched_name[0]}</Text>
            </View>
            <View>
              <Text style={styles.matchName}>{item.matched_name}</Text>
              <Text style={styles.matchSub}>Tap to start chatting</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { fontSize: 28, fontWeight: "bold", color: "#6C47FF", padding: 24, paddingTop: 60 },
  matchCard: { flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 0.5, borderBottomColor: "#eee", gap: 16 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#6C47FF", justifyContent: "center", alignItems: "center" },
  avatarText: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  matchName: { fontSize: 16, fontWeight: "600", color: "#222" },
  matchSub: { fontSize: 13, color: "#888", marginTop: 2 },
  emptyTitle: { fontSize: 22, fontWeight: "bold", color: "#222", marginBottom: 8 },
  emptySubtitle: { fontSize: 16, color: "#888" }
});
