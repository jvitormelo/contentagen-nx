import { serverEnv } from "@packages/environment/server";
import { ChromaClient as InternalChromaCLient } from "chromadb";
export const createChromaClient = (baseUrl: string): InternalChromaCLient => {
   return new InternalChromaCLient({
      path: baseUrl,
      auth: {
    provider: "token",
    credentials: serverEnv.CHROMA_TOKEN,
    tokenHeaderType: "AUTHORIZATION"
  }
      
   });
};

export type ChromaClient = ReturnType<typeof createChromaClient>;
