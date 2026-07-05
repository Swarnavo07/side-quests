import { useSignIn } from "@clerk/clerk-expo";
import { Link } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function SignIn() {
  // Bring in the Clerk hooks and Expo Router
  const { signIn, setActive, isLoaded } = useSignIn();
  const [isLoading, setIsLoading] = useState(false);

  // Create state to hold what the user types
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // The function that runs when they press "Sign In"
  const onSignInPress = async () => {
    if (!isLoaded) return;
    setIsLoading(true);
    try {
      // Send the email and password to Clerk
      const completeSignIn = await signIn.create({
        identifier: email.trim(),
        password,
      });
      // If the login is successful...
      if (completeSignIn.status === "complete") {
        // Activate the session
        await setActive({ session: completeSignIn.createdSessionId });
        // Send the user to the main app layout
      } else { Alert.alert("Login Blocked", `Clerk Status: ${completeSignIn.status}`);}
    } catch (err: any) {
      // If they type the wrong password, show a native alert
      Alert.alert("Login Failed", err.errors[0]?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center bg-white p-6">
      <Text className="text-2xl font-bold text-center mb-8">Sign In</Text>
      <TextInput
        className="border border-gray-300 p-4 mb-4 rounded-lg text-base"
        autoCapitalize="none"
        value={email}
        placeholder="Email Address"
        onChangeText={setEmail}
      />
      
      <TextInput
        className="border border-gray-300 p-4 mb-6 rounded-lg text-base"
        value={password}
        placeholder="Password"
        secureTextEntry={true}
        onChangeText={setPassword}
      />
      <TouchableOpacity
        disabled={isLoading}
        onPress={onSignInPress}
        className="bg-blue-600 py-4 rounded-xl items-center mb-4">
        {isLoading ? <ActivityIndicator size="small" color="white" /> : <Text className="text-white font-bold text-base text-xl">Sign In</Text>}
      </TouchableOpacity>
      <View className="flex-row jsutify-center items-center">
        <Text className="text-base text-gray-600">Don't have an account?</Text>
        <Link href="/sign-up" asChild>
          <TouchableOpacity>
            <Text className="text-base font-bold text-blue-600"> Sign Up</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}