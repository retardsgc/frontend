// Product related types
export interface Color {
  name: string;
  value: string;
  selected?: boolean;
}

export interface SizeOption {
  name: string;
  price: number;
}

export interface Specifications {
  [key: string]: string;
}

export interface Product {
  // MongoDB document id; backend may return both `_id` and `id` as strings
  _id?: string;
  id?: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: string;
  categoryId: string;
  images: string[];
  colors: Color[];
  sizes: SizeOption[];
  inStock: boolean;
  rating: number;
  reviews: number;
  specifications: Specifications;
  bestseller: boolean;
  hotDeal: boolean;
  onSale?: boolean;
  dealText?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface ProductsData {
  categories: Category[];
  products: Product[];
}
