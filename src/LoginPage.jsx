import React, { useState } from "react"
import { Swords, Lock, User, AlertCircle } from "lucide-react"

const ADMIN_USERNAME = "kelaminlakilaki"
const ADMIN_PASSWORD = "kelaminlakilaki"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    setTimeout(() => {
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        sessionStorage.setItem("waryuhu:admin", "true")
        window.location.hash = "#/admin/dashboard"
      } else {
        setError("Username atau password salah!")
      }
      setLoading(false)
    }, 500)
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center"
      style={{
        background: "radial-gradient(ellipse at top, #2a0a0a 0%, #0a0505 50%, #000 100%)",
        fontFamily: "'Space Mono', 'Courier New', monospace",
      }}
    >
      <div
        className="fixed inset-0 pointer-events-none opacity-20 mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9' /%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative w-full max-w-md px-6">
        <div className="text-center mb-8">
          <Swords className="w-16 h-16 text-red-500 mx-auto mb-4" strokeWidth={1.5} />
          <h1
            className="text-4xl font-black tracking-tighter"
            style={{
              background: "linear-gradient(180deg, #ff3b3b 0%, #8b0000 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontFamily: "'Bebas Neue', 'Arial Black', sans-serif",
            }}
          >
            WAR<span className="text-yellow-500">YUHU</span>
          </h1>
          <p className="text-red-300/60 text-xs tracking-[0.3em] uppercase mt-2">
            Berjuang hingga yuhu penghabisan
          </p>
        </div>

        <div
          className="border-2 border-red-900/40 bg-black/60 backdrop-blur p-8"
          style={{
            clipPath:
              "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))",
          }}
        >
          <div className="flex items-center gap-2 mb-6">
            <Lock className="w-5 h-5 text-yellow-500" />
            <h2 className="text-yellow-500 uppercase tracking-[0.25em] text-sm font-bold">
              Secure Login
            </h2>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-red-300/80 text-xs uppercase tracking-widest mb-2">
                &gt; Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-600/50" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-red-950/20 border border-red-800/50 text-red-100 px-4 py-3 pl-10 focus:outline-none focus:border-yellow-500 focus:bg-red-950/40 transition-all"
                  placeholder="Enter username"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-red-300/80 text-xs uppercase tracking-widest mb-2">
                &gt; Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-600/50" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-red-950/20 border border-red-800/50 text-red-100 px-4 py-3 pl-10 focus:outline-none focus:border-yellow-500 focus:bg-red-950/40 transition-all"
                  placeholder="Enter password"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-xs uppercase tracking-widest border-l-2 border-red-500 pl-3 py-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-yellow-500 hover:to-red-600 text-black font-black uppercase tracking-[0.25em] py-4 text-sm transition-all duration-300 disabled:opacity-50 border-2 border-red-500 hover:border-yellow-400 shadow-lg shadow-red-900/50"
            >
              {loading ? "▸ VERIFYING..." : "▸ ACCESS"}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <a
            href="#/"
            className="text-red-600/60 text-xs uppercase tracking-widest hover:text-red-400 transition-colors"
          >
            ← Back to Queue
          </a>
        </div>
      </div>

      <style>{`
        input::selection {
          background: rgba(234, 179, 8, 0.3);
        }
      `}</style>
    </div>
  )
}
