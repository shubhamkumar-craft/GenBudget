import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Home from './src/screens/Home';
import AllExpenses from './src/screens/AllExpenses';
import Stats from './src/screens/Stats';
import Addmoney from './src/screens/Addmoney';
import Addexpenses from './src/screens/Addexpense';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Tab = createBottomTabNavigator();

type Transaction = {
  id: string;
  type: 'income' | 'expense';
  amount: string;
  expname?: string;
  date?: string;
  time?: string;
  [key: string]: any;
};

const App = () => {
  const [trans, setTrans] = useState<Transaction[]>([]);

  const handledelete = (id: string) => {
    const newdata = trans.filter((item) => item.id !== id);
    setTrans(newdata);
  };

  useEffect(() => {
    const getData = async () => {
      try {
        const data = await AsyncStorage.getItem('transactions');
        if (data) {
          setTrans(JSON.parse(data));
        }
      } catch (error) {
        console.log('Error retrieving data:', error);
      }
    };

    getData();
  }, []);

  useEffect(() => {
    const storeData = async () => {
      try {
        await AsyncStorage.setItem('transactions', JSON.stringify(trans));
      } catch (error) {
        console.log('Error storing data:', error);
      }
    };

    storeData();
  }, [trans]);

  const expenseamt =
    trans.filter((item) => item.type === 'expense')
      .reduce((total, item) => total + Number(item.amount), 0);
  const incomeamt = trans.filter((item) => item.type === 'income')
    .reduce((total, item) => total + Number(item.amount), 0);
  const totalamt = incomeamt - expenseamt;
 
  const incomeitems=trans.filter((item)=>item.type === "income")

  return (
    <SafeAreaView style={styles.container}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#3A86FF',
            tabBarInactiveTintColor: '#94a3b8',
            tabBarStyle: {
              position: 'absolute',
              backgroundColor: 'rgba(15, 23, 45, 0.95)',
              borderColor: 'rgba(58, 134, 255, 0.24)',
              borderWidth: 1,
              height: 70,
              marginBottom: 10,
              marginHorizontal: 8,
              paddingTop: 10,
              paddingBottom: 10,
              borderRadius: 80,
              overflow: 'hidden',
              shadowColor: '#3A86FF',
              shadowOpacity: 0.18,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 5 },
              elevation: 8,
            },
            tabBarLabelStyle: {
              fontSize: 8,
              fontWeight: '800',
              marginTop: 3,
            },
            tabBarIconStyle: {
              alignItems: 'center',
              justifyContent: 'center',
            },
          }}
        >
          <Tab.Screen
            name="Home"
            options={{
              tabBarIcon: ({ color, size }) => (
                <AntDesign name="home" size={size} color={color} style={styles.icon} />
              ),
            }}
          >
            {(props) => (
              <Home
                {...props}
                trans={trans}
                setTrans={setTrans}
                totalamt={totalamt}
                handledelete={handledelete}
              />
            )}
          </Tab.Screen>

          <Tab.Screen
            name="Transcation"
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons
                  name="clipboard-text"
                  size={size}
                  color={color}
                  style={styles.icon}
                />
              ),
            }}
          >
            {(props) => (
              <AllExpenses
                {...props}
                trans={trans}
                setTrans={setTrans}
                handledelete={handledelete}
              />
            )}
          </Tab.Screen>

<Tab.Screen
            name="Stats"
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons
                  name="chart-box-outline"
                  size={size}
                  color={color}
                  style={styles.icon}
                />
              )
            }}
          >
            {(props) => (
              <Stats
                {...props}
                trans={trans}
                setTrans={setTrans}
                
              />
            )}
          </Tab.Screen>
          
          <Tab.Screen
            name="Addexpense"
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialIcons
                  name="payment"
                  size={size}
                  color={color}
                  style={styles.icon}
                />
              ),
            }}
          >
            {(props) => (
              <Addexpenses
                {...props}
                trans={trans}
                setTrans={setTrans}
                handledelete={handledelete}
              />
            )}
          </Tab.Screen>

          <Tab.Screen
            name="Addmoney"
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons
                  name="wallet-outline"
                  size={size}
                  color={color}
                  style={styles.icon}
                />
              ),
            }}
          >
            {(props) => (
              <Addmoney
                {...props}
                trans={trans}
                setTrans={setTrans}
              />
            )}
          </Tab.Screen>

        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
};

export default App; 

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  icon: {
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});