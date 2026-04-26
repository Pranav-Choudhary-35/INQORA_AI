import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../hook/useAuth'
import { CheckCircle, XCircle } from "lucide-react";
import axios from "axios";

const Register = () => {

const [modal, setModal] = useState({ open: false, type: '', message: '' })
const [username, setUsername] = useState('')
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [resending, setResending] = useState(false)
const [cooldown, setCooldown] = useState(0)
const [loading, setLoading] = useState(false)

const [isVerified, setIsVerified] = useState(false)

const { handleRegister } = useAuth()
const navigate = useNavigate()

// cooldown timer
useEffect(() => {
if (cooldown <= 0) return


const timer = setInterval(() => {
  setCooldown(prev => {
    if (prev <= 1) {
      clearInterval(timer)
      return 0
    }
    return prev - 1
  })
}, 1000)

return () => clearInterval(timer)

}, [cooldown])

useEffect(() => {
if (!(modal.open && modal.type === "success")) return


const interval = setInterval(async () => {
  try {
    const res = await axios.get(
      `/auth/check-verified?email=${email}`,
      { withCredentials: true } // ⚠️ IMPORTANT (cookies)
    )

    if (res.data?.verified) {
      setIsVerified(true)
      clearInterval(interval)
    }
  } catch (err) {
    // silent
  }
}, 3000)

return () => clearInterval(interval)


}, [modal.open, modal.type, email])

const submitForm = async (event) => {
event.preventDefault()


const payload = { username, email, password }

try {
  setLoading(true)
  await handleRegister(payload)

  setIsVerified(false) // reset every time

  setModal({
    open: true,
    type: 'success',
    message: `Verification link sent to ${email}`,
  })
} catch (err) {
  setModal({
    open: true,
    type: 'error',
    message: err.message || "Registration failed",
  })
} finally {
  setLoading(false)
}

}

const closeModal = () => {
// Only allow closing if it's an error modal OR if it's a success modal with verified email
if (modal.type === 'error' || (modal.type === 'success' && isVerified)) {
  if (modal.type === 'success' && isVerified) {
    navigate('/login')
  }

  setCooldown(0)
  setModal(prev => ({ ...prev, open: false }))
}
}

const handleResendEmail = async () => {
setResending(true)

try {
  await new Promise(resolve => setTimeout(resolve, 1000))

  setModal(prev => ({
    ...prev,
    message: `Verification email resent to ${email}`,
  }))

  setCooldown(30)
} finally {
  setResending(false)
}

}

return (
<> <section className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100"> <div className="mx-auto flex min-h-[85vh] w-full max-w-5xl items-center justify-center"> <div className="w-full max-w-md rounded-2xl border border-[#31b8c6]/40 bg-zinc-900/70 p-8 shadow-2xl backdrop-blur"> <h1 className="text-3xl font-bold text-[#31b8c6]">
Create Account </h1>
        <form onSubmit={submitForm} className="mt-8 space-y-5">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3"
          />

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
            disabled={loading}
            className="w-full rounded-lg bg-[#31b8c6] px-4 py-3 font-semibold text-black"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-[#31b8c6]">
            Login
          </Link>
        </p>
      </div>
    </div>
  </section>

  {/* MODAL */}
  {modal.open && (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={() => {
        // Only allow closing by clicking outside if it's an error modal or verified success
        if (modal.type === 'error' || (modal.type === 'success' && isVerified)) {
          closeModal()
        }
      }}
    >
      <div
        className="w-[380px] rounded-2xl border border-zinc-700 bg-zinc-900/95 p-6 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center mb-3">
          {modal.type === "success" ? (
            <CheckCircle className="w-10 h-10 text-green-400" />
          ) : (
            <XCircle className="w-10 h-10 text-red-400" />
          )}
        </div>

        <h2 className="text-lg font-semibold text-white mb-1">
          {modal.type === "success"
            ? "Verify Your Email"
            : "Registration Failed"}
        </h2>

        <p className="text-sm text-zinc-400 mb-4">
          {isVerified
            ? "Email verified successfully. You can continue."
            : modal.message}
        </p>

        {modal.type === "success" && (
          <button
            onClick={handleResendEmail}
            disabled={resending || cooldown > 0}
            className="text-sm text-zinc-400 hover:text-[#31b8c6]"
          >
            {resending
              ? "Resending..."
              : cooldown > 0
              ? `Resend in ${cooldown}s`
              : "Resend Email"}
          </button>
        )}

        <button
          onClick={closeModal}
          disabled={modal.type === "success" && !isVerified}
          className="w-full mt-4 rounded-lg bg-[#31b8c6] py-2 font-semibold text-black disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {modal.type === "success"
            ? isVerified
              ? "Continue"
              : "Waiting for verification..."
            : "Try Again"}
        </button>
      </div>
    </div>
  )}
</>


)
}

export default Register
