import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Save, Image as ImageIcon, LogOut, Settings2, Package, Pencil, Upload, X } from 'lucide-react';
import { useStore, Product } from '../context/StoreContext';

const MAX_UPLOAD_MB = 2;

// Lê um arquivo de imagem do dispositivo e devolve como base64 (data URL)
function readImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      reject(new Error(`A imagem precisa ter no máximo ${MAX_UPLOAD_MB}MB.`));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
    reader.readAsDataURL(file);
  });
}

const emptyForm = {
  name: '',
  price: '',
  description: '',
  mainPhoto: '',
  gallery: [] as string[],
  category: '',
};

export const Admin = () => {
  const { settings, updateSettings, products, addProduct, updateProduct, removeProduct, login, logout, isAdmin } = useStore();
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

  // Formulário de Produto (usado tanto para Novo quanto para Editar)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [galleryUrlInput, setGalleryUrlInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const mainPhotoFileRef = useRef<HTMLInputElement>(null);
  const galleryFileRef = useRef<HTMLInputElement>(null);

  // Lista de categorias já usadas nos produtos, para sugerir no formulário
  const existingCategories = Array.from(
    new Set(products.map((p) => p.category).filter((c): c is string => !!c && c.trim().length > 0))
  ).sort((a, b) => a.localeCompare(b, 'pt-BR'));

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

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setGalleryUrlInput('');
    setIsFormOpen(true);
  };

  const openEditForm = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      price: String(product.price),
      description: product.description,
      mainPhoto: product.mainPhoto,
      gallery: product.gallery ? [...product.gallery] : [],
      category: product.category || '',
    });
    setGalleryUrlInput('');
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setGalleryUrlInput('');
  };

  const handleMainPhotoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const dataUrl = await readImageFile(file);
      setForm((f) => ({ ...f, mainPhoto: dataUrl }));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Não foi possível carregar a imagem.');
    }
  };

  const handleGalleryFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length === 0) return;
    const spaceLeft = 5 - form.gallery.length;
    if (spaceLeft <= 0) {
      alert('Você já atingiu o limite de 5 fotos na galeria.');
      return;
    }
    const toRead = files.slice(0, spaceLeft);
    try {
      const dataUrls = await Promise.all(toRead.map(readImageFile));
      setForm((f) => ({ ...f, gallery: [...f.gallery, ...dataUrls].slice(0, 5) }));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Não foi possível carregar uma das imagens.');
    }
  };

  const addGalleryUrl = () => {
    const url = galleryUrlInput.trim();
    if (!url) return;
    if (form.gallery.length >= 5) {
      alert('Você já atingiu o limite de 5 fotos na galeria.');
      return;
    }
    setForm((f) => ({ ...f, gallery: [...f.gallery, url] }));
    setGalleryUrlInput('');
  };

  const removeGalleryImage = (index: number) => {
    setForm((f) => ({ ...f, gallery: f.gallery.filter((_, i) => i !== index) }));
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.mainPhoto) {
      alert('Adicione uma foto principal (link ou imagem do dispositivo).');
      return;
    }

    setIsSaving(true);
    const payload = {
      name: form.name,
      price: parseFloat(form.price.replace(',', '.')),
      description: form.description,
      mainPhoto: form.mainPhoto,
      gallery: form.gallery.slice(0, 5),
      category: form.category.trim(),
    };

    const ok = editingId ? await updateProduct(editingId, payload) : await addProduct(payload);
    setIsSaving(false);

    if (!ok) {
      alert('Não foi possível salvar o produto. Tente novamente.');
      return;
    }

    closeForm();
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
          {!isFormOpen && (
            <button 
              onClick={openAddForm}
              className="flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm active:scale-[0.98] w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              Novo Produto
            </button>
          )}
        </div>

        {isFormOpen && (
          <div className="bg-white p-6 sm:p-8 rounded-[2rem] border-2 border-pink-100 shadow-sm mb-8 relative">
            <div className="absolute top-0 left-8 -translate-y-1/2 bg-white px-2">
              <span className="text-xs font-bold tracking-wider text-pink-600 uppercase">
                {editingId ? 'Editando Produto' : 'Novo Cadastro'}
              </span>
            </div>
            <form onSubmit={handleSubmitProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome do Produto</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Preço (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500 outline-none transition-all"
                  placeholder="Ex: 99.90"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Categoria</label>
                <input
                  type="text"
                  required
                  list="category-suggestions"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500 outline-none transition-all"
                  placeholder="Ex: Cozinha, Beleza, Roupas..."
                />
                <datalist id="category-suggestions">
                  {existingCategories.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>

              {/* Foto principal: link OU imagem do dispositivo */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Foto Principal</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="url"
                    value={form.mainPhoto.startsWith('data:') ? '' : form.mainPhoto}
                    onChange={(e) => setForm({ ...form, mainPhoto: e.target.value })}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500 outline-none transition-all"
                    placeholder="Cole o link da imagem (https://...)"
                  />
                  <button
                    type="button"
                    onClick={() => mainPhotoFileRef.current?.click()}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors whitespace-nowrap"
                  >
                    <Upload className="w-4 h-4" />
                    Adicionar imagem local
                  </button>
                  <input
                    ref={mainPhotoFileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleMainPhotoFile}
                  />
                </div>
                {form.mainPhoto && (
                  <div className="mt-3 flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0">
                      <img src={form.mainPhoto} alt="Pré-visualização" className="w-full h-full object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, mainPhoto: '' })}
                      className="text-xs text-red-500 hover:text-red-600 font-medium"
                    >
                      Remover foto
                    </button>
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-1.5">
                  Use um link OU envie uma imagem do seu dispositivo (até {MAX_UPLOAD_MB}MB).
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Descrição do Produto</label>
                <textarea
                  required
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500 outline-none transition-all resize-none"
                />
              </div>

              {/* Galeria: links OU imagens do dispositivo */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Galeria de Fotos ({form.gallery.length}/5)
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="url"
                    value={galleryUrlInput}
                    onChange={(e) => setGalleryUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addGalleryUrl();
                      }
                    }}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500 outline-none transition-all"
                    placeholder="Cole o link de uma foto e clique em Adicionar"
                    disabled={form.gallery.length >= 5}
                  />
                  <button
                    type="button"
                    onClick={addGalleryUrl}
                    disabled={form.gallery.length >= 5}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    Adicionar link
                  </button>
                  <button
                    type="button"
                    onClick={() => galleryFileRef.current?.click()}
                    disabled={form.gallery.length >= 5}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    <Upload className="w-4 h-4" />
                    Imagem local
                  </button>
                  <input
                    ref={galleryFileRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleGalleryFiles}
                  />
                </div>
                {form.gallery.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-3">
                    {form.gallery.map((img, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 group">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(i)}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          title="Remover"
                        >
                          <X className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-1.5">Até 5 fotos, combinando links e imagens do dispositivo.</p>
              </div>

              <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                <button type="submit" disabled={isSaving} className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-sm active:scale-[0.98] disabled:opacity-60">
                  {isSaving ? 'Salvando...' : editingId ? 'Salvar Alterações' : 'Salvar Produto'}
                </button>
                <button 
                  type="button" 
                  onClick={closeForm}
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
                  <th className="px-6 py-4 font-semibold">Categoria</th>
                  <th className="px-6 py-4 font-semibold">Preço</th>
                  <th className="px-6 py-4 font-semibold text-center">Fotos</th>
                  <th className="px-6 py-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-medium">
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.category ? (
                          <span className="bg-pink-50 text-pink-700 px-2.5 py-1 rounded-full text-xs font-medium">
                            {product.category}
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
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
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => openEditForm(product)}
                            className="p-2.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 rounded-xl transition-colors inline-flex"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
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
                        </div>
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
