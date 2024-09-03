import React, { useState } from 'react'
import { useAuth } from '../src/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import Header from '../src/components/Header'
import { Pencil, X } from 'lucide-react'

export default function Profile() {
  const { currentUser, logout, setField, setCurrentUser } = useAuth()
  const [error, setError] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [addressError, setAddressError] = useState('')
  const [loading, setLoading] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [showPhoneInput, setShowPhoneInput] = useState(false)
  const [showAddressInput, setAddressInput] = useState(false)
  const [county, setCounty] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const navigate = useNavigate()

  // Function to handle logout
  async function handleLogout(e) {
    e.preventDefault()
    try {
      setError('')
      setLoading(true)
      await logout()
      navigate("/")
    } catch (error) {
      setError(error.message)
    }
    setLoading(false)
  }

  // Function to handle adding phone number
  async function handleTel(e) {
    e.preventDefault()
    try {
      setPhoneError('')  // Reset error message
      setLoading(true)
      await setField('users', currentUser.uid, 'tel', phoneNumber)  // Set the phone number

      // Update the `currentUser` object locally to reflect the new phone number
      setCurrentUser({
        ...currentUser,
        tel: phoneNumber,  // Update the local user object with the new phone number
      })

      setShowPhoneInput(false)  // Hide the input field after saving
    } catch (error) {
      setPhoneError("Failed to save phone number: " + error.message)  // Set error message if failed
    }
    setLoading(false)
  }

  async function handleAddress(e) {
    e.preventDefault()
    try {
      setAddressError('')  // Reset error message
      setLoading(true)
      const fullAddress = address + " " + city + " " + county
      await setField('users', currentUser.uid, 'address', fullAddress)  // Set the address
      // Update the `currentUser` object locally to reflect the new address
      setCurrentUser({
        ...currentUser,
        address: fullAddress,  // Update the local user object with the new address
      })

      setAddressInput(false)  // Hide the input field after saving
    } catch (error) {
      setAddressError("Failed to save address: " + error.message)  // Set error message if failed
    }
    setLoading(false)
  }

  // Function to show phone number input field
  function handleAddPhoneClick() {
    setShowPhoneInput(true)
  }

  const closeModal = () => {
    setAddressInput(false)
  }

  return (
    <>
    <div>
      <Header />
        <div className='min-h-screen bg-gray-100 py-1 flex flex-col items-center sm:py-12'>
          <div className="bg-white overflow-hidden shadow rounded-lg border item">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Datele contului</h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
              <dl className="sm:divide-y sm:divide-gray-200">
                <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Nume</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {currentUser?.name}
                  </dd>
                </div>
                <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {currentUser?.email}
                  </dd>
                </div>
                <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Telefon</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div className="flex justify-center sm:justify-between items-center w-full">
                      {showPhoneInput ? (
                        <form onSubmit={handleTel} className="flex items-center">
                          <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => {
                              const onlyNums = e.target.value.replace(/[^0-9]/g, '') // Numbers only
                              if (onlyNums.length <= 10) { // Phone number length = 10
                                setPhoneNumber(onlyNums)
                              }
                            }}
                            placeholder="Telefon"
                            className="border rounded px-2 py-1" 
                          />
                          <button type="submit" className="bg-teal-800 text-white rounded-md px-2 py-1 ml-2">
                            Modifică
                          </button>
                        </form>
                      ) : (
                        <>
                          <span>{currentUser?.tel}</span>
                          <button onClick={handleAddPhoneClick} className="text-teal-800 ml-6">
                            <Pencil />
                          </button>
                        </>
                      )}
                    </div>
                    {phoneError && <p className="text-red-600 mt-2">{error}</p>}
                  </dd>
                </div>
                 <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Address</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {currentUser?.address ? (
                      <div className="flex justify-center sm:justify-between items-center w-full">
                        <h2>{currentUser?.address}</h2>
                        <button onClick={() => setAddressInput(true)} className="text-teal-800 ml-6">
                          <Pencil />
                        </button>
                      </div>):(
                      <button onClick={() => setAddressInput(true)} className="bg-teal-800 text-white rounded-md px-2 py-1 ml-2">
                        Adaugă adresă
                      </button>
                    ) } 
                  </dd>
                  {addressError && <p className="text-red-600 mt-2">{error}</p>}
                </div>
                <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <button disabled={loading} onClick={handleLogout} className="bg-teal-800 text-white rounded-md px-2 py-1">
                    Log out
                  </button>
                </div>
              </dl>
            </div>
          </div>
        </div>
    </div>

    {/*Modal*/}
    {showAddressInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="relative bg-white p-6 rounded-md shadow-lg max-w-md w-full">
          <button onClick={closeModal} className="absolute top-2 right-2 text-teal-800"><X/></button>
          <h2 className="text-2xl font-bold mb-4 text-center"></h2>
          <form onSubmit={handleAddress} className="flex flex-col">
            <div className="flex justify-between">
              <div>
                <h2 className="px-2">Județ</h2>
                <input type="text" value={county} onChange={(e) => setCounty(e.target.value)} className="border rounded px-1 py-1 mt-2" />
              </div>
              <div>
              <h2 className="px-2">Oraș</h2>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="border rounded px-1 py-1 mt-2" />
              </div>
            </div>
            <h2 className="px-2">Adresă</h2>
            <textarea type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="border rounded h-24 px-1 py-1 mt-2 flex-grow "  style={{ resize: 'none' }}/>
            <div className="mt-2 flex justify-center">
              <button type="submit" className="bg-teal-800 text-white rounded-md px-2 py-1">
                Salvează
              </button>
            </div>
          </form>
        </div>
      </div>
      )}
    </>
  )
}
