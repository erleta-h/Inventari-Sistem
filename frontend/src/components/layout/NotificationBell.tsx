import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../config/apiClient';
import { Njoftim } from '../../types';

export const NotificationBell: React.FC = () => {
  const [njoftimet, setNjoftimet] = useState<Njoftim[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNjoftimet = async () => {
      try {
        const response = await apiClient.get<Njoftim[]>('/njoftimet/te-paleksuar');
        const data = Array.isArray(response.data) ? response.data : [];
        setNjoftimet(data.slice(0, 5)); // Vetëm 5 të fundit
      } catch (error) {
        console.error('Gabim në marrjen e njoftimeve:', error);
        setNjoftimet([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNjoftimet();

    // Refresh çdo 30 sekonda
    const interval = setInterval(fetchNjoftimet, 30000);
    return () => clearInterval(interval);
  }, []);

  // Mbyll dropdown kur klikohet jashtë
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAsRead = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiClient.put(`/njoftimet/${id}/lexuar`);
      setNjoftimet(njoftimet.filter(n => n.id !== id));
    } catch (error) {
      console.error('Gabim në shënimin e njoftimit si të lexuar:', error);
    }
  };

  const getTipiColor = (tipi: string) => {
    switch (tipi) {
      case 'LOW_STOCK':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'DELIVERY_ALERT':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getTipiLabel = (tipi: string) => {
    switch (tipi) {
      case 'LOW_STOCK':
        return 'Stok Minimal';
      case 'DELIVERY_ALERT':
        return 'Dërgesa Dështoi';
      default:
        return 'Njoftim';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-700 hover:text-gray-900 focus:outline-none rounded-full hover:bg-gray-100 transition-colors border border-gray-300"
        aria-label="Njoftimet"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {njoftimet.length > 0 && (
          <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
            {njoftimet.length > 9 ? '9+' : njoftimet.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 border border-gray-200 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Njoftimet</h3>
            <Link
              to="/njoftimet"
              className="text-sm text-indigo-600 hover:text-indigo-800"
              onClick={() => setIsOpen(false)}
            >
              Shiko të gjitha →
            </Link>
          </div>
          {loading ? (
            <div className="p-4 text-center text-gray-500">Duke ngarkuar...</div>
          ) : njoftimet.length === 0 ? (
            <div className="p-4 text-center text-gray-500">Nuk ka njoftime të reja</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {njoftimet.map((njoftim) => (
                <div
                  key={njoftim.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer border-l-4 ${getTipiColor(njoftim.tipi)}`}
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${getTipiColor(njoftim.tipi)}`}>
                          {getTipiLabel(njoftim.tipi)}
                        </span>
                      </div>
                      <p className="font-semibold text-sm text-gray-900">{njoftim.titulli}</p>
                      <p className="text-xs text-gray-600 mt-1">{njoftim.mesazhi}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(njoftim.created_at).toLocaleString('sq-AL')}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleMarkAsRead(njoftim.id, e)}
                      className="ml-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                      aria-label="Shëno si të lexuar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};


