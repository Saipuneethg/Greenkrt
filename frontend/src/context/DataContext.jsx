import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import API_BASE from '../config/api'

const DataContext = createContext()

export function DataProvider({ children }) {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(false)

  const getHeaders = () => {
    const token = sessionStorage.getItem('greenkrt_token')
    return {
      'Content-Type': 'application/json',
      'x-auth-token': token || '',
    }
  }

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/products`, {
        headers: getHeaders(),
      })
      if (res.ok) {
        const data = await res.json()
        setProducts(data)
      }
    } catch (err) {
      console.error('Error fetching products:', err)
    }
  }

  const fetchServices = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/services`, {
        headers: getHeaders(),
      })
      if (res.ok) {
        const data = await res.json()
        setServices(data)
      }
    } catch (err) {
      console.error('Error fetching services:', err)
    }
  }

  // Load data when user is authenticated
  useEffect(() => {
    if (user) {
      fetchProducts()
      fetchServices()
    } else {
      setProducts([])
      setServices([])
    }
  }, [user])

  const addProduct = async (productData) => {
    try {
      const res = await fetch(`${API_BASE}/api/products`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(productData),
      })
      if (res.ok) {
        const data = await res.json()
        setProducts((prev) => [...prev, data])
        return data
      }
    } catch (err) {
      console.error('Error adding product:', err)
    }
  }

  const updateProduct = async (id, productData) => {
    try {
      const res = await fetch(`${API_BASE}/api/products/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(productData),
      })
      if (res.ok) {
        const data = await res.json()
        setProducts((prev) => prev.map((p) => (p.id === id ? data : p)))
        return data
      }
    } catch (err) {
      console.error('Error updating product:', err)
    }
  }

  const deleteProduct = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/products/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id))
        return true
      }
    } catch (err) {
      console.error('Error deleting product:', err)
    }
  }

  const addService = async (serviceData) => {
    try {
      const res = await fetch(`${API_BASE}/api/services`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(serviceData),
      })
      if (res.ok) {
        const data = await res.json()
        setServices((prev) => [...prev, data])
        return data
      }
    } catch (err) {
      console.error('Error adding service:', err)
    }
  }

  const updateService = async (id, serviceData) => {
    try {
      const res = await fetch(`${API_BASE}/api/services/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(serviceData),
      })
      if (res.ok) {
        const data = await res.json()
        setServices((prev) => prev.map((s) => (s.id === id ? data : s)))
        return data
      }
    } catch (err) {
      console.error('Error updating service:', err)
    }
  }

  const deleteService = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/services/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
      if (res.ok) {
        setServices((prev) => prev.filter((s) => s.id !== id))
        return true
      }
    } catch (err) {
      console.error('Error deleting service:', err)
    }
  }

  return (
    <DataContext.Provider
      value={{
        products,
        setProducts,
        services,
        setServices,
        fetchProducts,
        fetchServices,
        addProduct,
        updateProduct,
        deleteProduct,
        addService,
        updateService,
        deleteService,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => useContext(DataContext)
