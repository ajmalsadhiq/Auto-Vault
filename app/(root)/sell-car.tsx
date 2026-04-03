import icons from "@/constants/icons";
import { createCarListing } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ── Constants ────────────────────────────────────────────────
const CAR_TYPES = [ "Sedan", "Suv", "Hatchback", "Coupe", "Convertible", "Pickup","Truck", "Bus/Van","Other"];
const CAR_MAKES = [ "Hyundai", "Honda", "Toyota", "Kia", "Ford", "Volkswagen", "BMW", "Mercedes", "Audi","Nissan", "Other"];
const PRESET_FEATURES = ["rear-view-camera",
  "parking-sensor", 
  "infotainment-screen",
  "v6",
  "v8",
  "hybrid",
  "EV",
  "petrol",
  "diesel",
  "airbags",
  "massage",
  "stereo-sound",
  "AC",
  "sunroof",
  "bluetooth",
  "cruise-control",];

const STEPS = ["Details", "Specs", "Photos", "Location", "Review"];

// ── Types ────────────────────────────────────────────────────
interface FormData {
  name: string;
  make: string;
  type: string;
  overview: string;
  price: string;
  mileage: string;
  seats: string;
  features: string[];
  customFeature: string;
  mainImage: string | null;
  galleryImages: string[];
  address: string;
  geolocation: string;
  phone: string;
  contactEmail: string;
}

// ── Step indicator ───────────────────────────────────────────
const StepBar = ({ current }: { current: number }) => (
  <View className="flex-row items-center justify-center px-5 py-3 gap-1">
    {STEPS.map((label, i) => (
      <View key={i} className="flex-1 items-center">
        <View
          className={`w-7 h-7 rounded-full items-center justify-center ${
            i < current ? "bg-primary-300" : i === current ? "bg-primary-300" : "bg-primary-100"
          }`}
        >
          <Text className={`text-xs font-rubik-bold ${i <= current ? "text-white" : "text-black-100"}`}>
            {i < current ? "✓" : i + 1}
          </Text>
        </View>
        <Text className={`text-[9px] mt-1 font-rubik ${i === current ? "text-primary-300 font-rubik-bold" : "text-black-100"}`}>
          {label}
        </Text>
      </View>
    ))}
  </View>
);

