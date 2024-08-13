import React, { useRef, useState } from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function SignUp() {
  const lnameRef = useRef()
  const nameRef = useRef()
  const emailRef = useRef()
  const passRef = useRef()
  const passConfRef = useRef()
  const { signup } = useAuth()
  const [error, setError] = useState('')
  const [loadig, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()

    if(passRef.current.value !== passConfRef.current.value){
      return setError('Password do not match')
    }

    try{
      setError('')
      setLoading(true)
      await signup(emailRef.current.value, passRef.current.value, nameRef.current.value, lnameRef.current.value)
      navigate("/")
    }catch{
      setError('Crearea contului a fost nereușită')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 py-1 flex flex-col justify-center items-center sm:py-12">
      <img src='src/images/lande.png' className='w-28 h-28 mb-12' alt='lande' />
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <form onSubmit={handleSubmit}>
        <div
          className="absolute inset-0 bg-gradient-to-r from-green-600 to-teal-800 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl">
        </div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">

          <div className="max-w-md mx-auto">
            <div>
              <h1 className="text-2xl font-semibold">Intră în cont</h1>
            </div>
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
              <div className="relative">
                  <input autoComplete="off" id="lastname" name="lastname" type="text" ref={lnameRef} required className="peer placeholder-transparent h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-green-600" placeholder="Lastname" />
                  <label htmlFor="password" className="absolute left-0 -top-3.5 text-gray-600 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-440 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm">Nume</label>
                </div>
                <div className="relative">
                  <input autoComplete="off" id="name" name="name" type="text" ref={nameRef} required className="peer placeholder-transparent h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-green-600" placeholder="Name" />
                  <label htmlFor="password" className="absolute left-0 -top-3.5 text-gray-600 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-440 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm">Prenume</label>
                </div>
                <div className="relative">
                  <input autoComplete="off" id="email" name="email" type="email" ref={emailRef} required className="peer placeholder-transparent h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-green-600" placeholder="Email address" />
                  <label htmlFor="email" className="absolute left-0 -top-3.5 text-gray-600 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-440 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm">Email</label>
                </div>
                <div className="relative">
                  <input autoComplete="off" id="password" name="password" type="password" ref={passRef} required className="peer placeholder-transparent h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-green-600" placeholder="Password" />
                  <label htmlFor="password" className="absolute left-0 -top-3.5 text-gray-600 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-440 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm">Parolă</label>
                </div>     
                <div className="relative">
                  <input autoComplete="off" id="password2" name="password2" type="password" ref={passConfRef} required className="peer placeholder-transparent h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-green-600" placeholder="Password Confirmation" />
                  <label htmlFor="password" className="absolute left-0 -top-3.5 text-gray-600 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-440 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm">Confirmă parolă</label>
                </div>           
                <div className="relative">
                  <button disabled={loadig} type="submit" className="bg-teal-800 text-white rounded-md px-2 py-1">Continuă</button>
                </div>
                {error && <span className='text-red-600'>{error}</span>}
              </div>
            </div>
          </div>
          <h1 className='p-4'>Ai deja un cont? <Link to='/sign-in' className='text-teal-800 hover:underline'>Intră în cont</Link></h1>

        </div>
        </form>
      </div>
    </div>
  )
}
