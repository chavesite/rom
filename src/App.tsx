import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { Layout } from './components/Layout';
import { Storefront } from './pages/Storefront';
import { ProductDetails } from './pages/ProductDetails';
import { Admin } from './pages/Admin';

export default function App() {
  return (
    <StoreProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Storefront />} />
          <Route path="product/:id" element={<ProductDetails />} />
          <Route path="admin" element={<Admin />} />
        </Route>
      </Routes>
    </StoreProvider>
  );
}
