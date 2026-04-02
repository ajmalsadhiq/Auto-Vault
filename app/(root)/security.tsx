import icons from "@/constants/icons";
import { router } from "expo-router";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const securityItems = [
  {
    icon: "🔐",
    title: "Google Sign-In",
    description: "Your account is secured with Google OAuth 2.0 authentication.",
  },
  {
    icon: "🛡️",
    title: "Data Encryption",
    description: "All your data is encrypted in transit using HTTPS/TLS.",
  },
  {
    icon: "☁️",
    title: "Secure Cloud Storage",
    description: "Your data is stored securely on Appwrite Cloud servers.",
  },
  {
    icon: "🔒",
    title: "Session Management",
    description: "Your session is managed securely. You can log out anytime to end it.",
  },
  {
    icon: "👁️",
    title: "Privacy",
    description: "We do not sell or share your personal data with third parties.",
  },
];

const Security = () => {
  return (
    <SafeAreaView className="h-full bg-white">
      <View className="flex flex-row items-center justify-between px-5 mt-5">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex flex-row bg-primary-200 rounded-full size-11 items-center justify-center"
        >
          <Image source={icons.backArrow} className="size-5" />
        </TouchableOpacity>
        <Text className="text-xl font-rubik-bold text-black-300">Security</Text>
        <View className="size-11" />
      </View>

      <ScrollView className="px-5 mt-5" showsVerticalScrollIndicator={false}>
        <Text className="text-sm font-rubik text-black-100 mb-5 text-center">
          Here&apos;s how AutoVault keeps your account and data safe.
        </Text>
        {securityItems.map((item, index) => (
          <View
            key={index}
            className="flex flex-row items-start bg-primary-100 rounded-xl p-4 mb-4"
          >
            <Text style={{ fontSize: 28 }}>{item.icon}</Text>
            <View className="flex-1 ml-4">
              <Text className="text-base font-rubik-bold text-black-300">
                {item.title}
              </Text>
              <Text className="text-sm font-rubik text-black-200 mt-1">
                {item.description}
              </Text>
            </View>
          </View>
        ))}
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Security;