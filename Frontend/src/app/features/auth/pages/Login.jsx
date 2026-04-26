import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router'
import { useAuth } from '../hook/useAuth'
import { useSelector } from 'react-redux'
import { XCircle } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [modal, setModal] = useState({ open: false, message: '' })
  const [loadingBtn, setLoadingBtn] = useState(false)

  const user = useSelector(state => state.auth.user)
  const loading = useSelector(state => state.auth.loading)

  const { handleLogin } = useAuth()
  const navigate = useNavigate()

  const submitForm = async (event) => {
    event.preventDefault()

    const payload = { email, password }

    try {
      setLoadingBtn(true)
      await handleLogin(payload)

      navigate("/")
    } catch (err) {
      setModal({
        open: true,
        message: err.message || "Invalid credentials",
      })
    } finally {
      setLoadingBtn(false)
    }
  }

  if (!loading && user) {
    return <Navigate to="/" replace />
  }

  return (
    <>
      <section className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100">
        <div className="mx-auto flex min-h-[85vh] w-full max-w-5xl items-center justify-center">
          <div className="w-full max-w-md rounded-2xl border border-[#31b8c6]/40 bg-zinc-900/70 p-8 shadow-2xl backdrop-blur">
            <h1 className="text-3xl font-bold text-[#31b8c6]">
              Welcome Back
            </h1>

            <p className="mt-2 text-sm text-zinc-300">
              Sign in with your email and password.
            </p>

            <form onSubmit={submitForm} className="mt-8 space-y-5">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3"
              />

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3"
              />

              <button
                type="submit"
                disabled={loadingBtn}
                className="w-full rounded-lg bg-[#31b8c6] px-4 py-3 font-semibold text-black"
              >
                {loadingBtn ? "Logging in..." : "Login"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm">
              Don’t have an account?{" "}
              <Link to="/register" className="text-[#31b8c6]">
                Register
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* ERROR MODAL */}
      {modal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setModal({ open: false, message: '' })}
        >
          <div
            className="w-[350px] rounded-2xl border border-zinc-700 bg-zinc-900 p-6 text-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <XCircle className="mx-auto mb-3 h-10 w-10 text-red-400" />

            <h2 className="text-lg font-semibold text-white mb-1">
              Login Failed
            </h2>

            <p className="text-sm text-zinc-400 mb-4">
              {modal.message}
            </p>

            <button
              onClick={() => setModal({ open: false, message: '' })}
              className="w-full rounded-lg bg-[#31b8c6] py-2 font-semibold text-black"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default Login