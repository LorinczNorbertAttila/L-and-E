import React, { useState, useEffect } from 'react'
import Header from '../src/components/Header'
import { useCart } from '../src/contexts/CartContext'

export default function Cart() {
  const { cart, updateCartItemQuantity, removeFromCart } = useCart()
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const calculatedTotal = cart.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    )
    setTotal(calculatedTotal)
  }, [cart])

  const handleQuantityChange = (item, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(item.product.id)
    } else if (newQuantity > item.quantity) {
      updateCartItemQuantity(item.product.id, 1)
    } else if (newQuantity < item.quantity) {
      updateCartItemQuantity(item.product.id, -1)
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-100 p-4">
        <h2 className="text-2xl font-bold mb-4">Coșul meu</h2>
        {cart.length > 0 ? (
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.product.id} className="bg-white p-4 rounded-md shadow-md flex relative">
                <img className="w-36" src={item.product.imageUrl || ''} alt={item.product.name} />
                <div>
                  <h3 className="text-lg font-bold">{item.product.name}</h3>
                  <p>{item.product.type}</p>
                  <p>{item.product.mass} g</p>  
                </div>
                <p className="absolute right-4 pr-4 font-bold">{item.product.price} RON</p>
                <form className="absolute right-4 pr-4 self-end">
                  <div className="flex items-center">
                    <label className="pr-4">Cantitate: </label>
                    <input 
                      id="quantity"
                      type="number" 
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item, parseInt(e.target.value))}
                      className="border rounded px-2 py-1 w-16" 
                    />
                  </div>
                </form>
              </div>
            ))}
            <div className="text-right font-bold text-xl mt-4">
              Total: {total.toFixed(2)} RON
            </div>
          </div>
        ) : (
          <p className="text-gray-600">Coșul tău este gol</p>
        )}
      </div>
    </>
  )
}
