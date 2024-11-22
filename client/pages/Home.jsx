import React, { useEffect, useState } from 'react'
import Header from '../src/components/Header'
import { useProduct } from '../src/contexts/ProductContext'
import { X, ShoppingCart, BotMessageSquare } from 'lucide-react'
import { useCart } from '../src/contexts/CartContext'
import BotpressChat from '../cahtbots/BotPress'
import TidioChat from '../cahtbots/Tidio'



export default function Home() {
  const { products, fetchProducts } = useProduct()
  const [selectedProduct, setSelectedProduct] = useState(null) // State for the selected product
  const { addToCart } = useCart()
  const [showChat, setShowChat] = useState(false)

  // Function to close the modal
  const closeModal = () => {
    setSelectedProduct(null)
  }

  // Function to prevent modal from opening when clicking the Shopping Cart button
  const handleCartClick = (e, product, mass, price) => {
    e.stopPropagation() // Prevent click event from propagating to the card
    addToCart(product.id, mass, price)
  }

  // Function to close the modal when clicking outside of it
  const handleModalBackgroundClick = (e) => {
    if (e.target === e.currentTarget) { // If the click is on the background, close the modal
      closeModal()
    }
  }



  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="flex flex-wrap justify-start gap-4">
          {products.map(product => (
              <div 
                key={product.id} 
                className="bg-white rounded-md shadow-md overflow-hidden p-4 cursor-pointer w-64"
                onClick={() => setSelectedProduct({ 
                  ...product, 
                  selectedMass: product.mass, 
                  selectedPrice: product.price, 
                  selectedQuantity: product.quantity 
                })} // Select the product and its details
              >
                <img className="w-full" src={product.imageUrl || ''} alt={product.name} />
                <div className="relative px-6 py-4">
                  <h2 className="text-lg font-bold leading-tight text-gray-900">{product.name}</h2>
                  <p className="mt-2 text-gray-600">{product.type}</p>
                  <p className="mt-2 text-gray-600">{product.mass} g</p>
                  <p className="mt-2 text-teal-800 font-bold">{product.price} RON</p>
                  <button 
                    onClick={(e) => handleCartClick(e, product, product.mass, product.price)} // Don't open modal when clicking this button
                    className='absolute bottom-2 right-2 bg-green-100 px-2 py-1 rounded hover:bg-teal-600'>
                    <ShoppingCart className='text-teal-800'/>
                  </button>
                </div>
              </div>
            ))
          } 
        </div>
      {/*   <BotpressChat/>
        { <button 
        onClick={() => setShowChat(!showChat)} 
        className=' fixed bottom-4 right-4 bg-teal-800 p-4 rounded-full hover:bg-green-400'>
          <BotMessageSquare className='' />
        </button> } */}
      </div>

      {/* Modal */}
      {selectedProduct && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" 
          onClick={handleModalBackgroundClick} // Detect click on the background to close modal
        >
          <div className="relative bg-white p-6 rounded-md shadow-lg max-w-lg w-full">
            <button onClick={closeModal} className="absolute top-2 right-2 text-teal-800"><X/></button>
            <h2 className="text-2xl font-bold mb-4 text-center">{selectedProduct.name}</h2>
            <p className="text-lg mb-2">Tip: {selectedProduct.type}</p>
            <p className="text-lg mb-2">Greutate: {selectedProduct.selectedMass} g</p>
            <p className="text-lg mb-2">Preț: {selectedProduct.selectedPrice} RON</p>
          </div>
        </div>
      )}


        {/* Chat Window */}
        <div 
          className={`fixed bottom-0 right-4 bg-white shadow-lg rounded-t-lg w-80 p-4 transition-transform duration-300 
          ${showChat ? 'translate-y-0' : 'translate-y-full'}`} 
        >
          <div className="flex justify-between items-center border-b pb-2 mb-2">
            <h2 className="text-lg font-bold text-gray-800">Chat AI</h2>
            <button 
              onClick={() => setShowChat(false)} 
              className="text-gray-600 hover:text-red-500"
            >
              <X />
            </button>
          </div>
          <div className="h-48 overflow-y-auto">
            <p className="text-sm text-gray-600">Hello! Hogyan segíthetek?</p>
          </div>
          <div className="mt-2">
            <input 
              type="text" 
              placeholder="Írj üzenetet..." 
              className="w-full border rounded px-2 py-1 focus:outline-none"
            />
          </div>
        </div>
    </>
  )
}
