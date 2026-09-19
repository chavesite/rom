import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Search, ShoppingBag, X } from 'lucide-react';

export const Storefront = () => {
  const { products } = useStore();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = useMemo(
    () =>
      Array.from(
        new Set(products.map((p) => p.category).filter((c): c is string => !!c && c.trim().length > 0))
      ).sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchesSearch = term.length === 0 || p.name.toLowerCase().includes(term);
      const matchesCategory = !activeCategory || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, activeCategory]);

  if (products.length === 0) {
    return (
      <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <p className="text-gray-500 font-medium">Nenhum produto cadastrado no momento.</p>
        <p className="text-sm text-gray-400 mt-1">Acesse o Painel Admin para adicionar itens.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Barra de busca */}
      <div className="relative mb-5">
        <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar produto na loja..."
          className="w-full pl-11 pr-10 py-3 rounded-2xl border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
        />
        {search.length > 0 && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Limpar busca"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filtro por categoria */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 -mx-1 px-1 scrollbar-hide">
          <button
            onClick={() => setActiveCategory(null)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all border ${
              activeCategory === null
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            Todas
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                activeCategory === cat
                  ? 'bg-pink-600 text-white border-pink-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-pink-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {filteredProducts.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <Search className="w-8 h-8" />
          </div>
          <p className="text-gray-500 font-medium">Nenhum produto encontrado.</p>
          <p className="text-sm text-gray-400 mt-1">Tente outra busca ou categoria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="group bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-pink-200 transition-all block"
            >
              <div className="aspect-square bg-gray-100 relative overflow-hidden">
                {product.mainPhoto ? (
                  <img
                    src={product.mainPhoto}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    Sem foto
                  </div>
                )}
              </div>
              <div className="p-6">
                {product.category && (
                  <span className="inline-block text-[11px] font-semibold uppercase tracking-wide text-pink-500 mb-1.5">
                    {product.category}
                  </span>
                )}
                <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 leading-snug">{product.name}</h3>
                <p className="text-xl font-bold text-pink-600">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};