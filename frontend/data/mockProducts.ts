// data/mockProducts.ts
import type { Product } from '../lib/product/useProductStore';

// Define the raw product data with Firebase Storage paths
interface RawProductData {
  id: number;
  name: string;
  price: number;
  quantity: number;
  imagePath: string; // Firebase Storage path
  category: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  description: string;
  isFeatured: boolean;
}

// Raw mock data with Firebase Storage paths
const rawMockProducts: RawProductData[] = [
  {
    id: 1,
    name: "Handwoven Cotton Scarf",
    price: 45.00,
    quantity: 12,
    imagePath: "products/image1.jpeg",
    category: "Accessories",
    rating: 4.8,
    reviews: 24,
    inStock: true,
    description: "Beautiful handwoven cotton scarf with intricate patterns",
    isFeatured: true
  },
  {
    id: 2,
    name: "Ceramic Tea Cup Set",
    price: 32.00,
    quantity: 8,
    imagePath: "products/image2.jpeg",
    category: "Home & Kitchen",
    rating: 4.9,
    reviews: 18,
    inStock: true,
    description: "Hand-painted ceramic tea cups with matching saucers",
    isFeatured: true
  },
  {
    id: 3,
    name: "Knitted Wool Mittens",
    price: 28.00,
    quantity: 15,
    imagePath: "products/image3.jpeg",
    category: "Accessories",
    rating: 4.7,
    reviews: 32,
    inStock: true,
    description: "Cozy knitted wool mittens in various colors",
    isFeatured: true
  },
  {
    id: 4,
    name: "Macrame Wall Hanging",
    price: 65.00,
    quantity: 5,
    imagePath: "products/image4.jpeg",
    category: "Home Decor",
    rating: 4.6,
    reviews: 15,
    inStock: true,
    description: "Beautiful macrame wall hanging for bohemian decor",
    isFeatured: true
  },
  {
    id: 5,
    name: "Handmade Soap Collection",
    price: 24.00,
    quantity: 20,
    imagePath: "products/image5.jpeg",
    category: "Bath & Body",
    rating: 4.8,
    reviews: 41,
    inStock: true,
    description: "Natural handmade soaps with essential oils",
    isFeatured: true
  },
  {
    id: 6,
    name: "Embroidered Pillow Cover",
    price: 38.00,
    quantity: 3,
    imagePath: "products/image6.jpeg",
    category: "Home Decor",
    rating: 4.9,
    reviews: 22,
    inStock: true,
    description: "Hand-embroidered pillow covers with floral patterns",
    isFeatured: true
  },
  {
    id: 7,
    name: "Wooden Jewelry Box",
    price: 85.00,
    quantity: 0,
    imagePath: "products/image9.jpeg", // No image available
    category: "Storage",
    rating: 4.7,
    reviews: 12,
    inStock: false,
    description: "Handcrafted wooden jewelry box with velvet lining",
    isFeatured: false
  },
  {
    id: 8,
    name: "Crocheted Baby Blanket",
    price: 55.00,
    quantity: 7,
    imagePath: "products/image8.jpeg",
    category: "Baby & Kids",
    rating: 5.0,
    reviews: 28,
    inStock: true,
    description: "Soft crocheted baby blanket in pastel colors",
    isFeatured: false
  },
  {
    id: 9,
    name: "Hand-painted Ceramic Vase",
    price: 42.00,
    quantity: 6,
    imagePath: "products/image9.jpeg",
    category: "Home Decor",
    rating: 4.8,
    reviews: 19,
    inStock: true,
    description: "Elegant hand-painted ceramic vase with floral motifs",
    isFeatured: false
  },
  {
    id: 10,
    name: "Leather Bound Journal",
    price: 35.00,
    quantity: 11,
    imagePath: "products/image10.jpeg",
    category: "Stationery",
    rating: 4.9,
    reviews: 33,
    inStock: true,
    description: "Handcrafted leather journal with blank pages",
    isFeatured: false
  },
  {
    id: 11,
    name: "Woven Basket Set",
    price: 52.00,
    quantity: 4,
    imagePath: "products/image11.jpeg",
    category: "Storage",
    rating: 4.6,
    reviews: 16,
    inStock: true,
    description: "Set of three woven baskets in different sizes",
    isFeatured: false
  },
  {
    id: 12,
    name: "Handmade Candle Collection",
    price: 29.00,
    quantity: 18,
    imagePath: "products/image12.jpeg",
    category: "Home & Kitchen",
    rating: 4.7,
    reviews: 45,
    inStock: true,
    description: "Set of three handmade candles with natural scents",
    isFeatured: false
  }
];

export { rawMockProducts };
export type { RawProductData };