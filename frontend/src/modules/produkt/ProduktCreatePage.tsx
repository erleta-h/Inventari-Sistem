import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../config/apiClient';
import { Produkt } from '../../types';

export const ProduktCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    emer: '',
    sku: '',
    pershkrimi: '',
    cmimi_njesi: '',
    stok_minimal_default: '',
    is_active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiClient.post<{ status: string; data: Produkt }>('/produktet', {
        ...formData,
        cmimi_njesi: Number(formData.cmimi_njesi),
        stok_minimal_default: Number(formData.stok_minimal_default),
        pershkrimi: formData.pershkrimi || null,
      });
      navigate('/produktet');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gabim në krijimin e produktit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Krijo Produkt të Ri</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Emër <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.emer}
              onChange={(e) => setFormData({ ...formData, emer: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              SKU <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Përshkrimi</label>
            <textarea
              value={formData.pershkrimi}
              onChange={(e) => setFormData({ ...formData, pershkrimi: e.target.value })}
              rows={3}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Çmimi për Njësi (EUR) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={formData.cmimi_njesi}
              onChange={(e) => setFormData({ ...formData, cmimi_njesi: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Stoku Minimal Default <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              required
              value={formData.stok_minimal_default}
              onChange={(e) => setFormData({ ...formData, stok_minimal_default: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="mr-2"
              />
              <span className="text-gray-700 text-sm font-bold">Aktiv</span>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/produktet')}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Anulo
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            >
              {loading ? 'Duke krijuar...' : 'Krijo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};