import React, { useRef, useState } from "react";
import { useAuth } from "../src/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@material-tailwind/react";
import logoWhite from "../src/assets/images/lande_white.png";

export default function SignUp() {
  // Refs to access the input fields
  const lnameRef = useRef();
  const nameRef = useRef();
  const emailRef = useRef();
  const passRef = useRef();
  const passConfRef = useRef();
  const { signup } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const ERROR_MESSAGES = {
    passwordsDoNotMatch: "Parolele nu se potrivesc.",
    "auth/email-already-in-use": "Această adresă de email este deja utilizată.",
    "auth/invalid-email": "Adresa de email nu este validă.",
    "auth/weak-password": "Parola introdusă este prea slabă.",
    invalidEmail: "Adresa de email nu este validă.",
    invalidPassword: "Parola trebuie să conțină cel puțin 6 caractere.",
    default: "Crearea utilizatorului eșuată: ",
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Function to handle form submission
  async function handleSubmit(e) {
    e.preventDefault(); // Prevent default form submission behavior

    const lname = lnameRef.current?.value || "";
    const name = nameRef.current?.value || "";

    // Validate email
    if (!validateEmail(emailRef.current.value)) {
      setError(ERROR_MESSAGES.invalidEmail);
      return;
    }

    // Validate password length
    if (passRef.current.value.length < 6) {
      setError(ERROR_MESSAGES.invalidPassword);
      return;
    }

    // Check if passwords match
    if (passRef.current.value !== passConfRef.current.value) {
      return setError(ERROR_MESSAGES.passwordsDoNotMatch);
    }

    try {
      setError(""); // Reset error message
      setLoading(true);
      // Attempt signup
      await signup(emailRef.current.value, passRef.current.value, name, lname);
      navigate("/"); // Redirect to home page
    } catch (error) {
      setError(
        ERROR_MESSAGES[error.code] || ERROR_MESSAGES.default + error.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="py-1 flex flex-col justify-center items-center sm:py-12">
      {/* Link to the home page */}
      <Link to="/">
        <img
          src={logoWhite}
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
                <h1 className="text-2xl font-semibold">Creare cont</h1>
              </div>
              <div className="divide-y divide-gray-200">
                <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                  {/* Last name input */}
                  <div className="relative">
                    <input
                      autoComplete="off"
                      id="lastname"
                      name="lastname"
                      type="text"
                      ref={lnameRef}
                      required
                      className="peer placeholder-transparent h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-green-600"
                      placeholder="Lastname"
                      onChange={(e) => {
                        setError("");
                      }}
                    />
                    <label
                      htmlFor="lastname"
                      className="absolute left-0 -top-3.5 text-gray-600 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-440 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm"
                    >
                      Nume
                    </label>
                  </div>
                  {/* First name input */}
                  <div className="relative">
                    <input
                      autoComplete="off"
                      id="name"
                      name="name"
                      type="text"
                      ref={nameRef}
                      required
                      className="peer placeholder-transparent h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-green-600"
                      placeholder="Name"
                      onChange={(e) => {
                        setError("");
                      }}
                    />
                    <label
                      htmlFor="name"
                      className="absolute left-0 -top-3.5 text-gray-600 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-440 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm"
                    >
                      Prenume
                    </label>
                  </div>
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
                      placeholder="Email address"
                      onChange={(e) => {
                        setError("");
                      }}
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
                      onChange={(e) => {
                        setError("");
                      }}
                    />
                    <label
                      htmlFor="password"
                      className="absolute left-0 -top-3.5 text-gray-600 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-440 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm"
                    >
                      Parolă
                    </label>
                  </div>
                  {/* Password confirmation input */}
                  <div className="relative">
                    <input
                      autoComplete="off"
                      id="password2"
                      name="password2"
                      type="password"
                      ref={passConfRef}
                      required
                      className="peer placeholder-transparent h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-green-600"
                      placeholder="Password Confirmation"
                      onChange={(e) => {
                        setError("");
                      }}
                    />
                    <label
                      htmlFor="password2"
                      className="absolute left-0 -top-3.5 text-gray-600 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-440 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm"
                    >
                      Confirmă parolă
                    </label>
                  </div>
                  {/* Submit button */}
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
                  {/* Display error message if there is one*/}
                  {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                      {error}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Link to sign-in page */}
            <h1 className="p-4">
              Ai deja un cont?{" "}
              <Link to="/sign-in" className="text-teal-800 hover:underline">
                Intră în cont
              </Link>
            </h1>
          </div>
        </form>
      </div>
    </div>
  );
}
