
// Mock implementation to prevent import errors
export const generateEmbedding = async (text: string): Promise<number[]> => {
  console.warn("Vector embedding is disabled in this version.");
  return [];
};

export const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
    return 0;
};
