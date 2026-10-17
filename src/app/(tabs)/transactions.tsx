import { useMemo, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen, Heading, Card, Field, Pill, Empty, Loading } from "../../src/ui";
import { COLORS } from "../../src/theme";
import { useFinance } from "../../src/finance/FinanceProvider";
import { money, dateLabel } from "../../src/lib/format";

export default function Transactions(){
 const {transactions,loading}=useFinance();const router=useRouter();const [query,setQuery]=useState("");const [filter,setFilter]=useState("all");
 const list=useMemo(()=>transactions.filter(t=>(filter==="all"||t.type===filter)&&(`${t.merchant} ${t.category} ${t.notes||""}`.toLowerCase().includes(query.toLowerCase()))),[transactions,filter,query]);
 return <Screen><Heading title="Transactions" subtitle={`${transactions.length} records`} />
 <Field label="Search" value={query} onChangeText={setQuery} placeholder="Merchant, category or notes" />
 <View style={{flexDirection:"row",gap:8,flexWrap:"wrap"}}>{["all","expense","income","transfer"].map(x=><Pill key={x} label={x==="all"?"All":x[0].toUpperCase()+x.slice(1)} active={filter===x} onPress={()=>setFilter(x)}/>)}</View>
 <Card>{loading?<Loading/>:list.length===0?<Empty title="No matching transactions" body="Try another search or add a transaction."/>:list.map(t=><Pressable key={t.id} onPress={()=>router.push({pathname:"/transaction/[id]",params:{id:t.id}})} style={{flexDirection:"row",alignItems:"center",paddingVertical:12,borderBottomWidth:1,borderBottomColor:COLORS.line,gap:12}}>
 <View style={{flex:1,gap:4}}><Text style={{fontSize:15,fontWeight:"800",color:COLORS.ink}}>{t.merchant}</Text><Text style={{fontSize:12,color:COLORS.muted}}>{t.category} · {dateLabel(t.transaction_date)}</Text></View>
 <View style={{alignItems:"flex-end",gap:4}}><Text style={{fontWeight:"800",color:t.type==="income"?COLORS.green:COLORS.ink}}>{t.type==="income"?"+":t.type==="expense"?"−":""}{money(t.amount)}</Text><Text style={{fontSize:11,color:COLORS.muted}}>{t.type}</Text></View>
 <Ionicons name="chevron-forward" color={COLORS.muted} size={16}/>
 </Pressable>)}</Card></Screen>;
}
