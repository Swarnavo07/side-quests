import { PropertyType, useFilterStore } from '@/store/filterStore';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';

const TYPES: { label: string; value: PropertyType }[] = [
  { label: "All", value: null },
  { label: "Apartment", value: "apartment" },
  { label: "House", value: "house" },
  { label: "Villa", value: "villa" },
  { label: "Studio", value: "studio" },
];

const BEDS = [
  { label: "Any", value: null },
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "4+", value: 4 },
];

const PRICE_PRESETS = [
  { label: "Under ₹50L", min: null, max: 5000000 },
  { label: "₹50L – ₹1Cr", min: 5000000, max: 10000000 },
  { label: "₹1Cr – ₹2Cr", min: 10000000, max: 20000000 },
  { label: "Above ₹2Cr", min: 20000000, max: null },
];

const chip = (active: boolean) =>
  `px-4 py-2 rounded-full border ${
    active ? "bg-blue-600 border-blue-600" : "bg-white border-gray-200"
  }`;

const chipText = (active: boolean) =>
  `text-sm font-semibold ${active ? "text-white" : "text-gray-600"}`;

export default function FilterModel(
    {visible, onClose}:{visible: boolean; onClose: () => void;})
{
    const{type,bedrooms,minPrice,maxPrice,
        setType,setBedrooms,setMinPrice,setMaxPrice,resetFilters
    }= useFilterStore();

    const [localMin, setLocalMin] = useState(minPrice?String(minPrice):"");
    const [localMax, setLocalMax] = useState(maxPrice?String(maxPrice):"");
    
    const activeCount = [type,bedrooms,minPrice,maxPrice]
    .filter((value) => value!==null).length;

    const handleApply = () => {
        setMinPrice(localMin ? Number(localMin) : null);
        setMaxPrice(localMax ? Number(localMax) : null);
        onClose();
    };

    const handleReset = () => {
        setLocalMin("");
        setLocalMax("");
        setType(null);
        setBedrooms(null);
        setMinPrice(null);
        setMaxPrice(null);
        resetFilters();
        onClose();
    };

    const shadow = {
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2,},
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    };

    return(
        <Modal 
            isVisible={visible}
            animationIn="zoomIn"
            animationOut="zoomOut"
            animationInTiming={300}
            animationOutTiming={300}
            backdropTransitionInTiming={300}
            backdropTransitionOutTiming={300}
            backdropOpacity={0.5}
            onBackdropPress={onClose}
            onBackButtonPress={onClose}
            swipeDirection={["up","down"]}
            onSwipeComplete={onClose}
            className="m-0 justify-end">
        <View className= "flex-1 bg-gray-100">
            <View className="flex-row items-center justify-between px-5 pt-5 pb-3
            bg-white border-b border-gray-100">
                <TouchableOpacity onPress={onClose} className="p-1">
                    <Ionicons name="close" size={24} color="gray"/>
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900">Filters</Text>
                <TouchableOpacity onPress={handleReset}>
                    <Text className="text-blue-600 text-base font-semibold">Reset</Text>
                </TouchableOpacity>
            </View>
            <ScrollView
         className="flex-1"
           contentContainerStyle={{ padding: 20, paddingBottom: 40}}
            showsVerticalScrollIndicator={false}>
                <Text className="text-base font-bold text-gray-800 mb-3">Property Type</Text>
                <View className="flex-row flex-wrap gap-2 mb-6">
                    {TYPES.map((item) =>
                    <TouchableOpacity
                    key={item.value}
                    onPress={() => setType(item.value)}
                    className={chip(type===item.value)}
                    style={shadow}>
                        <Text className={chipText(type===item.value)}>{item.label}</Text>
                    </TouchableOpacity>)}
                </View>
                <Text className="text-base font-bold text-gray-800 mb-3">Bedrooms</Text>
                <View className="flex-row flex-wrap gap-2 mb-6">
                    {BEDS.map((item) =>
                    <TouchableOpacity
                    key={item.value}
                    onPress={() => setBedrooms(item.value)}
                    className={chip(bedrooms===item.value)}
                    style={shadow}>
                        <Text className={chipText(bedrooms===item.value)}>{item.label}</Text>
                    </TouchableOpacity>)}
                </View>
                <Text className="text-base font-bold text-gray-800">Price Range</Text>
                <View className="flex-row gap-3 mb-3">
                    {[
                        {
                            label: "Min Price",
                            value: localMin,
                            onChange: setLocalMin,
                            placeholder: "0",
                        },
                        {
                            label: "Max Price",
                            value: localMax,
                            onChange: setLocalMax,
                            placeholder: "Any",
                        },].map(({ label, value, onChange, placeholder }) => (
                            <View key={label} className="flex-1">
                                <Text className="text-xs text-gray-400 mb-1.5 font-medium">{label}</Text>
                                <View className="flex-row items-center bg-white rounded-2xl px-3 border border-gray-200"
                                style={shadow}>
                                <Text className="text-gray-400 text-sm mr-1">Rs.</Text>
                                <TextInput
                                    className="flex-1 py-3 text-gray-800"
                                    placeholder={placeholder}
                                    placeholderTextColor="gray"
                                    keyboardType="numeric"
                                    value={value}
                                    onChangeText={onChange}
                                    />
                                </View>
                            </View>
                            ))}
                        </View>
                        <View className="flex-row flex-wrap gap-2 mb-6">
                            {PRICE_PRESETS.map((prices) =>{
                               const active = minPrice===prices.min && maxPrice===prices.max;
                                return(
                                    <TouchableOpacity
                                    key={prices.label}
                                    onPress={() => {
                                        setLocalMin(prices.min ? String(prices.min) : "");
                                        setLocalMax(prices.max ? String(prices.max) : "");
                                        setMinPrice(prices.min);
                                        setMaxPrice(prices.max);
                                    }}
                                    className={`px-3 py-2 rounded-full border ${
                                        active ? "bg-blue-50 border-blue-300": "bg-white border-gray-200"}`}
                                    style={shadow}>
                                        <Text className={`text-xs font-medium ${active ? "text-blue-600" : "text-gray-600"}`}>{prices.label}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                 </ScrollView>
                 <View className="px-5 pb-8 pt-4 bg-white border-t border-gray-100">
                    <TouchableOpacity
                    onPress={handleApply}
                    className="bg-blue-600 rounded-2xl py-4 items-center"
                    style={shadow}>
                        <Text className="text-white text-base font-bold">Apply Filters
                            {activeCount>0 ? `(${activeCount})` : ""}
                        </Text>
                    </TouchableOpacity> 
                 </View>
            </View>
        </Modal>
    )
}