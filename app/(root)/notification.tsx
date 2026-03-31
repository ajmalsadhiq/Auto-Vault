import { View, Text, Image } from "react-native";
import { router } from "expo-router";
import { TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import icons from "@/constants/icons";

const Notifications = () => {
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
          Notifications
        </Text>
        <View className="size-11" />
      </View>

      <View className="flex-1 flex items-center justify-center">
        <Image source={icons.bell} className="size-16 mb-4" tintColor="#8C8E98" />
        <Text className="text-xl font-rubik-bold text-black-300">
          No Notifications
        </Text>
        <Text className="text-sm font-rubik text-black-100 mt-2">
          You&apos;re all caught up!
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default Notifications;