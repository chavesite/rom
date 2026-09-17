import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const ProductDetails = () => {
  const { id } = useParams();
  const { products, settings } = useStore();
  const product = products.find(p => p.id === id);

  const [activePhoto, setActivePhoto] = useState('');

  useEffect(() => {
    if (product) {
      setActivePhoto(product.mainPhoto);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">Produto não encontrado.</p>
        <Link to="/" className="text-pink-600 font-medium hover:underline">Voltar para a loja</Link>
      </div>
    );
  }

  const allPhotos = [product.mainPhoto, ...(product.gallery || [])].filter(Boolean);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const handleWhatsApp = () => {
    const text = `Olá! Vi no aplicativo e tenho interesse no produto:\n*${product.name}*\nPreço: ${formatPrice(product.price)}`;
    const cleanNumber = settings.whatsappNumber.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Voltar para os produtos
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 bg-white p-6 md:p-8 lg:p-10 rounded-[2rem] shadow-sm border border-gray-100">
        
        {/* Galeria */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
            {activePhoto ? (
              <img src={activePhoto} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">Sem foto</div>
            )}
          </div>
          
          {allPhotos.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 snap-x">
              {allPhotos.map((photo, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhoto(photo)}
                  className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 snap-center transition-all ${
                    activePhoto === photo ? 'border-pink-500 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Informações */}
        <div className="flex flex-col">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
          <div className="text-3xl font-black text-pink-600 mb-6 tracking-tight">
            {formatPrice(product.price)}
          </div>
          
          <div className="prose prose-sm text-gray-600 mb-8 flex-1">
            <p className="whitespace-pre-line leading-relaxed text-base">{product.description}</p>
          </div>

          <button
            onClick={handleWhatsApp}
            className="w-full flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20bd5a] text-white px-6 py-4 rounded-2xl font-semibold text-lg transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
          >
            <MessageCircle className="w-6 h-6" />
            Comprar pelo WhatsApp
          </button>
          <p className="text-center text-xs text-gray-400 mt-4 font-medium">
            Fale direto com a vendedora. Compra 100% segura.
          </p>
        </div>
      </div>
    </div>
  );
};
