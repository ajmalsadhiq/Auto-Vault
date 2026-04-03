import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from "expo-router";
import {
  Alert,
  Clipboard,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Platform,
  ScrollView,
  Share,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View
} from "react-native";
import MapView, { Marker } from 'react-native-maps';
import Svg, {
  Circle,
  Line,
  Path,
  Rect,
  Text as SvgText,
} from "react-native-svg";

import LikeButton from "@/components/LikeButton";
import icons from "@/constants/icons";
import images from "@/constants/images";
import { getCarsById } from "@/lib/appwrite";
import { useAppwrite } from "@/lib/useAppwrite";
import React, { useState } from "react";

const getOptimizedImage = (url: string, width: number = 800) => {
  if (!url) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}width=${width}&quality=75`;
};


const CAR_FEATURE_ICONS: Record<string, (props: { size: number }) => React.ReactElement> = {
  "rear-view-camera": ({ size }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="6" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <Circle cx="10" cy="11.5" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <Circle cx="10" cy="11.5" r="1" stroke="currentColor" strokeWidth="1.5"/>
      <Rect x="17" y="8" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      <Path d="M5 19 Q10 22 15 19" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </Svg>
  ),
  "parking-sensor": ({ size }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="5" width="18" height="9" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <Path d="M8 16 Q10 19 10 22" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
      <Path d="M12 15 Q12 19 12 22" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.7"/>
      <Path d="M16 16 Q14 19 14 22" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </Svg>
  ),
  "infotainment-screen": ({ size }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <Line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <Line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <Line x1="6" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
      <Line x1="6" y1="12" x2="11" y2="12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
    </Svg>
  ),
  "v6": ({ size }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 4 L12 18 L20 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <Line x1="2" y1="21" x2="22" y2="21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <SvgText x="12" y="20" textAnchor="middle" fontSize="6" fill="currentColor" fontWeight="bold">6</SvgText>
    </Svg>
  ),
  "v8": ({ size }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 4 L12 18 L20 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <Line x1="2" y1="21" x2="22" y2="21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <SvgText x="12" y="20" textAnchor="middle" fontSize="6" fill="currentColor" fontWeight="bold">8</SvgText>
    </Svg>
  ),
  "hybrid": ({ size }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M14 2 L8 13 H11 L10 22 L16 11 H13 Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  ),
  "EV": ({ size }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="7" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <Rect x="20" y="10" width="2" height="4" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      <Path d="M12 9 L9 13 H11.5 L10 16 L15 12 H12.5 Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    </Svg>
  ),
  "petrol": ({ size }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="4" y="4" width="12" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <Path d="M16 6 L20 6 L20 12 L17 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <Line x1="7" y1="10" x2="13" y2="10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
      <Line x1="7" y1="14" x2="11" y2="14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
    </Svg>
  ),
  "diesel": ({ size }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="4" y="4" width="12" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <Path d="M16 6 L20 6 L20 12 L17 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <SvgText x="10" y="15" textAnchor="middle" fontSize="7" fill="currentColor" fontWeight="bold">D</SvgText>
    </Svg>
  ),
  "airbags": ({ size }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
      <Circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 2"/>
      <Line x1="12" y1="3" x2="12" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <Line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </Svg>
  ),
  "massage": ({ size }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M7 21 L7 10 Q7 4 12 4 L14 4 Q19 4 19 10 L19 16 L19 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <Line x1="4" y1="21" x2="20" y2="21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <Path d="M9 10 Q11 8 13 10 Q15 12 17 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <Path d="M9 14 Q11 12 13 14 Q15 16 17 14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </Svg>
  ),
  "stereo-sound": ({ size }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 9 L7 9 L12 4 L12 20 L7 15 L3 15 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <Path d="M16 8 Q20 12 16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <Path d="M18 5 Q23 12 18 19" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
    </Svg>
  ),
  "AC": ({ size }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <Line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <Line x1="5" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <Line x1="19" y1="5" x2="5" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <Line x1="12" y1="2" x2="10" y2="5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <Line x1="12" y1="2" x2="14" y2="5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <Line x1="12" y1="22" x2="10" y2="19" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <Line x1="12" y1="22" x2="14" y2="19" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <Line x1="2" y1="12" x2="5" y2="10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <Line x1="2" y1="12" x2="5" y2="14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <Line x1="22" y1="12" x2="19" y2="10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <Line x1="22" y1="12" x2="19" y2="14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </Svg>
  ),
  "sunroof": ({ size }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M2 16 L6 9 Q8 5 12 5 L14 5 Q18 7 20 10 L22 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <Line x1="2" y1="16" x2="22" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <Rect x="8" y="5" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      <Line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <Line x1="8" y1="2" x2="9" y2="3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <Line x1="16" y1="2" x2="15" y2="3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </Svg>
  ),
  "bluetooth": ({ size }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <Path d="M12 2 L18 7 L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M12 12 L18 17 L12 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <Line x1="6" y1="7" x2="12" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <Line x1="6" y1="17" x2="12" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </Svg>
  ),
  "cruise-control": ({ size }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 17 A9 9 0 0 1 20 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <Line x1="12" y1="17" x2="8" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <Circle cx="12" cy="17" r="2" fill="currentColor"/>
      <Line x1="4" y1="17" x2="6.5" y2="17" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <Line x1="20" y1="17" x2="17.5" y2="17" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <Line x1="12" y1="8" x2="12" y2="10.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </Svg>
  ),
};

const Property = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();

  const windowHeight = Dimensions.get("window").height;
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const { data: car } = useAppwrite({
    fn: getCarsById,
    params: {
      id: id!,
    },
  });

  const showToast = (msg: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      Alert.alert("Copied", msg);
    }
  };

  const handleCopyEmail = () => {
    const email = car?.agent?.email;
    if (!email) return;
    Linking.openURL(`mailto:${email}`).catch(() => {
      Clipboard.setString(email);
      showToast("Copied seller's email address");
    });
    Clipboard.setString(email);
  };

  const handlePhone = () => {
    const phone = car?.agent?.phone;
    if (!phone) { showToast("No phone number available"); return; }
    Clipboard.setString(phone);
    Alert.alert(
      "Contact Seller",
      `Phone: ${phone}\n\nHow would you like to reach them?`,
      [
        { text: "Call", onPress: () => Linking.openURL(`tel:${phone}`) },
        { text: "WhatsApp", onPress: () => Linking.openURL(`https://wa.me/${phone.replace(/\D/g, "")}`) },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };


  const handleShare = async () => {
    if (!car) {
      showToast("Car details not loaded yet");
      return;
    }
    
    const message = `🚗 ${car?.make} ${car?.name}\n\n` +
      `💰 Price: ₹${car?.price?.toLocaleString()}\n` +
      `📏 Mileage: ${car?.mileage?.toLocaleString()} km\n` +
      `👥 Seats: ${car?.seats}\n` +
      `📍 Location: ${car?.address}\n\n` +
      `Check out this car on AutoVault!`;
    
    try {
      await Share.share({
        title: `${car?.make} ${car?.name} - AutoVault`,
        message: message,
      });
    } catch (error) {
      console.error(error);
      showToast("Failed to share");
    }
  };




  return (
  <View>
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerClassName="pb-32 bg-white"
    >
      <View className="relative w-full" style={{ height: windowHeight / 2 }}>
        <Image
          source={{ uri: getOptimizedImage(car?.image, 500) }}
          className="size-full"
          resizeMode="cover"
          progressiveRenderingEnabled={true} 
        />
        <Image
          source={images.whiteGradient}
          className="absolute top-0 w-full z-40"
        />

        <View
          className="z-50 absolute inset-x-7"
          style={{ top: Platform.OS === "ios" ? 70 : 20 }}
        >
          <View className="flex flex-row items-center w-full justify-between">
            <TouchableOpacity
              onPress={() => router.back()}
              className="flex flex-row bg-primary-200 rounded-full size-11 items-center justify-center"
            >
              <Image source={icons.backArrow} className="size-5" style={{ tintColor: '#000000' }}/>
            </TouchableOpacity>

            <View className="flex flex-row items-center gap-3">
              <LikeButton carId={id!} />
              <TouchableOpacity onPress={handleShare}>
                <Image source={icons.send} className="size-7" style={{ tintColor: '#000000' }}/>
              </TouchableOpacity>            
            </View>
          </View>
        </View>
      </View>

      <View className="px-5 mt-7 flex gap-2">
        <Text className="text-2xl font-rubik-extrabold">{car?.name}</Text>

        <View className="flex flex-row items-center gap-3">
          <View className="flex flex-row items-center px-4 py-2 bg-primary-100 rounded-full">
            <Text className="text-xs font-rubik-bold text-primary-300">
              {car?.make}
            </Text>
          </View>
          <View className="flex flex-row items-center px-4 py-2 bg-primary-100 rounded-full">
            <Text className="text-xs font-rubik-bold text-primary-300">
              {car?.type}
            </Text>
          </View>
        </View>

        {/* Car Stats */}
        <View className="flex flex-row items-center mt-5">
          <View className="flex flex-row items-center justify-center bg-primary-100 rounded-full size-10">
            <Image source={icons.person} className="size-4" />
          </View>
          <Text className="text-black-300 text-sm font-rubik-medium ml-2">
            {car?.seats} Seats
          </Text>

          {/* Odometer icon replacing icons.info */}
          <View className="flex flex-row items-center justify-center bg-primary-100 rounded-full size-10 ml-7">
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path d="M4 17 A9 9 0 0 1 20 17" stroke="#191D31" strokeWidth="1.5" strokeLinecap="round"/>
              <Line x1="4" y1="17" x2="22" y2="17" stroke="#191D31" strokeWidth="1.5" strokeLinecap="round"/>
              <Line x1="12" y1="17" x2="8" y2="10" stroke="#191D31" strokeWidth="2" strokeLinecap="round"/>
              <Circle cx="12" cy="17" r="1.5" fill="#191D31"/>
              <Line x1="7" y1="14" x2="8.5" y2="15" stroke="#191D31" strokeWidth="1.2" strokeLinecap="round"/>
              <Line x1="17" y1="14" x2="15.5" y2="15" stroke="#191D31" strokeWidth="1.2" strokeLinecap="round"/>
              <Line x1="12" y1="9" x2="12" y2="11" stroke="#191D31" strokeWidth="1.2" strokeLinecap="round"/>
            </Svg>
          </View>
          <Text className="text-black-300 text-sm font-rubik-medium ml-2">
            {car?.mileage?.toLocaleString()} km
          </Text>
        </View>

        {/* Agent */}
        <View className="w-full border-t border-primary-200 pt-7 mt-5">
          <Text className="text-black-300 text-xl font-rubik-bold">
            Seller
          </Text>

          <View className="flex flex-row items-center justify-between mt-4">
            <View className="flex flex-row items-center">
              <Image
                source={{ uri: getOptimizedImage(car?.agent?.avatar, 100) }}
                className="size-14 rounded-full"
              />
              <View className="flex flex-col items-start justify-center ml-3">
                <Text className="text-lg text-black-300 text-start font-rubik-bold">
                  {car?.agent?.name}
                </Text>
                <Text className="text-sm text-black-200 text-start font-rubik-medium">
                  {car?.agent?.email}
                </Text>
              </View>
            </View>

            <View className="flex flex-row items-center gap-3">
              <TouchableOpacity onPress={handleCopyEmail}>
                <Image source={icons.chat} className="size-7" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handlePhone}>
                <Image source={icons.phone} className="size-7" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Overview */}
        <View className="mt-7">
          <Text className="text-black-300 text-xl font-rubik-bold">
            Overview
          </Text>
          <Text className="text-black-200 text-base font-rubik mt-2">
            {car?.description}
          </Text>
        </View>

        {/* Features */}
        <View className="mt-7">
          <Text className="text-black-300 text-xl font-rubik-bold">Features</Text>
          {car?.features?.length > 0 && (
            <View className="flex flex-row flex-wrap items-start justify-start mt-2 gap-5">
              {car?.features?.map((item: string, index: number) => {
                const IconComponent = CAR_FEATURE_ICONS[item];
                return (
                  <View key={index} className="flex flex-1 flex-col items-center min-w-16 max-w-20">
                    <View className="size-14 bg-primary-100 rounded-full flex items-center justify-center">
                      {IconComponent ? (
                        <IconComponent size={24} />
                      ) : (
                        <Image source={icons.info} className="size-6" />
                      )}
                    </View>
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      className="text-black-300 text-sm text-center font-rubik mt-1.5"
                    >
                      {item}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Gallery */}
        {car?.gallery?.length > 0 && (
          <View className="mt-7">
            <Text className="text-black-300 text-xl font-rubik-bold">
              Gallery
            </Text>
            <FlatList
              contentContainerStyle={{ paddingRight: 20 }}
              data={car?.gallery}
              keyExtractor={(item) => item.$id}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedImage(item.image);
                    setModalVisible(true);
                  }}
                >
                <Image
                  source={{ uri: getOptimizedImage(item.image, 300) }}
                  className="size-40 rounded-xl"
                />
                </TouchableOpacity>
              )}
              contentContainerClassName="flex gap-4 mt-3"
            />
          </View>
        )}

        {/* Location */}
        <View className="mt-7 pb-32">
          <Text className="text-black-300 text-xl font-rubik-bold">
            Location
          </Text>
          <View className="flex flex-row items-center justify-start mt-4 gap-2">
            <Image source={icons.location} className="w-7 h-7" />
            <Text className="text-black-200 text-sm font-rubik-medium flex-1">
              {car?.address}
            </Text>
          </View>
          
          {/* Dynamic Map Preview */}
          {/* Interactive Map */}
          {car?.geolocation && (
            <MapView
              style={{ height: 300, width: '100%', marginTop: 20, borderRadius: 12 }}
              initialRegion={{
                latitude: parseFloat(car?.geolocation.split(',')[0]),
                longitude: parseFloat(car?.geolocation.split(',')[1]),
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={{
                  latitude: parseFloat(car?.geolocation.split(',')[0]),
                  longitude: parseFloat(car?.geolocation.split(',')[1]),
                }}
              />
            </MapView>
          )}
        </View>
      </View>
    </ScrollView>

    {/* Bottom Bar */}
    <View className="absolute bg-white bottom-0 w-full rounded-t-2xl border-t border-r border-l border-primary-200 p-7">
      <View className="flex flex-row items-center justify-between gap-10">
        <View className="flex flex-col items-start">
          <Text className="text-black-200 text-xs font-rubik-medium">
            Price
          </Text>
          <Text
            numberOfLines={1}
            className="text-primary-300 text-start text-2xl font-rubik-bold"
          >
            ${car?.price}
          </Text>
        </View>

        <TouchableOpacity onPress={handlePhone} className="flex-1 flex flex-row items-center justify-center bg-primary-300 py-3 rounded-full shadow-md shadow-zinc-400">
          <Text className="text-white text-lg text-center font-rubik-bold">
            Contact Seller
          </Text>
        </TouchableOpacity>
      </View>
    </View>
    {/* Image Viewer Modal */}
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View className="flex-1 bg-black/95">
        {/* Close button (X) */}
        <TouchableOpacity
          className="absolute top-12 right-5 z-10 bg-black/50 rounded-full p-2"
          onPress={() => setModalVisible(false)}
        >
          <Text className="text-white text-2xl">✕</Text>
        </TouchableOpacity>
        
        {/* Background tap to close */}
        <TouchableOpacity 
          className="flex-1"
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          {/* Image container */}
          <View className="flex-1 justify-center items-center">
            {selectedImage && (
              <Image
                source={{ uri: selectedImage }}
                style={{ width: Dimensions.get('window').width, height: Dimensions.get('window').height * 0.8 }}
                resizeMode="contain"
              />
            )}
          </View>
        </TouchableOpacity>
        
        {/* Instructions */}
        <View className="absolute bottom-10 left-0 right-0 items-center">
          <Text className="text-white/50 text-xs">Tap anywhere to close</Text>
        </View>
      </View>
    </Modal>
  </View>
);
};
export default Property;
