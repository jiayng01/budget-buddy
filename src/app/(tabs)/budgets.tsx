import { useState } from "react";
import { Alert, Text, View } from "react-native";
import { Screen, Heading, Card, Field, Button, Pill, Empty } from "../../ui";
import { COLORS, CATEGORIES } from "../../theme";
import { useFinance } from "../../finance/FinanceProvider";
import { money } from "../../lib/format";

export default function Budgets(){
 const {budgets,transactions,goals,saveBudget,saveGoal,updateGoal}=useFinance();const [category,setCategory]=useState("Food & Drink");const [amount,setAmount]=useState("");const [goalName,setGoalName]=useState("");const [target,setTarget]=useState("");const [saved,setSaved]=useState("");
 const expenses=transactions.filter(t=>t.type==="expense");
 const spendFor=(cat:string)=>expenses.filter(t=>t.category===cat&&t.transaction_date.slice(0,7)===new Date().toISOString().slice(0,7)).reduce((s,t)=>s+t.amount,0);
 return <Screen><Heading title="Budgets & goals" subtitle="Set limits and track what you are saving for."/>
 <Card><Text style={{fontSize:17,fontWeight:"800",color:COLORS.ink}}>Monthly category budget</Text>
 <Text style={{fontSize:12,fontWeight:"800",color:COLORS.muted}}>CATEGORY</Text><View style={{flexDirection:"row",flexWrap:"wrap",gap:7}}>{CATEGORIES.filter(c=>!["Income","Unknown"].includes(c)).map(c=><Pill key={c} label={c} active={category===c} onPress={()=>setCategory(c)}/>)}</View>
 <Field label="Monthly limit (SGD)" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="e.g. 300"/>
 <Button title="Save budget" onPress={async()=>{const e=await saveBudget(category,Number(amount));if(e)Alert.alert("Could not save",e);else{setAmount("");Alert.alert("Saved","Monthly budget updated.");}}}/>
 </Card>
 <Card><Text style={{fontSize:17,fontWeight:"800",color:COLORS.ink}}>This month's budgets</Text>{budgets.length===0?<Empty title="No budgets set" body="Set a category limit above to track your progress."/>:budgets.map(b=>{const spent=spendFor(b.category);const pct=Math.min(1,spent/b.amount);return <View key={b.id} style={{gap:8,paddingVertical:8}}><View style={{flexDirection:"row",justifyContent:"space-between"}}><Text style={{fontWeight:"800",color:COLORS.ink}}>{b.category}</Text><Text style={{color:COLORS.muted,fontSize:12}}>{money(spent)} / {money(b.amount)}</Text></View><View style={{height:8,borderRadius:99,backgroundColor:COLORS.pale,overflow:"hidden"}}><View style={{height:8,width:`${pct*100}%`,backgroundColor:pct>.9?COLORS.red:COLORS.green,borderRadius:99}}/></View><Text style={{fontSize:11,color:pct>.9?COLORS.red:COLORS.muted}}>{pct>=1?"Budget exceeded":`${Math.round((1-pct)*100)}% remaining`}</Text></View>;})}</Card>
 <Card><Text style={{fontSize:17,fontWeight:"800",color:COLORS.ink}}>Savings goal</Text><Field label="Goal name" value={goalName} onChangeText={setGoalName} placeholder="e.g. Emergency fund"/><Field label="Target amount (SGD)" value={target} onChangeText={setTarget} keyboardType="decimal-pad" placeholder="e.g. 5000"/><Button title="Create goal" onPress={async()=>{const e=await saveGoal({name:goalName,target_amount:Number(target)});if(e)Alert.alert("Could not save",e);else{setGoalName("");setTarget("");Alert.alert("Goal created","Your savings goal is ready.");}}}/></Card>
 <Card><Text style={{fontSize:17,fontWeight:"800",color:COLORS.ink}}>Your savings goals</Text>{goals.length===0?<Empty title="Nothing to save for yet" body="Create a savings goal above."/>:goals.map(g=>{const pct=Math.min(1,g.current_amount/g.target_amount);return <View key={g.id} style={{gap:9,paddingVertical:8}}><View style={{flexDirection:"row",justifyContent:"space-between",gap:8}}><Text style={{fontWeight:"800",color:COLORS.ink,flex:1}}>{g.name}</Text><Text style={{fontWeight:"800",color:COLORS.green}}>{Math.round(pct*100)}%</Text></View><View style={{height:8,backgroundColor:COLORS.pale,borderRadius:99,overflow:"hidden"}}><View style={{height:8,width:`${pct*100}%`,backgroundColor:COLORS.green}}/></View><Text style={{color:COLORS.muted,fontSize:12}}>{money(g.current_amount)} saved of {money(g.target_amount)}</Text><Button title="Add S$50" secondary onPress={async()=>{const e=await updateGoal(g.id,Math.min(g.target_amount,g.current_amount+50));if(e)Alert.alert("Could not update",e);}}/></View>;})}</Card>
 </Screen>;
}
