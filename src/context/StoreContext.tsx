import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  mainPhoto: string;
  gallery: string[];
  category: string;
}

export interface PublicSettings {
  storeName: string;
  logoUrl: string;
  whatsappNumber: string;
}

interface StoreContextType {
  settings: PublicSettings;
  products: Product[];
  isLoading: boolean;
  isAdmin: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  updateSettings: (
    newSettings: Partial<PublicSettings> & { adminPassword?: string }
  ) => Promise<boolean>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<boolean>;
  removeProduct: (id: string) => Promise<boolean>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<boolean>;
}

const defaultSettings: PublicSettings = {
  storeName: 'Cris Variedades',
  logoUrl: '',
  whatsappNumber: '5511999999999',
};

const CACHE_KEY = 'cris_cache';

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<PublicSettings>(defaultSettings);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [adminPassword, setAdminPassword] = useState<string | null>(null);

  const loadStore = useCallback(async () => {
    try {
      const res = await fetch('/api/store');
      if (!res.ok) throw new Error('Falha ao buscar dados da loja');
      const data = await res.json();
      setSettings(data.settings);
      setProducts(data.products);
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch {
      // Sem conexão com a API: usa a última cópia salva neste navegador, se houver.
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const data = JSON.parse(cached);
        setSettings(data.settings);
        setProducts(data.products);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStore();
  }, [loadStore]);

  const login = useCallback(async (password: string) => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setAdminPassword(password);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => setAdminPassword(null), []);

  const saveStore = useCallback(
    async (partial: { settings?: Partial<PublicSettings> & { adminPassword?: string }; products?: Product[] }) => {
      if (!adminPassword) return false;
      try {
        const res = await fetch('/api/store', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPassword },
          body: JSON.stringify(partial),
        });
        if (!res.ok) return false;
        const data = await res.json();
        setSettings(data.settings);
        setProducts(data.products);
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        if (partial.settings?.adminPassword) {
          setAdminPassword(partial.settings.adminPassword);
        }
        return true;
      } catch {
        return false;
      }
    },
    [adminPassword]
  );

  const updateSettings = useCallback(
    (newSettings: Partial<PublicSettings> & { adminPassword?: string }) => saveStore({ settings: newSettings }),
    [saveStore]
  );

  const addProduct = useCallback(
    (product: Omit<Product, 'id'>) => {
      const newProduct = { ...product, id: Date.now().toString() };
      return saveStore({ products: [...products, newProduct] });
    },
    [products, saveStore]
  );

  const removeProduct = useCallback(
    (id: string) => saveStore({ products: products.filter((p) => p.id !== id) }),
    [products, saveStore]
  );

  const updateProduct = useCallback(
    (id: string, productUpdate: Partial<Product>) =>
      saveStore({ products: products.map((p) => (p.id === id ? { ...p, ...productUpdate } : p)) }),
    [products, saveStore]
  );

  if (isLoading) {
    return <div className="p-16 text-center text-gray-400 font-medium">Carregando loja...</div>;
  }

  return (
    <StoreContext.Provider
      value={{
        settings,
        products,
        isLoading,
        isAdmin: !!adminPassword,
        login,
        logout,
        updateSettings,
        addProduct,
        removeProduct,
        updateProduct,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
