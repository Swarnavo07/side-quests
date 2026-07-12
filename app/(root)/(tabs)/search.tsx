import FilterModel from '@/components/FilterModel';
import PropertyCard from '@/components/propertyCard';
import { createClerkSupabaseClient } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';
import { Property } from '@/types';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFilterStore } from '../../../store/filterStore';

export default function Search() {

  const [results, setResults] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const { getToken } = useAuth();

  const { openFilters } = useLocalSearchParams<{openFilters?: string}>();

  useEffect(() => {if (openFilters === 'true') {setShowFilters(true);}}, [openFilters]);
  

  const {search, type, bedrooms, minPrice, maxPrice,
    setSearch, setType, setBedrooms, setMinPrice,setMaxPrice,
  } = useFilterStore();

  const activeFilterCount = [
    type!==null,
    bedrooms!==null,
    minPrice!==null,
    maxPrice!==null,
  ].filter(Boolean).length;

  const fetchResults = useCallback(async () => {
    if (!getToken) return;
      setLoading(true);
      try {
        const supabase = createClerkSupabaseClient(getToken);
        let query = supabase.from("properties").select("*");
        if (search) {
          query = query.or(`title.ilike.%${search}%,city.ilike.%${search}%`);
        }
        if (type) {
          query = query.eq("type", type);
        }
        if (bedrooms) {
          query = query.eq("bedrooms", bedrooms);
        }
        if (minPrice) {
          query = query.gte("price", minPrice);
        }
        if (maxPrice) {
          query = query.lte("price", maxPrice);
        }
        const { data, error } = await query.order("created_at",{ascending: false});
        if (!error) {
          setResults(data??[]);
        } else {
          console.error(error);
        }
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
  }, [search, type, bedrooms, minPrice, maxPrice, getToken]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  type FilterChipProps = {label: string; onClear: () => void;};

  function FilterChips({label, onClear}:FilterChipProps){
    return(
        <View className="flex-row items-center bg-blue-50 border border-blue-200 rounded-full px-3 py-1 gap-1">
          <Text className="text-blue-700 text-xs font-semibold capitalize">{label}</Text>
          <TouchableOpacity onPress={onClear}>
          <Ionicons name="close" size={12} color="#1D4ED8" />
          </TouchableOpacity>
        </View>
       )}

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-5 pt-5 pb-3">
        <Text className="text-2xl font-bold">Find Property</Text>
      </View>
      <View className="flex-row items-center gap-3">
        <View className="flex-1 flex-row items-center bg-white rounded-2xl px-4 gap-3"
        style={{
          shadowColor: "#000",
          shadowOffset: {width: 0, height: 2,},
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}>
        <Ionicons name="search-outline" size={24} color="gray"/>
        <TextInput
          className="flex-1 py-3 text-gray-800"
          placeholder="Search by title or city...."
          placeholderTextColor="gray"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />
        {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={24} color="gray"/>
            </TouchableOpacity>
        )}
        </View>
        <TouchableOpacity 
        onPress={() => setShowFilters(!showFilters)}
        className={`w-12 h-12 mr-4 rounded-2xl items-center justify-center ${
            activeFilterCount>0 ? "bg-blue-700":"bg-white"
          }`}
          style={{
            shadowColor: "#000",
            shadowOffset: {width: 0, height: 2,},
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
            }}>
          <Ionicons name="filter" size={24} color={activeFilterCount>0?"white":"black"}/>
          {activeFilterCount>0 && (
            <View className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full items-center justify-center">
              <Text className="text-white text-xs font-bold">{activeFilterCount}</Text>
            </View>
          )}  
        </TouchableOpacity>
        </View>
           
      {activeFilterCount>0 && (
        <View className="flex-row flex-wrap gap-2 mt-3">
        {type && (
          <FilterChips label={type} onClear={() => setType(null)}/>
        )}
        {bedrooms !== null && (
          <FilterChips label={bedrooms === 4 ? "4+ beds" : `${bedrooms} bed${bedrooms > 1 ? "s" : " "}`}
            onClear={() => setBedrooms(null)}/>
        )}
        {(minPrice !== null || maxPrice !== null) && (
          <FilterChips label={minPrice && maxPrice
              ? `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`
              : minPrice
                ? `Above ${formatPrice(minPrice as number)}`
                : `Under ${formatPrice(maxPrice as number)}`}
            onClear={() => {
              setMinPrice(null);
              setMaxPrice(null);
            } }/>
        )}</View>
      )}
      <FilterModel visible={showFilters} onClose={() => setShowFilters(false)}/>
      <FlatList
          ListHeaderComponent={
            loading ? (
              <View className="items-center py-10">
                <ActivityIndicator size="small" color="#2563EB" />
                <Text className="mt-2 text-gray-500">Searching....</Text>
              </View>
            ) : (<Text className="text-sm text-gray-800 mt-2 mb-4">{results.length} Properties Found</Text>)}
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{padding:2, paddingBottom: 10}}
          renderItem={({ item }) => <View className="px-5 pb-4"><PropertyCard property={item}/></View>}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !loading ? (
              <View className="items-center py-10">
                <Text className="text-gray-400">No Properties Found</Text>
              </View>
            ): null
          }/>
    </SafeAreaView>
  );}