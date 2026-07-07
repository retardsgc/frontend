declare module 'elasticlunr' {
  export interface Document {
    [key: string]: any;
  }
  export interface SearchResult {
    ref: string;
    score: number;
  }
  export interface Index {
    setRef(field: string): void;
    addField(field: string): void;
    addDoc(doc: Document): void;
    search(query: string, options?: any): SearchResult[];
  }
  const elasticlunr: (config: (this: Index) => void) => Index;
  export default elasticlunr;
}
