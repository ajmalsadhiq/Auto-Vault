import icons from "@/constants/icons";
import { router } from "expo-router";
import { Image, Share, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const InviteFriends = () => {
  const handleShare = async () => {
    await Share.share({
      message:
        "🚗 Check out AutoVault — the best app to buy and sell used cars! Coming soon to the App Store and Play Store. Stay tuned!",
    });
  };

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
          Invite Friends
        </Text>
        <View className="size-11" />
      </View>

      <View className="flex-1 items-center justify-center px-10">
        <Text style={{ fontSize: 64 }}>🚗</Text>
        <Text className="text-2xl font-rubik-bold text-black-300 mt-4 text-center">
          Share AutoVault
        </Text>
        <Text className="text-sm font-rubik text-black-100 text-center mt-3 leading-5">
          Know someone looking to buy or sell a used car? Share AutoVault with
          them!
        </Text>

        <View className="w-full bg-primary-100 rounded-2xl p-5 mt-8 border border-primary-200">
          <Text className="text-xs font-rubik text-black-100 mb-1">
            App Status
          </Text>
          <Text className="text-sm font-rubik-bold text-black-300">
            🚧 Coming soon to App Store & Play Store
          </Text>
          <Text className="text-xs font-rubik text-black-100 mt-2">
            Share the word while we get ready to launch!
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleShare}
          className="w-full bg-primary-300 py-4 rounded-full mt-6 flex items-center justify-center"
        >
          <Text className="text-white font-rubik-bold text-lg">
            Share with Friends
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default InviteFriends;