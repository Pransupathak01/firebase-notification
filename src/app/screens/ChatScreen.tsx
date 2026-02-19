import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import io, { Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { AppConfig } from '../config/api';

// 1. Initialize Socket
const SOCKET_URL = AppConfig.SOCKET_URL;

export default function ChatScreen() {
    const { user } = useAuth();
    const [messages, setMessages] = useState<any[]>([]);
    const [currentMessage, setCurrentMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    // Refs
    const socketRef = useRef<Socket | null>(null);
    const flatListRef = useRef<FlatList>(null);

    // Hardcoded for demo - usually comes from navigation user/auth
    const roomId = "room_1";
    // Dynamic userId from AuthContext
    const userId = user?._id || user?.id; // Handle both _id (mongo) and id possibilities if inconsistent
    const username = user?.username || "Anonymous";

    console.log("ChatScreen Rendered. User:", user);
    console.log("ChatScreen UserId:", userId);

    useEffect(() => {
        if (!userId) {
            console.log("Waiting for user ID...");
            return;
        }

        // 2. Connect to Socket
        console.log("Connecting to socket at:", SOCKET_URL, "with userId:", userId);
        socketRef.current = io(SOCKET_URL);

        // 3. Join logic
        socketRef.current.on("connect", () => {
            console.log("Connected to server. Socket ID:", socketRef.current?.id);
            socketRef.current?.emit("join_room", roomId);
        });

        socketRef.current.on("connect_error", (err) => {
            console.error("Socket Connection Error:", err.message);
        });

        // 4. Listeners matching your backend API

        // Load history
        socketRef.current.on("load_messages", (history) => {
            console.log("Loaded history:", history.length, "messages");
            setMessages(history);
        });

        // Receive new message
        socketRef.current.on("receive_message", (msg) => {
            console.log("Received message:", msg);
            setMessages((prev) => [...prev, msg]);
            // Scroll to bottom when new message arrives
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        });

        // Typing indicators
        socketRef.current.on("display_typing", (id) => {
            if (id !== socketRef.current?.id) setIsTyping(true);
        });

        socketRef.current.on("hide_typing", () => {
            setIsTyping(false);
        });

        // Cleanup on unmount
        return () => {
            console.log("Disconnecting socket...");
            socketRef.current?.disconnect();
        };
    }, [userId]);

    const sendMessage = () => {
        if (currentMessage.trim().length === 0) return;
        if (!userId) {
            console.error("Cannot send message: User ID is missing");
            return;
        }

        const payload = {
            roomId,
            sender: userId, // Use dynamic ID
            username: username, // Optionally send username if backend supports it
            text: currentMessage
        };

        console.log("Sending message payload:", payload);

        // Emit event
        socketRef.current?.emit("send_message", payload);
        socketRef.current?.emit("stop_typing", roomId);
        setCurrentMessage("");
    };

    const handleTyping = (text: string) => {
        setCurrentMessage(text);
        if (text.length > 0) {
            socketRef.current?.emit("typing", roomId);
        } else {
            socketRef.current?.emit("stop_typing", roomId);
        }
    };

    const renderItem = ({ item }: { item: any }) => {
        const isMyMessage = item.sender === userId;
        return (
            <View style={[styles.msgContainer, isMyMessage ? styles.myMsg : styles.otherMsg]}>
                <Text style={styles.msgSender}>{item.username || item.sender}</Text>
                <Text style={[styles.msgText, isMyMessage ? styles.myMsgText : styles.otherMsgText]}>{item.text}</Text>
            </View>
        );
    };

    if (!user) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text>Loading User Data...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <View style={styles.header}>
                <Text style={styles.headerText}>Chat Room: {roomId}</Text>
                <Text style={styles.subHeaderText}>Logged in as: {username}</Text>
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.listContent}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            {isTyping && (
                <Text style={styles.typingText}>Someone is typing...</Text>
            )}

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={currentMessage}
                    onChangeText={handleTyping}
                    placeholder="Type a message..."
                    placeholderTextColor="#888"
                />
                <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                    <Text style={styles.sendButtonText}>Send</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    header: { padding: 20, paddingTop: 50, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#ddd' },
    headerText: { fontSize: 18, fontWeight: 'bold' },
    subHeaderText: { fontSize: 12, color: '#888' },
    listContent: { padding: 10, paddingBottom: 20 },
    msgContainer: { maxWidth: '80%', padding: 10, borderRadius: 10, marginBottom: 10 },
    myMsg: { alignSelf: 'flex-end', backgroundColor: '#007AFF' },
    otherMsg: { alignSelf: 'flex-start', backgroundColor: '#E5E5EA' },
    msgSender: { fontSize: 10, color: '#999', marginBottom: 2 }, // Changed color to visible gray
    msgText: { fontSize: 16 }, // Changed to black for visibility
    myMsgText: { color: '#fff' },
    otherMsgText: { color: '#000' },
    typingText: { marginLeft: 20, marginBottom: 5, color: '#888', fontStyle: 'italic' },
    inputContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#fff', alignItems: 'center' },
    input: { flex: 1, height: 40, borderColor: '#ddd', borderWidth: 1, borderRadius: 20, paddingHorizontal: 15, backgroundColor: '#f9f9f9', color: '#000' },
    sendButton: { marginLeft: 10, padding: 10, backgroundColor: '#007AFF', borderRadius: 20 },
    sendButtonText: { color: '#fff', fontWeight: 'bold' }
});
