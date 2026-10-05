import { StyleSheet, Text, View, FlatList, Pressable } from 'react-native'
import React, { useState, useMemo } from 'react'
import { useColorScheme } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import LottieView from 'lottie-react-native'
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const FILTERS = [
  { key: 'week', label: 'Last 7 Days' },
  { key: 'month', label: 'Last Month' },
  { key: 'all', label: 'All' },
];

// Tries multiple common date formats since item.date may be a string like
// "27/09/2026", "2026-09-27", or an ISO/timestamp value.
const parseItemDate = (item) => {
  if (!item?.date) return null;

  // Already a valid ISO / timestamp-parseable string
  const direct = new Date(item.date);
  if (!isNaN(direct.getTime())) return direct;

  // Try dd/mm/yyyy or dd-mm-yyyy
  const match = String(item.date).match(/(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/);
  if (match) {
    const [, d, m, y] = match;
    const year = y.length === 2 ? `20${y}` : y;
    const parsed = new Date(`${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  return null;
};

export default function Home({ trans, setTrans, totalamt, handledelete }) {
  const navigation = useNavigation();
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);

  const toggleSelected = (id) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

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
      // If we can't parse the date, keep the item visible rather than hiding it
      if (!itemDate) return true;
      return itemDate >= cutoff && itemDate <= now;
    });
  }, [trans, activeFilter]);

  return (
    <View style={styles.container}>
      <View style={styles.anima}>
        {/* <LottieView
          style={{ width: '100%', height: '100%' }}
          source={require('../assets/animation/welcome1.json')}
          autoPlay
          loop
        /> */}
      <Text style={styles.headerText}>GenTrack</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Total Balance</Text>
        <View style={styles.cardValueRow}>
          <FontAwesome name="rupee" color="white" size={28} style={styles.icon} />
          <Text style={styles.cardValue}>{totalamt.toFixed(2)}</Text>
        </View>
      </View>
    <View style={styles.btnmain} >

      <Pressable
      onPress={()=>{navigation.navigate('Addmoney')}}
      style={styles.btn}   >
           <Text style={styles.btntext}  > Add Money </Text>
      </Pressable>
      <Pressable
        onPress={()=>{navigation.navigate('Addexpense')}}
      style={styles.btn}  >
           <Text style={styles.btntext}  > Add Expense </Text>
      </Pressable>
    
    </View>

     <Text style={styles.sectionTitle}>All Transaction</Text>

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
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No transactions in this period.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isSelected = selectedId === item.id;
          return (
            <Pressable
              onPress={() => toggleSelected(item.id)}
              style={[styles.expenseItem, isSelected && styles.expenseItemSelected]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.expenseTitle}>{item.expname}</Text>
                <View style={styles.carddatecom} >
                  <Text style={[styles.dateText, styles.dateTextSpacing]}>{item.date}</Text>
                  <Text style={styles.dateText}>{item.time}</Text>
                </View>
              </View>

              {!isSelected && (
                <View style={styles.amountGroup}>
                  <View style={[styles.iconCircle, item.type === 'income' ? styles.incomeIcon : styles.expenseIcon]}>
                    <MaterialCommunityIcons
                      name={item.type === 'income' ? 'plus' : 'minus'}
                      size={16}
                      color="#fff"
                      style={styles.icon}
                    />
                  </View>
                  <Text style={styles.amountText}>{item.amount}</Text>
                </View>
              )}

              {isSelected && (
                <Pressable
                  onPress={() => handledelete(item.id)}
                  style={styles.deleteBtn}
                >
                  <MaterialCommunityIcons name="delete" color="#f8fafc" size={18} style={styles.icon} />
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </Pressable>
              )}
            </Pressable>
          );
        }}
      />

    </View>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 1,
    backgroundColor: '#090f1f',
  },
  anima: {
    width: '100%',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  headerText: {
    color: '#3A86FF',
    fontSize: 28,
    letterSpacing: 1.1,
    fontFamily: 'BlackOpsOne-Regular'    
  },
  card: {
    width: '100%',
    minHeight: 160,
    borderRadius: 32,
    padding: 24,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    shadowColor: '#3A86FF',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
  
    overflow: 'hidden',
  },
  cardLabel: {
    fontSize: 16,
    color: '#dbeafe',
    fontWeight: '500',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  cardValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  sectionTitle: {
    color: '#e2e8f0',
    fontSize: 22,
    marginTop: 24,
    paddingLeft: 4,
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  filterChipActive: {
    backgroundColor: '#3A86FF',
    borderColor: '#3A86FF',
  },
  filterChipText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#f8fafc',
  },
  carddatecom: {
    flexDirection: 'row',
    marginTop: 6,
  },
  dateTextSpacing: {
    marginRight: 12,
  },
  expenseItem: {
    width: '100%',
    minHeight: 86,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderRadius: 22,
 backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  expenseItemSelected: {
    borderColor: 'rgba(248, 113, 113, 0.5)',
    backgroundColor: 'rgba(248, 113, 113, 0.08)',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f87171',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  deleteBtnText: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '700',
  },
  dateText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  expenseTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
  },
  amountGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  incomeIcon: {
    backgroundColor: '#34d399',
  },
  expenseIcon: {
    backgroundColor: '#f87171',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3A86FF',
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
  btnmain: {
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop:10,
    gap: 16,
    paddingVertical: 10,
  },
  btn: {
    backgroundColor: '#3A86FF',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
    height: 60,
    shadowColor: '#3A86FF',
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  btntext: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '700',
  },
})