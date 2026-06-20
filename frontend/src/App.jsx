import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'

// Farmer pages
import FarmerLayout from './layouts/FarmerLayout'
import HomeDashboard from './pages/farmer/HomeDashboard'
import FarmerDashboard from './pages/farmer/FarmerDashboard'
import ServicesOverview from './pages/farmer/ServicesOverview'
import FertilizerMarketplace from './pages/farmer/FertilizerMarketplace'
import MyOrders from './pages/farmer/MyOrders'
import OrderTracking from './pages/farmer/OrderTracking'
import SoilTestAI from './pages/farmer/SoilTestAI'
import BookDroneService from './pages/farmer/BookDroneService'
import BookLandMeasurement from './pages/farmer/BookLandMeasurement'
import FarmerProfile from './pages/farmer/FarmerProfile'

// Admin pages
import AdminLayout from './layouts/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import FarmersManagement from './pages/admin/FarmersManagement'
import OrderManagement from './pages/admin/OrderManagement'
import ProductsManagement from './pages/admin/ProductsManagement'
import ServicesManagement from './pages/admin/ServicesManagement'
import SoilCropManagement from './pages/admin/SoilCropManagement'
import InventoryManagement from './pages/admin/InventoryManagement'
import DeliveryPartnerManagement from './pages/admin/DeliveryPartnerManagement'
import AssignDeliveryPartner from './pages/admin/AssignDeliveryPartner'
import ReportsAnalytics from './pages/admin/ReportsAnalytics'
import PlatformSettings from './pages/admin/PlatformSettings'

import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { LanguageProvider } from './context/LanguageContext'
import { DataProvider } from './context/DataContext'

// Guard — redirects to /login if not authenticated
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <LanguageProvider>
      <DataProvider>
        <AuthProvider>
          <CartProvider>
            <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />

            {/* Farmer Routes — protected */}
            <Route path="/dashboard" element={<ProtectedRoute><FarmerLayout /></ProtectedRoute>}>
              <Route index element={<HomeDashboard />} />
              <Route path="home" element={<FarmerDashboard />} />
              <Route path="services" element={<ServicesOverview />} />
              <Route path="marketplace" element={<FertilizerMarketplace />} />
              <Route path="orders" element={<MyOrders />} />
              <Route path="tracking" element={<OrderTracking />} />
              <Route path="soil-test" element={<SoilTestAI />} />
              <Route path="book-drone" element={<BookDroneService />} />
              <Route path="book-land" element={<BookLandMeasurement />} />
              <Route path="profile" element={<FarmerProfile />} />
            </Route>

            {/* Admin Routes — protected */}
            <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="farmers" element={<FarmersManagement />} />
              <Route path="orders" element={<OrderManagement />} />
              <Route path="products" element={<ProductsManagement />} />
              <Route path="services" element={<ServicesManagement />} />
              <Route path="soil-crop" element={<SoilCropManagement />} />
              <Route path="inventory" element={<InventoryManagement />} />
              <Route path="delivery" element={<DeliveryPartnerManagement />} />
              <Route path="assign-delivery" element={<AssignDeliveryPartner />} />
              <Route path="reports" element={<ReportsAnalytics />} />
              <Route path="settings" element={<PlatformSettings />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </DataProvider>
    </LanguageProvider>
  )
}
