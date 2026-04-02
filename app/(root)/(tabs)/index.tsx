import icons from "@/constants/icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card, FeaturedCard } from "@/components/Cards";
import Filters from "@/components/Filters";
import NoResults from "@/components/NoResults";
import Search from "@/components/Search";

import { getCars, getLatestCars } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";
import { useAppwrite } from "@/lib/useAppwrite";

const Home = () => {
  const { user, featuredVersion } = useGlobalContext();

  const params = useLocalSearchParams<{ query?: string; filter?: string; make?: string }>();

  const { data: latestCars, loading: latestCarsLoading, refetch: refetchFeatured } = useAppwrite({
    fn: getLatestCars,
  });

  const { data: cars, refetch, loading } = useAppwrite({
    fn: getCars,
    params: {
      filter: params.filter!,
      query: params.query!,
      make: params.make!,
      limit: 6,
    },
    skip: true,
  });

  useEffect(() => {
    refetch({
      filter: params.filter!,
      query: params.query!,
      limit: 6,
      make: params.make!,
    });
  }, [params.filter, params.query, params.make]);

  // Only refetch featured when payments page triggers a change
  useEffect(() => {
    if (featuredVersion > 0) refetchFeatured({});
  }, [featuredVersion]);

  const handleCardPress = (id: string) => router.push(`/properties/${id}`);

  const listRef = useRef<FlatList>(null);

  const scrollToRecommendations = () => {
    listRef.current?.scrollToOffset({
      offset: 490,
      animated: true,
    });
  };

  return (
    <SafeAreaView className="h-full bg-white">
      <FlatList
        ref={listRef}
        data={cars}
        numColumns={2}
        renderItem={({ item }) => (
          <Card item={item as any} onPress={() => handleCardPress(item.$id)} />
        )}
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
              <View className="flex flex-row">
                <TouchableOpacity onPress={() => router.push("/profile")}>
                  <Image
                    source={{ uri: user?.avatar }}
                    className="size-12 rounded-full"
                  />
                </TouchableOpacity>
                <View className="flex flex-col items-start ml-2 justify-center">
                  <Text className="text-xs font-rubik text-black-100">Hello</Text>
                  <Text className="text-base font-rubik-medium text-black-300">
                    {user?.name}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => router.push("/notification")}>
                <Image source={icons.bell} className="size-6" />
              </TouchableOpacity>
            </View>

            <Search />

            <View className="my-5">
              <View className="flex flex-row items-center justify-between">
                <Text className="text-xl font-rubik-bold text-black-300">Featured</Text>
                <TouchableOpacity onPress={() => router.push("/explore")}>
                  <Text className="text-base font-rubik-bold text-primary-300">See all</Text>
                </TouchableOpacity>
              </View>

              {latestCarsLoading ? (
                <ActivityIndicator size="large" className="text-primary-300" />
              ) : !latestCars || latestCars.length === 0 ? (
                <NoResults />
              ) : (
                <FlatList
                  data={latestCars}
                  renderItem={({ item }) => (
                    <FeaturedCard
                      item={item as any}
                      onPress={() => handleCardPress(item.$id)}
                    />
                  )}
                  keyExtractor={(item) => item.$id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerClassName="flex gap-5 mt-5"
                />
              )}
            </View>

            <View className="mt-5">
              <View className="flex flex-row items-center justify-between">
                <Text className="text-xl font-rubik-bold text-black-300">Our Recommendation</Text>
                <TouchableOpacity onPress={scrollToRecommendations}>
                  <Text className="text-base font-rubik-bold text-primary-300">See all</Text>
                </TouchableOpacity>
              </View>
              <Filters />
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default Home;