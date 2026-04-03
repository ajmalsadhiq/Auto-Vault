import { settings } from "@/constants/data";
import icons from "@/constants/icons";
import { deleteCarListing, getUserListings, logout } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import  { SafeAreaView } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  ImageSourcePropType,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface SettingsItemProp {
  icon: ImageSourcePropType;
  title: string;
  onPress?: () => void;
  textStyle?: string;
  showArrow?: boolean;
}

const SettingsItem = ({
  icon,
  title,
  onPress,
  textStyle,
  showArrow = true,
}: SettingsItemProp) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex flex-row items-center justify-between py-3"
  >
    <View className="flex flex-row items-center gap-3">
      <Image source={icon} className="size-6" />
      <Text className={`text-lg font-rubik-medium text-black-300 ${textStyle}`}>
        {title}
      </Text>
    </View>
    {showArrow && <Image source={icons.rightArrow} className="size-5" />}
  </TouchableOpacity>
);

const Profile = () => {
  const { user, refetch, refreshCars} = useGlobalContext();
  const [userListings, setUserListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch user's listings
  const fetchUserListings = useCallback(async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const listings = await getUserListings({ email: user.email });
      setUserListings(listings);
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    fetchUserListings();
  }, [fetchUserListings]);

  const handleDeleteListing = (carId: string, carName: string) => {
    Alert.alert(
      "Delete Listing",
      `Are you sure you want to delete "${carName}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const success = await deleteCarListing({ carId });
            if (success) {
              Alert.alert("Success", "Listing deleted successfully");
              refreshCars();
              fetchUserListings();
            } else {
              Alert.alert("Error", "Failed to delete listing");
            }
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    const result = await logout();
    if (result) {
      Alert.alert("Success", "Logged out successfully");
      refetch();
    } else {
      Alert.alert("Error", "Failed to logout");
    }
  };

  const renderListing = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => router.push(`/(root)/properties/${item.$id}`)}
      className="flex-row items-center bg-primary-100 p-3 rounded-xl mb-3"
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.image }}
        className="w-20 h-20 rounded-lg"
        resizeMode="cover"
      />
      <View className="flex-1 ml-3">
        <Text className="font-rubik-bold text-black-300 text-base" numberOfLines={1}>
          {item.name || "Unknown Car"}
        </Text>
        <Text className="text-primary-300 font-rubik-bold text-lg">
          ₹{(item.price || 0).toLocaleString()}
        </Text>
        <Text className="text-black-100 text-xs">
          {item.make || "?"} • {item.type || "?"} • {(item.mileage || 0).toLocaleString()} km
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => handleDeleteListing(item.$id, item.name || "this car")}
        className="bg-red-500 px-3 py-2 rounded-lg ml-2"
      >
        <Text className="text-white font-rubik-medium text-sm">Delete</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="h-full bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-32 px-7"
      >
        {/* Header */}
        <View className="flex flex-row items-center justify-between mt-5">
          <Text className="text-xl font-rubik-bold">Profile</Text>
          <TouchableOpacity onPress={() => router.push("/notification")}>
            <Image source={icons.bell} className="size-6" />
          </TouchableOpacity>
        </View>

        {/* User Info */}
        <View className="flex flex-row justify-center mt-5">
          <View className="flex flex-col items-center relative mt-5">
            <Image
              source={{ uri: user?.avatar }}
              className="size-44 relative rounded-full"
            />
            <TouchableOpacity className="absolute bottom-11 right-2">
              <Image source={icons.edit} className="size-9" />
            </TouchableOpacity>
            <Text className="text-2xl font-rubik-bold mt-2">{user?.name}</Text>
            <Text className="text-sm text-black-100 mt-1">{user?.email}</Text>
          </View>
        </View>

        {/* My Listings Section */}
        <View className="flex flex-col mt-10">
          <View className="flex flex-row items-center justify-between mb-3">
            <Text className="text-xl font-rubik-bold text-black-300">
              My Listings
            </Text>
            <TouchableOpacity onPress={fetchUserListings}>
              <Text className="text-primary-300 text-sm font-rubik-medium"> Refresh</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View className="py-10">
              <ActivityIndicator size="large" color="#0061FF" />
            </View>
          ) : userListings.length === 0 ? (
            <View className="bg-primary-100 rounded-xl py-10 items-center">
              <Text className="text-black-100 text-center text-base">
                🚗 No listings yet.
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/sell-car")}
                className="mt-3 bg-primary-300 px-4 py-2 rounded-full"
              >
                <Text className="text-white font-rubik-medium">Sell Your Car</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={userListings}
              renderItem={renderListing}
              keyExtractor={(item) => item.$id}
              scrollEnabled={false}
              refreshing={refreshing}
              onRefresh={fetchUserListings}
            />
          )}
        </View>

        {/* Settings Sections */}
        <View className="flex flex-col mt-10">
          <SettingsItem
            icon={icons.calendar}
            title="My Bookings/Likes"
            onPress={() => router.push("/liked-cars")}
          />
          <SettingsItem
            icon={icons.wallet}
            title="Payments"
            onPress={() => router.push("/payment")}
          />
        </View>

        <View className="flex flex-col mt-5 border-t pt-5 border-primary-200">
          {settings.slice(2).map((item, index) => {
            const routes: Record<string, string> = {
              Notifications: "/notification",
              Security: "/security",
              Language: "/language",
              "Help Center": "/help-center",
              "Invite Friends": "/invite-friends",
              "Sell Your Car": "/sell-car",
            };
            return (
              <SettingsItem
                key={index}
                {...item}
                onPress={
                  routes[item.title]
                    ? () => router.push(routes[item.title] as any)
                    : undefined
                }
              />
            );
          })}
        </View>

        {/* Logout */}
        <View className="flex flex-col border-t mt-5 pt-5 border-primary-200">
          <SettingsItem
            icon={icons.logout}
            title="Logout"
            textStyle="text-danger"
            showArrow={false}
            onPress={handleLogout}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;