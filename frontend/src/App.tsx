import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Sidebar } from './components/layout/Sidebar';
import { LoginPage } from './modules/auth/LoginPage';
import { OrdersListPage } from './modules/orders/OrdersListPage';
import { PorosiCreatePage } from './modules/orders/PorosiCreatePage';
import { PorosiDetailPage } from './modules/orders/PorosiDetailPage';
import { PorosiPergatitjePage } from './modules/orders/PorosiPergatitjePage';
import { InventoryOverviewPage } from './modules/inventory/InventoryOverviewPage';
import { PranimMallinPage } from './modules/inventory/PranimMallinPage';
import { TransferDepoPage } from './modules/inventory/TransferDepoPage';
import { TransferetListPage } from './modules/inventory/TransferetListPage';
import { FurnizimeListPage } from './modules/furnizime/FurnizimeListPage';
import { FurnizimCreatePage } from './modules/furnizime/FurnizimCreatePage';
import { DergesatListPage } from './modules/dergesa/DergesatListPage';
import { DergeseManagePage } from './modules/dergesa/DergeseManagePage';
import { ShoferDergesatPage } from './modules/dergesa/ShoferDergesatPage';
import { RaportetPage } from './modules/raportim/RaportetPage';
import { PerdoruesListPage } from './modules/perdorues/PerdoruesListPage';
import { PerdoruesCreatePage } from './modules/perdorues/PerdoruesCreatePage';
import { KlientetListPage } from './modules/klient/KlientetListPage';
import { KlientCreatePage } from './modules/klient/KlientCreatePage';
import { DepotListPage } from './modules/depo/DepotListPage';
import { DepoCreatePage } from './modules/depo/DepoCreatePage';
import { ProduktetListPage } from './modules/produkt/ProduktetListPage';
import { ProduktCreatePage } from './modules/produkt/ProduktCreatePage';
import { MjetetListPage } from './modules/mjet/MjetetListPage';
import { MjetCreatePage } from './modules/mjet/MjetCreatePage';
import { NjoftimetPage } from './modules/njoftim/NjoftimetPage';
import { DashboardPage } from './modules/dashboard/DashboardPage';
import { RoleName } from './types';


