import {BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import SignIn from '../pages/SignIn'
import SignUp from '../pages/SignUp'
import ForgotPassword from '../pages/ForgotPassword'
import Profile from '../pages/Profile'
import Cart from '../pages/Cart'
import AuthProvider from './contexts/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import CartProvider from './contexts/CartContext'
import ProductProvider from './contexts/ProductContext'


export default function App() {
  return  (
  <AuthProvider>
    <ProductProvider>
    <CartProvider>
      <BrowserRouter>
      {/*Routes */}
      <Routes>
        <Route path = "/" element={<Home/>} />
        <Route path = "/sign-in" element={<SignIn/>} />
        <Route path = "/sign-up" element={<SignUp/>} />
        <Route path = "/forgot-password" element={<ForgotPassword/>} />
        <Route path = "/cart" element={<Cart/>} />
        <Route element={<PrivateRoute />}>
          <Route path = "/profile" element={<Profile/>} />
        </Route>
      </Routes>
      </BrowserRouter>
    </CartProvider>
    </ProductProvider>
  </AuthProvider>
  )
}
