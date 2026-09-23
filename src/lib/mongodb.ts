import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI || "";
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (uri) {
  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
} else {
  // Graceful dummy fallback if MONGODB_URI is not yet configured
  clientPromise = Promise.resolve(null as unknown as MongoClient);
}

export async function getMongoDb(): Promise<Db | null> {
  if (!uri) return null;
  try {
    const connectedClient = await clientPromise;
    if (!connectedClient) return null;
    return connectedClient.db(process.env.MONGODB_DB_NAME || "buzzscout");
  } catch (err) {
    console.warn("MongoDB connection warning:", err);
    return null;
  }
}

export default clientPromise;
