import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { getSocket, connectSocket } from '../services/socketService';
import { Socket } from 'socket.io-client';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface Message {
    _id: string;
    text: string;
    sender: { _id: string; username: string; avatar?: string };
    createdAt: string;
    messageType: string;
}

const ChatScreen = ({ route, navigation }: any) => {
    const { roomId, currentUserId, roomName } = route.params;
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const flatListRef = useRef<FlatList>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // ─── Step 1: Connect socket & join room ───
    useEffect(() => {
        const init = async () => {
            let socket = getSocket();
            if (!socket?.connected) {
                socket = await connectSocket();
            }
            socketRef.current = socket;

            // Step 2: Receive socket ID
            socket.on('connected', (data: any) => {
                console.log('My socket ID:', data.socketId);
            });

            // Step 3: Join the room
            socket.emit('join_room', { roomId });

            // Receive initial messages
            socket.on('load_messages', (data: any) => {
                setMessages(data.messages);
                setHasMore(data.hasMore);
                setLoading(false);
            });

            // Step 6: Receive new messages in real-time
            socket.on('receive_message', (message: Message) => {
                setMessages((prev) => [...prev, message]);
                // Mark as read
                socket?.emit('mark_read', { roomId });
            });

            // Typing indicators
            socket.on('user_typing', (data: any) => {
                setIsTyping(data.username);
            });

            socket.on('user_stop_typing', () => {
                setIsTyping(null);
            });

            // Older messages (pagination)
            socket.on('older_messages', (data: any) => {
                setMessages((prev) => [...data.messages, ...prev]);
                setHasMore(data.hasMore);
            });

            // Errors
            socket.on('error', (err: any) => {
                console.error('Socket error:', err.message);
            });
        };

        init();

        return () => {
            // Leave room on unmount
            socketRef.current?.emit('leave_room', { roomId });
            socketRef.current?.off('connected');
            socketRef.current?.off('load_messages');
            socketRef.current?.off('receive_message');
            socketRef.current?.off('user_typing');
            socketRef.current?.off('user_stop_typing');
            socketRef.current?.off('older_messages');
            socketRef.current?.off('error');
        };
    }, [roomId]);

    // ─── Step 4: Send message ───
    const sendMessage = () => {
        if (!inputText.trim() || !socketRef.current) return;

        socketRef.current.emit('send_message', {
            roomId,
            text: inputText.trim(),
        });
        setInputText('');
        socketRef.current.emit('stop_typing', { roomId });
    };

    // Handle typing indicator
    const handleTyping = (text: string) => {
        setInputText(text);
        if (!socketRef.current) return;

        socketRef.current.emit('typing', { roomId });

        // Clear previous timeout
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        // Stop typing after 2 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            socketRef.current?.emit('stop_typing', { roomId });
        }, 2000);
    };

    // Load older messages
    const loadMore = () => {
        if (!hasMore || !socketRef.current || messages.length === 0) return;
        socketRef.current.emit('load_more_messages', {
            roomId,
            before: messages[0].createdAt,
        });
    };

    // ─── Render message bubble ───
    const renderMessage = ({ item }: { item: Message }) => {
        const isMe = item.sender._id === currentUserId;
        return (
            <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.otherMessage]}>
                {!isMe && <Text style={styles.senderName}>{item.sender.username}</Text>}
                <Text style={[styles.messageText, isMe && styles.myMessageText]}>{item.text}</Text>
                <Text style={[styles.timestamp, isMe && styles.myTimestamp]}>
                    {new Date(item.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </Text>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6C63FF" />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={90}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <View style={styles.headerAvatar}>
                        <Text style={styles.headerAvatarText}>
                            {(roomName || 'C')[0].toUpperCase()}
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.headerTitle}>{roomName || 'Chat'}</Text>
                        {isTyping && (
                            <Text style={styles.headerSubtitle}>typing...</Text>
                        )}
                    </View>
                </View>
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item._id}
                renderItem={renderMessage}
                contentContainerStyle={styles.messagesList}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                ListHeaderComponent={
                    hasMore ? (
                        <TouchableOpacity onPress={loadMore} style={styles.loadMoreBtn}>
                            <Text style={styles.loadMoreText}>Load older messages</Text>
                        </TouchableOpacity>
                    ) : null
                }
            />

            {isTyping && (
                <Text style={styles.typingIndicator}>{isTyping} is typing...</Text>
            )}

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={inputText}
                    onChangeText={handleTyping}
                    placeholder="Type a message..."
                    placeholderTextColor="#999"
                    multiline
                />
                <TouchableOpacity
                    style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                    onPress={sendMessage}
                    disabled={!inputText.trim()}
                >
                    <Ionicons
                        name="send"
                        size={20}
                        color="#FFF"
                    />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    backButton: {
        padding: 4,
        marginRight: 8,
    },
    headerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    headerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#6C63FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    headerAvatarText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#333',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#6C63FF',
        fontStyle: 'italic',
    },

    // Messages
    messagesList: { paddingHorizontal: 16, paddingVertical: 8 },
    messageBubble: {
        maxWidth: '75%',
        padding: 12,
        borderRadius: 16,
        marginVertical: 4,
    },
    myMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#6C63FF',
        borderBottomRightRadius: 4,
    },
    otherMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#FFF',
        borderBottomLeftRadius: 4,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    senderName: { fontSize: 12, fontWeight: '700', color: '#6C63FF', marginBottom: 2 },
    messageText: { fontSize: 15, color: '#333' },
    myMessageText: { color: '#FFF' },
    timestamp: { fontSize: 10, color: '#999', marginTop: 4, alignSelf: 'flex-end' },
    myTimestamp: { color: 'rgba(255,255,255,0.7)' },
    typingIndicator: {
        fontSize: 12,
        color: '#999',
        fontStyle: 'italic',
        paddingHorizontal: 20,
        paddingBottom: 4,
    },

    // Input
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#EEE',
    },
    input: {
        flex: 1,
        backgroundColor: '#F0F0F0',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 15,
        maxHeight: 100,
        color: '#333',
    },
    sendButton: {
        marginLeft: 8,
        backgroundColor: '#6C63FF',
        borderRadius: 22,
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: { backgroundColor: '#CCC' },

    // Load more
    loadMoreBtn: { alignSelf: 'center', paddingVertical: 8 },
    loadMoreText: { color: '#6C63FF', fontSize: 13 },
});

export default ChatScreen;
