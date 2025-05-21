import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import SignIn from "../pages/SignIn";
import SignUp from "../pages/SignUp";
import ForgotPassword from "../pages/ForgotPassword";
import Profile from "../pages/Profile";
import Cart from "../pages/Cart";
import AuthProvider from "./contexts/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import CartProvider from "./contexts/CartContext";
import ProductProvider from "./contexts/ProductContext";
import Background from "./components/Background";
import About from "../pages/About";

export default function App() {
  return (
    <CartProvider>
      <AuthProvider>
        <ProductProvider>
          <BrowserRouter>
            {/*Routes */}
            <Routes>
              <Route
                path="/"
                element={
                  <Background>
                    <Home />
                  </Background>
                }
              />
              <Route
                path="/sign-in"
                element={
                  <Background>
                    <SignIn />
                  </Background>
                }
              />
              <Route
                path="/sign-up"
                element={
                  <Background>
                    <SignUp />
                  </Background>
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <Background>
                    <ForgotPassword />
                  </Background>
                }
              />
              <Route
                path="/cart"
                element={
                  <Background>
                    <Cart />
                  </Background>
                }
              />
              <Route
                path="/about"
                element={
                  <Background>
                    <About />
                  </Background>
                }
              />
              <Route element={<PrivateRoute />}>
                <Route
                  path="/profile"
                  element={
                    <Background>
                      <Profile />
                    </Background>
                  }
                />
              </Route>
            </Routes>
          </BrowserRouter>
        </ProductProvider>
      </AuthProvider>
    </CartProvider>
  );
}
