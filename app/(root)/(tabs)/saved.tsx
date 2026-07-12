import PropertyCard from '@/components/propertyCard';
import { useSupabase } from '@/hooks/useSupabase';
import { Property } from '@/types';
import { useAuth } from '@clerk/clerk-expo';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SavedProperty {
  id: string;
  properties: Property;
}

export default function SavedScreen() {
  const {userId}=useAuth();
  const authSupabase = useSupabase();
  const router = useRouter();

  const [saved, setSaved] = useState<SavedProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchSaved = async () => {
      if (!userId) {
        setLoading(false);
        setSaved([]);
        return;
      }
      setLoading(true);
      const { data, error } = await authSupabase
        .from("saved_properties")
        .select("id, properties(*)") // Select 'id' from saved_properties and all from 'properties'
        .eq("user_clerk_id", userId).order("id",{ascending: false});

      if (error) {
        console.error("Error fetching saved properties:", error);
        setSaved([]);
      } else {
        setSaved(data as unknown as SavedProperty[] ?? []);
      }
      setLoading(false);
    };
    fetchSaved();
    }, [userId, authSupabase])
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-5 pt-5 pb-3">
        <Text className="text-2xl font-bold">Saved Properties</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="small" color="#2563EB" className="py-10" />
      ) : (
        <FlatList
          data={saved}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => (
            <View className="px-5">
              <PropertyCard property={item.properties} />
            </View>
          )}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            saved.length === 0 ? (
              <View className="items-center py-10">
                <Text className="text-gray-400">No Saved Properties Found</Text>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}
