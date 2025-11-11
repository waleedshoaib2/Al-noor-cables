import { useState } from 'react';
import { useStockStore } from '@/store/useStockStore';
import { useNavigate } from 'react-router-dom';
import ProductList from '@/components/Stock/ProductList';
import ProductForm from '@/components/Stock/ProductForm';
import SaleForm from '@/components/Stock/SaleForm';
import StockAlerts from '@/components/Stock/StockAlerts';
import { Button } from '@/components/Common/Button';
import type { Product } from '@/types';

export default function StockManagement() {
  const addProduct = useStockStore((state) => state.addProduct);
  const updateProduct = useStockStore((state) => state.updateProduct);
  const deleteProduct = useStockStore((state) => state.deleteProduct);
  const recordSale = useStockStore((state) => state.recordSale);
  const navigate = useNavigate();

  const [showProductForm, setShowProductForm] = useState(false);
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saleProduct, setSaleProduct] = useState<Product | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<number | null>(null);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowProductForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleDeleteProduct = (product: Product) => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      deleteProduct(product.id);
    }
  };

  const handleRecordSale = (product: Product) => {
    setSaleProduct(product);
    setShowSaleForm(true);
  };

  const handleProductSubmit = (data: any) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, data);
    } else {
      addProduct({
        ...data,
        isActive: true,
      });
    }
    setShowProductForm(false);
    setEditingProduct(null);
  };

  const handleSaleSubmit = (data: any) => {
    try {
      recordSale(data);
      setShowSaleForm(false);
      setSaleProduct(null);
      alert('Sale recorded successfully!');
    } catch (error: any) {
      alert(error.message || 'Error recording sale');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Stock Management</h1>
        <Button variant="primary" onClick={handleAddProduct}>
          Add Product
        </Button>
      </div>

      <StockAlerts />

      <ProductList
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
        onRecordSale={handleRecordSale}
      />

      <ProductForm
        isOpen={showProductForm}
        onClose={() => {
          setShowProductForm(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
        onSubmit={handleProductSubmit}
      />

      <SaleForm
        isOpen={showSaleForm}
        onClose={() => {
          setShowSaleForm(false);
          setSaleProduct(null);
        }}
        product={saleProduct}
        onSubmit={handleSaleSubmit}
      />
    </div>
  );
}
