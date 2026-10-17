import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { useFinance } from "../../finance/FinanceProvider";
import { dateLabel, money } from "../../lib/format";
import { COLORS } from "../../theme";
import { Card, Empty, Heading, Loading, Screen, Stat } from "../../ui";

export default function Overview(){
 const {transactions,loading}=useFinance();const router=useRouter();
 const stats=useMemo(()=>{
  const now=new Date();const m=now.getMonth(),y=now.getFullYear();
  const month=transactions.filter(t=>{const d=new Date(t.transaction_date+"T12:00:00");return d.getMonth()===m&&d.getFullYear()===y;});
  const expenses=month.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0);
  const income=month.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0);
  return {expenses,income,net:income-expenses,month};
 },[transactions]);
 return <Screen>
  <Heading title="Overview" subtitle={new Date().toLocaleDateString("en-SG",{weekday:"long",day:"numeric",month:"long"})} right={<View style={{backgroundColor:COLORS.greenLight,padding:11,borderRadius:15}}><Ionicons name="leaf-outline" color={COLORS.green} size={22}/></View>}/>
  <Card style={{backgroundColor:COLORS.navy,borderColor:COLORS.navy}}>
   <Text style={{color:"#C8D9CF",fontWeight:"700",fontSize:13}}>NET CASH FLOW · THIS MONTH</Text>
   <Text style={{fontSize:34,fontWeight:"800",color:"#FFFFFF"}}>{money(stats.net)}</Text>
   <View style={{height:1,backgroundColor:"#496157",marginVertical:3}}/>
   <View style={{flexDirection:"row",gap:18}}><Stat label="Income" value={money(stats.income)} color="#B6E6C9"/><Stat label="Expenses" value={money(stats.expenses)} color="#FFD1C8"/></View>
  </Card>
  <View style={{flexDirection:"row",gap:10}}>
   <Pressable onPress={()=>router.push("/add")} style={{flex:1,backgroundColor:COLORS.green,borderRadius:16,padding:15,flexDirection:"row",alignItems:"center",gap:9}}><Ionicons name="add-circle" size={22} color="#fff"/><Text style={{fontWeight:"800",color:"#fff"}}>Add transaction</Text></Pressable>
   <Pressable onPress={()=>router.push("/analytics")} style={{backgroundColor:COLORS.card,borderRadius:16,padding:15,borderWidth:1,borderColor:COLORS.line,justifyContent:"center"}}><Ionicons name="stats-chart-outline" size={22} color={COLORS.green}/></Pressable>
  </View>
  <Card>
   <View style={{flexDirection:"row",alignItems:"center",justifyContent:"space-between"}}><Text style={{fontSize:17,fontWeight:"800",color:COLORS.ink}}>Recent transactions</Text><Pressable onPress={()=>router.push("/transactions")}><Text style={{fontWeight:"800",color:COLORS.green}}>See all</Text></Pressable></View>
   {loading?<Loading/>:transactions.length===0?<Empty title="A clean slate" body="Add your first expense, income or transfer to start building your financial picture."/>:transactions.slice(0,5).map(t=><Pressable key={t.id} onPress={()=>router.push({pathname:"/transaction/[id]",params:{id:t.id}})} style={{flexDirection:"row",alignItems:"center",gap:12,paddingVertical:10,borderBottomWidth:1,borderBottomColor:COLORS.line}}>
    <View style={{width:42,height:42,borderRadius:14,backgroundColor:t.type==="income"?COLORS.greenLight:t.type==="transfer"?COLORS.pale:COLORS.amberLight,alignItems:"center",justifyContent:"center"}}><Ionicons name={t.type==="income"?"arrow-down-left-box":t.type==="transfer"?"swap-horizontal":"arrow-up-right-box"} size={19} color={t.type==="income"?COLORS.green:t.type==="transfer"?COLORS.navy:COLORS.amber}/></View>
    <View style={{flex:1,gap:4}}><Text style={{fontWeight:"800",color:COLORS.ink}}>{t.merchant}</Text><Text style={{fontSize:12,color:COLORS.muted}}>{t.category} · {dateLabel(t.transaction_date)}</Text></View>
    <Text style={{fontWeight:"800",color:t.type==="income"?COLORS.green:COLORS.ink}}>{t.type==="income"?"+":t.type==="expense"?"−":""}{money(t.amount)}</Text>
   </Pressable>)}
  </Card>
 </Screen>;
}
