import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminSignUpPage from './pages/AdminSignUpPage'

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

// Guard — redirects non-admin users away from admin routes
function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <DataProvider>
          <CartProvider>
            <BrowserRouter>
              <Routes>
                {/* Public */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/admin-login" element={<AdminLoginPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/admin-signup" element={<AdminSignUpPage />} />

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

                {/* Admin Routes — protected, admin role required */}
                <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
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
        </DataProvider>
      </LanguageProvider>
    </AuthProvider>
  )
}
