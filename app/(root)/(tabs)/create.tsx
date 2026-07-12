import { useSupabase } from '@/hooks/useSupabase';
import { Property } from '@/types/index';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type NewProperty = Omit<Property, "id" | "created_at"|"is_sold">&{localImages: string[];};

const INITIAL_FORM: NewProperty = {
  title: "",
  description: "",
  price: 0,
  type: "apartment",
  bedrooms: 1,
  bathrooms: 1,
  area_sqft: 0,
  address: "",
  city: "",
  latitude: 0,
  longitude: 0,
  is_featured: false,
  images: [],
  localImages: [],
};

const TYPES = ["Apartment", "House", "Villa", "Studio"];
const MIN_PRICE = 1;
const MAX_PRICE = 999999999;

const inputClass= "bg-white border border-gray-200 rounded-2xl px-4 py-3 text-gray-800";
const labelClass = "text-base font-semibold text-bold text-gray-600 mb-1.5";
const sectionClass = "mt-3 mb-5";

export default function Create() {
  const router = useRouter();
  const authSupabase = useSupabase();
  const { userId } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [formState, setFormState] = useState<NewProperty>(INITIAL_FORM);

  const updateForm = (fields: Partial<NewProperty>) => {
    setFormState((prev) => ({ ...prev, ...fields }));
  };
  
  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission Required","Please allow access to your photo library");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsMultipleSelection: true,
      quality: 0.7,
      base64: true,
      selectionLimit: 6,
    });
    if (result.canceled) return;
    setUploadingImages(true);

    const uploadUrls: string[]=[];
    const previewUris: string[]=[];
    for (const image of result.assets) {
      try{
        const filename = `property_${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
        const base64 = image.base64;
        const buffer = Uint8Array.from(atob(base64!), (char) => char.charCodeAt(0));
        const {error} = await authSupabase.storage.from("property-images").
        upload(filename, buffer, {contentType: "image/jpeg",upsert: false,});
        if (error) throw error;
        const {data: urlData}=authSupabase.storage.from("property-images").
        getPublicUrl(filename);
        if (!urlData.publicUrl) throw new Error("No public URL found");
        uploadUrls.push(urlData.publicUrl);
        previewUris.push(image.uri);
      }catch (error) {
        console.error("Error uploading image:", error);
        Alert.alert("Upload Failed","One or more images failed to upload.");
      }
    }
    updateForm({images: [...formState.images,...uploadUrls], localImages: [...formState.localImages,...previewUris]});
    setUploadingImages(false);
  };

  const handleRemoveImage = (index: number) => {
    updateForm({
      images: formState.images.filter((_, i) => i !== index),
      localImages: formState.localImages.filter((_, i)=> i !== index)
    })
  };
  const handleDetectLocation = async () => {
    setDetectingLocation(true);

    try{
      const {status} = await Location.requestForegroundPermissionsAsync();
      if(status !== "granted"){
        Alert.alert("Permission Required","Please allow access to your location");
        return;
      }
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      updateForm({latitude: location.coords.latitude, longitude: location.coords.longitude});
      setDetectingLocation(false);
    }catch (error) {
      Alert.alert("Error","Could not detect location, enter manually");
      setDetectingLocation(false);
    }
  };
  const handleSubmit = async () => {
    if(!formState.title.trim())
      return Alert.alert("Error","Please enter a title");
    if(!formState.description.trim())
      return Alert.alert("Error","Please enter a description");
    if(formState.price < MIN_PRICE || formState.price > MAX_PRICE)
      return Alert.alert("Error","Please enter a valid price")
    if (!formState.address.trim())
      return Alert.alert("Error","Please enter an address");
    if (!formState.city.trim())
      return Alert.alert("Error","Please enter a city");
    if (formState.images.length === 0)
      return Alert.alert("Error","Please add at least one image");
    setSubmitting(true);
    const {error} = await authSupabase.from("properties").insert({
      title: formState.title.trim(),
      description: formState.description.trim(),
      price: formState.price,
      type: formState.type.toLowerCase(),
      bedrooms: formState.bedrooms,
      bathrooms: formState.bathrooms,
      area_sqft: formState.area_sqft,
      address: formState.address.trim(),
      city: formState.city.trim(),
      latitude: formState.latitude,
      longitude: formState.longitude,
      is_featured: formState.is_featured,
      images: formState.images,
      is_sold: false,
    });
    setSubmitting(false);
    if(error){
      Alert.alert("Error","Failed to create property");
      console.error(error);
    }else{
      Alert.alert("Success","Property created successfully");
      router.back();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView
      style={{flex: 1}}>
        <View className="px-5 pt-5 pb-3">
          <Text className="text-2xl font-bold text-black-200 flex-1">Add Property</Text>
        </View>
        <ScrollView
        contentContainerStyle={{padding:20, paddingBottom:120}}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
          <View className="flex-row items-center gap-1.5 mb-1.5">
            <Text className={labelClass}>Photos</Text>
            <Text className="text-gray-400 text-sm">(up to 6)</Text>
          </View>
            <View className="flex-row flex-wrap gap-3">
              {formState.localImages.map((uri, index)=>(
                <View key={index} className="relative">
                  <Image source={{uri}} className="w-24 h-24 rounded-2xl" resizeMode="cover"/>
                  {index===0 && (
                    <View className="absolute top-1 left-1 bg-blue-600 px-1.5 py-0.5 rounded-full">
                      <Text className="text-white text-xs font-bold">COVER</Text>
                    </View>
                  )}
                  <TouchableOpacity
                  onPress={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 bg-red-600 px-1.5 py-0.5 rounded-full">
                    <Ionicons name="close" size={11} color="white"/>
                  </TouchableOpacity>
                </View>
              ))}
              {formState.localImages.length < 6 && (
                <TouchableOpacity 
                onPress={handlePickImage}
                className="w-24 h-24 rounded-2xl bg-white border-2 border-dashed border-gray-300 items-center justify-center">
                  {uploadingImages ? (<ActivityIndicator size="small" color="gray"/>)
                  :(
                  <>
                    <Ionicons name="camera-outline" size={22} color = "gray"/>
                    <Text className="text-gray-400 text-xs mt-1">Add Images</Text>
                  </>)}
                </TouchableOpacity>
              )}
            </View>
            <View className={sectionClass}>
              <Text className={labelClass}>Title</Text>
              <TextInput className={inputClass}
              placeholder="e.g. Modern 3BHK in Bandra"
              placeholderTextColor="gray"
              value={formState.title}
              onChangeText={(v)=> updateForm({title: v})}/>
            </View>
            <View className={sectionClass}>
              <Text className={labelClass}>Description</Text>
              <TextInput className={`${inputClass} h-24`}
              placeholder="Describe the property....."
              placeholderTextColor="gray"
              value={formState.description}
              onChangeText={(v)=> updateForm({description: v})}
              multiline
              textAlignVertical="top"/>
            </View>
            <View className={sectionClass}>
              <Text className={labelClass}>Price (Rs.)</Text>
              <TextInput className={inputClass}
              placeholder="e.g. Valid range Re.1 - Rs. 9999999999999"
              placeholderTextColor="gray"
              value={formState.price.toString()}
              onChangeText={(v)=> updateForm({price: Number(v)})}
              keyboardType="numeric"/>
            </View>
            <View className={sectionClass}>
              <Text className={labelClass}>Property Type</Text>
              <View className="flex-row">
              {TYPES.map((t) => {
                const isSelected = formState.type === t;
                return (
                  <TouchableOpacity
                    key={t}
                    onPress={() => updateForm({ type: t })}
                    className={`mr-3 px-5 py-2.5 rounded-full border 
                      ${isSelected 
                        ? "bg-blue-600 border-blue-600" 
                        : "bg-white border-gray-300"}`}>
                    <Text className={`text-sm font-semibold ${
                      isSelected ? "text-white" : "text-gray-600"}`}>{t}</Text>
                </TouchableOpacity>);
              })}
              </View>
            </View>
            <View className="flex-row gap-4 mb-5">
              <Counter label="Bedrooms" value={formState.bedrooms}
              onChange={(v)=> updateForm({bedrooms: Number(v) || 0})}/>
              <Counter label="Bathrooms" value={formState.bathrooms}
              onChange={(v)=> updateForm({bathrooms: Number(v) || 0})}/>
            </View>
            <View className={sectionClass}>
              <Text className={labelClass}>Area (sqft)</Text>
              <TextInput className={inputClass}
              placeholder="e.g. 1200"
              placeholderTextColor="gray"
              value={formState.area_sqft.toString()}
              onChangeText={(v)=> updateForm({area_sqft: Number(v) || 0})}
              keyboardType="numeric"/>
            </View>
            <View className={sectionClass}>
            <Text className={labelClass}>Address</Text>
            <TextInput
              className={inputClass}
              placeholder="Complete address"
              placeholderTextColor="#9CA3AF"
              value={formState.address}
              onChangeText={(v) => updateForm({ address: v })}
            />
          </View>
          <View className={sectionClass}>
            <Text className={labelClass}>City</Text>
            <TextInput
              className={inputClass}
              placeholder="e.g. Mumbai"
              placeholderTextColor="#9CA3AF"
              value={formState.city}
              onChangeText={(v) => updateForm({ city: v })}
            />
          </View>
          <View className={sectionClass}>
            <View className="flex-row items-center justify-between mb-1.5">
              <Text className={labelClass}>Coordinates</Text>
                <TouchableOpacity onPress={handleDetectLocation}
                  className="flex-row items-center gap-1 bg-blue-50
                  px-3 py-1.5 rounded-full
                  disabled={detectingLocation}">
                    {detectingLocation ? (
                      <ActivityIndicator size="small" color="blue"/>)
                      :(<Ionicons name="locate" size={15} color="blue"/>
                    )}
                    <Text className="text-blue-600 text-xs font-semibold">
                  {detectingLocation ? ("Detecting..."):("Detect Location")}
                </Text>
                </TouchableOpacity>
          </View>
          <View className="flex-row mb-5 gap-3">
              <View className="flex-1">
                <TextInput
                  className={inputClass}
                  placeholder="Latitude"
                  placeholderTextColor="#9CA3AF"
                  value={formState.latitude ? formState.latitude.toString() : ""}
                  onChangeText={(v) => updateForm({ latitude: Number(v) })}
                  keyboardType="numeric"/>
              </View>
              <View className="flex-1">
                <TextInput
                  className={inputClass}
                  placeholder="Longitude"
                  placeholderTextColor="#9CA3AF"
                  value={formState.longitude ? formState.longitude.toString() : ""}
                  onChangeText={(v) => updateForm({ longitude: Number(v) })}
                  keyboardType="numeric"/>
              </View>
          </View>
          <View className="gap-3 mb-5">
            <Toggle
              label="Featured Property"
              description="Show this in the Featured section on home"
              value={formState.is_featured}
              onChange={(v) => updateForm({ is_featured: v })}
            />
          </View>
          </View>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting || uploadingImages}
            className="bg-blue-600 rounded-2xl py-4 items-center"
            style={{
              shadowColor: "#2563EB",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
              opacity: submitting || uploadingImages ? 0.7 : 1,}}>
            {submitting
            ? (<ActivityIndicator size="small" color="white" />)
            : (<Text className="text-white font-bold text-base">Upload Property</Text>)}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const Counter=({label,value,onChange}:{label:string; value:number;
    onChange:(v:number)=>void;})=>
    (
      (<View className="flex-1">
      <Text className={labelClass}>{label}</Text>
      <View className="flex-row items-center bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <TouchableOpacity
        onPress={()=>onChange(Math.max(1,value-1))}
        className="w-11 h-11 items-center justify-center">
          <Ionicons name="remove" size={18} color="gray"/>
        </TouchableOpacity>
        <Text className="flex-1 font-semibold text-gray-800 text-center">{value}</Text>
        <TouchableOpacity
        onPress={()=>onChange(value+1)}
        className="w-11 h-11 items-center justify-center">
          <Ionicons name="add" size={18} color="gray"/>
        </TouchableOpacity>
      </View>
    </View>)
  );

  const Toggle = ({label,value,onChange,description,}
    : {label: string; value: boolean;
      onChange: (v: boolean) => void; description?: string;}) => (
    <TouchableOpacity
      onPress={() => onChange(!value)}
      className={`flex-row items-center justify-between p-4 rounded-2xl border
        ${value ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"}`}>
      <View className="flex-1 mr-3">
        <Text className={`font-semibold
          ${value ? "text-blue-700" : "text-gray-700"}`}>{label}</Text>
        {description && (<Text className="text-xs text-gray-400 mt-0.5">{description}</Text>)}
      </View>
      <View
        className={`w-6 h-6 rounded-full border-2 items-center justify-center
        ${value ? "bg-blue-600 border-blue-600" : "border-gray-300"}`}>
        {value && <Ionicons name="checkmark" size={14} color="white"/>}
      </View>

    </TouchableOpacity>
  );
