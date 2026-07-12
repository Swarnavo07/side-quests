import { useUserStore } from '@/store/userStore';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from "expo-router";

export default function TabsLayout() {
  const isAdmin = useUserStore(state=>state.isAdmin);
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'black', headerShown: false }}>
      <Tabs.Screen name="index" options={{title: "Home", tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />}}/>
      <Tabs.Screen name="search" options={{title: "Search", tabBarIcon: ({ color }) => <Ionicons name="search" size={24} color={color} />}}/>
      <Tabs.Screen name="create" options={{title: "Add Property", href: isAdmin ? "/create" : null, tabBarIcon: ({ color }) => <Ionicons name="add-circle" size={24} color={color} />}}/>
      <Tabs.Screen name="saved" options={{title: "Saved",tabBarIcon: ({ color }) => <Ionicons name="heart-circle" size={24} color={color} />}}/>
      <Tabs.Screen name="profile" options={{title: "Profile",tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />}}/>
    </Tabs>
  );
}