import { Account, Avatars, Client, OAuthProvider, Databases, Query } from "react-native-appwrite";
import * as Linking from 'expo-linking';
import { openAuthSessionAsync } from "expo-web-browser";


export const config = {
    platform: 'com.ajmal.autovault',
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
    databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
    galleriesCollectionId: process.env.EXPO_PUBLIC_APPWRITE_GALLERIES_COLLECTION_ID,
    agentsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_AGENTS_COLLECTION_ID,
    sellerReviewsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_SELLER_REVIEWS_COLLECTION_ID,
    carsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_CARS_COLLECTION_ID,

}

export const client = new Client();

client
    .setEndpoint(config.endpoint!)
    .setProject(config.projectId!)
    .setPlatform(config.platform!)

export const avatar = new Avatars(client);
export const account = new Account(client);
export const databases = new Databases(client);

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
      [Query.orderDesc("$createdAt"), Query.limit(5)]
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