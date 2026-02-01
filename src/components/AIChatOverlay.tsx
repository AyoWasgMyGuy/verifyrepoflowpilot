import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTasks } from '../lib/hooks';
import { theme } from '../styles/theme';

type ChatMessage = {
  id: string;
  role: 'ai' | 'user';
  text: string;
  suggested?: string[];
};

type AIChatOverlayProps = {
  visible: boolean;
  onClose: () => void;
  onAddTasks: (titles: string[]) => void;
};

type AIOverlayContextValue = {
  open: () => void;
  close: () => void;
};

const AIOverlayContext = createContext<AIOverlayContextValue | undefined>(undefined);

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome',
    role: 'ai',
    text: "Hello! I'm FlowPilot. How can I help you find your flow today?",
  },
];

function parseSuggestions(input: string) {
  return input
    .split(/\n|,/g)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 5);
}

export function AIOverlayProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const { addTasks } = useTasks();

  const handleAddTasks = useCallback(async (titles: string[]) => {
    if (titles.length === 0) return;
    await addTasks(
      titles.map((title) => ({
        title,
        priority: 3,
        estimateMinutes: 30,
      }))
    );
  }, [addTasks]);

  return (
    <AIOverlayContext.Provider value={{ open: () => setIsOpen(true), close: () => setIsOpen(false) }}>
      {children}
      <AIChatOverlay visible={isOpen} onClose={() => setIsOpen(false)} onAddTasks={handleAddTasks} />
    </AIOverlayContext.Provider>
  );
}

export function useAIOverlay() {
  const ctx = useContext(AIOverlayContext);
  if (!ctx) {
    throw new Error('useAIOverlay must be used within AIOverlayProvider');
  }
  return ctx;
}

export function AIChatOverlay({ visible, onClose, onAddTasks }: AIChatOverlayProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (visible) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    }
  }, [visible, messages]);

  const pushMessage = (message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      text: trimmed,
    };

    pushMessage(userMsg);
    setInput('');
    setIsTyping(true);

    const suggestions = parseSuggestions(trimmed);
    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'ai',
        text: suggestions.length
          ? 'Here are a few tasks I can turn into your inbox.'
          : "Got it. I can help break that down whenever you're ready.",
        suggested: suggestions.length ? suggestions : undefined,
      };
      pushMessage(aiMsg);
      setIsTyping(false);
    }, 550);
  };

  const handleAddAll = (suggested: string[] | undefined) => {
    if (!suggested || suggested.length === 0) return;
    onAddTasks(suggested);
    pushMessage({
      id: `ai_${Date.now()}_confirm`,
      role: 'ai',
      text: `Added ${suggested.length} tasks to your inbox.`,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.avatar}>
                <Ionicons name="sparkles" size={18} color={theme.colors.bg} />
              </View>
              <View>
                <Text style={styles.title}>FlowPilot AI</Text>
                <View style={styles.statusRow}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>Online</Text>
                </View>
              </View>
            </View>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={18} color={theme.colors.textMuted} />
            </Pressable>
          </View>

          <ScrollView
            ref={scrollRef}
            style={styles.messages}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((msg) => (
              <View
                key={msg.id}
                style={[styles.messageWrap, msg.role === 'user' ? styles.messageRight : styles.messageLeft]}
              >
                <View style={[styles.messageBubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}>
                  <Text style={[styles.messageText, msg.role === 'user' ? styles.userText : styles.aiText]}>
                    {msg.text}
                  </Text>
                </View>
                {msg.suggested && msg.suggested.length > 0 && (
                  <View style={styles.suggestedCard}>
                    <Text style={styles.suggestedTitle}>Suggested Tasks</Text>
                    <View style={styles.suggestedList}>
                      {msg.suggested.map((item) => (
                        <View key={item} style={styles.suggestedItem}>
                          <View style={styles.suggestedDot} />
                          <Text style={styles.suggestedText} numberOfLines={1}>
                            {item}
                          </Text>
                        </View>
                      ))}
                    </View>
                    <Pressable style={styles.addAllButton} onPress={() => handleAddAll(msg.suggested)}>
                      <Text style={styles.addAllText}>Add All Tasks</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            ))}
            {isTyping && (
              <View style={[styles.messageWrap, styles.messageLeft]}>
                <View style={[styles.messageBubble, styles.aiBubble, styles.typingBubble]}>
                  <View style={styles.typingDot} />
                  <View style={[styles.typingDot, styles.typingDotDelay]} />
                  <View style={[styles.typingDot, styles.typingDotDelayTwo]} />
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.inputWrap}>
            <View style={styles.inputRow}>
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="Ask anything or dump tasks..."
                placeholderTextColor={theme.colors.textMuted}
                style={styles.input}
                onSubmitEditing={handleSend}
                returnKeyType="send"
              />
              <Pressable style={[styles.sendButton, input.trim() ? styles.sendButtonActive : null]} onPress={handleSend}>
                <Ionicons
                  name="arrow-up"
                  size={16}
                  color={input.trim() ? theme.colors.bg : theme.colors.textMuted}
                />
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: '#111818',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    maxHeight: '85%',
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    backgroundColor: theme.colors.surface,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  title: {
    color: theme.colors.text,
    fontFamily: theme.fonts.display,
    fontSize: 15,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
  },
  statusText: {
    color: theme.colors.primary,
    fontSize: 10,
    fontFamily: theme.fonts.body,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messages: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 12,
  },
  messageWrap: {
    maxWidth: '85%',
  },
  messageLeft: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageRight: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  messageBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  aiBubble: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderTopLeftRadius: 8,
  },
  userBubble: {
    backgroundColor: theme.colors.primary,
    borderTopRightRadius: 8,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
  },
  aiText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
  },
  userText: {
    color: theme.colors.bg,
    fontFamily: theme.fonts.display,
  },
  suggestedCard: {
    marginTop: 10,
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    width: '100%',
  },
  suggestedTitle: {
    color: theme.colors.textMuted,
    fontSize: 10,
    fontFamily: theme.fonts.display,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  suggestedList: {
    gap: 6,
    marginBottom: 10,
  },
  suggestedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  suggestedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
  },
  suggestedText: {
    color: theme.colors.text,
    fontSize: 12,
    fontFamily: theme.fonts.body,
    flex: 1,
  },
  addAllButton: {
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(19,236,236,0.4)',
    backgroundColor: 'rgba(19,236,236,0.12)',
    alignItems: 'center',
  },
  addAllText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontFamily: theme.fonts.display,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.textMuted,
  },
  typingDotDelay: {
    opacity: 0.7,
  },
  typingDotDelayTwo: {
    opacity: 0.4,
  },
  inputWrap: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    backgroundColor: theme.colors.surface,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    color: theme.colors.text,
    fontSize: 13,
    fontFamily: theme.fonts.body,
  },
  sendButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  sendButtonActive: {
    backgroundColor: theme.colors.primary,
  },
});
