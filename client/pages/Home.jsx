import React, { useEffect, useState } from 'react';
import Header from '../src/components/Header';
import { db } from '../../firebase/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const coll = collection(db, 'products');
        const productSnapshot = await getDocs(coll);
        const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productList); 
      } catch (error) {
        console.error("Error fetching products: ", error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="flex flex-wrap justify-start gap-4">
          {products.map(product => (
            product.mass.map((mass, index) => (
              <div key={`${product.id}-${index}`} className="bg-white rounded-md shadow-md overflow-hidden p-4" style={{ width: '250px' }}>
                <img className="w-full" src={product.imageUrl || ''} alt={product.name} />
                <div className="px-6 py-4">
                  <h2 className="text-lg font-bold leading-tight text-gray-900">{product.name}</h2>
                  <p className="mt-2 text-gray-600">{product.type}</p>
                  <p className="mt-2 text-gray-600">{mass} g</p>
                  <p className="mt-2 text-teal-800">{product.price[index]} RON</p>
                </div>
              </div>
            ))
          ))}
        </div>
      </div>
    </>
  );
}
