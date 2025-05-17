import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { io } from "socket.io-client";
import axios from "axios";
import Message from "@/components/Message";
import TypingIndicator from "@/components/TypingIndicator";
import { Ionicons } from "@expo/vector-icons";
import { logScreenView } from '@/firebase/analytics';
// Configuration
const API_BASE_URL = "https://calculator-app-backend-wy7h.onrender.com";

// Define a type for valid usernames
type ValidUsername = "Kunal" | "friend" | "reviewer";

const VALID_USERS: Record<ValidUsername, string> = {
  Kunal: "Lanuk",
  friend: "Dhanera",
  reviewer: "review123", // Added reviewer account
};

type Message = {
  _id: string;
  sender: string;
  message: string;
  timestamp: string;
};


// Sample messages for reviewer to see
const REVIEWER_MESSAGES: Message[] = [
  {
    _id: "review1",
    sender: "Kunal",
    message: "Hello! This is a sample message for the reviewer.",
    timestamp: new Date().toISOString(),
  },
  {
    _id: "review2",
    sender: "friend",
    message: "Hi Kunal, thanks for sharing this app for review.",
    timestamp: new Date().toISOString(),
  },
  {
    _id: "review3",
    sender: "Kunal",
    message: "Feel free to test the chat functionality!",
    timestamp: new Date().toISOString(),
  },
  {
    _id: "review4",
    sender: "friend",
    message: "The UI looks great. I like the dark theme.",
    timestamp: new Date().toISOString(),
  },
];


const Chat = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState<any>(null);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isReviewer, setIsReviewer] = useState<boolean>(false);
  const scrollViewRef = useRef<ScrollView>(null);

useEffect(() => {
  logScreenView('Chat');
}, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollViewRef.current && messages.length > 0) {
      // Small delay to ensure layout is complete
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

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
      if (isReviewer) {
        // Set sample messages for reviewer
        setMessages(REVIEWER_MESSAGES);
      } else {
        // Fetch real chats for actual users
        fetchChats();
      }
    }
  }, [isAuthenticated, isReviewer]);

  useEffect(() => {
    let typingTimeout: NodeJS.Timeout;

    if (socket && isAuthenticated && !isReviewer) {
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
  }, [socket, isAuthenticated, isReviewer]);

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
    // Check if username is reviewer
    if (username === "reviewer" && password === "review123") {
      setIsAuthenticated(true);
      setIsReviewer(true);
      setAuthError("");
      return;
    }

    // Check if username and password are valid for regular users
    if (isValidUsername(username) && VALID_USERS[username] === password) {
      setIsAuthenticated(true);
      setIsReviewer(false);
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
    if (newMessage.trim() === "") return;

    if (isReviewer) {
      // For reviewer, just add message locally without sending to backend
      const reviewerMsg: Message = {
        _id: `local_${Date.now()}`,
        sender: username,
        message: newMessage,
        timestamp: new Date().toISOString(),
      };
      
      setMessages((prevMessages) => [...prevMessages, reviewerMsg]);
      setNewMessage("");
      
      // Simulate receiving a response after a short delay
      setTimeout(() => {
        const responseMsg: Message = {
          _id: `local_${Date.now() + 1}`,
          sender: username === "reviewer" ? "Kunal" : "reviewer",
          message: "Thanks for testing the chat functionality!",
          timestamp: new Date().toISOString(),
        };
        setMessages((prevMessages) => [...prevMessages, responseMsg]);
      }, 1500);
      
      return;
    }

    // For real users, send message via socket
    if (!socket) return;

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
    if (!isReviewer && socket) {
      socket.emit("typing");
    }
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
                borderRadius: 1,
                padding: 16,
                alignItems: "center",
                width: "100%",
              }}
            >
              <Text className="text-white font-bold text-lg">Login</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          {/* Hint for reviewer */}
          <TouchableOpacity 
            onPress={() => {
              Alert.alert(
                "Reviewer Access",
                "For app review purposes, use:\nUsername: reviewer\nPassword: review123"
              );
            }}
            className="mt-4"
          >
            <Text className="text-gray-500 text-center">App Reviewer? Tap here</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderChatInterface = () => (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header */}
      <View className="flex-row items-center p-3 border-b border-gray-800">
        <View>
          <Text className="text-white text-sm font-bold">Private Chat</Text>
          <Text className="text-gray-400 text-sm">
            Logged in as {username}
            {isReviewer && " (Review Mode)"}
          </Text>
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          zIndex: -1,
        }}>
          <Image
            source={require('@/assets/images/lofi.jpg')}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        </View>
        <ScrollView
          className="flex-1 p-4"
          ref={scrollViewRef}
        >
          {messages.map((msg) => (
            <Message key={msg._id} msg={msg} username={username} />
          ))}
        </ScrollView>

        {!isReviewer && <TypingIndicator isTyping={isTyping} />}
        
        {/* Message Input */}
        <View className="flex-row items-center px-4 pb-2  border-gray-400">
          <TextInput
            placeholder="Message..."
            placeholderTextColor="#666"
            value={newMessage}
            onChangeText={(text) => {
              setNewMessage(text);
              handleTyping();
            }}
            className="flex-1 bg-black/20 text-white p-3 py-4 rounded-2xl mr-2 border  border-purple-500/30"
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