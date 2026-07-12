import { useSavedProperty } from "@/hooks/useSavedProperty";
import { useSupabase } from "@/hooks/useSupabase";
import { formatPrice } from "@/lib/utils";
import { useUserStore } from "@/store/userStore";
import { Property } from "@/types";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Dimensions, FlatList, Image, Linking, NativeScrollEvent, NativeSyntheticEvent, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

const {width}= Dimensions.get("window")
const ADMIN_PHONE = "7595915097";

export default function PropertyDetails(){
    const {id}=useLocalSearchParams<{id:string}>();
    const {userId}=useAuth();
    const router = useRouter();
    const isAdmin = useUserStore((state)=>state.isAdmin);

    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const [expanded, setExpanded] = useState(false);
    const [imageViewerVisible, setImageViewerVisible] = useState(false);
    const [images, setImages] = useState<string[]>([]);

    const authSupabase = useSupabase();
    const {isSaved,saveLoading,toggleSave}=useSavedProperty(id??"");

    const fetchProperty = async () => {
        const { data, error } = await authSupabase.from("properties").select("*").eq("id", id).single();
        if (!error) {
            setProperty(data);
            setLoading(false);
        } else {
            console.error(error);
        }
    }
    useEffect(() => {
        fetchProperty();
    }, [id]);

    const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) =>{
        const index = Math.round(event.nativeEvent.contentOffset.x / width);
        setActiveIndex(index);
    }

    const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) =>{
        const index = Math.round(event.nativeEvent.contentOffset.x / width);
        setActiveIndex(index);
    }

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="#2563EB" />
                <Text className="mt-4 text-gray-500 font-medium">Loading property...</Text>
            </View>
        );
    }

    if (!property) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <Ionicons name="home-outline" size={48} color="gray" />
                <Text className="mt-2 text-gray-500 text-lg font-medium">Property not found</Text>
                <TouchableOpacity 
                    onPress={() => router.back()} 
                    className="mt-6 bg-blue-600 px-6 py-3 rounded-xl">
                    <Text className="text-white font-bold">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }
    const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${
        property.longitude - 0.003
    }%2C${property.latitude - 0.003}%2C${property.longitude + 0.003}%2C${
        property.latitude + 0.003
    }&layer=mapnik&marker=${property.longitude}%2C${property.latitude}`;

    const isLongDesc=(property.description?.length??0)>20;
    const displayDesc = expanded||!isLongDesc
    ? property.description
    : property.description?.slice(0,20)+"...";

    const Contact = () => {
        const message = `Hi! I'm interested in the property: ${property?.title}`;
        const url = `https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent(message)}`;
        Linking.openURL(url);
    }

    const Sold = () => {
        Alert.alert("Mark as Sold", "Are you sure you want to mark this property as sold?", [
            {text: "Cancel", style: "cancel"},
            {
                text: "Mark as Sold", style: "destructive",
                onPress: async()=>
                {await authSupabase.from("properties").update({is_sold: true}).eq("id", id);
                setProperty((prev) => (prev ? { ...prev, is_sold: true } : prev));},
            }
        ])}
    
    const Delete = () => {
        Alert.alert("Delete Property", "Are you sure you want to delete this property?", [
            {text: "Cancel", style: "cancel"},
            {
                text: "Delete", style: "destructive",
                onPress: async()=>
                {await authSupabase.from("properties").delete().eq("id", id);
                router.replace("/(root)/(tabs)");}
            }
        ])}

    function SpecItem({icon, label, value}:{icon: string; label: string; value: string}){
    return(
        <View className="items-center">
            <Ionicons name = {icon} size={20} color="blue" />
            <Text className="text-gray-900 font-bold text-sm">{value}</Text>
            <Text className="text-gray-400 text-sm">{label}</Text>
        </View>
    )}

    return (
            <View className="flex-1 bg-white">
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View>
                        <View style={{ opacity: property.is_sold ? 0.5 : 1}}>
                            <FlatList
                            data={property.images}
                            keyExtractor={(_, index) => index.toString()}
                            renderItem={({item})=>(
                             <TouchableOpacity onPress={()=>setImageViewerVisible(true)}>
                                <Image source={{uri: item}}
                                style={{width,height:300}}
                                resizeMode="cover"
                               />
                             </TouchableOpacity>   
                            )}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            pagingEnabled
                            onScroll={onScroll}
                            scrollEventThrottle={16}
                            onMomentumScrollEnd={onMomentumScrollEnd}
                            />
                        </View>
                        <View className="absolute bottom-3 right-4 bg-black/50 rounded-full px-3 py-1">
                            <Text className="text-white text-xs font-medium">
                                {activeIndex+1}/{property.images.length}
                            </Text>
                        </View>
                    </View>
                    <SafeAreaView className="absolute top-0 left-0 right-0">
                        <View className="flex-row items-center justify-between px-4 pt-2">
                            <TouchableOpacity onPress={()=>router.back()}
                                className="w-10 h-10 bg-white rounded-full items-center justify-center"
                                style={{elevation: 5}}>
                                    <Ionicons name="arrow-back" size={24} color="black"/>
                            </TouchableOpacity>
                            <TouchableOpacity
                            onPress={toggleSave}
                            className="w-10 h-10 bg-white rounded-full items-center justify-center"
                            style={{elevation: 5}}>
                                <Ionicons
                                name={isSaved ? "heart":"heart"}
                                size={24}
                                color={isSaved ? "red" : "gray"}/>
                            </TouchableOpacity>
                        </View>
                        {property.is_sold && (<View className="flex-1 items-center justify-center">
                            <Image source={require("../../../assets/images/SOLD.png")}
                            style={{width: 200, height: 200, resizeMode: "contain"}}/>
                        </View>)}
                    </SafeAreaView>
                <View className="px-3 pb-8 pt-3"
                style={{opacity: property.is_sold ? 0.6 : 1}}>
                    <View className="flex-row gap-2 mb-3 flex-wrap">
                        <View className="bg-blue-50 px-3 py-1 rounded-full">
                            <Text className="text-blue-700 text-xs font-semibold capitalize">{property.type}</Text>
                        </View>
                        {property.is_featured && (
                        <View className="mb-1 bg-orange-50 px-3 py-1 rounded-full">
                            <Text className="text-orange-700 text-xs font-semibold">Featured</Text>
                    </View>)}
                    </View>
                    <Text className="text-2xl font-bold">{property.title}</Text>
                    <Text className="text-xl font-bold text-blue-600">{formatPrice(property.price)}</Text>
                    <View className="flex-row justify-between bg-gray-50 rounded-2xl p-4 mb-5">
                        <SpecItem icon="bed-outline" label="Bedrooms" value={`${property.bedrooms}`}/>
                        <SpecItem icon="water-outline" label="Bathrooms" value={`${property.bathrooms}`}/>
                        <SpecItem icon="expand-outline" label="Area" value={`${property.area_sqft} sq.ft.`}/>
                        <SpecItem icon="home-outline" label="Type" value={`${property.type}`}/>
                    </View>
                    <Text className="text-lg font-bold text-gray-800">Description</Text>
                    <Text className="text-base text-gray-500">{displayDesc} {isLongDesc && (
                    <TouchableOpacity onPress={() => setExpanded(!expanded)}>
                        <Text className="text-blue-600 text-base font-medium">{expanded?"Show Less":"Read More"}</Text>
                    </TouchableOpacity>)}
                    </Text>
                    <Text className="text-lg font-bold text-gray-800 mt-2">Location</Text>
                    <View className="flex-row mb-3 items-center gap-1">
                        <Ionicons name="locate-outline" size={16} color="gray"/>
                        <Text className="text-gray-500 text-base">{property.address}, {property.city}</Text>
                    </View>
                    <TouchableOpacity
                    onPress={() => router.push({pathname: "/(root)/property/map",
                        params: {latitude: property.latitude, longitude: property.longitude,title: property.title,address: `${property.address}, ${property.city}`,},})}
            activeOpacity={0.9}
            className="rounded-2xl overflow-hidden mb-6"
                    style={{ height: 200 }}>
                        <WebView source={{uri: mapUrl}}
                        style={{flex:1}}
                        scrollEnabled={false}
                        pointerEvents="none"/>
                        <View className="absolute bottom-3 right-3 bg-white/90 px-3 py-1 rounded-full flex-row items-center gap-1">
                            <Ionicons name="expand-outline" size={12} color="gray" />
                               <Text className="text-gray-600 text-xs font-medium">Tap to expand</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
            <TouchableOpacity onPress={Contact}
            className="flex-row items-center justify-center rounded-2xl py-4 mt-1 mb-4 gap-2 bg-green-500">
                <Ionicons name="logo-whatsapp" size={24} color="white"/>
                <Text className="text-white font-bold text-base">Contact Agent</Text>
            </TouchableOpacity>
            {isAdmin && (
                <View className="flex-row gap-3 px-3 justify-center">
                    {!property.is_sold &&(
                        <TouchableOpacity onPress={Sold}
                        className="bg-yellow-100 rounded-2xl
                        flex-1 flex-row items-center justify-center
                        rounded-2xl px-4 py-3 mb-5 gap-2">
                                <Ionicons name="checkmark-circle-outline" size={24} color="orange"/>
                                <Text className="font-bold text-orange-600 text-base">Mark Sold</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={Delete}
                    className="bg-red-100 rounded-2xl rounded-2xl
                        flex-1 flex-row items-center justify-center
                        rounded-2xl px-4 py-3 mb-5 gap-2">
                        <Ionicons name="trash-outline" size={24} color="red"/>
                        <Text className="font-bold text-red-600 text-base">Delete</Text>
                    </TouchableOpacity>
                </View>)}
        </View>
    )
}