import icons from "@/constants/icons";
import { router } from "expo-router";
import { useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const faqs = [
  {
    q: "How do I list my car for sale?",
    a: "Car listing feature is coming soon! You'll be able to post your car with photos, price, and details directly from the app.",
  },
  {
    q: "How do I contact a seller?",
    a: 'Open any car listing and tap the "Contact Seller" button at the bottom to get in touch with the seller directly.',
  },
  {
    q: "Is AutoVault free to use?",
    a: "Yes! AutoVault is completely free to browse and search cars. Premium features may be introduced in the future.",
  },
  {
    q: "How do I save a car I like?",
    a: "Tap the heart icon on any car card or inside the car detail page to save it. Find all saved cars under My Bookings in your profile.",
  },
  {
    q: "How do I search for a specific car?",
    a: "Use the search bar on the Home or Explore page. You can also filter by car make and type using the filter buttons.",
  },
  {
    q: "How do I log out?",
    a: "Go to your Profile page and tap the Logout button at the bottom.",
  },
  {
    q: "Is my data safe?",
    a: "Yes. AutoVault uses Google OAuth and Appwrite Cloud for secure authentication and data storage. Check the Security page for more details.",
  },
];

const HelpCenter = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <SafeAreaView className="h-full bg-white">
      <View className="flex flex-row items-center justify-between px-5 mt-5">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex flex-row bg-primary-200 rounded-full size-11 items-center justify-center"
        >
          <Image source={icons.backArrow} className="size-5" />
        </TouchableOpacity>
        <Text className="text-xl font-rubik-bold text-black-300">
          Help Center
        </Text>
        <View className="size-11" />
      </View>

      <ScrollView className="px-5 mt-5" showsVerticalScrollIndicator={false}>
        <Text className="text-sm font-rubik text-black-100 mb-5 text-center">
          Frequently Asked Questions
        </Text>

        {faqs.map((faq, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setOpenIndex(openIndex === index ? null : index)}
            className="bg-primary-100 rounded-xl px-5 py-4 mb-3"
          >
            <View className="flex flex-row items-center justify-between">
              <Text className="text-sm font-rubik-bold text-black-300 flex-1 mr-3">
                {faq.q}
              </Text>
              <Text className="text-black-300 text-lg">
                {openIndex === index ? "−" : "+"}
              </Text>
            </View>
            {openIndex === index && (
              <Text className="text-sm font-rubik text-black-200 mt-3 leading-5">
                {faq.a}
              </Text>
            )}
          </TouchableOpacity>
        ))}
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default HelpCenter;