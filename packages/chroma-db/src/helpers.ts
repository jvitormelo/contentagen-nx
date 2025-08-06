import type { Collection, Metadata, ChromaClient } from "chromadb";
import { OpenAIEmbeddingFunction } from "@chroma-core/openai";
import { serverEnv } from "@packages/environment/server";
export const embedder = new OpenAIEmbeddingFunction({
   modelName: "text-embedding-3-small",
   apiKey: serverEnv.OPENAI_API_KEY,
});

// Collection names used in ChromaDB
export const CollectionName = {
   AgentKnowledge: "agent_knowledge",
   // Add more as needed
} as const;

export type CollectionName =
   (typeof CollectionName)[keyof typeof CollectionName];

/**
 * Get a collection by name, or create it if it doesn't exist.
 * Returns { collection, justCreated }
 */
export const getOrCreateCollection = async (
   client: ChromaClient,
   name: keyof typeof CollectionName,
   metadata?: Metadata,
): Promise<{ collection: Collection; justCreated: boolean }> => {
   const collectionName = CollectionName[name];
   try {
      console.log(`Attempting to get collection: ${collectionName}`);
      const collection = await client.getCollection({
         name: collectionName,
         embeddingFunction: embedder,
      });
      console.log(`Successfully retrieved collection: ${collectionName}`);
      return { collection, justCreated: false };
   } catch (err) {
      console.log(
         `Collection "${collectionName}" not found, creating a new one:`,
         err instanceof Error ? err.message : String(err),
      );
      try {
         const collection = await client.createCollection({
            name: collectionName,
            embeddingFunction: embedder,
            metadata,
         });
         console.log(`Successfully created collection: ${collectionName}`);
         return { collection, justCreated: true };
      } catch (createErr) {
         console.error(`Failed to create collection "${collectionName}":`, createErr);
         throw createErr;
      }
   }
};
type AddToCollectionArgs = Parameters<Collection["add"]>[0];
type QueryCollectionArgs = Parameters<Collection["query"]>[0];

export const createCollection = async (
   client: ChromaClient,
   opts: { name: string; metadata?: Metadata },
) => {
   return await client.createCollection(opts);
};

export const getCollection = async (client: ChromaClient, name: string) => {
   return await client.getCollection({ name });
};

export const listCollections = async (client: ChromaClient) => {
   const collections = await client.listCollections();
   return collections.map((c: { name: string }) => c.name);
};

export const deleteCollection = async (client: ChromaClient, name: string) => {
   await client.deleteCollection({ name });
};

export const deleteFromCollection = async (
   collection: Collection,
   args: Parameters<Collection["delete"]>[0],
) => {
   await collection.delete(args);
};
export const addToCollection = async (
   collection: Collection,
   args: AddToCollectionArgs,
) => {
   await collection.add(args);
};

export const queryCollection = async (
   collection: Collection,
   args: QueryCollectionArgs,
) => {
   return await collection.query(args);
};
