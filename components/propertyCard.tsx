import { useSavedProperty } from '@/hooks/useSavedProperty';
import { formatPrice } from '@/lib/utils';
import { Property } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

export default function PropertyCard({property,onUnsave,showSave=false}:
    {
        property: Property;
        onUnsave?: () => void;
        showSave?: boolean;
    }){
        const {isSaved,saveLoading,toggleSave}=useSavedProperty(property.id,onUnsave);
        const router = useRouter();

    return(
    <TouchableOpacity className="flex-row w-full mr-2 mb-2 rounded-3xl overflow-hidden bg-white"
        style={{
            shadowColor: "#000",
            shadowOffset: {width: 0, height: 2,},
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
            opacity: property.is_sold ? 0.5 : 1, 
        }}
         onPress={() => router.push(`/(root)/property/${property.id}` as any)}
        >
        <Image source={{uri: property.images[0]}} className="w-28 h-28" resizeMode="cover"/>
        {property.is_sold && (
            <View className="absolute top-3 right-3 bg-red-700 px-3 py-1 rounded-full">
                <Text className="text-xs font-semibold text-white">Sold</Text>
            </View>
        )}
        <View className="flex-1 p-3 justify-between">
            <View>
                <Text className="text-sm font-bold text-gray-800 mb-1" numberOfLines={1}>{property.title}</Text>
            </View>
            <View className="flex-row items-center mb-3">
                <Ionicons name = "locate-outline" size={13} color="gray"/>
                <Text className="text-xs px-1 text-gray-500" numberOfLines={1}>{property.address},{property.city}</Text>
            </View>
            <View className="flex-row justify-between items-center">
                <Text className="text-blue-600 font-bold text-base">{formatPrice(property.price)}</Text>
                <View className="flex-row items-center gap-3">
                    <View className="flex-row items-center gap-1">
                    <Ionicons name="bed-outline" size={13} color="gray"/>
                    <Text className="text-xs text-gray-500">{property.bedrooms}</Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                        <Ionicons name="water-outline" size={13} color="gray"/>
                        <Text className="text-xs text-gray-500">{property.bathrooms}</Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                        <Ionicons name="expand-outline" size={13} color="gray"/>
                        <Text className="text-xs text-gray-500">{property.area_sqft} sq.ft</Text>
                    </View>
                </View>
            </View>
        </View>
        <TouchableOpacity
        onPress={toggleSave}
            className="w-10 items-center pt-3">
            <Ionicons
            name={isSaved ? "heart" : "heart-outline"}
            size={24}
            color={isSaved ? "red" : "gray"}/>
        </TouchableOpacity>
    </TouchableOpacity>
    );
}