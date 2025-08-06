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
 * Test ChromaDB connection
 */
export const testConnection = async (client: ChromaClient): Promise<boolean> => {
   try {
      const heartbeat = await client.heartbeat();
      console.log(`ChromaDB connection test successful. Heartbeat: ${heartbeat}`);
      
      const version = await client.version();
      console.log(`ChromaDB version: ${version}`);
      
      const collections = await client.listCollections();
      console.log(`Existing collections: ${collections.map(c => c.name).join(', ') || 'none'}`);
      
      return true;
   } catch (error) {
      console.error(`ChromaDB connection test failed:`, error);
      return false;
   }
};

/**
 * Get a collection by name, or create it if it doesn't exist.
 * Returns { collection, justCreated }
 */
export const getOrCreateCollection = async (
   client: ChromaClient,
   name: keyof typeof CollectionName,
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
      
      // Add a small delay to prevent race conditions
      await new Promise(resolve => setTimeout(resolve, 100));
      
      try {
         // First, let's check if we can connect and list collections
         const collections = await client.listCollections();
         console.log(`Current collections:`, collections.map(c => c.name));
         
         // Try creating collection without embedding function first
         console.log(`Attempting to create collection without embedding function: ${collectionName}`);
         let collection: Collection;
         try {
            collection = await client.createCollection({
               name: collectionName,
            });
            console.log(`Successfully created collection without embedding function: ${collectionName}`);
         } catch (basicCreateErr) {
            console.log(`Failed to create basic collection, trying with embedding function:`, basicCreateErr);
            collection = await client.createCollection({
               name: collectionName,
               embeddingFunction: embedder,
            });
            console.log(`Successfully created collection with embedding function: ${collectionName}`);
         }
         
         return { collection, justCreated: true };
      } catch (createErr) {
         console.error(`Failed to create collection "${collectionName}":`, createErr);
         console.error(`Full error details:`, JSON.stringify(createErr, null, 2));
         
         // Try to get the collection again in case it was created by another process
         try {
            console.log(`Retrying to get collection: ${collectionName}`);
            const collection = await client.getCollection({
               name: collectionName,
               embeddingFunction: embedder,
            });
            console.log(`Collection "${collectionName}" found after creation attempt`);
            return { collection, justCreated: false };
         } catch (finalErr) {
            console.error(`Final attempt to get collection "${collectionName}" failed:`, finalErr);
            throw createErr;
         }
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
