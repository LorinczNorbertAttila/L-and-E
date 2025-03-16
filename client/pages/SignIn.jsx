import React, { useRef, useState } from "react";
import { useAuth } from "../src/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@material-tailwind/react";

export default function SignIn() {
  const emailRef = useRef();
  const passRef = useRef();
  const { google_login, login } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Function to handle form submission
  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError(""); // Reset error message
      setLoading(true);
      // Attempt to log in with email and password
      await login(emailRef.current.value, passRef.current.value);
      // Redirect to home page
      navigate("/");
    } catch (error) {
      // Handle different errors
      if (error.code === "auth/wrong-password") {
        setError("Parola introdusă este incorectă.");
      } else if (error.code === "auth/invalid-credential") {
        setError("Credentialele sunt invalide.");
      } else if (error.code === "auth/user-not-found") {
        setError("Adresa de email nu există.");
      } else if (error.code === "auth/invalid-email") {
        setError("Adresa de email nu este validă.");
      } else if (error.code === "auth/too-many-requests") {
        setError(
          "Accesul la acest cont a fost temporar dezactivat din cauza prea multor încercări eșuate. Resetați parola sau încercați din nou mai târziu."
        );
      } else {
        setError("Autentificare eșuată: " + error.message);
      }
    }

    setLoading(false);
  }

  // Function to handle Google authentication
  async function handleGoogleAuth(e) {
    e.preventDefault();

    try {
      setError(""); // Reset error message
      setLoading(true);
      // Attempt to log in with Google
      await google_login();
      // Redirect to home page
      navigate("/");
    } catch (error) {
      setError("Intrarea în cont a fost nereușită: " + error.message);
    }

    setLoading(false);
  }

  return (
    <div className="py-1 flex flex-col justify-center items-center sm:py-12">
      {/* Link to the home page */}
      <Link to="/">
        <img
          src="src/assets/images/lande_white.png"
          className="w-28 h-28 mb-12"
          alt="lande"
        />
      </Link>
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <form onSubmit={handleSubmit}>
          {/* Background gradient for form */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-teal-800 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
          <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
            <div className="max-w-md mx-auto">
              <div>
                {/* Form title */}
                <h1 className="text-2xl font-semibold">Intră în cont</h1>
              </div>
              <div className="divide-y divide-gray-200">
                <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                  {/* Email input */}
                  <div className="relative">
                    <input
                      autoComplete="off"
                      id="email"
                      name="email"
                      type="email"
                      ref={emailRef}
                      required
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
                  {/* Password input */}
                  <div className="relative">
                    <input
                      autoComplete="off"
                      id="password"
                      name="password"
                      type="password"
                      ref={passRef}
                      required
                      className="peer placeholder-transparent h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-green-600"
                      placeholder="Password"
                    />
                    <label
                      htmlFor="password"
                      className="absolute left-0 -top-3.5 text-gray-600 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-440 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm"
                    >
                      Parolă
                    </label>
                  </div>
                  {/* Submit button and link to password reset */}
                  <div className="relative">
                    <Button
                      size="sm"
                      disabled={loading}
                      type="submit"
                      className="bg-teal-800 text-white"
                    >
                      Continuă
                    </Button>
                    <Link
                      to="/forgot-password"
                      className="text-base text-teal-800 hover:underline p-2"
                    >
                      Am uitat parola
                    </Link>
                  </div>
                  {/* Display error message if there is one */}
                  {error && <span className="text-red-600">{error}</span>}
                </div>
              </div>
            </div>
            {/* Link to sign up page */}
            <h1 className="text-center p-4">
              Nu ai cont?{" "}
              <Link to="/sign-up" className="text-teal-800 hover:underline">
                Crează
              </Link>
            </h1>
            <div className="w-full flex justify-center">
              {/* Google sign-in button */}
              <Button
                size="md"
                variant="outlined"
                color="blue-gray"
                className="flex items-center gap-3"
                onClick={handleGoogleAuth}
              >
                <img
                  src="https://docs.material-tailwind.com/icons/google.svg"
                  alt="metamask"
                  className="h-6 w-6"
                />
                Continuă cu Google
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
