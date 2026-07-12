import FeaturedCard from "@/components/FeaturedCard";
import PropertyCard from "@/components/propertyCard";
import { createClerkSupabaseClient } from "@/lib/supabase";
import { Property } from "@/types";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Image, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Home() {
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();
  
  const [featured, setFeatured] = useState<Property[]>([]);
  const [recommended, setRecommended] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if(!isSignedIn) return;
    const fetchProperties = async () => {
    setLoading(true);
    try {
      const supabase = createClerkSupabaseClient(getToken);
      const [featured, recommended] = await Promise.all([
      supabase.from("properties").select("*").eq("is_featured", true).order("created_at",{ascending: false}),
      supabase.from("properties").select("*").order("created_at",{ascending: false})
    ]);
    setFeatured(featured.data??[]);
    setRecommended(recommended.data??[]);
    setLoading(false);
  } catch(error){
    console.error(error);
  }
}; fetchProperties();}, [getToken, isSignedIn])
);
  
    return (
  <SafeAreaView className="flex-1 bg-gray-50">
    <FlatList
    ListHeaderComponent={
      <View>
        <View className="flex-row items-center justify-between ps-5 pt-4 pb-5">
          <Image source={require("../../../assets/images/kribb.png")}
          style={{width: 90, height: 60, resizeMode: "contain"}}/>
          <View className="items-end px-5">
            <Text className="text-xl font-bold">Hello!!</Text>
            <Text className="text-lg">{user?.fullName}</Text>
          </View>
        </View>
        <View className="px-5">
          <View className="mt-5 mb-5">
              <Text className="text-xl font-bold">Featured</Text>
     {loading ? (
       <ActivityIndicator
          size="small"
          color="#2563EB"
          className="py-10"
        />
      ) : (
        <FlatList
          data={featured}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <FeaturedCard property={item} />}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 15}}
          />
      )}
        </View>
      </View>
        <Text className="text-xl font-bold px-5">Recommended</Text>
    </View>}
    data={recommended}
    keyExtractor={(item) => item.id}
    contentContainerStyle={{paddingBottom: 100}}
    renderItem={({ item }) => <View className="px-5"><PropertyCard property={item}/></View>}
    showsVerticalScrollIndicator={false}
    ListEmptyComponent={
      !loading ? (
        <View className="items-center py-10">
          <Text className="text-gray-400">No Properties Found</Text>
        </View>
      ): null
    }
    />
  </SafeAreaView>
  );
}