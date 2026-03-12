import React, { useEffect, useState, useRef } from 'react';
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
    Alert,
    StatusBar,
    Animated,
    Easing,
} from 'react-native';
import { getSocket, connectSocket } from '../services/socketService';
import { Socket } from 'socket.io-client';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ScreenHeader from '../components/ScreenHeader';
import AudioService from '../services/AudioService';
import EncryptedStorage from 'react-native-encrypted-storage';
import { AppConfig } from '../config/api';
import { deleteMessageForMe, deleteMessageForEveryone } from '../services/chatService';

interface Message {
    _id: string;
    text?: string;
    audio?: string;
    voiceUrl?: string;
    sender: { _id: string; username: string; avatar?: string };
    createdAt: string;
    messageType: 'text' | 'audio' | 'voice';
    status?: 'sent' | 'delivered' | 'read';
    isDeletedForEveryone?: boolean;
    deletedFor?: string[];
}

const ChatScreen = ({ route, navigation }: any) => {
    const { roomId, currentUserId, roomName } = route.params;
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // ─── Multi-select state ───
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const isSelecting = selectedIds.size > 0;

    // Audio States
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const isStartingRecording = useRef(false);
    const shouldStopRecording = useRef(false);
    const recordingIntervalRef = useRef<any>(null);

    const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);

    const socketRef = useRef<Socket | null>(null);
    const flatListRef = useRef<FlatList>(null);
    const typingTimeoutRef = useRef<any>(null);
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // ─── Socket setup ───
    useEffect(() => {
        const init = async () => {
            let socket = getSocket();
            if (!socket?.connected) {
                socket = await connectSocket();
            }
            socketRef.current = socket;

            socket.emit('join_room', { roomId });
            socket.emit('mark_read', { roomId });

            socket.on('load_messages', (data: any) => {
                setMessages(data.messages);
                setHasMore(data.hasMore);
                setLoading(false);
            });

            socket.on('receive_message', (message: Message) => {
                setMessages((prev) => [...prev, message]);
                socket?.emit('mark_read', { roomId });
            });

            socket.on('messages_delivered', (data: { roomId: string; messageIds: string[] }) => {
                if (data.roomId === roomId) {
                    setMessages((prev) =>
                        prev.map((msg) =>
                            data.messageIds.includes(msg._id) ? { ...msg, status: 'delivered' } : msg
                        )
                    );
                }
            });

            socket.on('messages_read', (data: { roomId: string; userId: string }) => {
                if (data.roomId === roomId) {
                    setMessages((prev) =>
                        prev.map((msg) =>
                            msg.sender._id === currentUserId ? { ...msg, status: 'read' } : msg
                        )
                    );
                }
            });

            socket.on('message_deleted_for_everyone', (data: { messageId: string; roomId: string }) => {
                if (data.roomId === roomId) {
                    setMessages((prev) =>
                        prev.map((msg) =>
                            msg._id === data.messageId
                                ? { ...msg, isDeletedForEveryone: true, text: '', voiceUrl: undefined, audio: undefined }
                                : msg
                        )
                    );
                }
            });

            socket.on('user_typing', (data: any) => { setIsTyping(data.username); });
            socket.on('user_stop_typing', () => { setIsTyping(null); });

            socket.on('older_messages', (data: any) => {
                setMessages((prev) => [...data.messages, ...prev]);
                setHasMore(data.hasMore);
            });

            socket.on('error', (err: any) => { console.error('Socket error:', err); });
        };

        init();

        return () => {
            socketRef.current?.emit('leave_room', { roomId });
            socketRef.current?.off('load_messages');
            socketRef.current?.off('receive_message');
            socketRef.current?.off('user_typing');
            socketRef.current?.off('user_stop_typing');
            socketRef.current?.off('older_messages');
            socketRef.current?.off('message_deleted_for_everyone');
            socketRef.current?.off('error');
            if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
        };
    }, [roomId]);

    // ─── Selection helpers ───
    const clearSelection = () => setSelectedIds(new Set());

    const toggleSelect = (id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const enterSelectionMode = (id: string) => {
        setSelectedIds(new Set([id]));
    };

    // ─── Multi-select delete ───
    const selectedMessages = messages.filter((m) => selectedIds.has(m._id));
    const allSelectionsAreOwnedByMe = selectedMessages.every((m) => m.sender._id === currentUserId);

    const handleBulkDeleteForMe = async () => {
        const ids = Array.from(selectedIds);
        try {
            await Promise.all(ids.map((id) => deleteMessageForMe(id)));
            setMessages((prev) => prev.filter((m) => !selectedIds.has(m._id)));
            clearSelection();
        } catch (e: any) {
            Alert.alert('Error', e?.response?.data?.message || 'Some messages could not be deleted');
        }
    };

    const handleBulkDeleteForEveryone = async () => {
        const ids = Array.from(selectedIds);
        Alert.alert(
            'Delete for Everyone',
            `Delete ${ids.length} message${ids.length > 1 ? 's' : ''} for everyone? This cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const errors: string[] = [];
                        await Promise.all(
                            ids.map(async (id) => {
                                try {
                                    await deleteMessageForEveryone(id);
                                    setMessages((prev) =>
                                        prev.map((m) =>
                                            m._id === id
                                                ? { ...m, isDeletedForEveryone: true, text: '', voiceUrl: undefined, audio: undefined }
                                                : m
                                        )
                                    );
                                } catch (e: any) {
                                    errors.push(e?.response?.data?.message || id);
                                }
                            })
                        );
                        clearSelection();
                        if (errors.length > 0) {
                            Alert.alert('Some failed', errors.join('\n'));
                        }
                    },
                },
            ]
        );
    };

    const handleShowDeleteOptions = () => {
        const ids = Array.from(selectedIds);
        const count = ids.length;

        if (allSelectionsAreOwnedByMe) {
            Alert.alert(
                `Delete ${count} Message${count > 1 ? 's' : ''}`,
                'Choose how to delete',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Delete for Me',
                        style: 'destructive',
                        onPress: handleBulkDeleteForMe,
                    },
                    {
                        text: 'Delete for Everyone',
                        style: 'destructive',
                        onPress: handleBulkDeleteForEveryone,
                    },
                ]
            );
        } else {
            Alert.alert(
                `Delete ${count} Message${count > 1 ? 's' : ''}`,
                'These messages will be hidden only for you.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Delete for Me',
                        style: 'destructive',
                        onPress: handleBulkDeleteForMe,
                    },
                ]
            );
        }
    };

    // ─── Messaging ───
    const sendMessage = () => {
        if (!inputText.trim() || !socketRef.current || !roomId) return;
        socketRef.current.emit('send_message', {
            roomId,
            text: inputText.trim(),
            messageType: 'text',
        });
        setInputText('');
        socketRef.current.emit('stop_typing', { roomId });
    };

    const handleTyping = (text: string) => {
        setInputText(text);
        if (!socketRef.current) return;
        socketRef.current.emit('typing', { roomId });
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socketRef.current?.emit('stop_typing', { roomId });
        }, 2000);
    };

    const loadMore = () => {
        if (!hasMore || !socketRef.current || messages.length === 0) return;
        socketRef.current.emit('load_more_messages', {
            roomId,
            before: messages[0].createdAt,
        });
    };

    // ─── Recording ───
    const startRecording = async () => {
        if (isSelecting) return;
        try {
            isStartingRecording.current = true;
            shouldStopRecording.current = false;
            await AudioService.requestPermissions();
            await AudioService.startRecording();
            if (shouldStopRecording.current) { await stopRecording(); return; }
            setIsRecording(true);
            setRecordingTime(0);

            // Start pulse animation
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.5, duration: 600, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
                ])
            ).start();

            recordingIntervalRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (error) {
            console.error('Failed to start recording', error);
        } finally {
            isStartingRecording.current = false;
        }
    };

    const stopRecording = async () => {
        if (isStartingRecording.current) { shouldStopRecording.current = true; return; }
        if (!isRecording) return;
        try {
            pulseAnim.setValue(1);
            if (recordingIntervalRef.current) { clearInterval(recordingIntervalRef.current); recordingIntervalRef.current = null; }
            const filePath = await AudioService.stopRecording();
            setIsRecording(false);
            if (recordingTime < 1) return;
            sendVoiceMessage(filePath);
        } catch (error) {
            console.error('Failed to stop recording', error);
            setIsRecording(false);
        }
    };

    const cancelRecording = async () => {
        shouldStopRecording.current = true;
        try {
            pulseAnim.setValue(1);
            if (recordingIntervalRef.current) { clearInterval(recordingIntervalRef.current); recordingIntervalRef.current = null; }
            if (isRecording) await AudioService.stopRecording();
            setIsRecording(false);
        } catch (error) {
            console.error('Failed to cancel recording', error);
            setIsRecording(false);
        }
    };

    const sendVoiceMessage = async (audioPath: string) => {
        if (!socketRef.current || !roomId) return;
        try {
            setIsUploading(true);
            const sessionRaw = await EncryptedStorage.getItem('user_session');
            if (!sessionRaw) throw new Error('No session');
            const { token } = JSON.parse(sessionRaw);

            const formData = new FormData();
            formData.append('audio', {
                uri: Platform.OS === 'android' ? `file://${audioPath}` : audioPath,
                type: 'audio/m4a',
                name: `voice_${Date.now()}.m4a`,
            } as any);
            formData.append('roomId', roomId);
            formData.append('duration', recordingTime.toString());

            const response = await fetch(`${AppConfig.API_URL}/chat/upload/voice`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Upload failed (${response.status}): ${errorText.substring(0, 100)}`);
            }

            const result = await response.json();
            if (result.success) {
                socketRef.current.emit('broadcast_voice_message', { roomId, message: result.message });
            }
        } catch (error) {
            console.error('Voice upload failed:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const formatRecordingTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // ─── Render message ───
    const renderMessage = ({ item }: { item: Message }) => {
        if (item.deletedFor?.includes(currentUserId)) return null;

        const isMe = item.sender._id === currentUserId;
        const isSelected = selectedIds.has(item._id);
        const isDeleted = !!item.isDeletedForEveryone;

        const handlePress = () => {
            if (isSelecting) {
                toggleSelect(item._id);
            }
        };

        const handleLongPress = () => {
            if (!isDeleted) {
                enterSelectionMode(item._id);
            }
        };

        return (
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={handlePress}
                onLongPress={handleLongPress}
                delayLongPress={350}
            >
                <View style={[
                    styles.messageRow,
                    isMe && styles.messageRowMe,
                    isSelected && styles.messageRowSelected,
                ]}>
                    {/* Selection indicator */}
                    {isSelecting && (
                        <View style={[styles.selectionCircle, isSelected && styles.selectionCircleActive]}>
                            {isSelected && <Ionicons name="checkmark" size={13} color="#FFF" />}
                        </View>
                    )}

                    <View style={[
                        styles.messageBubble,
                        isMe ? styles.myMessage : styles.otherMessage,
                        isSelected && (isMe ? styles.myMessageSelected : styles.otherMessageSelected),
                    ]}>
                        {!isMe && <Text style={styles.senderName}>{item.sender.username}</Text>}

                        {isDeleted ? (
                            <Text style={[styles.deletedText, isMe && styles.deletedTextMe]}>
                                🚫 This message was deleted
                            </Text>
                        ) : item.messageType === 'voice' || item.messageType === 'audio' ? (
                            <VoiceMessage
                                key={item._id}
                                messageId={item._id}
                                audio={item.audio}
                                voiceUrl={item.voiceUrl}
                                isMe={isMe}
                                isPlaying={!isSelecting && playingMessageId === item._id}
                                onTogglePlay={() => {
                                    if (isSelecting) return;
                                    if (playingMessageId === item._id) setPlayingMessageId(null);
                                    else setPlayingMessageId(item._id);
                                }}
                            />
                        ) : (
                            <Text style={[styles.messageText, isMe && styles.myMessageText]}>{item.text}</Text>
                        )}

                        <View style={styles.messageFooter}>
                            <Text style={[styles.timestamp, isMe && styles.myTimestamp]}>
                                {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                            {isMe && !isDeleted && (
                                <View style={styles.tickContainer}>
                                    {item.status === 'read' ? (
                                        <Ionicons name="checkmark-done" size={16} color="#4FC3F7" />
                                    ) : item.status === 'delivered' ? (
                                        <Ionicons name="checkmark-done" size={16} color="rgba(255,255,255,0.6)" />
                                    ) : (
                                        <Ionicons name="checkmark" size={15} color="rgba(255,255,255,0.6)" />
                                    )}
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6C63FF" />
            </View>
        );
    }

    // ─── Selection Header ───
    const SelectionHeader = () => (
        <View style={styles.selectionHeader}>
            <TouchableOpacity style={styles.selectionHeaderBtn} onPress={clearSelection}>
                <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>

            <Text style={styles.selectionCount}>
                {selectedIds.size} selected
            </Text>

            <View style={styles.selectionActions}>
                {/* Delete for Everyone — only if ALL selected msgs are mine */}
                {allSelectionsAreOwnedByMe && (
                    <TouchableOpacity
                        style={styles.selectionActionBtn}
                        onPress={handleBulkDeleteForEveryone}
                    >
                        <Ionicons name="people" size={20} color="#FFF" />
                        <Text style={styles.selectionActionLabel}>For All</Text>
                    </TouchableOpacity>
                )}

                {/* Delete for Me */}
                <TouchableOpacity
                    style={[styles.selectionActionBtn, { marginLeft: 4 }]}
                    onPress={handleBulkDeleteForMe}
                >
                    <Ionicons name="trash-outline" size={20} color="#FFF" />
                    <Text style={styles.selectionActionLabel}>For Me</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={90}
        >
            {/* Contextual header when selecting, normal header otherwise */}
            {isSelecting ? (
                <SelectionHeader />
            ) : (
                <ScreenHeader
                    title=""
                    showBackButton={true}
                    rightElement={
                        <View style={styles.headerInfo}>
                            <View style={styles.headerAvatar}>
                                <Text style={styles.headerAvatarText}>{(roomName || 'C')[0].toUpperCase()}</Text>
                            </View>
                        </View>
                    }
                />
            )}

            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item._id}
                renderItem={renderMessage}
                contentContainerStyle={styles.messagesList}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                ListHeaderComponent={hasMore ? (
                    <TouchableOpacity onPress={loadMore} style={styles.loadMoreBtn}>
                        <Text style={styles.loadMoreText}>Load older messages</Text>
                    </TouchableOpacity>
                ) : null}
                ListFooterComponent={isUploading ? (
                    <View style={[styles.messageRow, styles.messageRowMe, { marginBottom: 10 }]}>
                        <View style={[styles.messageBubble, styles.myMessage, styles.uploadingBubble]}>
                            <Text style={[styles.myMessageText, { fontSize: 13, fontWeight: '600', fontStyle: 'italic' }]}>
                                Sending voice...
                            </Text>
                        </View>
                    </View>
                ) : null}
            />

            {isTyping && !isSelecting && (
                <Text style={styles.typingIndicator}>{isTyping} is typing...</Text>
            )}

            {/* Bottom bar — hidden during selection mode */}
            {!isSelecting && (
                <View style={styles.inputBarWrapper}>
                    <View style={styles.inputContainer}>
                        {isRecording ? (
                            <View style={styles.recordingOverlay}>
                                <View style={styles.recordingIndicator}>
                                    <View style={styles.dotContainer}>
                                        <Animated.View style={[styles.recordingDot, { transform: [{ scale: pulseAnim }] }]} />
                                    </View>
                                    <Text style={styles.recordingTimeText}>{formatRecordingTime(recordingTime)}</Text>
                                </View>
                                <Text style={styles.swipeToCancelText}>Release to send</Text>
                                <TouchableOpacity style={styles.cancelButton} onPress={cancelRecording}>
                                    <Ionicons name="trash-outline" size={22} color="#FF4757" />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <>
                                <TouchableOpacity style={styles.attachButton}>
                                    <Ionicons name="add" size={28} color="#6C63FF" />
                                </TouchableOpacity>
                                <TextInput
                                    style={styles.input}
                                    value={inputText}
                                    onChangeText={handleTyping}
                                    placeholder="Type a message..."
                                    placeholderTextColor="#999"
                                    multiline
                                />
                            </>
                        )}
                        {inputText.trim().length > 0 ? (
                            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                                <Ionicons name="send" size={20} color="#FFF" />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={[styles.sendButton, isRecording && { backgroundColor: '#FF4757', transform: [{ scale: 1.2 }] }]}
                                onPressIn={startRecording}
                                onPressOut={stopRecording}
                            >
                                <Ionicons name={isRecording ? "mic" : "mic"} size={24} color="#FFF" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            )}
        </KeyboardAvoidingView>
    );
};

// ─── Voice Message Component ───
const VoiceMessage = ({ messageId, audio, voiceUrl, isMe, isPlaying, onTogglePlay }: {
    messageId: string; audio?: string; voiceUrl?: string;
    isMe: boolean; isPlaying: boolean; onTogglePlay: () => void;
}) => {
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isPreparing, setIsPreparing] = useState(false);
    const [isStarted, setIsStarted] = useState(false);
    const audioPathRef = useRef<string | null>(null);

    // Smaller waveform bars for compact UI
    const bars = [8, 12, 6, 16, 10, 20, 14, 18, 10, 16, 12, 8, 14, 16, 10, 14, 10, 6];

    useEffect(() => {
        if (isPlaying) {
            if (isStarted) {
                AudioService.resumePlaying(audioPathRef.current || undefined);
            } else {
                start();
            }
        } else {
            if (isStarted) {
                AudioService.pausePlaying(audioPathRef.current || undefined);
            }
        }
    }, [isPlaying]);

    useEffect(() => {
        return () => {
            if (isStarted) AudioService.stopPlaying();
        };
    }, [isStarted]);

    const start = async () => {
        let audioSource = audio || voiceUrl;
        if (voiceUrl && !voiceUrl.startsWith('http') && !voiceUrl.startsWith('data:')) {
            audioSource = `${AudioService.getBaseUrl()}${voiceUrl}`;
        }
        if (!audioSource) { console.warn('[VoiceMessage] No audio source'); return; }
        try {
            setIsPreparing(true);
            let playPath = audioSource;
            if (audioSource.startsWith('http') && !audioSource.startsWith('data:')) {
                playPath = await AudioService.downloadRemoteFile(audioSource, `voice_cache_${messageId}.m4a`);
            } else if (audioSource.startsWith('data:') || !audioSource.includes('://')) {
                playPath = await AudioService.base64ToFile(audioSource, `temp_play_${Date.now()}.m4a`);
            }
            await AudioService.stopPlaying();
            await AudioService.startPlaying(playPath, (pos, dur) => {
                setIsPreparing(false);
                setProgress(pos);
                setDuration(dur);
                if (dur > 0 && pos >= dur - 50) { 
                    onTogglePlay(); 
                    setProgress(0); 
                    setIsStarted(false);
                }
            });
            setIsStarted(true);
            audioPathRef.current = playPath;
        } catch (error: any) {
            console.error('Playback error', error);
            setIsPreparing(false);
            onTogglePlay();
            if (error.message?.includes('404')) {
                Alert.alert('Missing Audio', 'Voice message not found on server.');
            } else {
                Alert.alert('Playback Error', 'Could not play the voice message.');
            }
        }
    };

    const playedPercentage = duration > 0 ? (progress / duration) : 0;
    const accentColor = isMe ? '#FFFFFF' : '#6C63FF';
    const inactiveColor = isMe ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)';

    return (
        <View style={styles.voiceMessageWrapper}>
            <TouchableOpacity
                style={[styles.playButtonContainer, !isMe && styles.playButtonOther]}
                onPress={onTogglePlay}
                disabled={isPreparing}
            >
                {isPreparing
                    ? <ActivityIndicator size="small" color={accentColor} />
                    : <Ionicons name={isPlaying ? 'pause' : 'play'} size={20} color={accentColor} />
                }
            </TouchableOpacity>

            <View style={styles.trackContainer}>
                <View style={styles.barsContainer}>
                    {bars.map((h, i) => {
                        const isPlayed = (i / bars.length) < playedPercentage;
                        return (
                            <View
                                key={i}
                                style={[
                                    styles.bar,
                                    { height: h },
                                    { backgroundColor: isPlayed ? accentColor : inactiveColor }
                                ]}
                            />
                        );
                    })}
                </View>
            </View>
            <Text style={[styles.compactDuration, isMe && { color: 'rgba(255,255,255,0.9)' }]}>
                {duration > 0
                    ? (isPlaying ? AudioService.formatTime(progress / 1000) : AudioService.formatTime(duration / 1000))
                    : '0:00'}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    // ─── Normal header ───
    headerInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    headerAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#6C63FF', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
    headerAvatarText: { color: '#FFF', fontSize: 14, fontWeight: '700' },

    // ─── Selection header ───
    selectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4A3BCC',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 48,
        paddingBottom: 12,
        paddingHorizontal: 12,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    selectionHeaderBtn: { padding: 6 },
    selectionCount: { flex: 1, color: '#FFF', fontSize: 17, fontWeight: '700', marginLeft: 12 },
    selectionActions: { flexDirection: 'row', alignItems: 'center' },
    selectionActionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.18)',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 7,
        marginLeft: 8,
    },
    selectionActionLabel: { color: '#FFF', fontSize: 13, fontWeight: '600', marginLeft: 5 },

    // ─── Message list ───
    messagesList: { paddingHorizontal: 12, paddingVertical: 8 },

    messageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 2,
        paddingHorizontal: 4,
        borderRadius: 12,
    },
    messageRowMe: { justifyContent: 'flex-end' },
    messageRowSelected: { backgroundColor: 'rgba(108, 99, 255, 0.1)' },

    // ─── Selection circle ───
    selectionCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: '#6C63FF',
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    selectionCircleActive: { backgroundColor: '#6C63FF', borderColor: '#6C63FF' },

    // ─── Bubbles ───
    messageBubble: { maxWidth: '75%', padding: 12, borderRadius: 16, marginVertical: 2 },
    myMessage: { alignSelf: 'flex-end', backgroundColor: '#6C63FF', borderBottomRightRadius: 4 },
    otherMessage: { alignSelf: 'flex-start', backgroundColor: '#FFF', borderBottomLeftRadius: 4, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2 },
    myMessageSelected: { backgroundColor: '#5750D9' },
    otherMessageSelected: { backgroundColor: '#E8E6FF' },

    senderName: { fontSize: 12, fontWeight: '700', color: '#6C63FF', marginBottom: 2 },
    messageText: { fontSize: 15, color: '#333' },
    myMessageText: { color: '#FFF' },
    deletedText: { fontSize: 14, color: 'rgba(0,0,0,0.3)', fontStyle: 'italic' },
    deletedTextMe: { color: 'rgba(255,255,255,0.4)' },

    messageFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4 },
    timestamp: { fontSize: 10, color: '#999' },
    myTimestamp: { color: 'rgba(255,255,255,0.65)' },
    tickContainer: { marginLeft: 4 },

    // ─── Typing / input ───
    typingIndicator: { fontSize: 12, color: '#999', fontStyle: 'italic', paddingHorizontal: 20, paddingBottom: 4 },
    inputBarWrapper: { backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EEE', paddingBottom: Platform.OS === 'ios' ? 20 : 0 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8 },
    attachButton: { padding: 5, marginRight: 5 },
    input: { flex: 1, backgroundColor: '#F2F2F7', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, maxHeight: 120, color: '#1C1C1E', minHeight: 44 },
    sendButton: { marginLeft: 10, backgroundColor: '#6C63FF', borderRadius: 22, width: 44, height: 44, justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 3 },
    loadMoreBtn: { alignSelf: 'center', paddingVertical: 8 },
    loadMoreText: { color: '#6C63FF', fontSize: 13, fontWeight: '600' },
    uploadingBubble: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 16, 
        paddingVertical: 10,
        opacity: 0.8,
        borderBottomRightRadius: 16, // Override the sharp corner for placeholder
        backgroundColor: '#7D75FF'
    },

    // ─── Recording ───
    recordingOverlay: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2F2F7', borderRadius: 24, paddingHorizontal: 15, height: 48, justifyContent: 'space-between' },
    recordingIndicator: { flexDirection: 'row', alignItems: 'center' },
    dotContainer: { width: 14, height: 14, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
    recordingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF4757' },
    recordingTimeText: { color: '#1C1C1E', fontSize: 16, fontWeight: '700' },
    swipeToCancelText: { color: '#8E8E93', fontSize: 14, fontWeight: '500' },
    cancelButton: { padding: 5, backgroundColor: 'rgba(255, 71, 87, 0.1)', borderRadius: 20 },

    // ─── Voice message ───
    voiceMessageWrapper: { flexDirection: 'row', alignItems: 'center', paddingVertical: 0, minWidth: 150 },
    playButtonContainer: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    playButtonOther: { backgroundColor: 'rgba(108, 99, 255, 0.1)' },
    trackContainer: { flex: 1, marginLeft: 8, justifyContent: 'center' },
    barsContainer: { flexDirection: 'row', alignItems: 'center', height: 20, justifyContent: 'space-between', paddingRight: 4 },
    bar: { width: 2.5, borderRadius: 1.2, marginHorizontal: 0.5 },
    compactDuration: { fontSize: 11, fontWeight: '700', color: '#1C1C1E', marginLeft: 8 },
});

export default ChatScreen;
