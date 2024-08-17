import React, { useEffect, useState } from 'react';
import Header from '../src/components/Header';
import { db } from '../../firebase/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { X, ShoppingCart } from 'lucide-react';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null); // State for the selected product

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const coll = collection(db, 'products');
        const productSnapshot = await getDocs(coll);
        const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productList); 
      } catch (error) {
        console.error("Error loading products: ", error);
      }
    };

    fetchProducts();
  }, []);

  // Function to close the modal
  const closeModal = () => {
    setSelectedProduct(null);
  };

  // Function to prevent modal from opening when clicking the Shopping Cart button
  const handleCartClick = (e) => {
    e.stopPropagation(); // Prevent click event from propagating to the card
    console.log("Product added to cart!");
  };

  // Function to close the modal when clicking outside of it
  const handleModalBackgroundClick = (e) => {
    if (e.target === e.currentTarget) { // If the click is on the background, close the modal
      closeModal();
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="flex flex-wrap justify-start gap-4">
          {products.map(product => (
            product.mass.map((mass, index) => (
              <div 
                key={`${product.id}-${index}`} 
                className="bg-white rounded-md shadow-md overflow-hidden p-4 cursor-pointer"
                style={{ width: '300px' }}
                onClick={() => setSelectedProduct({ 
                  ...product, 
                  selectedMass: mass, 
                  selectedPrice: product.price[index], 
                  selectedQuantity: product.quantity[index] 
                })} // Select the product and its details
              >
                <img className="w-full" src={product.imageUrl || ''} alt={product.name} />
                <div className="relative px-6 py-4">
                  <h2 className="text-lg font-bold leading-tight text-gray-900">{product.name}</h2>
                  <p className="mt-2 text-gray-600">{product.type}</p>
                  <p className="mt-2 text-gray-600">{mass} g</p>
                  <p className="mt-2 text-teal-800 font-bold">{product.price[index]} RON</p>
                  <button 
                    onClick={handleCartClick} // Don't open modal when clicking this button
                    className='absolute bottom-2 right-2 bg-green-100 px-2 py-1 rounded hover:bg-teal-600'>
                    <ShoppingCart className='text-teal-800'/>
                  </button>
                </div>
              </div>
            ))
          ))}
        </div>
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
            <p className="text-lg mb-2">Cantitate disponibilă: {selectedProduct.selectedQuantity} bucăți</p>
          </div>
        </div>
      )}
    </>
  );
}
