import React from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View, type TextInputProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "./theme";

export function Screen({children,scroll=true}: {children:React.ReactNode;scroll?:boolean}) {
 return <SafeAreaView style={{flex:1,backgroundColor:COLORS.bg}} edges={["top","left","right"]}>{scroll?<ScrollView contentContainerStyle={{padding:20,paddingBottom:28,gap:18}} keyboardShouldPersistTaps="handled">{children}</ScrollView>:children}</SafeAreaView>;
}
export function Heading({title,subtitle,right}:{title:string;subtitle?:string;right?:React.ReactNode}){
 return <View style={{flexDirection:"row",alignItems:"center",justifyContent:"space-between",gap:10}}><View style={{flex:1,gap:4}}><Text style={{fontSize:27,fontWeight:"800",color:COLORS.ink}}>{title}</Text>{subtitle?<Text style={{fontSize:13,color:COLORS.muted}}>{subtitle}</Text>:null}</View>{right}</View>;
}
export function Card({children,style}: {children:React.ReactNode;style?:any}){return <View style={[{backgroundColor:COLORS.card,borderRadius:20,padding:16,borderWidth:1,borderColor:COLORS.line,gap:12},style]}>{children}</View>}
export function Button({title,onPress,disabled,secondary}:{title:string;onPress:()=>void;disabled?:boolean;secondary?:boolean}){
 return <Pressable disabled={disabled} onPress={onPress} style={{minHeight:48,paddingHorizontal:16,borderRadius:14,alignItems:"center",justifyContent:"center",backgroundColor:secondary?COLORS.greenLight:COLORS.green,opacity: disabled ? 0.6 : 1}}><Text style={{fontWeight:"800",color:secondary?COLORS.green:"#FFFFFF",fontSize:15}}>{title}</Text></Pressable>;
}
export function Field({label,...props}:TextInputProps&{label:string}){
 return <View style={{gap:7}}><Text style={{fontSize:12,fontWeight:"800",color:COLORS.muted}}>{label.toUpperCase()}</Text><TextInput placeholderTextColor="#9AA69E" {...props} style={[{borderWidth:1,borderColor:COLORS.line,borderRadius:13,paddingHorizontal:13,paddingVertical:12,color:COLORS.ink,backgroundColor:"#FBFCFA",fontSize:15,minHeight:46},props.style]} /></View>;
}
export function Pill({label,active,onPress}:{label:string;active:boolean;onPress:()=>void}){
 return <Pressable onPress={onPress} style={{borderRadius:999,paddingVertical:9,paddingHorizontal:13,backgroundColor:active?COLORS.green:COLORS.card,borderWidth:1,borderColor:active?COLORS.green:COLORS.line}}><Text style={{fontWeight:"700",fontSize:12,color:active?"#FFFFFF":COLORS.muted}}>{label}</Text></Pressable>;
}
export function Loading(){return <View style={{padding:24,alignItems:"center"}}><ActivityIndicator color={COLORS.green}/><Text style={{marginTop:8,color:COLORS.muted}}>Loading your data…</Text></View>}
export function Empty({title,body}:{title:string;body:string}){return <View style={{alignItems:"center",paddingVertical:26,gap:8}}><Text style={{fontSize:16,fontWeight:"800",color:COLORS.ink}}>{title}</Text><Text style={{fontSize:13,color:COLORS.muted,textAlign:"center",lineHeight:19}}>{body}</Text></View>}
export function Stat({label,value,detail,color=COLORS.ink}:{label:string;value:string;detail?:string;color?:string}){
 return <View style={{flex:1,gap:6}}><Text style={{fontSize:12,color:COLORS.muted,fontWeight:"700"}}>{label}</Text><Text numberOfLines={1} adjustsFontSizeToFit style={{fontSize:22,fontWeight:"800",color}}>{value}</Text>{detail?<Text style={{fontSize:11,color:COLORS.muted}}>{detail}</Text>:null}</View>;
}
