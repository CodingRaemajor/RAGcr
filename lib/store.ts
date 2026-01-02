export type Chunk = {
  text: string
  embedding: number[]
}

let STORE: Chunk[] = []

export function saveChunks(chunks: Chunk[]) {
  STORE.push(...chunks)
}

export function getAllChunks(): Chunk[] {
  return STORE
}
