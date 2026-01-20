import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Cart from './pages/Cart'
import Product from './pages/Product'
import Login from './pages/Login'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import Profile from './pages/Profile'
import ResetPassword from './pages/ResetPassword'
import Layout from './components/Layout'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
    </Routes>
  )
}

export default App
