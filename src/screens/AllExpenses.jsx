import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FlatList } from 'react-native';
import React, { useMemo, useState } from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'week', label: 'Last 7 Days' },
  { key: 'month', label: 'Last Month' },
];

const parseItemDate = (item) => {
  if (!item?.date) return null;

  const direct = new Date(item.date);
  if (!isNaN(direct.getTime())) return direct;

  const match = String(item.date).match(/(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/);
  if (match) {
    const [, d, m, y] = match;
    const year = y.length === 2 ? `20${y}` : y;
    const parsed = new Date(`${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  return null;
};

const AllExpenses = ({ trans, setTrans, handledelete }) => {
  const [selectedId, setSelectedId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredTrans = useMemo(() => {
    if (activeFilter === 'all') return trans;

    const now = new Date();
    const cutoff = new Date();

    if (activeFilter === 'week') {
      cutoff.setDate(now.getDate() - 7);
    } else if (activeFilter === 'month') {
      cutoff.setMonth(now.getMonth() - 1);
    }

    return trans.filter((item) => {
      const itemDate = parseItemDate(item);
      if (!itemDate) return true;
      return itemDate >= cutoff && itemDate <= now;
    });
  }, [trans, activeFilter]);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>All Transactions</Text>

      <View style={styles.filterRow}>
        {FILTERS.map((filter) => {
          const isActive = activeFilter === filter.key;
          return (
            <Pressable
              key={filter.key}
              onPress={() => setActiveFilter(filter.key)}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
            >
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={filteredTrans}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No transactions in this period.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isSelected = selectedId === item.id;
          const isIncome = item.type === 'income';

          return (
            <Pressable
              onPress={() => setSelectedId(isSelected ? null : item.id)}
              style={[styles.expenseItem, isSelected && styles.selectedItem]}
            >
              <View style={styles.rowTop}>
                <View style={styles.titleBlock}>
                  <Text style={styles.expenseTitle}>{item.expname}</Text>
                  <Text style={styles.dateText}>
                    {item.date}  {item.time}
                  </Text>
                </View>

                <View style={styles.valueBlock}>
                  <Text style={[styles.amountText, { color: isIncome ? '#34d399' : '#f87171' }]}>
                    {isIncome ? '+' : '-'}₹{item.amount}
                  </Text>
                  <Text style={[styles.typeBadge, isIncome ? styles.incomeBadge : styles.expenseBadge]}>
                    {item.type}
                  </Text>
                </View>
              </View>

              {isSelected && (
                <View style={styles.actionRow}>
                  <Text style={styles.actionHint}>Delete this item</Text>
                  <Pressable
                    onPress={() => {
                      handledelete(item.id);
                      setSelectedId(null);
                    }}
                    style={styles.deleteButton}
                  >
                    <MaterialCommunityIcons name="delete-outline" color="#fff" size={18} style={styles.icon} />
                    <Text style={styles.deleteText}>Delete</Text>
                  </Pressable>
                </View>
              )}
            </Pressable>
          );
        }}
      />
    </View>
  );
};

export default AllExpenses;

const styles = StyleSheet.create({
  icon: {
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#090f1f',
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 16,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  filterChipActive: {
    backgroundColor: '#3A86FF',
    borderColor: '#3A86FF',
  },
  filterChipText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: '#f8fafc',
  },
  listContent: {
    paddingBottom: 32,
  },
  expenseItem: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderRadius: 22,
    backgroundColor: 'rgba(15, 27, 56, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.16)',
  },
  selectedItem: {
    borderColor: 'rgba(58, 134, 255, 0.7)',
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleBlock: {
    flex: 1,
    paddingRight: 12,
  },
  expenseTitle: {
    fontSize: 16,
    color: '#f8fafc',
    fontWeight: '700',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  valueBlock: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'right',
  },
  typeBadge: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
    textTransform: 'uppercase',
  },
  incomeBadge: {
    backgroundColor: 'rgba(52, 211, 153, 0.16)',
    color: '#86efac',
  },
  expenseBadge: {
    backgroundColor: 'rgba(248, 113, 113, 0.16)',
    color: '#fca5a5',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.14)',
  },
  actionHint: {
    color: '#cbd5e1',
    fontSize: 12,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  deleteText: {
    color: '#fff',
    fontWeight: '700',
    marginLeft: 6,
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#94a3b8',
    fontSize: 13,
    textAlign: 'center',
  },
});