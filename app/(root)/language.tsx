import icons from "@/constants/icons";
import { router } from "expo-router";
import { useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const languages = [
  { label: "English", code: "en", available: true },
  { label: "தமிழ் (Tamil)", code: "ta", available: false },
  { label: "हिन्दी (Hindi)", code: "hi", available: false },
  { label: "العربية (Arabic)", code: "ar", available: false },
];

const Language = () => {
  const [selected, setSelected] = useState("en");

  return (
    <SafeAreaView className="h-full bg-white">
      <View className="flex flex-row items-center justify-between px-5 mt-5">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex flex-row bg-primary-200 rounded-full size-11 items-center justify-center"
        >
          <Image source={icons.backArrow} className="size-5" />
        </TouchableOpacity>
        <Text className="text-xl font-rubik-bold text-black-300">Language</Text>
        <View className="size-11" />
      </View>

      <ScrollView className="px-5 mt-5" showsVerticalScrollIndicator={false}>
        <Text className="text-sm font-rubik text-black-100 mb-5 text-center">
          More languages coming soon!
        </Text>
        {languages.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            onPress={() => lang.available && setSelected(lang.code)}
            className={`flex flex-row items-center justify-between px-5 py-4 rounded-xl mb-3 ${
              selected === lang.code
                ? "bg-primary-300"
                : "bg-primary-100 border border-primary-200"
            } ${!lang.available ? "opacity-40" : ""}`}
          >
            <Text
              className={`text-base font-rubik-medium ${
                selected === lang.code ? "text-white" : "text-black-300"
              }`}
            >
              {lang.label}
            </Text>
            {selected === lang.code && (
              <Text style={{ color: "white", fontSize: 18 }}>✓</Text>
            )}
            {!lang.available && (
              <Text className="text-xs font-rubik text-black-100">
                Coming soon
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Language;