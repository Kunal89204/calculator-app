import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { io } from "socket.io-client";
import axios from "axios";
import Message from "@/components/Message";
import TypingIndicator from "@/components/TypingIndicator";
import { Ionicons } from "@expo/vector-icons";
// Configuration
const API_BASE_URL = "https://calculator-app-backend-wy7h.onrender.com";

// Define a type for valid usernames
type ValidUsername = "Kunal" | "friend";

const VALID_USERS: Record<ValidUsername, string> = {
  Kunal: "Lanuk",
  friend: "Dhanera",
};

type Message = {
  _id: string;
  sender: string;
  message: string;
  timestamp: string;
};

const Chat = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState<any>(null);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(API_BASE_URL);
    setSocket(newSocket);

    // Clean up socket on component unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    // Fetch existing chats when authenticated
    if (isAuthenticated) {
      fetchChats();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let typingTimeout: NodeJS.Timeout;

    if (socket && isAuthenticated) {
      socket.on("message", (newMsg: Message) => {
        setMessages((prevMessages) => [...prevMessages, newMsg]);
      });

      socket.on("userTyping", () => {
        setIsTyping(true);

        if (typingTimeout) clearTimeout(typingTimeout);

        typingTimeout = setTimeout(() => {
          setIsTyping(false);
        }, 1000);
      });
    }

    // Cleanup
    return () => {
      if (socket) {
        socket.off("message");
        socket.off("userTyping");
      }
      if (typingTimeout) clearTimeout(typingTimeout);
    };
  }, [socket, isAuthenticated]);

  const fetchChats = async () => {
    try {
      const response = await axios.get<Message[]>(
        `${API_BASE_URL}/api/v1/chats`
      );
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  const handleLogin = () => {
    // Check if username and password are valid
    if (isValidUsername(username) && VALID_USERS[username] === password) {
      setIsAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("Invalid username or password. Please try again.");
    }
  };

  // Type guard to check if username is valid
  const isValidUsername = (input: string): input is ValidUsername => {
    return input in VALID_USERS;
  };

  const sendMessage = async () => {
    if (newMessage.trim() === "" || !socket) return;

    try {
      // Emit message via socket with sender username
      socket.emit("message", {
        sender: username,
        message: newMessage,
      });

      // Clear input
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleTyping = () => {
    socket.emit("typing");
  };

  const renderLoginScreen = () => (
    <View className="flex-1 bg-black justify-center items-center p-6">
      <StatusBar backgroundColor={"black"} />
      <View className="w-full max-w-md">
        <Text className="text-white text-3xl mb-8 text-center font-bold">
          Private Chat
        </Text>
        <View className="bg-gray-900 p-6 rounded-2xl">
          <TextInput
            placeholder="Username"
            placeholderTextColor="#666"
            value={username}
            onChangeText={setUsername}
            className="bg-gray-800 text-white w-full p-4 rounded-lg mb-4"
          />

          <TextInput
            placeholder="Password"
            placeholderTextColor="#666"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            className="bg-gray-800 text-white w-full p-4 rounded-lg mb-4"
          />
          {authError ? (
            <Text className="text-red-500 text-center mb-4">{authError}</Text>
          ) : null}
          <TouchableOpacity
            onPress={handleLogin}
            className="rounded-xl overflow-hidden"
          >
            <LinearGradient
              colors={["#E1306C", "#F77737"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 1, // or 20 for "xl", adjust as needed
                padding: 16,
                alignItems: "center",
                width: "100%",
              }}
            >
              <Text className="text-white font-bold text-lg">Login</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderChatInterface = () => (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-800">
        <View>
          <Text className="text-white text-lg font-bold">Private Chat</Text>
          <Text className="text-gray-400 text-sm">Logged in as {username}</Text>
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 p-4"
          ref={(ref) => {
            // Auto scroll to bottom
            ref?.scrollToEnd({ animated: true });
          }}
        >
          {messages.map((msg) => (
            <Message key={msg._id} msg={msg} username={username} />
          ))}
        </ScrollView>

        <TypingIndicator isTyping={isTyping} />
        {/* Message Input */}
        <View className="flex-row items-center p-4 border-t border-gray-800">
          <TextInput
            placeholder="Message..."
            placeholderTextColor="#666"
            value={newMessage}
            onChangeText={(text) => {
              setNewMessage(text);
              handleTyping();
            }}
            className="flex-1 bg-gray-800 text-white p-3 rounded-2xl mr-2"
          />
          <TouchableOpacity
            onPress={sendMessage}
            className="w-12 h-12 rounded-full overflow-hidden justify-center items-center"
          >
            <LinearGradient
              colors={["#E1306C", "#F77737"]}
              className="w-full h-full rounded-full justify-center items-center"
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text className="text-white font-bold text-lg rounded-full`">
                <Ionicons name="send-outline" size={18} />
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  return isAuthenticated ? renderChatInterface() : renderLoginScreen();
};

export default Chat;
