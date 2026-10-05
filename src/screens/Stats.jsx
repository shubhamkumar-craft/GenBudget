import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
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
import { PieChart } from 'react-native-gifted-charts';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Matches your app's palette: blue primary, teal / amber / slate for the rest
const CATEGORY_COLORS = {
  Rent: '#3A86FF',
  Travel: '#2dd4bf',
  Food: '#fbbf24',
  Others: '#5b6b8c',
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

// Maps any expense name into one of your 4 buckets
const classify = (rawName = '') => {
  const name = rawName.toLowerCase();
  if (name.includes('rent') || name.includes('house') || name.includes('emi')) return 'Rent';
  if (name.includes('travel') || name.includes('uber') || name.includes('cab') || name.includes('fuel') || name.includes('petrol') || name.includes('flight') || name.includes('train')) return 'Travel';
  if (name.includes('food') || name.includes('grocery') || name.includes('restaurant') || name.includes('swiggy') || name.includes('zomato') || name.includes('lunch') || name.includes('dinner')) return 'Food';
  return 'Others';
};

const CATEGORY_ORDER = ['Rent', 'Travel', 'Food', 'Others'];
const SUGGESTED_QUESTIONS = [
  'Where did I spend the most?',
  'How can I save more?',
];

const getAssistantReply = (question, { expenseTotal, incomeTotal, balance, expenseBreakdown, expenses }) => {
  const normalizedQuestion = question.toLowerCase();
  const categories = Object.entries(expenseBreakdown).sort((a, b) => b[1] - a[1]);
  const largestCategory = categories[0];
  const largestExpense = expenses.reduce(
    (largest, item) => Number(item.amount || 0) > Number(largest?.amount || 0) ? item : largest,
    null,
  );

  if (normalizedQuestion.includes('most') || normalizedQuestion.includes('category')) {
    return largestCategory
      ? `${largestCategory[0]} is your biggest spending category at ${formatCurrency(largestCategory[1])}${expenseTotal > 0 ? ` (${Math.round((largestCategory[1] / expenseTotal) * 100)}% of your expenses)` : ''}.`
      : 'There are no expenses to compare yet. Add a transaction and I can break down your spending.';
  }

  if (normalizedQuestion.includes('save') || normalizedQuestion.includes('advice') || normalizedQuestion.includes('budget')) {
    if (!expenseTotal) return 'Once you add a few expenses, I can suggest practical ways to save based on your spending.';
    const suggestion = largestCategory
      ? `Your largest category is ${largestCategory[0]}. Try setting a weekly limit for it and reviewing it before the week ends.`
      : 'Try setting a weekly spending limit and checking your expenses regularly.';
    const savingsRate = incomeTotal > 0 ? Math.max(0, Math.round((balance / incomeTotal) * 100)) : 0;
    return `${suggestion}${incomeTotal > 0 ? ` Your current balance is ${formatCurrency(balance)} (${savingsRate}% of recorded income).` : ''}`;
  }

  if (normalizedQuestion.includes('balance') || normalizedQuestion.includes('left') || normalizedQuestion.includes('income')) {
    return `You've recorded ${formatCurrency(incomeTotal)} in income and ${formatCurrency(expenseTotal)} in expenses, leaving a balance of ${formatCurrency(balance)}.`;
  }

  if (normalizedQuestion.includes('spent') || normalizedQuestion.includes('expense') || normalizedQuestion.includes('spend')) {
    return `You've recorded ${formatCurrency(expenseTotal)} in expenses across ${expenses.length} transaction${expenses.length === 1 ? '' : 's'}.`;
  }

  if (normalizedQuestion.includes('biggest') || normalizedQuestion.includes('largest') || normalizedQuestion.includes('transaction')) {
    return largestExpense
      ? `Your largest single expense is ${largestExpense.expname || 'Unnamed expense'} at ${formatCurrency(Number(largestExpense.amount || 0))}.`
      : 'There are no expenses to compare yet. Add an expense and I can find your largest one.';
  }

  return `So far, you've recorded ${formatCurrency(expenseTotal)} in expenses and have a balance of ${formatCurrency(balance)}. Ask me about your biggest category, balance, or ways to save.`;
};

const Stats = ({ trans = [] }) => {
  const [assistantVisible, setAssistantVisible] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const panelOffset = useRef(new Animated.Value(420)).current;

  const incomeTotal = trans
    .filter((item) => item.type === 'income')
    .reduce((total, item) => total + Number(item.amount || 0), 0);

  const expenses = trans
    .filter((item) => item.type === 'expense')
  const expenseTotal = expenses
    .reduce((total, item) => total + Number(item.amount || 0), 0);

  const balance = incomeTotal - expenseTotal;

  const expenseBreakdown = expenses
    .reduce((grouped, item) => {
      const bucket = classify(item.expname);
      grouped[bucket] = (grouped[bucket] || 0) + Number(item.amount || 0);
      return grouped;
    }, {});

  const largestCategory = Object.entries(expenseBreakdown).sort((a, b) => b[1] - a[1])[0];
  const assistantContext = { expenseTotal, incomeTotal, balance, expenseBreakdown, expenses };

  useEffect(() => {
    if (assistantVisible) {
      panelOffset.setValue(420);
      Animated.timing(panelOffset, {
        toValue: 0,
        duration: 240,
        useNativeDriver: true,
      }).start();
    }
  }, [assistantVisible, panelOffset]);

  const askAssistant = (rawQuestion) => {
    const trimmedQuestion = rawQuestion.trim();
    if (!trimmedQuestion) return;

    const reply = getAssistantReply(trimmedQuestion, assistantContext);
    setMessages((previousMessages) => [
      ...previousMessages,
      { id: `${Date.now()}-question`, role: 'user', text: trimmedQuestion },
      { id: `${Date.now()}-reply`, role: 'assistant', text: reply },
    ]);
    setQuestion('');
  };

  const openAssistant = () => {
    setMessages([]);
    setQuestion('');
    setAssistantVisible(true);
  };

  const closeAssistant = () => {
    Animated.timing(panelOffset, {
      toValue: 420,
      duration: 180,
      useNativeDriver: true,
    }).start(() => setAssistantVisible(false));
  };

  const pieData = CATEGORY_ORDER
    .filter((label) => expenseBreakdown[label] > 0)
    .map((label) => {
      const value = expenseBreakdown[label];
      return {
        value,
        color: CATEGORY_COLORS[label],
        label,
      };
    });

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.headerText}>Spending categories</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open AI money coach"
            testID="open-money-coach"
            onPress={openAssistant}
            style={styles.assistantButton}
          >
            <MaterialCommunityIcons name="creation" size={17} color="#bfdbfe" />
            <Text style={styles.assistantButtonText}>Ask AI</Text>
          </Pressable>
        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.cardLabel}>Income</Text>
            <Text style={styles.metricValue}>{formatCurrency(incomeTotal)}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.cardLabel}>Expense</Text>
            <Text style={styles.metricValue}>{formatCurrency(expenseTotal)}</Text>
          </View>
          <View style={[styles.metricCard, styles.balanceCard]}>
            <Text style={styles.cardLabel}>Balance</Text>
            <Text testID="total-balance" style={styles.balanceValue}>
              {`₹${balance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
            </Text>
          </View>
        </View>

        <View style={styles.chartCard}>
          {pieData.length > 0 ? (
            <>
              <PieChart
                donut
                radius={120}
                innerRadius={82}
                innerCircleColor="#0d1526"
                data={pieData}
                centerLabelComponent={() => (
                  <View style={{ alignItems: 'center' }}>
                    <Text style={styles.centerSubLabel}>Total expenses</Text>
                    <Text style={styles.centerLabel}>{formatCurrency(expenseTotal)}</Text>
                  </View>
                )}
              />

              <View style={styles.list}>
                {pieData.map((item, index) => (
                  <View
                    key={item.label}
                    style={[
                      styles.listRow,
                      index === pieData.length - 1 && styles.listRowLast,
                    ]}
                  >
                    <View style={styles.listRowLeft}>
                      <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                      <Text style={styles.listLabel}>{item.label}</Text>
                    </View>
                    <Text style={styles.listValue}>{formatCurrency(item.value)}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Add expenses to see your spending breakdown.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={assistantVisible}
        transparent
        animationType="fade"
        onRequestClose={closeAssistant}
      >
        <View style={styles.modalRoot}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close AI money coach"
            testID="close-money-coach"
            style={styles.backdrop}
            onPress={closeAssistant}
          />
          <Animated.View
            testID="money-coach-panel"
            style={[styles.assistantPanel, { transform: [{ translateX: panelOffset }] }]}
          >
            <KeyboardAvoidingView
              style={styles.assistantContent}
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
              <View style={styles.assistantHeader}>
                <View style={styles.assistantTitleWrap}>
                  <View style={styles.assistantAvatar}>
                    <MaterialCommunityIcons name="creation" size={19} color="#bfdbfe" />
                  </View>
                  <View>
                    <Text style={styles.assistantTitle}>Money Coach</Text>
                    <Text style={styles.assistantSubtitle}>Your personal expense insights</Text>
                  </View>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close AI money coach"
                  onPress={closeAssistant}
                  style={styles.closeButton}
                >
                  <MaterialCommunityIcons name="close" size={22} color="#cbd5e1" />
                </Pressable>
              </View>

              <View style={styles.insightCard}>
                <Text style={styles.insightEyebrow}>YOUR MONEY SNAPSHOT</Text>
                <Text style={styles.insightHeadline}>
                  {expenseTotal > 0
                    ? `${formatCurrency(expenseTotal)} spent so far`
                    : 'Your insights start here'}
                </Text>
                <Text style={styles.insightDescription}>
                  {expenseTotal > 0
                    ? largestCategory
                      ? `${largestCategory[0]} is your top category. You have ${formatCurrency(balance)} left from recorded income.`
                      : `You have ${formatCurrency(balance)} left from recorded income.`
                    : 'Add transactions to get a personal breakdown of your spending.'}
                </Text>
              </View>

              <ScrollView
                style={styles.chatScroll}
                contentContainerStyle={styles.chatContent}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.assistantBubble}>
                  <Text style={styles.chatMessage}>
                    Hi! I can help you understand your expenses and find ways to save. What would you like to know?
                  </Text>
                </View>
                {messages.map((message) => (
                  <View
                    key={message.id}
                    style={[
                      styles.chatBubble,
                      message.role === 'user' ? styles.userBubble : styles.assistantBubble,
                    ]}
                  >
                    <Text style={styles.chatMessage}>{message.text}</Text>
                  </View>
                ))}
                {messages.length === 0 && (
                  <View style={styles.suggestionWrap}>
                    {SUGGESTED_QUESTIONS.map((suggestion) => (
                      <Pressable
                        key={suggestion}
                        onPress={() => askAssistant(suggestion)}
                        style={styles.suggestionChip}
                      >
                        <Text style={styles.suggestionText}>{suggestion}</Text>
                        <MaterialCommunityIcons name="arrow-top-left" size={15} color="#93c5fd" />
                      </Pressable>
                    ))}
                    <Pressable
                      onPress={() => askAssistant('What is my balance?')}
                      style={styles.suggestionChip}
                    >
                      <Text style={styles.suggestionText}>What is my balance?</Text>
                      <MaterialCommunityIcons name="arrow-top-left" size={15} color="#93c5fd" />
                    </Pressable>
                  </View>
                )}
              </ScrollView>

              <View style={styles.inputRow}>
                <TextInput
                  accessibilityLabel="Ask about your expenses"
                  testID="money-coach-input"
                  value={question}
                  onChangeText={setQuestion}
                  onSubmitEditing={() => askAssistant(question)}
                  placeholder="Ask about your expenses..."
                  placeholderTextColor="#64748b"
                  returnKeyType="send"
                  style={styles.questionInput}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Send question"
                  testID="send-money-coach-question"
                  onPress={() => askAssistant(question)}
                  style={styles.sendButton}
                >
                  <MaterialCommunityIcons name="arrow-up" size={21} color="#fff" />
                </Pressable>
              </View>
              <Text style={styles.privacyNote}>Insights are generated on your device from your transactions.</Text>
            </KeyboardAvoidingView>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

export default Stats;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#090f1f',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
    backgroundColor: '#090f1f',
  },
  headerText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: 1.1,
    fontFamily: '',
    marginBottom: 18,
    flexShrink: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  assistantButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.42)',
    backgroundColor: 'rgba(58, 134, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 18,
  },
  assistantButtonText: {
    color: '#bfdbfe',
    fontSize: 13,
    fontWeight: '700',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flexGrow: 1,
    minWidth: '30%',
    borderRadius: 24,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    shadowColor: '#3A86FF',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
  },
  balanceCard: {
    backgroundColor: 'rgba(58, 134, 255, 0.12)',
    borderColor: 'rgba(58, 134, 255, 0.4)',
  },
  cardLabel: {
    fontSize: 13,
    color: '#dbeafe',
    fontWeight: '500',
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#3A86FF',
  },
  chartCard: {
    width: '100%',
    borderRadius: 32,
    paddingVertical: 28,
    paddingHorizontal: 20,
    marginTop: 22,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    shadowColor: '#3A86FF',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    alignItems: 'center',
  },
  centerSubLabel: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 4,
  },
  centerLabel: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  list: {
    width: '100%',
    marginTop: 28,
  },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  listRowLast: {
    borderBottomWidth: 0,
  },
  listRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    marginRight: 12,
  },
  listLabel: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '600',
  },
  listValue: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyState: {
    paddingVertical: 34,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#94a3b8',
    textAlign: 'center',
    fontSize: 14,
  },
  modalRoot: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(2, 6, 23, 0.55)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  assistantPanel: {
    width: '90%',
    maxWidth: 420,
    height: '100%',
    paddingTop: Platform.OS === 'ios' ? 54 : 32,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    paddingHorizontal: 18,
    backgroundColor: '#0d1526',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(148, 163, 184, 0.2)',
  },
  assistantContent: {
    flex: 1,
  },
  assistantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  assistantTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  assistantAvatar: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(58, 134, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.35)',
  },
  assistantTitle: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '800',
  },
  assistantSubtitle: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 3,
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  insightCard: {
    borderRadius: 20,
    padding: 17,
    marginBottom: 18,
    backgroundColor: 'rgba(58, 134, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.28)',
  },
  insightEyebrow: {
    color: '#93c5fd',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 9,
  },
  insightHeadline: {
    color: '#f8fafc',
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 6,
  },
  insightDescription: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 18,
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    paddingBottom: 16,
  },
  chatBubble: {
    maxWidth: '90%',
    borderRadius: 17,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 10,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderBottomLeftRadius: 5,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(58, 134, 255, 0.28)',
    borderBottomRightRadius: 5,
  },
  chatMessage: {
    color: '#e2e8f0',
    fontSize: 13,
    lineHeight: 19,
  },
  suggestionWrap: {
    gap: 9,
    marginTop: 4,
  },
  suggestionChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.25)',
    backgroundColor: 'rgba(58, 134, 255, 0.08)',
  },
  suggestionText: {
    color: '#bfdbfe',
    fontSize: 12,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 18,
    padding: 6,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  questionInput: {
    flex: 1,
    color: '#f8fafc',
    minHeight: 42,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3A86FF',
  },
  privacyNote: {
    color: '#64748b',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 9,
  },
});