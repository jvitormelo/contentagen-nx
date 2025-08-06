import { serverEnv } from "@packages/environment/server";
import { ChromaClient as InternalChromaCLient } from "chromadb";

export const createChromaClient = (baseUrl: string): InternalChromaCLient => {
   try {
      console.log(`Creating ChromaDB client for ${baseUrl}`);

      const client = new InternalChromaCLient({
         path: baseUrl,
         headers: {
            "Authorization": `Bearer ${serverEnv.CHROMA_TOKEN}`
         }
      });

      // Test the connection immediately
      client.heartbeat().then((result) => {
         console.log(`ChromaDB heartbeat successful: ${result}`);
      }).catch((error) => {
         console.error(`ChromaDB heartbeat failed:`, error);
      });

      return client;
   } catch (error) {
      console.error("Failed to create ChromaDB client:", error);
      throw error;
   }
};

export type ChromaClient = ReturnType<typeof createChromaClient>;
