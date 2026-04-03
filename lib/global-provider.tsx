import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { getCurrentUser, getLikedCars } from "./appwrite";
import { useAppwrite } from "./useAppwrite";

interface User {
  $id: string;
  name: string;
  email: string;
  avatar: string;
}

interface GlobalContextType {
  isLoggedIn: boolean;
  user: User | null;
  loading: boolean;
  refetch: (newParams?: Record<string, string | number> | undefined) => Promise<void>;
  likedCarIds: Set<string>;
  toggleLikedCar: (carId: string) => void;
  featuredVersion: number;
  bumpFeatured: () => void;
  carsVersion: number;  // ✅ Added
  refreshCars: () => void;  // ✅ Added
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const {
    data: user,
    loading,
    refetch,
  } = useAppwrite({
    fn: getCurrentUser,
  });

  const [likedCarIds, setLikedCarIds] = useState<Set<string>>(new Set());
  const [featuredVersion, setFeaturedVersion] = useState(0);
  const [carsVersion, setCarsVersion] = useState(0);  // ✅ Added

  useEffect(() => {
    if (!user?.$id) return;
    getLikedCars({ userId: user.$id }).then((cars) => {
      setLikedCarIds(new Set(cars.map((c: any) => c.$id)));
    });
  }, [user?.$id]);

  const toggleLikedCar = (carId: string) => {
    setLikedCarIds((prev) => {
      const next = new Set(prev);
      if (next.has(carId)) next.delete(carId);
      else next.add(carId);
      return next;
    });
  };

  const bumpFeatured = () => setFeaturedVersion((v) => v + 1);
  const refreshCars = () => setCarsVersion((v) => v + 1);  // ✅ Added

  const isLoggedIn = !!user;

  return (
    <GlobalContext.Provider
      value={{
        isLoggedIn,
        user: user as User | null,
        loading,
        refetch,
        likedCarIds,
        toggleLikedCar,
        featuredVersion,
        bumpFeatured,
        carsVersion,  // ✅ Added
        refreshCars,  // ✅ Added
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = (): GlobalContextType => {
  const context = useContext(GlobalContext);
  if (!context)
    throw new Error("useGlobalContext must be used within a GlobalProvider");
  return context;
};

export default GlobalProvider;