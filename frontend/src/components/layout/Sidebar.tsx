import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { RoleName } from '../../types';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, hasRole, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      roles: [RoleName.ADMIN, RoleName.MENAXHER, RoleName.MAGAZINIER, RoleName.SHITES, RoleName.SHOFER],
    },
    {
      label: 'Porositë',
      path: '/porosite',
      roles: [RoleName.SHITES],
    },
    {
      label: 'Porositë',
      path: '/porosite/pergatitje',
      roles: [RoleName.MENAXHER],
    },
    {
      label: 'Përgatitje Porosish',
      path: '/porosite/pergatitje',
      roles: [RoleName.MAGAZINIER],
    },
    {
      label: 'Inventari',
      path: '/inventar',
      roles: [RoleName.MENAXHER, RoleName.MAGAZINIER],
    },
    {
      label: 'Dërgesat',
      path: '/dergesat',
      roles: [RoleName.MENAXHER],
    },
    {
      label: 'Raportet',
      path: '/raportet',
      roles: [RoleName.MENAXHER, RoleName.ADMIN],
    },
    {
      label: 'Përdoruesit',
      path: '/perdoruesit',
      roles: [RoleName.ADMIN],
    },
    {
      label: 'Klientët',
      path: '/klientet',
      roles: [RoleName.MENAXHER, RoleName.SHITES],
    },
    {
      label: 'Depot',
      path: '/depot',
      roles: [RoleName.MENAXHER],
    },
    {
      label: 'Produktet',
      path: '/produktet',
      roles: [RoleName.MENAXHER, RoleName.MAGAZINIER, RoleName.SHITES],
    },
    {
      label: 'Mjetet',
      path: '/mjetet-transportuese',
      roles: [RoleName.MENAXHER, RoleName.SHOFER],
    },
  ];

  const visibleItems = menuItems.filter((item) =>
    item.roles.some((role) => hasRole(role))
  );

  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold">Inventari</h1>
        <p className="text-sm text-gray-400">Menaxhim i Inventarit</p>
      </div>

      <nav className="space-y-2">
        {visibleItems.map((item, index) => (
          <Link
            key={`${item.path}-${item.label}-${index}`}
            to={item.path}
            className={`block px-4 py-2 rounded ${
              location.pathname.startsWith(item.path)
                ? 'bg-gray-700 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-8 pt-8 border-t border-gray-700">
        <p className="text-sm text-gray-400 mb-2">
          {user?.emer} ({user?.rolet?.join(', ')})
        </p>
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
        >
          Dil
        </button>
      </div>
    </div>
  );
};

