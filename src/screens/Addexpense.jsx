import { StyleSheet, Text, View, TextInput, Pressable } from 'react-native'
import React, { useState } from 'react'
import { FlatList } from 'react-native';

const Addexpense = ({trans, setTrans,handledelete}) => {
    const [expensename, setExpensename ]=useState("");
    const [amount, setAmount]=useState("");
    const handlesubmit=()=>{
      setExpensename("");
      setAmount("");
      setTrans([...trans, {id:Math.random().toString(), expname:expensename, amount:amount, type:"expense", date:new Date().toLocaleDateString(), time:new Date().toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})}])
      const date=new Date().toLocaleString();
      
    }
    const expansedata=trans.filter((item)=>item.type==="expense")
  return (
    <View style={styles.container}>
      <TextInput
        placeholder='Enter the expense name'
        placeholderTextColor='rgba(226,232,240,0.7)'
        style={styles.inputbox}
        value={expensename}
        onChangeText={(text) => setExpensename(text)}
      />
      <TextInput
        placeholder='Enter amount'
        placeholderTextColor='rgba(226,232,240,0.7)'
        value={amount}
        onChangeText={(text) => setAmount(text)}
        keyboardType='number-pad'
        style={styles.inputbox}
      />

      <Pressable style={styles.btn} onPress={handlesubmit}>
        <Text style={styles.btnText}>Save</Text>
      </Pressable>
    <Text style={{color: '#e2e8f0',
    fontSize: 22,
    marginTop: 24,
    paddingLeft: 4,
    marginBottom: 12,}} >All Expenses</Text>
   <FlatList
           data={expansedata}
           keyExtractor={(item) => item.id}
           renderItem={({ item }) => (
             
               <View style={styles.expenseItem}>
                 <View>
                   <Text style={styles.expenseTitle}>{item.expname}</Text>
                   <View style={styles.carddatecom} >
                   <Text style={[styles.dateText, styles.dateTextSpacing]}>{item.date}</Text>
                   <Text style={styles.dateText}>   {item.time}</Text>
                   </View>
                 </View>
               <Text style={styles.amountText}>{item.type  }</Text>
               <Text style={styles.amountText}>{item.amount}</Text>
             </View>
           
           )}
         />
   
    
    </View>

  )
}

export default Addexpense

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    padding: 16,
    backgroundColor: '#090f1f',
  },
  txt: {
    color: '#e2e8f0',
    marginTop: 8,
  },
  inputbox: {
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.18)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    color: '#e2e8f0',
    padding: 14,
    borderRadius: 18,
    marginBottom: 14,
  },
  btn: {
    width: '100%',
    height: 52,
    backgroundColor: '#3A86FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 28,
    shadowColor: '#3A86FF',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
    marginBottom:15,
  },
  btnText: {
    color: '#f8fafc',
    fontWeight: '700',

  },
   incomeItem: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 27, 56, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 10,
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
  dateText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  expenseTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3A86FF',
  },
  btnmain: {
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop:10,
    gap: 16,
    paddingVertical: 10,
  },
  carddatecom:{
    flex:1,
    flexDirection:"row",
    paddingTop:6,
  },
})