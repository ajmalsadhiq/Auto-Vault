import icons from "@/constants/icons";
import { featureCar, getUserListings, unfeatureCar } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";
import { useAppwrite } from "@/lib/useAppwrite";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Models } from "react-native-appwrite";
import { SafeAreaView } from "react-native-safe-area-context";

interface CarDoc extends Models.Document {
  name: string;
  image: string;
  price: number;
  make: string;
  type: string;
  featured: boolean;
}

const Payments = () => {
  const { user, bumpFeatured } = useGlobalContext();
  const [featuringId, setFeaturingId] = useState<string | null>(null);

  const { data: listings, loading, refetch } = useAppwrite({
    fn: getUserListings,
    params: { email: user?.email || "" },
  });

  const handleFeature = (car: CarDoc) => {
    if (car.featured) return;
    Alert.alert(
      "Feature this car",
      `"${car.name}" will appear in Featured on the home page.\n\n(Payment will be required in a future update.)`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            setFeaturingId(car.$id);
            const ok = await featureCar({ carId: car.$id });
            setFeaturingId(null);
            if (ok) {
              bumpFeatured();
              Alert.alert("🎉 Featured!", `"${car.name}" is now featured on the home page.`);
              refetch({ email: user?.email || "" });
            } else {
              Alert.alert("Error", "Could not feature this car. Try again.");
            }
          },
        },
      ]
    );
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
        <Text className="text-xl font-rubik-bold text-black-300">Payments</Text>
        <View className="size-11" />
      </View>

      <View className="px-5 mt-6 mb-2">
        <Text className="text-base font-rubik-bold text-black-300">Feature a Car</Text>
        <Text className="text-xs font-rubik text-black-100 mt-1">
          Featured cars appear at the top of the home page. Select one of your listings below.
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" className="mt-10 text-primary-300" />
      ) : !listings || listings.length === 0 ? (
        <View className="flex-1 items-center justify-center px-10">
          <Text style={{ fontSize: 48 }}>🚗</Text>
          <Text className="text-base font-rubik-bold text-black-300 mt-4 text-center">
            No listings yet
          </Text>
          <Text className="text-sm font-rubik text-black-100 text-center mt-2">
            Sell a car first, then come back to feature it.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/sell-car")}
            className="bg-primary-300 px-6 py-3 rounded-full mt-6"
          >
            <Text className="text-white font-rubik-bold">Sell Your Car</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={listings as unknown as CarDoc[]}
          keyExtractor={(item) => item.$id}
          contentContainerClassName="px-5 pb-10"
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View className="flex-row items-center bg-primary-100 rounded-2xl p-3 mb-3 border border-primary-200">
              <Image
                source={{ uri: item.image }}
                className="w-20 h-16 rounded-xl"
                resizeMode="cover"
              />
              <View className="flex-1 ml-3">
                <Text className="text-sm font-rubik-bold text-black-300" numberOfLines={1}>
                  {item.name}
                </Text>
                <Text className="text-xs font-rubik text-black-100">
                  {item.make} · {item.type}
                </Text>
                <Text className="text-xs font-rubik-bold text-primary-300 mt-0.5">
                  ₹{item.price.toLocaleString()}
                </Text>
              </View>

              {item.featured ? (
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert(
                      "Remove from Featured",
                      `Remove "${item.name}" from the featured section?`,
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Remove",
                          style: "destructive",
                          onPress: async () => {
                            setFeaturingId(item.$id);
                            const ok = await unfeatureCar({ carId: item.$id });
                            setFeaturingId(null);
                            if (ok) {
                              bumpFeatured();
                              refetch({ email: user?.email || "" });
                            }
                          },
                        },
                      ]
                    );
                  }}
                  className="bg-yellow-400 px-3 py-1.5 rounded-full"
                >
                  <Text className="text-xs font-rubik-bold text-white">⭐ Unfeature</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => handleFeature(item)}
                  disabled={featuringId === item.$id}
                  className="bg-primary-300 px-3 py-1.5 rounded-full"
                >
                  {featuringId === item.$id ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text className="text-xs font-rubik-bold text-white">Feature</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          )}
          ListHeaderComponent={() => (
            <View className="bg-primary-100 border border-primary-200 rounded-2xl p-4 mb-4">
              <Text className="text-xs font-rubik-bold text-black-300">💳 Payment</Text>
              <Text className="text-xs font-rubik text-black-100 mt-1">
                Payment integration coming soon. Featuring is free for now.
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

export default Payments;