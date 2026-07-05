import { useAuth, useUser } from "@clerk/clerk-expo";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();
  
  return (
    <View className="flex-1 justify-center items-center bg-white p-6">
      <Text className="text-2xl font-bold text-center mb-2">Name: {user?.fullName}</Text>
      <Text className="text-xl font-bold text-center mb-10">E-mail: {user?.emailAddresses[0]?.emailAddress}</Text>
      <TouchableOpacity 
        onPress={() => signOut()} className="bg-red-500 px-6 py-3 rounded-xl">
        <Text className="text-white font-bold text-base">Sign Out</Text>
      </TouchableOpacity>
   </View>
  );
}