import React, { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Text, ScrollView, TouchableOpacity, View } from "react-native";

import { categories, carMakes } from "@/constants/data";
  
const Filters = () => {
  const params = useLocalSearchParams<{ filter?: string;make?: string }>();
  const [selectedCategory, setSelectedCategory] = useState(
    params.filter || "All"
  );
  const [selectedMake, setSelectedMake] = useState(
    params.make || "All"
  );

  const handleCategoryPress = (category: string) => {
    if (selectedCategory === category) {
      setSelectedCategory("All");
      router.setParams({ filter: "All" });
      return;
    }

    setSelectedCategory(category);
    router.setParams({ filter: category });
  };


  const handleMakePress = (make: string) => {
    if (selectedMake === make) {
      setSelectedMake("All");
      router.setParams({ make: "All" });
      return;
    }
    setSelectedMake(make);
    router.setParams({ make: make });
  };

  


  return (
    <View>
      {/* Car Make Filter */}
      <Text className="text-black-300 text-base font-rubik-bold mt-3 mb-1">
        Make
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-2"
      >
        {carMakes.map((item, index) => (
          <TouchableOpacity
            onPress={() => handleMakePress(item.make)}
            key={index}
            className={`flex flex-col items-start mr-4 px-4 py-2 rounded-full ${
              selectedMake === item.make
                ? "bg-primary-300"
                : "bg-primary-100 border border-primary-200"
            }`}
          >
            <Text
              className={`text-sm ${
                selectedMake === item.make
                  ? "text-white font-rubik-bold"
                  : "text-black-300 font-rubik"
              }`}
            >
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Car Type Filter */}
      <Text className="text-black-300 text-base font-rubik-bold mt-3 mb-1">
        Type
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-2"
      >
        {categories.map((item, index) => (
          <TouchableOpacity
            onPress={() => handleCategoryPress(item.category)}
            key={index}
            className={`flex flex-col items-start mr-4 px-4 py-2 rounded-full ${
              selectedCategory === item.category
                ? "bg-primary-300"
                : "bg-primary-100 border border-primary-200"
            }`}
          >
            <Text
              className={`text-sm ${
                selectedCategory === item.category
                  ? "text-white font-rubik-bold"
                  : "text-black-300 font-rubik"
              }`}
            >
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};
export default Filters;