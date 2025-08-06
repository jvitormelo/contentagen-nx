import { serverEnv } from "@packages/environment/server";
import { ChromaClient as InternalChromaCLient } from "chromadb";

export const createChromaClient = (baseUrl: string): InternalChromaCLient => {
   try {
      // Parse the URL to extract host, port, and ssl info
      const url = new URL(baseUrl);
      const host = url.hostname;
      const port = parseInt(url.port) || (url.protocol === "https:" ? 443 : 80);
      const ssl = url.protocol === "https:";

      console.log(`Creating ChromaDB client for ${host}:${port} (SSL: ${ssl})`);

      return new InternalChromaCLient({
         host,
         port,
         ssl,
         headers: {
            "Authorization": `Bearer ${serverEnv.CHROMA_TOKEN}`
         }
      });
   } catch (error) {
      console.error("Failed to create ChromaDB client:", error);
      throw error;
   }
};

export type ChromaClient = ReturnType<typeof createChromaClient>;
