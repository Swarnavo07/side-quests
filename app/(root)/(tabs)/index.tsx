import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Home() {
  return (
  <SafeAreaView className="flex-1 bg-white-100">
    <View className="flex-1 items-center justify-center bg-blue-500">
      <Text className="text-2xl font-bold">Home</Text>
    </View>
  </SafeAreaView>
  );
}