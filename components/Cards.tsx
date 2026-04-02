import LikeButton from "@/components/LikeButton";
import icons from "@/constants/icons";
import images from "@/constants/images";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { Models } from "react-native-appwrite";

interface CarDocument extends Models.Document {
  name: string;
  make: string;
  type: string;
  address: string;
  price: number;
  rating: number;
  image: string;
  mileage: number;
  seats: number;
  features: string[];
  geolocation: string;
}

interface Props {
  item: CarDocument;
  onPress?: () => void;
}

/* const LikeButton = ({ carId, style }: { carId: string; style?: string }) => {
  const { user } = useGlobalContext();
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.$id) return;
    isCarLiked({ userId: user.$id, carId }).then(setLiked);
  }, [carId, user?.$id]);

  const handleLike = async (e: any) => {
    e.stopPropagation();
    if (!user?.$id || loading) return;
    setLiked((prev) => !prev); // ✅ instant UI update
    setLoading(true);
    const result = await toggleLike({ userId: user.$id, carId });
    if (result === null) setLiked((prev) => !prev); // revert if failed
    setLoading(false);
  };

  return (
    <TouchableOpacity onPress={handleLike} className={style}>
      <Text style={{ fontSize: 20, color: liked ? "#E00000" : "#9CA3AF" }}>
        {liked ? "♥" : "♡"}
      </Text>
    </TouchableOpacity>
  );
};*/

export const FeaturedCard = ({ item, onPress }: Props) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex flex-col items-start w-60 h-80 relative"
    >
      <Image source={{ uri: item.image }} className="size-full rounded-2xl" />

      <Image
        source={images.cardGradient}
        className="size-full rounded-2xl absolute bottom-0"
      />

      {/* Premium star badge — keep for future subscription feature */}
      <View className="flex flex-row items-center bg-white/90 px-2 py-1.5 rounded-full absolute top-5 right-5">
        <Image source={icons.star} className="size-3.5" />
      </View>

      <View className="flex flex-col items-start absolute bottom-5 inset-x-5">
        <Text
          className="text-xl font-rubik-extrabold text-white"
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <Text className="text-sm font-rubik text-white/80" numberOfLines={1}>
          {item.type}
        </Text>
        <Text className="text-base font-rubik text-white" numberOfLines={1}>
          {item.address}
        </Text>

        <View className="flex flex-row items-center justify-between w-full">
          <Text className="text-xl font-rubik-extrabold text-white">
            ₹{item.price}
          </Text>
          <LikeButton carId={item.$id} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const Card = ({ item, onPress }: Props) => {
  return (
    <TouchableOpacity
      className="flex-1 w-full mt-4 px-3 py-4 rounded-lg bg-white shadow-lg shadow-black-100/70 relative"
      onPress={onPress}
    >
      <Image source={{ uri: item.image }} className="w-full h-40 rounded-lg" />

      <View className="flex flex-col mt-2">
        <Text className="text-base font-rubik-bold text-black-300">
          {item.name}
        </Text>
        <Text className="text-xs font-rubik-medium text-primary-300">
          {item.make}
        </Text>
        <Text className="text-xs font-rubik text-black-100">{item.address}</Text>

        <View className="flex flex-row items-center justify-between mt-2">
          <Text className="text-base font-rubik-bold text-primary-300">
            ₹{item.price}
          </Text>
          <LikeButton carId={item.$id} style="mr-2" />
        </View>
      </View>
    </TouchableOpacity>
  );
};