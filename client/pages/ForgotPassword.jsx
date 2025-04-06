import React, { useRef, useState } from "react";
import { useAuth } from "../src/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Button, Alert } from "@material-tailwind/react";

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default function ForgotPassword() {
  const emailRef = useRef();
  const { resetPassword } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault(); // Prevent default form submission behavior

    if (!validateEmail(emailRef.current.value)) {
      setError("Te rugăm să introduci o adresă de email validă.");
      return;
    }

    try {
      setError(""); // Clear previous errors
      setLoading(true);
      await resetPassword(emailRef.current.value);
      alert("Email-ul de recuperare a fost trimis!"); // Alert message
      navigate("/sign-in"); // Navigate to sign-in page when resetting is successful
    } catch (error) {
      setError("Recuperarea parolei a fost nereușită: " + error.message); // Error message
    }

    setLoading(false);
  }

  return (
    <div className="py-1 flex flex-col justify-center items-center sm:py-12">
      <Link to="/">
        <img
          src="src/assets/images/lande_white.png"
          className="w-28 h-28 mb-12"
          alt="lande"
        />
      </Link>
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-teal-800 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
          <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
            <div className="max-w-md mx-auto">
              <div>
                <h1 className="text-2xl font-semibold">Recuperare parolă</h1>
              </div>
              <div className="divide-y divide-gray-200">
                <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                  <div className="relative">
                    <input
                      autoComplete="off"
                      id="email"
                      name="email"
                      type="email"
                      ref={emailRef}
                      required
                      onChange={() => setError("")}
                      className="peer placeholder-transparent h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-green-600"
                      placeholder="Email"
                    />
                    <label
                      htmlFor="email"
                      className="absolute left-0 -top-3.5 text-gray-600 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-440 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm"
                    >
                      Email
                    </label>
                  </div>
                  <div className="relative">
                    <Button
                      size="sm"
                      disabled={loading}
                      type="submit"
                      className="bg-teal-800 text-white"
                    >
                      Continuă
                    </Button>
                  </div>
                  {error && <span className="text-red-600">{error}</span>}
                  {/* Display error message if there is one */}
                </div>
              </div>
            </div>
            <Link to="/sign-in" className="text-teal-800 hover:underline">
              Intră în cont
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
