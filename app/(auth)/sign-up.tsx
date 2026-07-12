import { useSignUp } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function SignUp() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  // Function 1: Sign Up
  const onSignUpPress = async () => {
    if (!isLoaded) return;
    setIsLoading(true);

    try {
      await signUp.create({
        firstName,
        lastName,
        emailAddress: email.trim(),
        password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch(err: any) {
      Alert.alert("Sign up failed", err.errors[0]?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // Function 2: Verify Code
  const onVerifyPress = async() => {
    if (!isLoaded) return;
    setIsLoading(true);
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({ code });
      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        router.replace("/");
      } else {
        console.error("OTP failed", completeSignUp);
      }
    } catch (err: any) {
      Alert.alert("Sign Up Failed", err.errors[0]?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // UI: Verification Screen
  if (pendingVerification) {
    return(
      <View className="flex-1 justify-center bg-white p-6">
        <Text className="text-2xl font-bold text-center mb-2">Verify your email</Text>
        <Text className="text-gray-500 text-center mb-8">We sent a code to {email}</Text>
        <TextInput
          className="border border-gray-300 p-4 mb-4 rounded-xl text-base"
          value={code}
          placeholder="Enter 6-digit code"
          keyboardType="number-pad"
          onChangeText={setCode}
        />
        <TouchableOpacity
          disabled={isLoading}
          onPress={onVerifyPress}
          className="bg-blue-600 py-4 rounded-xl items-center"
        >
          {isLoading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-base">Verify</Text>}
        </TouchableOpacity>
      </View>
    );
  }

  // UI: Main Registration Screen
  return (
    <View className="flex-1 justify-center bg-white p-6">
      <Text className="text-3xl font-bold text-center mb-8 text-red-500">Create Account</Text>
      
      <View className="flex-row gap-3 mb-4">
        <TextInput
          className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-base"
          autoCapitalize="words"
          value={firstName}
          placeholder="First Name"
          onChangeText={setFirstName}
        />
        <TextInput
          className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-base"
          autoCapitalize="words"
          value={lastName}
          placeholder="Last Name"
          onChangeText={setLastName}
        />
      </View>
      
      <TextInput
        className="border border-gray-300 p-4 py-3 mb-4 rounded-xl text-base"
        autoCapitalize="none"
        value={email}
        placeholder="Email Address"
        keyboardType="email-address"
        onChangeText={setEmail}
      />
      
      <TextInput
        className="border border-gray-300 p-4 py-3 mb-4 rounded-xl text-base"
        autoCapitalize="none"
        value={password}
        placeholder="Password"
        secureTextEntry={true} // <-- ADDED: Hides the password
        onChangeText={setPassword}
      />
      
      <TouchableOpacity
        disabled={isLoading}
        onPress={onSignUpPress} // <-- ADDED: Makes the button actually work
        className="bg-blue-600 py-4 rounded-xl items-center mb-4"
      >
        {isLoading ? <ActivityIndicator size="small" color="white" /> : <Text className="text-white font-bold text-base text-xl">Sign Up</Text>}
      </TouchableOpacity>
      
      <View className="flex-row justify-center items-center">
        <Text className="text-base text-gray-600">Already have an account?</Text>
        <Link href="/sign-in" asChild>
          <TouchableOpacity>
            <Text className="text-base font-bold text-blue-600"> Sign In</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}