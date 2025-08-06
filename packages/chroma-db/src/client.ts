import { serverEnv } from "@packages/environment/server";
import { ChromaClient as InternalChromaCLient } from "chromadb";

export const createChromaClient = (baseUrl: string): InternalChromaCLient => {
   return new InternalChromaCLient({
      path: baseUrl,
      headers: {
         "Authorization": `Bearer ${serverEnv.CHROMA_TOKEN}`
      }
   });
};

export type ChromaClient = ReturnType<typeof createChromaClient>;
