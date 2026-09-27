import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import Swiper from "react-native-deck-swiper";
import { useAuth } from "../context/AuthContext";
import { getFeed, swipe } from "../services/api";

export default function SwipeScreen() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    const data = await getFeed(token);
    if (data.users) {
      setUsers(data.users);
    }
    setLoading(false);
  };

  const handleSwipe = async (cardIndex, direction) => {
    const user = users[cardIndex];
    const result = await swipe(token, user.id, direction);
    if (result.match) {
      Alert.alert("Its a Match!", `You and ${user.name} both want to study together!`);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (users.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>No more matches available</Text>
        <Text style={styles.emptySubtitle}>Check back later!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Buzz</Text>
      <Swiper
        cards={users}
        renderCard={(user) => (
          <View style={styles.card}>
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoText}>{user.name[0]}</Text>
            </View>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.college}>{user.college_name}</Text>
            <View style={styles.topicsContainer}>
              {user.topics && user.topics.filter(t => t).map((topic, i) => (
                <View key={i} style={styles.topicPill}>
                  <Text style={styles.topicText}>{topic}</Text>
                </View>
              ))}
            </View>
            {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}
          </View>
        )}
        onSwipedLeft={(i) => handleSwipe(i, "left")}
        onSwipedRight={(i) => handleSwipe(i, "right")}
        backgroundColor="#f5f5f5"
        stackSize={3}
        cardIndex={0}
        infinite={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { fontSize: 28, fontWeight: "bold", color: "#6C47FF", textAlign: "center", paddingTop: 60, paddingBottom: 10 },
  card: { borderRadius: 20, backgroundColor: "#fff", padding: 20, height: 480, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  photoPlaceholder: { width: "100%", height: 240, backgroundColor: "#6C47FF", borderRadius: 16, justifyContent: "center", alignItems: "center", marginBottom: 16 },
  photoText: { fontSize: 80, color: "#fff", fontWeight: "bold" },
  name: { fontSize: 24, fontWeight: "bold", color: "#222", marginBottom: 4 },
  college: { fontSize: 16, color: "#888", marginBottom: 12 },
  topicsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  topicPill: { backgroundColor: "#EEE9FF", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  topicText: { color: "#6C47FF", fontSize: 13, fontWeight: "500" },
  bio: { fontSize: 14, color: "#555" },
  emptyTitle: { fontSize: 22, fontWeight: "bold", color: "#222", marginBottom: 8 },
  emptySubtitle: { fontSize: 16, color: "#888" }
});
