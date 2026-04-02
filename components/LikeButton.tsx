import { toggleLike } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";
import { useState } from "react";
import { Text, TouchableOpacity } from "react-native";

const LikeButton = ({ carId, style }: { carId: string; style?: string }) => {
  const { user, likedCarIds, toggleLikedCar } = useGlobalContext();
  const [loading, setLoading] = useState(false);

  const liked = likedCarIds.has(carId);

  const handleLike = async (e: any) => {
    e.stopPropagation();
    if (!user?.$id || loading) return;
    toggleLikedCar(carId); // instant update everywhere
    setLoading(true);
    const result = await toggleLike({ userId: user.$id, carId });
    if (result === null) toggleLikedCar(carId); // revert if failed
    setLoading(false);
  };

  return (
    <TouchableOpacity onPress={handleLike} className={style}>
      <Text style={{ fontSize: 22, color: liked ? "#E00000" : "#000000" }}>
        {liked ? "♥" : "♡"}
      </Text>
    </TouchableOpacity>
  );
};

export default LikeButton;