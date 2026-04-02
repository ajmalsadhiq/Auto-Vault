import * as Linking from 'expo-linking';
import { openAuthSessionAsync } from "expo-web-browser";
import { Account, Avatars, Client, Databases, ID, OAuthProvider, Query, Storage } from "react-native-appwrite";


export const config = {
    platform: 'com.ajmal.autovault',
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
    databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
    galleriesCollectionId: process.env.EXPO_PUBLIC_APPWRITE_GALLERIES_COLLECTION_ID,
    agentsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_AGENTS_COLLECTION_ID,
    sellerReviewsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_SELLER_REVIEWS_COLLECTION_ID,
    carsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_CARS_COLLECTION_ID,
    likesCollectionId: process.env.EXPO_PUBLIC_APPWRITE_LIKES_COLLECTION_ID,
    bucketId: process.env.EXPO_PUBLIC_APPWRITE_STORAGE_BUCKET_ID,


}

export const client = new Client();

client
    .setEndpoint(config.endpoint!)
    .setProject(config.projectId!)
    .setPlatform(config.platform!)

export const avatar = new Avatars(client);
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);


export async function login() {
    try {
        const redirectUri = Linking.createURL('/');

        const response = await account.createOAuth2Token(
            OAuthProvider.Google,
            redirectUri,
            redirectUri
        );

        if (!response) throw new Error('Failed to login');

        const browserResult = await openAuthSessionAsync(
            response.toString(),
            redirectUri
        );

        if (browserResult.type !== "success") throw new Error("Authorization failed");

        const url = new URL(browserResult.url);
        const secret = url.searchParams.get("secret")?.toString();
        const userId = url.searchParams.get("userId")?.toString();

        if (!secret || !userId) throw new Error("failed to login");

        const session = await account.createSession(userId, secret);
        if (!session) throw new Error("Failed to create session");

        return true;

    } catch (error) {
        console.error(error);
        return false;
    }
}
export async function logout() {
  try {
    await account.deleteSession("current");
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function getCurrentUser() {
  try {
    const response = await account.get();
    if (response.$id) {
      const name = response.name;

const userAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
  name
)}&size=512&background=111827&color=ffffff&bold=true`;
      return {
        ...response,
        avatar: userAvatar.toString(),
      };
    }

    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getLatestCars() {
  try {
    const result = await databases.listDocuments(
      config.databaseId!,
      config.carsCollectionId!,
      [Query.equal("featured", true), Query.orderDesc("$createdAt"), Query.limit(5)]

    );
    return result.documents;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getCars({
  filter,
  query,
  limit,
  make,
}: {
  filter: string;
  query: string;
  limit: number;
  make?: string;
}) {
  try {
    const buildQuery = [Query.orderDesc("$createdAt")];

    if (filter && filter !== "All")
      buildQuery.push(Query.equal("type", filter));
    if (make && make !== "All")
      buildQuery.push(Query.equal("make", make));


    if (query)
      buildQuery.push(
        Query.or([
          Query.search("name", query),
          Query.search("address", query),
          Query.search("type", query),
          Query.search("make", query),
        ])
      );

    if (limit) buildQuery.push(Query.limit(limit));

    const result = await databases.listDocuments(
      config.databaseId!,
      config.carsCollectionId!,
      buildQuery
    );

    return result.documents;
  } catch (error) {
    console.error(error);
    return [];
  }
}

// write function to get property by id
export async function getCarsById({ id }: { id: string }) {
  try {
    const result = await databases.getDocument(
      config.databaseId!,
      config.carsCollectionId!,
      id,
      [Query.select(["*", "agent.*", "gallery.*", "sellerReviews.*"])]

    );
    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
}




export async function getLikedCars({ userId }: { userId: string }) {
  try {
    const likes = await databases.listDocuments(
      config.databaseId!,
      config.likesCollectionId!,
      [Query.equal("userId", userId)]
    );

    if (likes.documents.length === 0) return [];

    const carIds = likes.documents.map((like) => like.carId);

    const cars = await Promise.allSettled(
      carIds.map((carId) =>
        databases.getDocument(
          config.databaseId!,
          config.carsCollectionId!,
          carId
        )
      )
    );

    return cars
      .filter((res) => res.status === "fulfilled")
      .map((res:any) => res.value);
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function toggleLike({
  userId,
  carId,
}: {
  userId: string;
  carId: string;
}) {
  try {
    const existing = await databases.listDocuments(
      config.databaseId!,
      config.likesCollectionId!,
      [Query.equal("userId", userId), Query.equal("carId", carId)]
    );

    if (existing.documents.length > 0) {
      await databases.deleteDocument(
        config.databaseId!,
        config.likesCollectionId!,
        existing.documents[0].$id
      );
      return false; // unliked
    } else {
      await databases.createDocument(
        config.databaseId!,
        config.likesCollectionId!,
        ID.unique(),
        { userId, carId }
      );
      return true; // liked
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function isCarLiked({
  userId,
  carId,
}: {
  userId: string;
  carId: string;
}) {
  try {
    const existing = await databases.listDocuments(
      config.databaseId!,
      config.likesCollectionId!,
      [Query.equal("userId", userId), Query.equal("carId", carId)]
    );
    return existing.documents.length > 0;
  } catch (error) {
    console.error(error);
    return false;
  }
}

/**
 * Upload a local image URI to Appwrite Storage.
 * Returns the public URL of the uploaded file.
 */
export async function uploadImage(uri: string): Promise<string> {
  const fileName = uri.split("/").pop() || `image_${Date.now()}.jpg`;
  const mimeType = fileName.endsWith(".png") ? "image/png" : "image/jpeg";
 
  const file = {
    name: fileName,
    type: mimeType,
    size: 0, // Appwrite SDK fills this in
    uri,
  };
 
  const uploaded = await storage.createFile(
    config.bucketId!,
    ID.unique(),
    file as any
  );
 
  // Build public view URL
  const url = `${config.endpoint}/storage/buckets/${config.bucketId}/files/${uploaded.$id}/view?project=${config.projectId}`;
  return url;
}
 
/**
 * Check if an agent record exists for this user (by email).
 * If not, create one. Returns the agent document $id.
 */
export async function createAgentIfNotExists({
  userId,
  name,
  email,
  avatar,
  phone,
}: {
  userId: string;
  name: string;
  email: string;
  avatar: string;
  phone: string;
}): Promise<string> {
  // Check if agent already exists
  const existing = await databases.listDocuments(
    config.databaseId!,
    config.agentsCollectionId!,
    [Query.equal("email", email)]
  );
 
  if (existing.documents.length > 0) {
    const existingAgent = existing.documents[0];
    
    // ✅ Update the agent with new phone number (and potentially name/avatar if changed)
    if (phone) {
      await databases.updateDocument(
        config.databaseId!,
        config.agentsCollectionId!,
        existingAgent.$id,
        { 
          phone,  // Add missing phone number
          // Optionally update name/avatar if they've changed
          name, 
          avatar 
        }
      );
    }
    
    return existingAgent.$id;
  }
 
  // Create new agent record
  const agent = await databases.createDocument(
    config.databaseId!,
    config.agentsCollectionId!,
    ID.unique(),
    { name, email, avatar, phone }
  );
 
  return agent.$id;
}
 
/**
 * Full car listing creation:
 * 1. Upload main image → get URL
 * 2. Upload gallery images → get URLs
 * 3. Create/find agent record for the seller
 * 4. Create gallery documents
 * 5. Create car document linked to agent + gallery
 */
export async function createCarListing({
  user,
  form,
}: {
  user: {
    $id: string;
    name: string;
    email: string;
    avatar: string;
  };
  form: {
    name: string;
    make: string;
    type: string;
    description: string;
    price: number;
    mileage: number;
    seats: number;
    features: string[];
    mainImageUri: string;
    galleryUris: string[];
    address: string;
    geolocation: string;
    phone: string;
    contactEmail: string;
  };
}) {
  // 1. Upload main image
  const mainImageUrl = await uploadImage(form.mainImageUri);
 
  // 2. Upload gallery images
  const galleryUrls: string[] = [];
  for (const uri of form.galleryUris) {
    const url = await uploadImage(uri);
    galleryUrls.push(url);
  }
 
  // 3. Create or find agent
  const agentId = await createAgentIfNotExists({
    userId: user.$id,
    name: user.name,
    email: form.contactEmail || user.email,
    avatar: user.avatar,
    phone: form.phone,
  });
 
  // 4. Create gallery documents and collect their IDs
  const galleryIds: string[] = [];
  for (const imageUrl of galleryUrls) {
    const galleryDoc = await databases.createDocument(
      config.databaseId!,
      config.galleriesCollectionId!,
      ID.unique(),
      { image: imageUrl }
    );
    galleryIds.push(galleryDoc.$id);
  }
 
  // 5. Create the car document
  const car = await databases.createDocument(
    config.databaseId!,
    config.carsCollectionId!,
    ID.unique(),
    {
      name: form.name,
      make: form.make,
      type: form.type,
      description: form.description,
      price: form.price,
      mileage: form.mileage,
      seats: form.seats,
      rating: 0,
      features: form.features,
      image: mainImageUrl,
      geolocation: form.geolocation,
      address: form.address,
      agent: agentId,
      gallery: galleryIds,
      featured: false,
    }
  );
 
  return car;
}





export async function getUserListings({ email }: { email: string }) {
  try {
    // Find agent by email
    const agents = await databases.listDocuments(
      config.databaseId!,
      config.agentsCollectionId!,
      [Query.equal("email", email)]
    );
    if (agents.documents.length === 0) return [];
    const agentId = agents.documents[0].$id;
 
    // Get cars linked to this agent
    const result = await databases.listDocuments(
      config.databaseId!,
      config.carsCollectionId!,
      [Query.equal("agent", agentId), Query.orderDesc("$createdAt")]
    );
    return result.documents;
  } catch (error) {
    console.error(error);
    return [];
  }
}
 
// Set featured: true on a car
export async function featureCar({ carId }: { carId: string }) {
  try {
    await databases.updateDocument(
      config.databaseId!,
      config.carsCollectionId!,
      carId,
      { featured: true }
    );
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function unfeatureCar({ carId }: { carId: string }) {
  try {
    await databases.updateDocument(
      config.databaseId!,
      config.carsCollectionId!,
      carId,
      { featured: false }
    );
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}