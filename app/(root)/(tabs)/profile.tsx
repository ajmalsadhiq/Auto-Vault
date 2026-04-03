import {
  Alert,
  FlatList,
  Image,
  ImageSourcePropType,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { logout, getUserListings, deleteCarListing, updateUserAvatar } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";
import { settings } from "@/constants/data";
import icons from "@/constants/icons";
import { router } from "expo-router";
import * as ImagePicker from 'expo-image-picker';
import { databases, config } from "@/lib/appwrite";
import { Query } from "react-native-appwrite";

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
  const { user, refetch } = useGlobalContext();
  const [userListings, setUserListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [agentAvatar, setAgentAvatar] = useState(user?.avatar);

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

  // Fetch agent avatar
  useEffect(() => {
    const fetchAgentAvatar = async () => {
      if (!user?.email) return;
      try {
        const agents = await databases.listDocuments(
          config.databaseId!,
          config.agentsCollectionId!,
          [Query.equal("email", user.email)]
        );
        if (agents.documents.length > 0 && agents.documents[0].avatar) {
          setAgentAvatar(agents.documents[0].avatar);
        }
      } catch (error) {
        console.error("Error fetching agent avatar:", error);
      }
    };
    fetchAgentAvatar();
  }, [user?.email]);

  // Handle avatar change
  const handleChangeAvatar = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission needed", "Please grant permission to access your photos");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0]) {
        setUploadingAvatar(true);
        
        const newAvatarUrl = await updateUserAvatar(user?.$id!, result.assets[0].uri);
        
        // Update local avatar state
        setAgentAvatar(newAvatarUrl);
        
        // Refresh user data
        await refetch();
        
        Alert.alert("Success", "Profile picture updated!");
      }
    } catch (error) {
      console.error("Error changing avatar:", error);
      Alert.alert("Error", "Failed to update profile picture");
    } finally {
      setUploadingAvatar(false);
    }
  };

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

        {/* User Info with Edit Button on Avatar Corner */}
        <View className="flex flex-row justify-center mt-5">
          <View className="flex flex-col items-center relative mt-5">
            <View className="relative">
              <Image
                source={{ uri: agentAvatar }}
                className="size-44 rounded-full"
              />
              <TouchableOpacity 
                onPress={handleChangeAvatar}
                className="absolute bottom-0 right-0 bg-primary-300 rounded-full p-2 border-2 border-white"
                disabled={uploadingAvatar}
              >
                {uploadingAvatar ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Image source={icons.edit} className="size-5" tintColor="white" />
                )}
              </TouchableOpacity>
            </View>
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
              <Text className="text-primary-300 text-sm font-rubik-medium">↻ Refresh</Text>
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