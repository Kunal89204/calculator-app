import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface MessageProps {
  msg: {
    _id: string;
    sender: string;
    message: string;
    timestamp: string | number | Date;
  };
  username: string;
}

const Message: React.FC<MessageProps> = ({ msg, username }) => {
  const isOwnMessage = msg.sender === username;

  return (
    <View
      key={msg._id}
      style={[
        styles.messageContainer,
        isOwnMessage ? styles.sent : styles.received,
      ]}
    >
      <LinearGradient
        colors={isOwnMessage ? ["#E1306C", "#F77737"] : ["#833AB4", "#C13584"]}
        style={styles.bubble}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.messageText}>{msg.message}</Text>
      </LinearGradient>
      <Text style={styles.timestamp}>
        <Text style={styles.sender}>{msg.sender}</Text>{" "}
        {new Date(msg.timestamp).toLocaleTimeString()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    marginBottom: 12,
    maxWidth: "80%",
  },
  sent: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  received: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  bubble: {
    padding: 12,
    borderRadius: 18,
    minWidth: 10,
  },
  messageText: {
    color: "white",
  },
  timestamp: {
    fontSize: 10,
    color: "#aaa",
    marginTop: 4,
  },
  sender: {
    fontWeight: "bold",
  },
});

export default Message;
