import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../config/apiClient';
import { MjetTransportues } from '../../types';

export const MjetCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    targa: '',
    modeli: '',
    kapaciteti: '',
    status: 'AKTIV' as 'AKTIV' | 'NE_MIREMBAJTJE' | 'JO_DISPONUESHME',
    is_active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiClient.post<{ status: string; data: MjetTransportues }>('/mjetet-transportuese', {
        ...formData,
        targa: formData.targa.toUpperCase(),
        modeli: formData.modeli || null,
        kapaciteti: formData.kapaciteti ? Number(formData.kapaciteti) : null,
      });
      navigate('/mjetet-transportuese');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gabim në krijimin e mjetit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Krijo Mjet Transportues të Ri</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Targë <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.targa}
              onChange={(e) => setFormData({ ...formData, targa: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline uppercase"
              placeholder="ABC-123"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Modeli</label>
            <input
              type="text"
              value={formData.modeli}
              onChange={(e) => setFormData({ ...formData, modeli: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Kapaciteti (kg)</label>
            <input
              type="number"
              min="0"
              value={formData.kapaciteti}
              onChange={(e) => setFormData({ ...formData, kapaciteti: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="AKTIV">Aktiv</option>
              <option value="NE_MIREMBAJTJE">Në Mirëmbajtje</option>
              <option value="JO_DISPONUESHME">Jo Disponueshëm</option>
            </select>
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
              onClick={() => navigate('/mjetet-transportuese')}
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