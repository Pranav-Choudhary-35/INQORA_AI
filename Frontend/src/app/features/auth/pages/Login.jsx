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
                Return to the <br />
                <span className="bg-[linear-gradient(135deg,#d7fff3_0%,#00dfc1_100%)] bg-clip-text text-transparent">
                  Intelligence
                </span>{' '}
                Core.
              </h1>

              <p className="mx-auto mt-8 max-w-md text-lg leading-8 text-text-muted/80">
                Continue with your existing access and jump straight into the
                unified AI workspace.
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
                  Continue into your unified AI workspace.
                </p>
              </div>

              <div className="mb-8 text-center md:mb-10 md:text-left">
                <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-text-muted/70">
                  Secure access
                </p>
                <h2 className="mt-3 text-3xl font-heading font-semibold text-accent-muted sm:text-4xl">
                  Sign In
                </h2>
                <p className="mt-3 text-base text-text-muted">
                  Authenticate with your registered email and password.
                </p>
              </div>

              <form onSubmit={submitForm} className="space-y-6">
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
                </div>

                <button
                  type="submit"
                  disabled={loadingBtn}
                  className="mt-3 w-full rounded-2xl bg-accent px-6 py-4 text-base font-bold text-[#00382f] transition-colors duration-300 hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-80"
                >
                  {loadingBtn ? "Initializing..." : "Initialize Session"}
                </button>
              </form>

              <p className="mt-8 text-center text-sm text-text-muted">
                Don&apos;t have an account?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-accent hover:text-accent-hover"
                >
                  Create one
                </Link>
              </p>
            </div>
          </section>
        </div>
      </section>

      {modal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setModal({ open: false, message: '' })}
        >
          <div
            className="w-[350px] rounded-[2rem] border border-white/10 bg-[rgba(18,18,18,0.95)] p-6 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <XCircle className="mx-auto mb-3 h-10 w-10 text-red-400" />

            <h2 className="text-lg font-heading font-semibold text-text-primary mb-1">
              Login Failed
            </h2>

            <p className="text-sm text-text-muted mb-4">
              {modal.message}
            </p>

            <button
              onClick={() => setModal({ open: false, message: '' })}
              className="w-full rounded-lg bg-accent hover:bg-accent-hover py-2 font-medium text-bg transition-colors"
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