// ── Reusable input ───────────────────────────────────────────
const Field = ({
  label, value, onChange, placeholder, keyboardType = "default", multiline = false
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; keyboardType?: any; multiline?: boolean;
}) => (
  <View className="mb-4">
    <Text className="text-sm font-rubik-medium text-black-300 mb-1">{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      keyboardType={keyboardType}
      multiline={multiline}
      numberOfLines={multiline ? 4 : 1}
      className={`bg-primary-100 rounded-xl px-4 py-3 text-sm font-rubik text-black-300 border border-primary-200 ${multiline ? "h-24 text-top" : ""}`}
      placeholderTextColor="#9CA3AF"
      textAlignVertical={multiline ? "top" : "center"}
    />
  </View>
);

// ── Pill selector ────────────────────────────────────────────
const PillSelect = ({
  label, options, selected, onSelect, multi = false
}: {
  label: string; options: string[]; selected: string | string[];
  onSelect: (v: any) => void; multi?: boolean;
}) => (
  <View className="mb-4">
    <Text className="text-sm font-rubik-medium text-black-300 mb-2">{label}</Text>
    <View className="flex-row flex-wrap gap-2">
      {options.map((opt) => {
        const isSelected = multi
          ? (selected as string[]).includes(opt)
          : selected === opt;
        return (
          <TouchableOpacity
            key={opt}
            onPress={() => {
              if (multi) {
                const arr = selected as string[];
                onSelect(isSelected ? arr.filter((x) => x !== opt) : [...arr, opt]);
              } else {
                onSelect(opt);
              }
            }}
            className={`px-3 py-1.5 rounded-full border ${
              isSelected ? "bg-primary-300 border-primary-300" : "bg-white border-primary-200"
            }`}
          >
            <Text className={`text-xs font-rubik-medium ${isSelected ? "text-white" : "text-black-300"}`}>
              {opt}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
);

// ── Main Component ───────────────────────────────────────────
const SellCar = () => {
  const { user } = useGlobalContext();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const [form, setForm] = useState<FormData>({
    name: "",
    make: "",
    type: "",
    overview: "",
    price: "",
    mileage: "",
    seats: "",
    features: [],
    customFeature: "",
    mainImage: null,
    galleryImages: [],
    address: "",
    geolocation: "",
    phone: "",
    contactEmail: user?.email || "",
  });

  const set = (key: keyof FormData, val: any) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  // ── Image pickers ────────────────────────────────────────
  const pickMainImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled) set("mainImage", result.assets[0].uri);
  };

  const pickGalleryImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri);
      set("galleryImages", [...form.galleryImages, ...uris].slice(0, 8));
    }
  };

  const removeGalleryImage = (idx: number) =>
    set("galleryImages", form.galleryImages.filter((_, i) => i !== idx));

  // ── Auto-detect location ─────────────────────────────────
  const detectLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Allow location access to auto-detect.");
        setLocationLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;
      set("geolocation", `${latitude},${longitude}`);
      const geo = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (geo.length > 0) {
        const g = geo[0];
        const addr = [g.street, g.district, g.city, g.region, g.country]
          .filter(Boolean)
          .join(", ");
        set("address", addr);
      }
    } catch {
      Alert.alert("Error", "Could not detect location.");
    }
    setLocationLoading(false);
  };

  // ── Validation ───────────────────────────────────────────
  const validate = (): boolean => {
    if (step === 0 && (!form.name || !form.make || !form.type || !form.overview))
      return Alert.alert("Missing", "Fill in all details.") as any || false;
    if (step === 1 && (!form.price || !form.mileage || !form.seats))
      return Alert.alert("Missing", "Fill in price, mileage and seats.") as any || false;
    if (step === 2 && !form.mainImage)
      return Alert.alert("Missing", "Add a main photo.") as any || false;
    if (step === 3 && (!form.address || !form.geolocation))
      return Alert.alert("Missing", "Add location details.") as any || false;
    return true;
  };

  const next = () => { if (validate()) setStep((s) => s + 1); };
  const back = () => setStep((s) => s - 1);

  // ── Submit ───────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      await createCarListing({
        user,
        form: {
          name: form.name,
          make: form.make,
          type: form.type,
          description: form.overview,
          price: parseInt(form.price),
          mileage: parseFloat(form.mileage),
          seats: parseInt(form.seats),
          features: form.features,
          mainImageUri: form.mainImage!,
          galleryUris: form.galleryImages,
          address: form.address,
          geolocation: form.geolocation,
          phone: form.phone,
          contactEmail: form.contactEmail,
        },
      });
      Alert.alert("🎉 Listed!", "Your car is now live.", [
        { text: "View Listings", onPress: () => router.replace("/") },
      ]);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Something went wrong.");
    }
    setSubmitting(false);
  };

  // ── Steps ────────────────────────────────────────────────
  const renderStep = () => {
    switch (step) {
      // Step 0 — Details
      case 0:
        return (
          <View>
            <Text className="text-base font-rubik-bold text-black-300 mb-4">Car Details</Text>
            <Field label="Car Name *" value={form.name} onChange={(v) => set("name", v)} placeholder="e.g. Swift VXi 2021" />
            <PillSelect label="Make *" options={CAR_MAKES} selected={form.make} onSelect={(v) => set("make", v)} />
            <PillSelect label="Type *" options={CAR_TYPES} selected={form.type} onSelect={(v) => set("type", v)} />
            <Field label="Overview *" value={form.overview} onChange={(v) => set("overview", v)}
              placeholder="Reason for selling, condition, any extras..." multiline />
          </View>
        );

      // Step 1 — Specs
      case 1:
        return (
          <View>
            <Text className="text-base font-rubik-bold text-black-300 mb-4">Specs & Features</Text>
            <Field label="Price (₹) *" value={form.price} onChange={(v) => set("price", v)} placeholder="e.g. 450000" keyboardType="numeric" />
            <Field label="Mileage (km) *" value={form.mileage} onChange={(v) => set("mileage", v)} placeholder="e.g. 45000" keyboardType="numeric" />
            <Field label="Seats *" value={form.seats} onChange={(v) => set("seats", v)} placeholder="e.g. 5" keyboardType="numeric" />
            <PillSelect label="Features" options={PRESET_FEATURES} selected={form.features} onSelect={(v) => set("features", v)} multi />
            {/* Custom feature */}
            
              
            {form.features.length > 0 && (
              <View className="flex-row flex-wrap gap-2">
                {form.features.map((f, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => set("features", form.features.filter((_, idx) => idx !== i))}
                    className="bg-primary-300 px-3 py-1 rounded-full flex-row items-center gap-1"
                  >
                    <Text className="text-white text-xs font-rubik-medium">{f}</Text>
                    <Text className="text-white text-xs">✕</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        );

      // Step 2 — Photos
      case 2:
        return (
          <View>
            <Text className="text-base font-rubik-bold text-black-300 mb-4">Photos</Text>
            {/* Main photo */}
            <Text className="text-sm font-rubik-medium text-black-300 mb-2">Main Photo *</Text>
            <TouchableOpacity
              onPress={pickMainImage}
              className="w-full h-48 rounded-2xl bg-primary-100 border-2 border-dashed border-primary-200 items-center justify-center mb-4 overflow-hidden"
            >
              {form.mainImage ? (
                <Image source={{ uri: form.mainImage }} className="w-full h-full" resizeMode="cover" />
              ) : (
                <View className="items-center">
                  <Text className="text-3xl mb-2">📷</Text>
                  <Text className="text-sm font-rubik text-black-100">Tap to add main photo</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Gallery */}
            <Text className="text-sm font-rubik-medium text-black-300 mb-2">Gallery Photos (up to 8)</Text>
            <View className="flex-row flex-wrap gap-2 mb-3">
              {form.galleryImages.map((uri, i) => (
                <View key={i} className="w-24 h-24 rounded-xl overflow-hidden">
                  <Image source={{ uri }} className="w-full h-full" resizeMode="cover" />
                  <TouchableOpacity
                    onPress={() => removeGalleryImage(i)}
                    className="absolute top-1 right-1 bg-black/50 rounded-full w-5 h-5 items-center justify-center"
                  >
                    <Text className="text-white text-xs">✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
              {form.galleryImages.length < 8 && (
                <TouchableOpacity
                  onPress={pickGalleryImages}
                  className="w-24 h-24 rounded-xl bg-primary-100 border-2 border-dashed border-primary-200 items-center justify-center"
                >
                  <Text className="text-2xl">+</Text>
                  <Text className="text-[10px] font-rubik text-black-100">Add</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        );

      // Step 3 — Location
      case 3:
        return (
          <View>
            <Text className="text-base font-rubik-bold text-black-300 mb-4">Location & Contact</Text>

            {/* Auto detect */}
            <TouchableOpacity
              onPress={detectLocation}
              disabled={locationLoading}
              className="flex-row items-center justify-center bg-primary-100 border border-primary-200 rounded-xl py-3 mb-4 gap-2"
            >
              {locationLoading ? (
                <ActivityIndicator size="small" color="#0061FF" />
              ) : (
                <Text className="text-sm font-rubik-medium text-primary-300">📍 Auto-detect my location</Text>
              )}
            </TouchableOpacity>

            <Text className="text-center text-xs font-rubik text-black-100 mb-4">— or enter manually —</Text>

            <Field label="Address *" value={form.address} onChange={(v) => set("address", v)}
              placeholder="e.g. Anna Nagar, Chennai, Tamil Nadu" multiline />
            <Field label="Coordinates (lat,lng) *" value={form.geolocation} onChange={(v) => set("geolocation", v)}
              placeholder="e.g. 13.0827,80.2707" keyboardType="numbers-and-punctuation" />

            <Text className="text-base font-rubik-bold text-black-300 mb-3 mt-2">Contact Info</Text>
            <Field label="Phone" value={form.phone} onChange={(v) => set("phone", v)}
              placeholder="e.g. 9876543210" keyboardType="phone-pad" />
            <Field label="Email" value={form.contactEmail} onChange={(v) => set("contactEmail", v)}
              placeholder="you@email.com" keyboardType="email-address" />
          </View>
        );

      // Step 4 — Review
      case 4:
        return (
          <View>
            <Text className="text-base font-rubik-bold text-black-300 mb-4">Review & Submit</Text>

            {/* Seller info */}
            <View className="flex-row items-center gap-3 bg-primary-100 rounded-2xl p-4 mb-4">
              <Image source={{ uri: user?.avatar }} className="w-12 h-12 rounded-full" />
              <View>
                <Text className="text-sm font-rubik-bold text-black-300">{user?.name}</Text>
                <Text className="text-xs font-rubik text-black-100">{form.contactEmail || user?.email}</Text>
                {form.phone ? <Text className="text-xs font-rubik text-black-100">{form.phone}</Text> : null}
              </View>
            </View>

            {form.mainImage && (
              <Image source={{ uri: form.mainImage }} className="w-full h-44 rounded-2xl mb-4" resizeMode="cover" />
            )}

            <View className="bg-primary-100 rounded-2xl p-4 gap-2">
              <Row label="Name" value={form.name} />
              <Row label="Make" value={form.make} />
              <Row label="Type" value={form.type} />
              <Row label="Price" value={`₹${form.price}`} />
              <Row label="Mileage" value={`${form.mileage} km`} />
              <Row label="Seats" value={form.seats} />
              <Row label="Features" value={form.features.join(", ") || "None"} />
              <Row label="Location" value={form.address} />
            </View>

            <View className="bg-primary-100 rounded-2xl p-4 mt-3">
              <Text className="text-xs font-rubik-medium text-black-300 mb-1">Overview</Text>
              <Text className="text-xs font-rubik text-black-200">{form.overview}</Text>
            </View>

            <Text className="text-center text-xs font-rubik text-black-100 mt-4">
              Your listing goes live immediately after submitting.
            </Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView className="h-full bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 mt-3">
        <TouchableOpacity
          onPress={() => (step === 0 ? router.back() : back())}
          className="flex-row bg-primary-200 rounded-full size-11 items-center justify-center"
        >
          <Image source={icons.backArrow} className="size-5" />
        </TouchableOpacity>
        <Text className="text-xl font-rubik-bold text-black-300">Sell Your Car</Text>
        <View className="size-11" />
      </View>

      <StepBar current={step} />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View className="pb-10 pt-2">{renderStep()}</View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom nav */}
      <View className="px-5 pb-5 pt-3 border-t border-primary-100">
        {step < 4 ? (
          <TouchableOpacity onPress={next} className="bg-primary-300 py-4 rounded-full items-center">
            <Text className="text-white font-rubik-bold text-base">Continue</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting}
            className="bg-primary-300 py-4 rounded-full items-center"
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-rubik-bold text-base">🚀 List My Car</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <View className="flex-row justify-between">
    <Text className="text-xs font-rubik text-black-100">{label}</Text>
    <Text className="text-xs font-rubik-medium text-black-300 flex-1 text-right ml-4" numberOfLines={2}>{value}</Text>
  </View>
);

export default SellCar;