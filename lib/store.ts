type VectorDoc = {
  text: string;
  embedding: number[];
};

const store: VectorDoc[] = [];

export function addToStore(doc: VectorDoc) {
  store.push(doc);
}

export function getStore() {
  return store;
}
