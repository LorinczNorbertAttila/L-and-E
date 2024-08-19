import React, { useState } from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../src/components/Header';

export default function Profile() {
  const { currentUser, logout, setField, setCurrentUser } = useAuth(); // Assuming you have a `setCurrentUser` method in `AuthContext`
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const navigate = useNavigate();

  // Function to handle logout
  async function handleLogout(e) {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await logout();
      navigate("/");
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  }

  // Function to handle adding phone number
  async function handleTel(e) {
    e.preventDefault();
    try {
      setError('');  // Reset error message
      setLoading(true);
      await setField('users', currentUser.uid, 'tel', phoneNumber);  // Set the phone number

      // Update the `currentUser` object locally to reflect the new phone number
      setCurrentUser({
        ...currentUser,
        tel: phoneNumber,  // Update the local user object with the new phone number
      });

      setShowPhoneInput(false);  // Hide the input field after saving
    } catch (error) {
      setError("Failed to save phone number: " + error.message);  // Set error message if failed
    }
    setLoading(false);
  }

  // Function to show phone number input field
  function handleAddPhoneClick() {
    setShowPhoneInput(true);
  }

  return (
    <div>
      <Header />
      {currentUser ? (
        <div className='min-h-screen bg-gray-100 py-1 flex flex-col items-center sm:py-12'>
          <div className="bg-white overflow-hidden shadow rounded-lg border item">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Account Details</h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
              <dl className="sm:divide-y sm:divide-gray-200">
                <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {currentUser?.first} {currentUser?.last}
                  </dd>
                </div>
                <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {currentUser?.email}
                  </dd>
                </div>
                <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {currentUser?.tel ? (
                      currentUser?.tel
                    ) : (
                      <>
                        <button onClick={handleAddPhoneClick} className="bg-teal-800 text-white rounded-md px-2 py-1">Add Phone Number</button>
                        {showPhoneInput && (
                          <form onSubmit={handleTel}>
                            <input
                              type="text"
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              placeholder="Enter phone number"
                              className="border rounded px-2 py-1 mt-2"
                            />
                            <button type="submit" className="bg-teal-800 text-white rounded-md px-2 py-1 ml-2">
                              Save
                            </button>
                          </form>
                        )}
                      </>
                    )}
                    {/* Display error if there is any */}
                    {error && <p className="text-red-600 mt-2">{error}</p>}
                  </dd>
                </div>
                <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Address</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {currentUser?.address}
                  </dd>
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
      ) : (
        <div>No user!</div>
      )}
    </div>
  );
}
