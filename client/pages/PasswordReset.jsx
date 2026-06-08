import React, { useRef, useState, useEffect } from "react";
import { useAuth } from "../src/contexts/AuthContext";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import logoWhite from "../src/assets/images/lande_white.png";
import RippleButton from "../src/components/RippleButton";

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
          <div className="absolute inset-0 bg-linear-to-r from-green-600 to-teal-800 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
          <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
            <div>
              <h1 className="text-2xl font-semibold">Resetare parolă</h1>

              {email && (
                <h2 className="text-sm text-gray-500">Pentru: {email}</h2>
              )}
            </div>
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="off"
                    required
                    ref={passwordRef}
                    placeholder="Parolă nouă"
                    onChange={() => setError("")}
                    className="peer placeholder-transparent h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-hidden focus:border-green-600"
                  />
                  <label
                    htmlFor="password"
                    className="absolute left-0 -top-3.5 text-gray-600 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-440 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm"
                  >
                    Parolă nouă
                  </label>
                </div>
                <div className="relative">
                  <RippleButton
                    variant="primary"
                    type="submit"
                    disabled={loading}
                    className="bg-teal-800 px-4 py-2"
                  >
                    {loading ? "Se salvează..." : "Schimbă parola"}
                  </RippleButton>
                </div>
                {error && <p className="text-red-600 text-sm">{error}</p>}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
