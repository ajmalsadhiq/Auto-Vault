import icons from "./icons";
import images from "./images";

export const cards = [
  {
    title: "Toyota Camry",
    location: "Chennai, TN",
    price: "$15,000",
    rating: 4.8,
    category: "Sedans",
    image: images.newYork,
  },
  {
    title: "Honda CR-V",
    location: "Mumbai, MH",
    price: "$22,000",
    rating: 3,
    category: "SUVs",
    image: images.japan,
  },
  {
    title: "Maruti Swift",
    location: "Delhi, DL",
    price: "$8,000",
    rating: 2,
    category: "Hatchbacks",
    image: images.newYork,
  },
  {
    title: "Ford Mustang",
    location: "Bangalore, KA",
    price: "$35,000",
    rating: 5,
    category: "Coupes",
    image: images.japan,
  },
];

export const featuredCards = [
  {
    title: "BMW 3 Series",
    location: "Chennai, TN",
    price: "$28,000",
    rating: 4.8,
    image: images.newYork,
    category: "Sedans",
  },
  {
    title: "Toyota Fortuner",
    location: "Mumbai, MH",
    price: "$32,000",
    rating: 4.5,
    image: images.japan,
    category: "SUVs",
  },
];

export const categories = [
  { title: "All", category: "All" },
  { title: "Sedan", category: "Sedan" },
  { title: "SUV", category: "SUV" },
  { title: "Hatchback", category: "Hatchback" },
  { title: "Coupe", category: "Coupe" },
  { title: "Pickup", category: "Pickup" },
  { title: "Convertible", category: "Convertible" },
  { title: "Truck", category: "Truck" },
  { title: "Bus/Van", category: "Bus/Van" },
];

export const carMakes = [
  { title: "All", make: "All" },
  { title: "Toyota", make: "Toyota" },
  { title: "Honda", make: "Honda" },
  { title: "Ford", make: "Ford" },
  { title: "BMW", make: "BMW" },
  { title: "Mercedes", make: "Mercedes" },
  { title: "Nissan", make: "Nissan" },
  { title: "Hyundai", make: "Hyundai" },
  { title: "Kia", make: "Kia" },
  { title: "Audi", make: "Audi" },
  { title: "Volkswagen", make: "Volkswagen" },
  { title: "Others", make: "Others" },  // ✅ added

];

export const settings = [
  {
    title: "My Bookings",
    icon: icons.calendar,
  },
  {
    title: "Payments",
    icon: icons.wallet,
  },
  
  {
    title: "Notifications",
    icon: icons.bell,
  },
  {
    title: "Security",
    icon: icons.shield,
  },
  {
    title: "Sell Your Car",
    icon: icons.person,
  },
  {
    title: "Language",
    icon: icons.language,
  },
  {
    title: "Help Center",
    icon: icons.info,
  },
  {
    title: "Invite Friends",
    icon: icons.people,
  },
];

export const facilities = [
  { title: "Rear View Camera", icon: icons.carPark },
  { title: "Parking Sensor", icon: icons.carPark },
  { title: "Infotainment", icon: icons.wifi },
  { title: "V6 Engine", icon: icons.run },
  { title: "Hybrid", icon: icons.laundry },
  { title: "Electric", icon: icons.dumbell },
  { title: "Airbags", icon: icons.shield },
  { title: "Stereo Sound", icon: icons.swim },
];

export const gallery = [
  { id: 1, image: images.newYork },
  { id: 2, image: images.japan },
  { id: 3, image: images.newYork },
  { id: 4, image: images.japan },
  { id: 5, image: images.newYork },
  { id: 6, image: images.japan },
];