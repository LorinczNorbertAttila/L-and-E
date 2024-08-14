import React, { useRef, useState } from 'react'
import { useAuth } from '../src/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function SignIn() {
  const emailRef = useRef()
  const passRef = useRef()
  const { google_login, login } = useAuth()
  const [error, setError] = useState('')
  const [loadig, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()

    try{
      setError('')
      setLoading(true)
      await login(emailRef.current.value, passRef.current.value)
      navigate("/")
    }catch (error) {
      if (error.code === 'auth/wrong-password') {
        setError('Parola introdusă este incorectă.');
      } else if (error.code === 'auth/invalid-credential') {
        setError('Credentialele sunt invalide.');
      }else if (error.code === 'auth/user-not-found') {
        setError('Adresa de email nu există.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Adresa de email nu este validă.');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Accesul la acest cont a fost temporar dezactivat din cauza prea multor încercări eșuate. Resetați parola sau încercați din nou mai târziu.');
      }else {
        setError('Autentificare eșuată: ' + error.message);
      }
    }

    setLoading(false)
  }

  async function handleGoogleAuth(e){
    e.preventDefault()

    try{
      setError('')
      setLoading(true)
      await google_login(emailRef.current.value, passRef.current.value)
      navigate("/")
    }catch (error) {
      setError('Intrarea în cont a fost nereușită: ' + error.message);
    }

    setLoading(false)

  }

  return (
    <div className="min-h-screen bg-gray-100 py-1 flex flex-col justify-center items-center sm:py-12">
      <Link to='/'>
        <img src='src/images/lande.png' className='w-28 h-28 mb-12' alt='lande' />
      </Link>
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
                  <input autoComplete="off" id="email" name="email" type="email" ref={emailRef} required className="peer placeholder-transparent h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-green-600" placeholder="Email" />
                  <label htmlFor="email" className="absolute left-0 -top-3.5 text-gray-600 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-440 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm">Email</label>
                </div>
                <div className="relative">
                  <input autoComplete="off" id="password" name="password" type="password" ref={passRef} required className="peer placeholder-transparent h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-green-600" placeholder="Password" />
                  <label htmlFor="password" className="absolute left-0 -top-3.5 text-gray-600 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-440 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm">Parolă</label>
                </div>
                <div className="relative">
                  <button disabled={loadig} type="submit" className="bg-teal-800 text-white rounded-md px-2 py-1">Continuă</button>
                  <Link to='/forgot-password' className='text-base text-teal-800 hover:underline p-2'>Am uitat parola</Link>
                </div>
                {error && <span className='text-red-600'>{error}</span>}
              </div>
            </div>
          </div>
          <h1 className='text-center p-4'>Nu ai cont? <Link to='/sign-up' className='text-teal-800 hover:underline'>Crează</Link></h1>
          <div className="w-full flex justify-center">
            <button onClick={handleGoogleAuth} className="flex items-center bg-white border border-gray-300 rounded-lg shadow-md px-6 py-2 text-sm font-medium text-gray-800 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
            <img src='src/images/google.png' className='w-5 h-5 mr-2' alt='google' />
              <span>Continuă cu Google</span>
            </button>
          </div>

        </div>
        </form>
      </div>
    </div>
  )
}
