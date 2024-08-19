import React, { useEffect, useState } from 'react'
import {FaSearch} from 'react-icons/fa'
import {Link} from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext';
import { User, ShoppingBasket } from 'lucide-react';

export default function Header() {
  const {currentUser} = useAuth()
    
  return (
    <header className='bg-teal-800 bg-opacity-85 shadow-md'>
        <div className='flex justify-between items-center max-w-6x1 mx-auto px-3'>
          <Link to='/'>
            <img src='src/images/lande.png' className='w-20 h-20' alt='Home' />
          </Link>
          <form className='bg-green-100 bg-opacity-85 p-3 rounded-lg flex items-center'> 
            <input type='text' placeholder='Căutare...' 
            className='bg-transparent focus:outline-none w-24 sm:w-64'/>
            <FaSearch className='text-teal-800'/>
          </form>
          <ul className='flex gap-4'>
            <Link to='/profile'>
            {currentUser ? (
              <img
                className='rounded-full h-7 w-7 object-cover'
                src={currentUser?.img || import.meta.env.VITE_DEFAULT_PICTURE}
                alt='profile'
              />
              ) : (
                <li className='hover:underline text-white flex items-center gap-1'> <User /> Autentificare</li>
              )}
            </Link>
            <Link to = '/about'>
            <li className='hover:underline text-white flex items-center gap-1'> <ShoppingBasket /> Coșul meu </li>
            </Link>
          </ul>
        </div>
    </header>
  )
}
