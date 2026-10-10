import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Product } from '../types';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: Always specify custom firestoreDatabaseId if configured
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return new Error(JSON.stringify(errInfo));
}

export const SAMPLE_PRODUCTS: Omit<Product, 'id'>[] = [
  {
    name: "L'Élixir d'Or",
    category: "perfume",
    price: 48500,
    description: "An intoxicating symphony of rare Bulgarian Damask Rose, aged Cambodian Oud, and warm Golden Amber infused with Italian Bergamot and Tahitian Vanilla.",
    images: [
      "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1000"
    ],
    model3dUrl: "perfume_elixir",
    variants: [
      { name: "Volume", value: "50 ml" },
      { name: "Volume", value: "100 ml" },
      { name: "Volume", value: "250 ml Flacon" }
    ],
    stock: 18,
    isFeatured: true
  },
  {
    name: "Nuit de Diamant",
    category: "perfume",
    price: 65000,
    description: "Seductive night-blooming Jasmine, Iris Pallida, and Smoked Florentine Leather garnished with floating 24K pure gold leaf flakes.",
    images: [
      "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=80&w=1000"
    ],
    model3dUrl: "perfume_nuit",
    variants: [
      { name: "Volume", value: "50 ml" },
      { name: "Volume", value: "100 ml" }
    ],
    stock: 12,
    isFeatured: true
  },
  {
    name: "Rose Impériale",
    category: "perfume",
    price: 52000,
    description: "Hand-harvested Grasse May Rose blossoms drizzled with royal wild flower honey, pink pepper berries, and Mysore sandalwood.",
    images: [
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=1000"
    ],
    model3dUrl: "perfume_rose",
    variants: [
      { name: "Volume", value: "100 ml" }
    ],
    stock: 25,
    isFeatured: false
  },
  {
    name: "Aura Solaria Solitaire",
    category: "jewelry",
    price: 185000,
    description: "Hand-crafted 2.5 carat flawless VVS1 brilliant-cut solitaire diamond set upon a hand-hammered 18K solid yellow gold ribbon band.",
    images: [
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&q=80&w=1000"
    ],
    model3dUrl: "jewelry_ring",
    variants: [
      { name: "Ring Size", value: "US 6" },
      { name: "Ring Size", value: "US 7" },
      { name: "Ring Size", value: "US 8" }
    ],
    stock: 7,
    isFeatured: true
  },
  {
    name: "Cascade Rose Necklace",
    category: "jewelry",
    price: 295000,
    description: "An extraordinary 18K rose gold drop chain featuring 42 brilliant round pavé-set natural diamonds totaling 3.8 carats of radiance.",
    images: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=1000"
    ],
    model3dUrl: "jewelry_necklace",
    variants: [
      { name: "Chain Length", value: "16 inches" },
      { name: "Chain Length", value: "18 inches" }
    ],
    stock: 5,
    isFeatured: true
  },
  {
    name: "Lumière Éternelle Earrings",
    category: "jewelry",
    price: 210000,
    description: "Rare 1.8 carat total weight emerald-cut diamonds mounted in handcrafted platinum halos with micro-pavé detailing.",
    images: [
      "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=1000"
    ],
    model3dUrl: "jewelry_earrings",
    variants: [
      { name: "Setting", value: "Platinum" },
      { name: "Setting", value: "18K Gold" }
    ],
    stock: 9,
    isFeatured: false
  }
];

export async function seedProductsIfEmpty(): Promise<void> {
  try {
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    if (snapshot.empty) {
      console.log('Seeding initial luxury products into Firestore...');
      for (const prod of SAMPLE_PRODUCTS) {
        await addDoc(productsRef, {
          ...prod,
          createdAt: new Date().toISOString()
        });
      }
      console.log('Seeding complete!');
    }
  } catch (error) {
    console.error('Error checking or seeding products:', error);
  }
}
