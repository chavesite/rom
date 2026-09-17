import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Image as ImageIcon, LogOut, Settings2, Package } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const Admin = () => {
  const { settings, updateSettings, products, addProduct, removeProduct, login, logout, isAdmin } = useStore();
  const [passwordInput, setPasswordInput] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Configurações
  const [storeName, setStoreName] = useState(settings.storeName);
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl);
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber);
  const [adminPassword, setAdminPassword] = useState('');

  useEffect(() => {
    setStoreName(settings.storeName);
    setLogoUrl(settings.logoUrl);
    setWhatsappNumber(settings.whatsappNumber);
  }, [settings]);

  // Novo Produto
  const [isAdding, setIsAdding] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '', price: '', description: '', mainPhoto: '', galleryUrls: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    const ok = await login(passwordInput);
    setIsLoggingIn(false);
    if (ok) {
      setAdminPassword(passwordInput);
      setPasswordInput('');
    } else {
      alert('Senha incorreta.');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await updateSettings({ storeName, logoUrl, whatsappNumber, adminPassword });
    alert(ok ? 'Configurações salvas com sucesso!' : 'Não foi possível salvar. Tente novamente.');
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const gallery = newProduct.galleryUrls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0)
      .slice(0, 5); // limite de 5 fotos

    const ok = await addProduct({
      name: newProduct.name,
      price: parseFloat(newProduct.price.replace(',', '.')),
      description: newProduct.description,
      mainPhoto: newProduct.mainPhoto,
      gallery,
    });

    if (!ok) {
      alert('Não foi possível salvar o produto. Tente novamente.');
      return;
    }

    setIsAdding(false);
    setNewProduct({ name: '', price: '', description: '', mainPhoto: '', galleryUrls: '' });
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto mt-20 bg-white p-8 sm:p-10 rounded-[2rem] shadow-sm border border-gray-100">
        <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Settings2 className="w-8 h-8 text-pink-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Acesso Admin</h2>
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Senha do Administrador</label>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
              placeholder="Sua senha secreta"
            />
          </div>
          <button type="submit" disabled={isLoggingIn} className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3.5 rounded-xl transition-all shadow-sm active:scale-[0.98] disabled:opacity-60">
            {isLoggingIn ? 'Verificando...' : 'Acessar Painel'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Painel de Controle</h1>
          <p className="text-gray-500 mt-1 font-medium">Gerencie sua loja, produtos e configurações.</p>
        </div>
        <button 
          onClick={() => { logout(); setPasswordInput(''); }}
          className="inline-flex items-center justify-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white px-4 py-2.5 rounded-xl border border-gray-200 shadow-sm transition-colors w-full sm:w-auto"
        >
          <LogOut className="w-4 h-4" />
          Sair do Painel
        </button>
      </div>

      <section className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-gray-400" />
          Configurações da Loja
        </h2>
        <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome da Loja</label>
            <input
              type="text"
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">WhatsApp (apenas números)</label>
            <input
              type="text"
              required
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500 outline-none transition-all"
              placeholder="Ex: 5511999999999"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">URL da Logo (Opcional)</label>
            <input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500 outline-none transition-all"
              placeholder="https://exemplo.com/logo.png"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Senha do Painel Admin</label>
            <input
              type="text"
              required
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500 outline-none transition-all"
            />
          </div>
          <div className="md:col-span-2 pt-2">
            <button type="submit" className="flex items-center justify-center sm:justify-start gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-sm active:scale-[0.98] w-full sm:w-auto">
              <Save className="w-4 h-4" />
              Salvar Alterações
            </button>
          </div>
        </form>
      </section>

      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-gray-400" />
            Produtos Cadastrados ({products.length})
          </h2>
          {!isAdding && (
            <button 
              onClick={() => setIsAdding(true)}
              className="flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm active:scale-[0.98] w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              Novo Produto
            </button>
          )}
        </div>

        {isAdding && (
          <div className="bg-white p-6 sm:p-8 rounded-[2rem] border-2 border-pink-100 shadow-sm mb-8 relative">
            <div className="absolute top-0 left-8 -translate-y-1/2 bg-white px-2">
              <span className="text-xs font-bold tracking-wider text-pink-600 uppercase">Novo Cadastro</span>
            </div>
            <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome do Produto</label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Preço (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500 outline-none transition-all"
                  placeholder="Ex: 99.90"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">URL da Foto Principal</label>
                <input
                  type="url"
                  required
                  value={newProduct.mainPhoto}
                  onChange={(e) => setNewProduct({ ...newProduct, mainPhoto: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500 outline-none transition-all"
                  placeholder="https://..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Descrição do Produto</label>
                <textarea
                  required
                  rows={4}
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500 outline-none transition-all resize-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Galeria de Fotos (Até 5 URLs, uma por linha)</label>
                <textarea
                  rows={3}
                  value={newProduct.galleryUrls}
                  onChange={(e) => setNewProduct({ ...newProduct, galleryUrls: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500 outline-none transition-all font-mono text-sm resize-none"
                  placeholder="https://foto1.jpg&#10;https://foto2.jpg"
                />
              </div>
              <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                <button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-sm active:scale-[0.98]">
                  Salvar Produto
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsAdding(false)}
                  className="bg-white border border-gray-200 text-gray-700 px-8 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-600">
                <tr>
                  <th className="px-6 py-4 font-semibold">Produto</th>
                  <th className="px-6 py-4 font-semibold">Preço</th>
                  <th className="px-6 py-4 font-semibold text-center">Fotos</th>
                  <th className="px-6 py-4 font-semibold text-right">Remover</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 font-medium">
                      Sua loja ainda não possui produtos.
                    </td>
                  </tr>
                ) : (
                  products.map(product => (
                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200/50">
                            {product.mainPhoto ? (
                              <img src={product.mainPhoto} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-gray-400 m-auto mt-3.5" />
                            )}
                          </div>
                          <span className="font-semibold text-gray-900">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-medium">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-medium text-center">
                        <span className="bg-gray-100 px-2.5 py-1 rounded-full text-xs">
                          {1 + (product.gallery?.length || 0)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={async () => {
                            if (window.confirm(`Remover "${product.name}"?`)) {
                              const ok = await removeProduct(product.id);
                              if (!ok) alert('Não foi possível remover o produto. Tente novamente.');
                            }
                          }}
                          className="p-2.5 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors inline-flex"
                          title="Remover"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};
