import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ShoppingBag } from 'lucide-react';

export const Storefront = () => {
  const { products } = useStore();

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
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
            <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 leading-snug">{product.name}</h3>
            <p className="text-xl font-bold text-pink-600">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
};
