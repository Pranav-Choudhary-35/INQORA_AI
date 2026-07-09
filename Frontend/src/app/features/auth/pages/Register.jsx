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

  let strengthScore = 0
  if (password.length > 6) strengthScore += 20
  if (password.length > 10) strengthScore += 20
  if (/[A-Z]/.test(password)) strengthScore += 20
  if (/[0-9]/.test(password)) strengthScore += 20
  if (/[^A-Za-z0-9]/.test(password)) strengthScore += 20

  const strength = strengthScore === 0
    ? { label: 'Awaiting input', color: '#474746' }
    : strengthScore < 40
      ? { label: 'Vulnerable', color: '#ffb4ab' }
      : strengthScore < 80
        ? { label: 'Standard', color: '#00dfc1' }
        : { label: 'Inpenetrable', color: '#26fedc' }

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
    <>
      <section className="relative min-h-screen overflow-hidden bg-bg text-text-primary">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(0,223,193,0.04),transparent_32%),radial-gradient(circle_at_80%_72%,rgba(38,254,220,0.05),transparent_36%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,223,193,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,223,193,0.03)_1px,transparent_1px)] bg-[size:52px_52px] opacity-40 [mask-image:radial-gradient(circle_at_center,black,transparent_88%)]" />
        </div>

        <div className="relative z-10 flex min-h-screen flex-col md:flex-row">
          <section className="hidden md:flex md:w-1/2 flex-col justify-center items-center px-10 py-16 lg:px-16 text-center">
            <div className="max-w-xl">
              <div className="mb-10 flex justify-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-[1.75rem] border border-white/10 bg-white/[0.03] backdrop-blur-sm">
                  <img
                    src="/logo.png"
                    alt="Inqora Logo"
                    className="h-12 w-12 object-contain"
                  />
                </div>
              </div>

              <h1 className="text-5xl font-heading font-extrabold leading-[0.92] tracking-[-0.05em] lg:text-6xl">
                Join the <br />
                <span className="bg-[linear-gradient(135deg,#d7fff3_0%,#00dfc1_100%)] bg-clip-text text-transparent">
                  Intelligence
                </span>{' '}
                Core.
              </h1>

              <p className="mx-auto mt-8 max-w-md text-lg leading-8 text-text-muted/80">
                Access high-end generative models, real-time processing, and
                your AI workspace from one unified interface.
              </p>
            </div>
          </section>

          <section className="flex w-full flex-1 items-center justify-center px-5 py-10 sm:px-8 md:w-1/2 md:px-10 lg:px-16">
            <div className="w-full max-w-xl py-2 sm:py-6">
              <div className="mb-8 flex flex-col items-center gap-4 md:hidden">
                <img
                  src="/logo.png"
                  alt="Inqora Logo"
                  className="h-12 w-12 object-contain"
                />
                <span className="text-2xl font-bold tracking-tight text-accent-muted">
                  Inqora
                </span>
                <p className="max-w-sm text-center text-sm leading-6 text-text-muted">
                  Secure your access to the next generation of AI.
                </p>
              </div>

              <div className="mb-8 text-center md:mb-10 md:text-left">
                <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-text-muted/70">
                  Secure onboarding
                </p>
                <h2 className="mt-3 text-3xl font-heading font-semibold text-accent-muted sm:text-4xl">
                  Create Account
                </h2>
                <p className="mt-3 text-base text-text-muted">
                  Secure your access to the next generation of AI.
                </p>
              </div>

              <form onSubmit={submitForm} className="space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="username"
                    className="ml-1 font-mono text-[11px] uppercase tracking-[0.22em] text-text-muted/75"
                  >
                    Username
                  </label>
                  <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.02] transition-colors duration-300 focus-within:border-accent/25">
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="quantum_architect"
                      required
                      className="w-full border-none bg-transparent px-6 py-4 text-text-primary placeholder:text-[#5f6b67] outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="ml-1 font-mono text-[11px] uppercase tracking-[0.22em] text-text-muted/75"
                  >
                    Email Address
                  </label>
                  <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.02] transition-colors duration-300 focus-within:border-accent/25">
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@inqora.ai"
                      required
                      className="w-full border-none bg-transparent px-6 py-4 text-text-primary placeholder:text-[#5f6b67] outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="ml-1 font-mono text-[11px] uppercase tracking-[0.22em] text-text-muted/75"
                  >
                    Password
                  </label>
                  <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.02] transition-colors duration-300 focus-within:border-accent/25">
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full border-none bg-transparent px-6 py-4 text-text-primary placeholder:text-[#5f6b67] outline-none"
                    />
                  </div>

                  <div className="px-1 pt-2">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-hover">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${strengthScore}%`,
                          backgroundColor: strength.color,
                        }}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6d7774]">
                        Security Level
                      </p>
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
                        {strength.label}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-3 w-full rounded-2xl bg-accent px-6 py-4 text-base font-bold text-[#00382f] transition-colors duration-300 hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-80"
                >
                  {loading ? "Initializing..." : "Initialize Account"}
                </button>
              </form>

              <p className="mt-8 text-center text-sm text-text-muted">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-accent hover:text-accent-hover"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </section>
        </div>
      </section>

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
            className="w-[380px] rounded-[2rem] border border-white/10 bg-[rgba(18,18,18,0.95)] p-6 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-3">
              {modal.type === "success" ? (
                <CheckCircle className="w-10 h-10 text-green-400" />
              ) : (
                <XCircle className="w-10 h-10 text-red-400" />
              )}
            </div>

            <h2 className="text-lg font-heading font-semibold text-text-primary mb-1">
              {modal.type === "success"
                ? "Verify Your Email"
                : "Registration Failed"}
            </h2>

            <p className="text-sm text-text-muted mb-4">
              {isVerified
                ? "Email verified successfully. You can continue."
                : modal.message}
            </p>

            {modal.type === "success" && (
              <button
                onClick={handleResendEmail}
                disabled={resending || cooldown > 0}
                className="text-sm text-text-muted hover:text-accent transition-colors"
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
              className="w-full mt-4 rounded-lg bg-accent hover:bg-accent-hover py-2 font-medium text-bg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
