import React, { useRef, useState, useEffect } from "react";
import { useAuth } from "../src/contexts/AuthContext";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@material-tailwind/react";
import logoWhite from "../src/assets/images/lande_white.png";

export default function PasswordReset() {
  const passwordRef = useRef();
  const { verifyResetCode, resetPassword } = useAuth();

  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get("oobCode");

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  // Verify email from code
  useEffect(() => {
    async function verifyCode() {
      try {
        const email = await verifyResetCode(oobCode);
        setEmail(email);
      } catch (err) {
        setError("Link invalid sau expirat");
      }
    }

    if (oobCode) verifyCode();
    if (!oobCode) {
      setError("Link invalid. Codul lipsește.");
    }
  }, [oobCode, verifyResetCode]);

  // Reset password
  async function handleSubmit(e) {
    e.preventDefault();

    const password = passwordRef.current.value;

    if (!password || password.length < 6) {
      setError("Parola trebuie să aibă minim 6 caractere");
      return;
    }

    try {
      setError("");
      setLoading(true);

      await resetPassword(oobCode, password);

      setSuccess(true);
    } catch (error) {
      setError("Resetarea parolei a eșuat: " + error.message);
    }

    setLoading(false);
  }

  // SUCCESS UI
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <img src={logoWhite} className="w-24 mb-6" />

        <div className="bg-white p-10 rounded-xl shadow-lg text-center">
          <h1 className="text-2xl font-semibold text-green-600">
            Parolă schimbată cu succes!
          </h1>

          <p className="text-gray-500 mt-2">
            Acum te poți conecta cu noua parolă.
          </p>

          <Button
            className="mt-6 bg-teal-800"
            onClick={() => navigate("/sign-in")}
          >
            Mergi la login
          </Button>
        </div>
      </div>
    );
  }

  // RESET FORM UI
  return (
    <div className="py-1 flex flex-col justify-center items-center sm:py-12">
      <Link to="/">
        <img src={logoWhite} className="w-28 h-28 mb-12" alt="lande" />
      </Link>

      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-teal-800 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>

          <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
            <h1 className="text-2xl font-semibold">Resetare parolă</h1>

            {email && (
              <h2 className="text-sm text-gray-500">Pentru: {email}</h2>
            )}

            <div className="mt-6 space-y-4">
              <input
                id="password"
                name="password"
                type="password"
                required
                ref={passwordRef}
                placeholder="Parolă nouă"
                onChange={() => setError("")}
                className="w-full border-b-2 p-2 focus:outline-none focus:border-green-600"
              />

              <Button
                type="submit"
                disabled={loading}
                className="bg-teal-800 text-white w-full"
              >
                {loading ? "Se salvează..." : "Schimbă parola"}
              </Button>

              {error && <p className="text-red-600 text-sm">{error}</p>}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
