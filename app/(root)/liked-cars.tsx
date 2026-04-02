import { Card } from "@/components/Cards";
import NoResults from "@/components/NoResults";
import icons from "@/constants/icons";
import { getLikedCars } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LikedCars = () => {
  const { user, likedCarIds } = useGlobalContext();
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.$id) return;
    setLoading(true);
    getLikedCars({ userId: user.$id }).then((result) => {
      setCars(result);
      setLoading(false);
    });
  }, [likedCarIds]); // re-fetches whenever you like/unlike anywhere

  const handleCardPress = (id: string) => router.push(`/properties/${id}`);

  return (
    <SafeAreaView className="h-full bg-white">
      <FlatList
        data={cars}
        numColumns={2}
        keyExtractor={(item) => item.$id}
        contentContainerClassName="pb-32"
        columnWrapperClassName="flex gap-5 px-5"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" className="text-primary-300 mt-5" />
          ) : (
            <NoResults />
          )
        }
        ListHeaderComponent={() => (
          <View className="px-5">
            <View className="flex flex-row items-center justify-between mt-5">
              <TouchableOpacity
                onPress={() => router.back()}
                className="flex flex-row bg-primary-200 rounded-full size-11 items-center justify-center"
              >
                <Image source={icons.backArrow} className="size-5" />
              </TouchableOpacity>
              <Text className="text-xl font-rubik-bold text-black-300">
                Liked Cars
              </Text>
              <View className="size-11" />
            </View>
            <Text className="text-sm font-rubik text-black-100 mt-2 text-center">
              {cars.length} {cars.length === 1 ? "car" : "cars"} saved
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <Card item={item} onPress={() => handleCardPress(item.$id)} />
        )}
      />
    </SafeAreaView>
  );
};

export default LikedCars;