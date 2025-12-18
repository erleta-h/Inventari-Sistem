import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../config/apiClient';
import { Perdorues, RoleName } from '../../types';

export const PerdoruesCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rolet, setRolet] = useState<{ id: number; name: RoleName; description: string }[]>([]);
  const [formData, setFormData] = useState({
    emer: '',
    email: '',
    password: '',
    telefoni: '',
    rolet: [] as RoleName[],
    is_active: true,
  });

  useEffect(() => {
    const fetchRolet = async () => {
      try {
        const response = await apiClient.get<{ status: string; data: any[] }>('/rolet');
        setRolet(response.data.data);
      } catch (err) {
        console.error('Gabim në marrjen e roleve:', err);
      }
    };
    fetchRolet();
  }, []);

  const handleRoleToggle = (roleName: RoleName) => {
    if (formData.rolet.includes(roleName)) {
      setFormData({
        ...formData,
        rolet: formData.rolet.filter(r => r !== roleName),
      });
    } else {
      setFormData({
        ...formData,
        rolet: [...formData.rolet, roleName],
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiClient.post<{ status: string; data: Perdorues }>('/perdoruesit', {
        ...formData,
        telefoni: formData.telefoni || null,
        rolet: formData.rolet.length > 0 ? formData.rolet : undefined,
      });
      navigate('/perdoruesit');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gabim në krijimin e përdoruesit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Krijo Përdorues të Ri</h1>

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
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Fjalëkalimi <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Telefoni</label>
            <input
              type="tel"
              value={formData.telefoni}
              onChange={(e) => setFormData({ ...formData, telefoni: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">Rolet</label>
            <div className="space-y-2">
              {rolet.map((rol) => (
                <label key={rol.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.rolet.includes(rol.name)}
                    onChange={() => handleRoleToggle(rol.name)}
                    className="mr-2"
                  />
                  <span className="text-gray-700 text-sm">{rol.name} - {rol.description}</span>
                </label>
              ))}
            </div>
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
              onClick={() => navigate('/perdoruesit')}
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






