import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ArrowRight, CircleHelp, Clock3, HeartHandshake, MessageCircle, Plus, Send, ShieldCheck, Sparkles, X } from 'lucide-react-native';
import { colors } from '@/theme/colors';
import { Screen } from '@/components/Screen';
import { AppButton } from '@/components/AppButton';
import { Surface } from '@/components/Surface';
import { getMoodEntries } from '@/features/mood/moodStorage';
import { getMoodLabel } from '@/features/mood/moodUtils';
import { getConversation, getConversations, getHealth, isApiConfigured, postMessage, type ChatTurnResponse } from '@/features/chat/chatApi';
import type { ChatMessage, ConversationSummary, MoodContextItem, ServerMode } from '@/features/chat/types';

const CRISIS_RESOURCE_URL = 'https://findahelpline.com/';
const STARTERS = [
  'I’ve had a heavy day',
  'Can you help me slow down?',
  'I’m not sure what I’m feeling',
];

function fromTurnMessage(message: ChatTurnResponse['assistantMessage'], id: string, crisis = false): ChatMessage {
  return { ...message, id, crisis: crisis || message.crisis };
}

export default function CompanionScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [draft, setDraft] = useState('');
  const [serverMode, setServerMode] = useState<ServerMode>('offline');
  const [serverError, setServerError] = useState('');
  const [historyError, setHistoryError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingThread, setIsLoadingThread] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [moodConsent, setMoodConsent] = useState(false);
  const [moodContext, setMoodContext] = useState<MoodContextItem[]>([]);
  const [moodConsentError, setMoodConsentError] = useState('');
  const [historyLoading, setHistoryLoading] = useState(false);
  const messagesRef = useRef<ScrollView>(null);
  const apiConfigured = isApiConfigured();

  const loadThread = useCallback(async (id: string) => {
    setIsLoadingThread(true);
    setHistoryError('');
    try {
      const { conversation } = await getConversation(id);
      setConversationId(conversation.conversationId);
      setMessages(conversation.messages.map((message, index) => ({ ...message, id: `${conversation.conversationId}-${index}` })));
      setHistoryOpen(false);
    } catch (error) {
      setHistoryError(error instanceof Error ? error.message : 'Could not load that conversation.');
    } finally {
      setIsLoadingThread(false);
    }
  }, []);

  const initialize = useCallback(async () => {
    setIsLoading(true);
    setServerError('');
    if (!apiConfigured) {
      setServerMode('offline');
      setServerError('Add EXPO_PUBLIC_API_URL to the project .env file, then restart Expo.');
      setIsLoading(false);
      return;
    }
    try {
      const health = await getHealth();
      setServerMode(health.mode);
      const items = await getConversations();
      setConversations(items);
      if (items.length) await loadThread(items[0].conversationId);
      else { setConversationId(undefined); setMessages([]); }
    } catch (error) {
      setServerMode('offline');
      setServerError(error instanceof Error ? error.message : 'Could not reach the Solace API.');
    } finally { setIsLoading(false); }
  }, [apiConfigured, loadThread]);

  useEffect(() => { void initialize(); }, [initialize]);

  const toggleMoodConsent = async (enabled: boolean) => {
    setMoodConsentError('');
    if (!enabled) {
      setMoodConsent(false);
      setMoodContext([]);
      return;
    }
    try {
      const recent = (await getMoodEntries()).slice(0, 7);
      const context = recent.map((entry) => ({ date: entry.dateKey, emotion: getMoodLabel(entry.mood), intensity: entry.intensity }));
      setMoodContext(context);
      setMoodConsent(true);
    } catch {
      setMoodConsent(false);
      setMoodConsentError('Could not read recent check-ins from this device. You can still chat without them.');
    }
  };

  const sendMessage = async (suggestion?: string) => {
    const content = (suggestion ?? draft).trim();
    if (!content || isSending) return;
    setDraft(content);
    setIsSending(true);
    setServerError('');
    try {
      const result = await postMessage({
        message: content,
        conversationId,
        includeMoodContext: moodConsent,
        ...(moodConsent ? { moodContext } : {}),
      });
      const now = new Date().toISOString();
      setMessages((current) => [
        ...current,
        { ...result.userMessage, id: `${result.conversationId}-${now}-user` },
        fromTurnMessage(result.assistantMessage, `${result.conversationId}-${now}-assistant`, result.crisis),
      ]);
      setConversationId(result.conversationId);
      setDraft('');
      setMoodConsent(false);
      setMoodContext([]);
      setServerMode(result.mode === 'groq' ? 'production' : serverMode === 'offline' ? 'demo' : serverMode);
      const latest: ConversationSummary = { conversationId: result.conversationId, title: content.slice(0, 90), updatedAt: now };
      setConversations((current) => [latest, ...current.filter((item) => item.conversationId !== latest.conversationId)]);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'The companion is unavailable. Check your connection and retry.');
    } finally { setIsSending(false); }
  };

  const openHistory = async () => {
    setHistoryOpen(true);
    setHistoryLoading(true);
    setHistoryError('');
    try { setConversations(await getConversations()); }
    catch (error) { setHistoryError(error instanceof Error ? error.message : 'Could not load chat history.'); }
    finally { setHistoryLoading(false); }
  };

  const startNewConversation = () => {
    setConversationId(undefined);
    setMessages([]);
    setDraft('');
    setHistoryOpen(false);
    setServerError('');
    setMoodConsent(false);
    setMoodContext([]);
  };

  const serverLabel = useMemo(() => serverMode === 'production' ? 'Groq connected' : serverMode === 'demo' ? 'Demo mode' : 'Not connected', [serverMode]);

  const openCrisisResources = async () => {
    try { await Linking.openURL(CRISIS_RESOURCE_URL); }
    catch { Alert.alert('Could not open resources', 'Search for a verified crisis line in your country at findahelpline.com.'); }
  };

  return <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
    <KeyboardAvoidingView style={styles.keyboardArea} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <View style={styles.brandMark}><HeartHandshake size={18} color={colors.forest} /></View>
        <View style={styles.headerTitleWrap}><Text style={styles.eyebrow}>A LISTENING SPACE</Text><Text style={styles.headerTitle}>Your companion</Text></View>
        <Pressable accessibilityRole="button" accessibilityLabel="Chat history" onPress={() => void openHistory()} style={styles.headerButton}><Clock3 size={18} color={colors.forest} /></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="New conversation" onPress={startNewConversation} style={styles.headerButton}><Plus size={19} color={colors.forest} /></Pressable>
      </View>

      <View style={[styles.connectionBanner, serverMode === 'production' ? styles.connectedBanner : serverMode === 'demo' ? styles.demoBanner : styles.offlineBanner]}>
        <View style={[styles.statusDot, serverMode === 'production' ? styles.connectedDot : serverMode === 'demo' ? styles.demoDot : styles.offlineDot]} />
        <Text style={styles.connectionText}>{serverLabel}{serverMode === 'demo' ? ' · replies are scripted' : serverMode === 'production' ? ' · chats saved to your server' : ''}</Text>
        {serverMode === 'offline' && <Pressable accessibilityRole="button" onPress={() => void initialize()} hitSlop={8}><Text style={styles.retryLink}>Retry</Text></Pressable>}
      </View>

      <View style={styles.urgentRow}>
        <View style={styles.privacyHint}><ShieldCheck size={13} color={colors.muted} /><Text style={styles.privacyHintText}>Your messages are sent to the Solace API to reply.</Text></View>
        <Pressable accessibilityRole="button" onPress={() => void openCrisisResources()} style={styles.helpButton}><CircleHelp size={14} color={colors.peachInk} /><Text style={styles.helpText}>Urgent help</Text></Pressable>
      </View>

      <ScrollView ref={messagesRef} style={styles.messages} contentContainerStyle={[styles.messagesContent, messages.length === 0 && styles.messagesEmpty]} keyboardShouldPersistTaps="handled" onContentSizeChange={() => messagesRef.current?.scrollToEnd({ animated: true })}>
        {isLoadingThread && <View style={styles.loadingThread}><ActivityIndicator size="small" color={colors.forest} /><Text style={styles.loadingText}>Opening conversation…</Text></View>}
        {messages.length === 0 && !isLoadingThread && <View style={styles.welcome}>
          <View style={styles.welcomeArt}><View style={styles.welcomeHalo} /><View style={styles.welcomeIcon}><MessageCircle size={24} color={colors.forest} /></View><Sparkles size={15} color="#AD946A" style={styles.sparkle} /></View>
          <Text style={styles.welcomeTitle}>You can start anywhere.</Text>
          <Text style={styles.welcomeCopy}>Share what’s on your mind. We can take it one thought at a time.</Text>
          <Text style={styles.startersLabel}>A FEW PLACES TO BEGIN</Text>
          <View style={styles.starters}>{STARTERS.map((starter) => <Pressable key={starter} accessibilityRole="button" onPress={() => void sendMessage(starter)} style={({ pressed }) => [styles.starter, pressed && styles.pressed]}><Text style={styles.starterText}>{starter}</Text><ArrowRight size={15} color={colors.forest} /></Pressable>)}</View>
        </View>}

        {messages.map((message) => <View key={message.id} style={[styles.messageRow, message.role === 'user' ? styles.userRow : styles.assistantRow]}>
          {message.role === 'assistant' && <View style={styles.assistantAvatar}><HeartHandshake size={14} color={colors.forest} /></View>}
          <View style={[styles.bubble, message.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
            <Text style={[styles.messageText, message.role === 'user' ? styles.userMessageText : styles.assistantMessageText]}>{message.content}</Text>
            <Text style={[styles.messageTime, message.role === 'user' && styles.userTime]}>{new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(new Date(message.createdAt))}</Text>
            {message.crisis && <Pressable accessibilityRole="button" onPress={() => void openCrisisResources()} style={styles.crisisLink}><Text style={styles.crisisLinkText}>Find a crisis line for my country</Text><ArrowRight size={14} color={colors.peachInk} /></Pressable>}
          </View>
        </View>)}

        {isSending && <View style={[styles.messageRow, styles.assistantRow]}><View style={styles.assistantAvatar}><HeartHandshake size={14} color={colors.forest} /></View><View style={[styles.bubble, styles.assistantBubble, styles.typingBubble]}><ActivityIndicator size="small" color={colors.forest} /><Text style={styles.typingText}>Taking a moment…</Text></View></View>}
      </ScrollView>

      <View style={styles.composerArea}>
        {!!serverError && <View accessibilityRole="alert" style={styles.errorPanel}><Text style={styles.errorText}>{serverError}</Text><Pressable accessibilityRole="button" disabled={isSending || !draft.trim()} onPress={() => void sendMessage()} style={styles.retryButton}><Text style={[styles.retryLink, (!draft.trim() || isSending) && styles.disabledText]}>Retry message</Text></Pressable></View>}
        {moodConsentError ? <Text accessibilityRole="alert" style={styles.contextError}>{moodConsentError}</Text> : null}
        <View style={styles.moodConsentCard}>
          <View style={styles.moodSwitchCopy}><Text style={styles.moodSwitchTitle}>Share recent mood context</Text><Text style={styles.moodSwitchDescription}>For your next reply only · emotion, intensity, and date</Text></View>
          <Switch value={moodConsent} onValueChange={(value) => void toggleMoodConsent(value)} trackColor={{ false: '#D9DBD3', true: '#9DB39F' }} thumbColor={colors.white} accessibilityLabel="Share mood context for the next reply" />
        </View>
        {moodConsent && <Text style={styles.contextDisclosure}>Only up to 7 recent check-ins are shared. Mood notes and journal entries are never included.</Text>}
        <View style={styles.composerRow}>
          <TextInput accessibilityLabel="Message your wellness companion" placeholder="Write what’s on your mind…" placeholderTextColor="#9A9D93" value={draft} onChangeText={setDraft} editable={!isSending} multiline maxLength={2000} style={styles.input} textAlignVertical="center" />
          <Pressable accessibilityRole="button" accessibilityLabel="Send message" disabled={!draft.trim() || isSending} onPress={() => void sendMessage()} style={({ pressed }) => [styles.sendButton, (!draft.trim() || isSending) && styles.sendDisabled, pressed && styles.pressed]}>
            {isSending ? <ActivityIndicator size="small" color={colors.white} /> : <Send size={17} color={colors.white} />}
          </Pressable>
        </View>
        <Text style={styles.disclaimer}>Solace offers supportive conversation, not diagnosis or professional care.</Text>
      </View>
    </KeyboardAvoidingView>

    <Modal visible={historyOpen} animationType="slide" transparent onRequestClose={() => setHistoryOpen(false)}>
      <View style={styles.modalBackdrop}>
        <SafeAreaView style={styles.historySheet} edges={['bottom']}>
          <View style={styles.sheetHeader}><View><Text style={styles.sheetEyebrow}>YOUR PRIVATE SPACE</Text><Text style={styles.sheetTitle}>Past conversations</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Close conversation history" onPress={() => setHistoryOpen(false)} style={styles.closeButton}><X size={19} color={colors.ink} /></Pressable></View>
          {historyLoading ? <View style={styles.sheetEmpty}><ActivityIndicator color={colors.forest} /><Text style={styles.sheetEmptyText}>Loading your history…</Text></View> : historyError ? <View style={styles.sheetEmpty}><Text style={styles.sheetError}>{historyError}</Text><AppButton variant="secondary" onPress={() => void openHistory()}>Try again</AppButton></View> : conversations.length === 0 ? <View style={styles.sheetEmpty}><View style={styles.sheetEmptyIcon}><MessageCircle size={20} color={colors.forest} /></View><Text style={styles.sheetEmptyTitle}>No conversations yet</Text><Text style={styles.sheetEmptyText}>Your chats will be saved here.</Text></View> : <ScrollView contentContainerStyle={styles.historyList}>
            {conversations.map((item) => <Pressable key={item.conversationId} accessibilityRole="button" onPress={() => void loadThread(item.conversationId)} style={({ pressed }) => [styles.historyItem, pressed && styles.pressed]}>
              <View style={styles.historyItemIcon}><MessageCircle size={17} color={colors.forest} /></View><View style={styles.historyItemCopy}><Text numberOfLines={1} style={styles.historyItemTitle}>{item.title || 'New conversation'}</Text><Text style={styles.historyItemDate}>{new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(item.updatedAt))}</Text></View><ArrowRight size={16} color={colors.muted} />
            </Pressable>)}
          </ScrollView>}
          <AppButton variant="secondary" onPress={startNewConversation}>Start a new conversation</AppButton>
          <Text style={styles.sheetNote}>Conversation history is held by the API’s configured storage. Demo history clears when the server restarts.</Text>
        </SafeAreaView>
      </View>
    </Modal>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas }, keyboardArea: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingTop: 8, paddingBottom: 11, gap: 10, borderBottomWidth: 1, borderBottomColor: colors.line },
  brandMark: { width: 36, height: 36, borderRadius: 14, backgroundColor: colors.sage, alignItems: 'center', justifyContent: 'center' }, headerTitleWrap: { flex: 1 }, eyebrow: { fontSize: 8, letterSpacing: 1.3, color: colors.muted, fontWeight: '700' }, headerTitle: { color: colors.ink, fontSize: 15, fontWeight: '600', marginTop: 2 },
  headerButton: { width: 35, height: 35, borderRadius: 13, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  connectionBanner: { minHeight: 27, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 19 }, connectedBanner: { backgroundColor: '#EEF3EA' }, demoBanner: { backgroundColor: '#F4EFE3' }, offlineBanner: { backgroundColor: '#F6EAE7' }, statusDot: { width: 6, height: 6, borderRadius: 4 }, connectedDot: { backgroundColor: '#64876B' }, demoDot: { backgroundColor: '#A8874F' }, offlineDot: { backgroundColor: colors.danger }, connectionText: { flex: 1, color: '#737A71', fontSize: 9 }, retryLink: { color: colors.forestDeep, fontSize: 10, fontWeight: '700' },
  urgentRow: { minHeight: 34, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, borderBottomWidth: 1, borderBottomColor: colors.line }, privacyHint: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5 }, privacyHintText: { color: colors.muted, fontSize: 8 }, helpButton: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.peach, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 11 }, helpText: { color: colors.peachInk, fontSize: 8, fontWeight: '700' },
  messages: { flex: 1 }, messagesContent: { paddingHorizontal: 17, paddingTop: 16, paddingBottom: 18, gap: 13 }, messagesEmpty: { flexGrow: 1, justifyContent: 'center' }, loadingThread: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, padding: 20 }, loadingText: { color: colors.muted, fontSize: 11 },
  welcome: { alignItems: 'center', paddingHorizontal: 5, paddingVertical: 8 }, welcomeArt: { width: 91, height: 91, alignItems: 'center', justifyContent: 'center', marginBottom: 15 }, welcomeHalo: { position: 'absolute', width: 88, height: 88, borderRadius: 44, backgroundColor: colors.sage }, welcomeIcon: { width: 55, height: 55, borderRadius: 22, backgroundColor: '#F7F6F0', alignItems: 'center', justifyContent: 'center' }, sparkle: { position: 'absolute', top: 8, right: 4 }, welcomeTitle: { color: colors.ink, fontSize: 19, fontWeight: '500', letterSpacing: -0.2, textAlign: 'center' }, welcomeCopy: { color: colors.muted, fontSize: 11, lineHeight: 17, textAlign: 'center', marginTop: 7, maxWidth: 260 }, startersLabel: { color: colors.muted, fontSize: 8, fontWeight: '700', letterSpacing: 1.15, marginTop: 21, marginBottom: 8 }, starters: { width: '100%', maxWidth: 360, gap: 7 }, starter: { minHeight: 41, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, borderRadius: 14, paddingHorizontal: 13 }, starterText: { color: colors.ink, fontSize: 10, fontWeight: '500' },
  pressed: { opacity: 0.78 }, messageRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 7 }, userRow: { justifyContent: 'flex-end' }, assistantRow: { justifyContent: 'flex-start' }, assistantAvatar: { width: 27, height: 27, borderRadius: 11, backgroundColor: colors.sage, alignItems: 'center', justifyContent: 'center', marginBottom: 2 }, bubble: { maxWidth: '82%', borderRadius: 18, paddingHorizontal: 13, paddingTop: 10, paddingBottom: 7 }, userBubble: { backgroundColor: colors.forest, borderBottomRightRadius: 5 }, assistantBubble: { backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, borderBottomLeftRadius: 5 }, messageText: { fontSize: 12, lineHeight: 18 }, userMessageText: { color: colors.white }, assistantMessageText: { color: colors.ink }, messageTime: { color: '#A0A297', fontSize: 8, marginTop: 6, alignSelf: 'flex-end' }, userTime: { color: '#D7E1D5' }, typingBubble: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12 }, typingText: { color: colors.muted, fontSize: 10 }, crisisLink: { flexDirection: 'row', gap: 5, alignItems: 'center', paddingTop: 9, marginTop: 7, borderTopWidth: 1, borderTopColor: colors.line }, crisisLinkText: { color: colors.peachInk, fontSize: 10, fontWeight: '700' },
  composerArea: { backgroundColor: colors.canvas, borderTopWidth: 1, borderTopColor: colors.line, paddingHorizontal: 14, paddingTop: 9, paddingBottom: 6 }, errorPanel: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 9, borderRadius: 12, backgroundColor: '#F6EAE7', marginBottom: 8 }, errorText: { flex: 1, color: colors.danger, fontSize: 10, lineHeight: 14 }, retryButton: { padding: 4 }, disabledText: { opacity: 0.4 }, contextError: { color: colors.danger, fontSize: 9, marginBottom: 6 },
  moodConsentCard: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 11, paddingVertical: 8, backgroundColor: colors.paper, borderColor: colors.line, borderWidth: 1, borderRadius: 13, marginBottom: 7 }, moodSwitchCopy: { flex: 1 }, moodSwitchTitle: { color: colors.ink, fontSize: 10, fontWeight: '600' }, moodSwitchDescription: { color: colors.muted, fontSize: 8, marginTop: 3 }, contextDisclosure: { color: colors.forest, fontSize: 8, lineHeight: 12, marginHorizontal: 4, marginBottom: 6 },
  composerRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 }, input: { flex: 1, minHeight: 43, maxHeight: 96, borderRadius: 17, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 13, paddingVertical: 10, color: colors.ink, fontSize: 12, lineHeight: 17 }, sendButton: { width: 42, height: 42, borderRadius: 16, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center' }, sendDisabled: { backgroundColor: '#AAB6A9' }, disclaimer: { textAlign: 'center', color: '#9A9D93', fontSize: 7, marginTop: 6 },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(29,39,33,0.34)' }, historySheet: { maxHeight: '82%', minHeight: '45%', backgroundColor: colors.canvas, borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingHorizontal: 20, paddingTop: 21, paddingBottom: 13 }, sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }, sheetEyebrow: { color: colors.muted, fontSize: 8, letterSpacing: 1.3, fontWeight: '700' }, sheetTitle: { color: colors.ink, fontSize: 21, fontWeight: '500', marginTop: 4 }, closeButton: { width: 34, height: 34, borderRadius: 12, backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center' },
  sheetEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 15 }, sheetEmptyIcon: { width: 45, height: 45, borderRadius: 17, backgroundColor: colors.sage, alignItems: 'center', justifyContent: 'center' }, sheetEmptyTitle: { color: colors.ink, fontSize: 13, fontWeight: '600' }, sheetEmptyText: { color: colors.muted, fontSize: 10, textAlign: 'center', lineHeight: 15 }, sheetError: { color: colors.danger, fontSize: 11, textAlign: 'center' }, historyList: { gap: 8, paddingBottom: 12 }, historyItem: { minHeight: 62, flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, borderRadius: 16, paddingHorizontal: 12 }, historyItemIcon: { width: 34, height: 34, borderRadius: 12, backgroundColor: colors.sage, alignItems: 'center', justifyContent: 'center' }, historyItemCopy: { flex: 1 }, historyItemTitle: { color: colors.ink, fontSize: 11, fontWeight: '600' }, historyItemDate: { color: colors.muted, fontSize: 8, marginTop: 4 }, sheetNote: { color: colors.muted, fontSize: 8, lineHeight: 12, textAlign: 'center', marginTop: 8 },
});