const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Duke ngarkuar...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div className="flex">
                <Sidebar />
                <div className="flex-1">
                  <DashboardPage />
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/porosite"
          element={
            <ProtectedRoute>
              <div className="flex">
                <Sidebar />
                <div className="flex-1">
                  <ProtectedRoute allowedRoles={[RoleName.SHITES]}>
                    <OrdersListPage />
                  </ProtectedRoute>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/porosite/krijo"
          element={
            <ProtectedRoute>
              <div className="flex">
                <Sidebar />
                <div className="flex-1">
                  <ProtectedRoute allowedRoles={[RoleName.SHITES]}>
                    <PorosiCreatePage />
                  </ProtectedRoute>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/porosite/:id"
          element={
            <ProtectedRoute>
              <div className="flex">
                <Sidebar />
                <div className="flex-1">
                  <ProtectedRoute allowedRoles={[RoleName.SHITES, RoleName.MENAXHER, RoleName.ADMIN, RoleName.MAGAZINIER]}>
                    <PorosiDetailPage />
                  </ProtectedRoute>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/porosite/pergatitje"
          element={
            <ProtectedRoute>
              <div className="flex">
                <Sidebar />
                <div className="flex-1">
                  <ProtectedRoute allowedRoles={[RoleName.MAGAZINIER, RoleName.MENAXHER]}>
                    <PorosiPergatitjePage />
                  </ProtectedRoute>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventar"
          element={
            <ProtectedRoute>
              <div className="flex">
                <Sidebar />
                <div className="flex-1">
                  <ProtectedRoute allowedRoles={[RoleName.MENAXHER, RoleName.MAGAZINIER]}>
                    <InventoryOverviewPage />
                  </ProtectedRoute>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventar/pranim"
          element={
            <ProtectedRoute>
              <div className="flex">
                <Sidebar />
                <div className="flex-1">
                  <ProtectedRoute allowedRoles={[RoleName.MENAXHER, RoleName.MAGAZINIER]}>
                    <PranimMallinPage />
                  </ProtectedRoute>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventar/transfer"
          element={
            <ProtectedRoute>
              <div className="flex">
                <Sidebar />
                <div className="flex-1">
                  <ProtectedRoute allowedRoles={[RoleName.MENAXHER, RoleName.MAGAZINIER]}>
                    <TransferDepoPage />
                  </ProtectedRoute>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventar/transferet"
          element={
            <ProtectedRoute>
              <div className="flex">
                <Sidebar />
                <div className="flex-1">
                  <ProtectedRoute allowedRoles={[RoleName.MENAXHER, RoleName.MAGAZINIER]}>
                    <TransferetListPage />
                  </ProtectedRoute>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/furnizime"
          element={
            <ProtectedRoute>
              <div className="flex">
                <Sidebar />
                <div className="flex-1">
                  <ProtectedRoute allowedRoles={[RoleName.MENAXHER, RoleName.MAGAZINIER]}>
                    <FurnizimeListPage />
                  </ProtectedRoute>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/furnizime/krijo"
          element={
            <ProtectedRoute>
              <div className="flex">
                <Sidebar />
                <div className="flex-1">
                  <ProtectedRoute allowedRoles={[RoleName.MENAXHER, RoleName.MAGAZINIER]}>
                    <FurnizimCreatePage />
                  </ProtectedRoute>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dergesat"
          element={
            <ProtectedRoute>
              <div className="flex">
                <Sidebar />
                <div className="flex-1">
                  <ProtectedRoute allowedRoles={[RoleName.MENAXHER]}>
                    <DergeseManagePage />
                  </ProtectedRoute>
                  <ProtectedRoute allowedRoles={[RoleName.SHOFER]}>
                    <ShoferDergesatPage />
                  </ProtectedRoute>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dergesat/shofer"
          element={
            <ProtectedRoute>
              <div className="flex">
                <Sidebar />
                <div className="flex-1">
                  <ProtectedRoute allowedRoles={[RoleName.SHOFER]}>
                    <ShoferDergesatPage />
                  </ProtectedRoute>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dergesat/menaxho"
          element={
            <ProtectedRoute>
              <div className="flex">
                <Sidebar />
                <div className="flex-1">
                  <ProtectedRoute allowedRoles={[RoleName.MENAXHER]}>
                    <DergeseManagePage />
                  </ProtectedRoute>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/raportet"
          element={
            <ProtectedRoute>
              <div className="flex">
                <Sidebar />
                <div className="flex-1">
                  <ProtectedRoute allowedRoles={[RoleName.MENAXHER, RoleName.ADMIN]}>
                    <RaportetPage />
                  </ProtectedRoute>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/njoftimet"
          element={
            <ProtectedRoute>
              <div className="flex">
                <Sidebar />
                <div className="flex-1">
                  <ProtectedRoute allowedRoles={[RoleName.MENAXHER, RoleName.ADMIN, RoleName.MAGAZINIER]}>
                    <NjoftimetPage />
                  </ProtectedRoute>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/perdoruesit"
          element={
            <ProtectedRoute>
              <div className="flex">
                <Sidebar />
                <div className="flex-1">
                  <ProtectedRoute allowedRoles={[RoleName.ADMIN]}>
                    <PerdoruesListPage />
                  </ProtectedRoute>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/perdoruesit/krijo"
          element={
            <ProtectedRoute>
              <div className="flex">
                <Sidebar />
                <div className="flex-1">
                  <ProtectedRoute allowedRoles={[RoleName.ADMIN]}>
                    <PerdoruesCreatePage />
                  </ProtectedRoute>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/klientet"
          element={
            <ProtectedRoute>
              <div className="flex">
                <Sidebar />
                <div className="flex-1">
                  <ProtectedRoute allowedRoles={[RoleName.MENAXHER, RoleName.SHITES]}>
                    <KlientetListPage />
                  </ProtectedRoute>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/klientet/krijo"
          element={
            <ProtectedRoute>
              <div className="flex">
                <Sidebar />
                <div className="flex-1">
                  <ProtectedRoute allowedRoles={[RoleName.MENAXHER, RoleName.SHITES]}>
                    <KlientCreatePage />
                  </ProtectedRoute>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/depot"
          element={
            <ProtectedRoute>
              <div className="flex">
                <Sidebar />
                <div className="flex-1">
                  <ProtectedRoute allowedRoles={[RoleName.MENAXHER]}>
                    <DepotListPage />
                  </ProtectedRoute>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/depot/krijo"
          element={
            <ProtectedRoute>
              <div className="flex">
                <Sidebar />
                <div className="flex-1">
                  <ProtectedRoute allowedRoles={[RoleName.MENAXHER]}>
                    <DepoCreatePage />
                  </ProtectedRoute>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/produktet"
          element={
            <ProtectedRoute>
              <div className="flex">
                <Sidebar />
                <div className="flex-1">
                  <ProtectedRoute allowedRoles={[RoleName.MENAXHER, RoleName.MAGAZINIER, RoleName.SHITES]}>
                    <ProduktetListPage />
                  </ProtectedRoute>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/produktet/krijo"
          element={
            <ProtectedRoute>
              <div className="flex">
                <Sidebar />
                <div className="flex-1">
                  <ProtectedRoute allowedRoles={[RoleName.MENAXHER, RoleName.MAGAZINIER]}>
                    <ProduktCreatePage />
                  </ProtectedRoute>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/mjetet-transportuese"
          element={
            <ProtectedRoute>
              <div className="flex">
                <Sidebar />
                <div className="flex-1">
                  <ProtectedRoute allowedRoles={[RoleName.MENAXHER, RoleName.SHOFER]}>
                    <MjetetListPage />
                  </ProtectedRoute>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/mjetet-transportuese/krijo"
          element={
            <ProtectedRoute>
              <div className="flex">
                <Sidebar />
                <div className="flex-1">
                  <ProtectedRoute allowedRoles={[RoleName.MENAXHER]}>
                    <MjetCreatePage />
                  </ProtectedRoute>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;

