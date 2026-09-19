export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  mainPhoto: string;
  gallery: string[];
  category: string;
}

export interface Settings {
  storeName: string;
  logoUrl: string;
  whatsappNumber: string;
  adminPassword: string;
}

export interface StoreData {
  settings: Settings;
  products: Product[];
}

export const DEFAULT_DATA: StoreData = {
  settings: {
    storeName: 'Cris Variedades',
    logoUrl: '',
    whatsappNumber: '5511999999999',
    adminPassword: 'admin',
  },
  products: [
    {
      id: '1',
      name: 'Jogo de Panelas 5 Peças Antiaderente',
      price: 189.9,
      description:
        'Lindo jogo de panelas antiaderentes para a sua cozinha. Qualidade premium, não gruda e é fácil de limpar.\n\nContém:\n- 1 Panela 16cm\n- 1 Panela 18cm\n- 1 Caçarola 20cm\n- 1 Frigideira\n- 1 Fervedor',
      mainPhoto:
        'https://images.unsplash.com/photo-1584990347449-a352093510e1?auto=format&fit=crop&q=80&w=800',
      gallery: [
        'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&q=80&w=800',
      ],
      category: 'Cozinha',
    },
    {
      id: '2',
      name: 'Kit Utensílios de Silicone 12 Peças',
      price: 89.9,
      description:
        'Kit com 12 peças em silicone de alta qualidade, resistente ao calor (até 230ºC). Cabo em madeira que não aquece. Perfeito para não riscar suas panelas.',
      mainPhoto:
        'https://images.unsplash.com/photo-1596225270529-6536b5ccf711?auto=format&fit=crop&q=80&w=800',
      gallery: [],
      category: 'Cozinha',
    },
  ],
};

const KV_KEY = 'store';

// KVNamespace é fornecido em runtime pelo Cloudflare Pages; tipado como "any"
// aqui para não depender do pacote @cloudflare/workers-types no build local.
export async function getStoreData(kv: any): Promise<StoreData> {
  const raw = await kv.get(KV_KEY);
  if (!raw) {
    await kv.put(KV_KEY, JSON.stringify(DEFAULT_DATA));
    return DEFAULT_DATA;
  }
  try {
    return JSON.parse(raw) as StoreData;
  } catch {
    return DEFAULT_DATA;
  }
}

export async function saveStoreData(kv: any, data: StoreData): Promise<void> {
  await kv.put(KV_KEY, JSON.stringify(data));
}

export function stripPassword(settings: Settings) {
  const { adminPassword, ...publicSettings } = settings;
  return publicSettings;
}
