import React, { useState, useEffect } from "react"
import { Swords, Ticket, Users, Trophy, RefreshCw, Flame, Zap, Ban, Clock } from "lucide-react"

const STORAGE_KEY = "waryuhu:queue"
const COUNTER_KEY = "waryuhu:counter"
const DEVICE_ID_KEY = "waryuhu:deviceId"

const WHITELISTED_USERS = [
  { displayName: "Wahyudi", jobTitle: "HEAD OF DIGITAL BUSINESS DIVISON" },
  { displayName: "Silvia Phungky", jobTitle: "Software Developers" },
  { displayName: "Aditya Brahmayoga", jobTitle: "Ui/Ux Designer" },
  { displayName: "Mira Iskarnita A", jobTitle: "HEAD OF UI/UX DEPARTMENT" },
  { displayName: "Reno Rizdano", jobTitle: "DIGITAL PRODUCT MANAGER" },
  { displayName: "Fadilla Tourizqua Zain", jobTitle: "Head Of Digital Marketing Department" },
  { displayName: "Teguh Riyanto", jobTitle: "GROWTH MARKETING OFFICER" },
  { displayName: "Karina Nuzul Fitria", jobTitle: "DIGITAL ACTIVATION OFFICER" },
  { displayName: "Anis Ferisa Nurlistiani", jobTitle: "DIGITAL PRODUCT MANAGER" },
  { displayName: "Yesty Desca Refita Putri", jobTitle: "GRAPHIC DESIGNER" },
  { displayName: "Widya Sitaresmi", jobTitle: "HEAD OF DIGITAL PRODUCT MANAGEMENT DEPARTMENT" },
  { displayName: "Rafli Putra", jobTitle: "Software Developers" },
  { displayName: "Ilyyas Sukmadjarna", jobTitle: "Software Developers" },
  { displayName: "Joshua Pohan", jobTitle: "Software Developers" },
  { displayName: "Muhammad Yuka Langbuana", jobTitle: "HEAD OF SOFTWARE DELIVERY DEPARTMENT" },
  { displayName: "Rizky Muhammad Reza", jobTitle: "Software Developers" },
  { displayName: "Muhammad Revy Saladdin", jobTitle: "BRANDING & ACQUISITION OFFICER" },
  { displayName: "Said Muhammad Yahya", jobTitle: "DIGITAL PRODUCT MANAGER" },
  { displayName: "Ruth Marlina Hutabarat", jobTitle: "Project Manager / Scrum Master" },
  { displayName: "Hendra Nugraha", jobTitle: "HEAD OF IT - OPERATIONAL DEPARTMENT" },
  { displayName: "Ayodhia Tri Harmanto", jobTitle: "IT SERVICE MANAGEMENT LEAD" },
  { displayName: "Marsel Widjaja", jobTitle: "Software Developers" },
  { displayName: "Ari Arsadi", jobTitle: "Software Developers" },
  { displayName: "Irfan Asidiq", jobTitle: "Software Developers" },
  { displayName: "Handik Yuwono", jobTitle: "AI SPECIALIST" },
  { displayName: "Michael Sotaronggal Manurung", jobTitle: "IT DATA SCIENTIST" },
  { displayName: "Rezha Satria", jobTitle: "HEAD OF BUSINESS ENABLEMENT DEPARTMENT" },
  { displayName: "Ivan Julius Liefrance", jobTitle: "DIGITAL PRODUCT MANAGER" },
  { displayName: "Yulia Melda", jobTitle: "DIGITAL PRODUCT MANAGER" },
  { displayName: "Poppy Buana Mega Putri", jobTitle: "IT Risk Management Officer" },
  { displayName: "Muhammad Ahadian Razzaq", jobTitle: "Business Analyst" },
  { displayName: "Paramita Sari", jobTitle: "DEPUTY HEAD OF DIGITAL BUSINESS DIVISON" },
  { displayName: "Rheco Paradhika Kusuma", jobTitle: "IT Data Scientist" },
  { displayName: "Rifqi Dika Hamana", jobTitle: "Software Developers" },
  { displayName: "Gagah Kharismanuary", jobTitle: "Software Developers" },
  { displayName: "Andi Danca Prima Raharja", jobTitle: "Software Developers" },
  { displayName: "Achmad Fauzi", jobTitle: "Software Developers" },
  { displayName: "Hakki Haromain", jobTitle: "Project Manager / Scrum Master" },
  { displayName: "Aditya Fabio Hariawan", jobTitle: "Software Developers" },
  { displayName: "Hendra Pria Utama", jobTitle: "Software Developers" },
  { displayName: "Alfina Megasiwi", jobTitle: "Software Developers" },
  { displayName: "Rafli Hidayat", jobTitle: "Ui/Ux Designer" },
  { displayName: "Nur Choirudin", jobTitle: "Software Developers" },
  { displayName: "Muhammad Noor", jobTitle: "IOS DEVELOPER" },
  { displayName: "Sri Wahyuni", jobTitle: "Software Developers" },
  { displayName: "Muhammad Afifuddin Al Rasyid", jobTitle: "Software Developers" },
  { displayName: "Aliffia Permata Sakarosa", jobTitle: "IT Data Analyst" },
  { displayName: "Carmudi", jobTitle: "Software Developers" },
  { displayName: "Eko Fajar Putra", jobTitle: "Software Developers" },
  { displayName: "Daniel Henry", jobTitle: "Software Developers" },
  { displayName: "Meidiana Monica", jobTitle: "Software Developers" },
  { displayName: "Marsha Nayla Zulkarnain", jobTitle: "BRANDING & ACQUISITION OFFICER" },
  { displayName: "Alya Natasha Andriani", jobTitle: "BRANDING & ACQUISITION OFFICER" },
  { displayName: "Wresni Wahyu Widodo", jobTitle: "SOFTWARE DEVELOPERS" },
  { displayName: "I Putu Wisnuadi Prabawa Bukian", jobTitle: "Software Developers" },
  { displayName: "Alvin Lander", jobTitle: "Software Developers" },
  { displayName: "Hollyana Puteri Haryono", jobTitle: "IT DATA ANALYST" },
  { displayName: "M Sidik Augi Rahmat", jobTitle: "Software Developers" },
  { displayName: "Thariq Alfa Benriska", jobTitle: "SOFTWARE DEVELOPERS" },
  { displayName: "Muhammad Husein", jobTitle: "Software Developers" },
  { displayName: "Hendy Arin Wijaya", jobTitle: "PRODUCT MARKETING: CONTENT SPECIALIST" },
  { displayName: "Aldyaz Gusti Nugroho", jobTitle: "ANDROID DEVELOPER" },
  { displayName: "Kadek Wikananda Laksmana Priambada", jobTitle: "UI/UX Designer" },
  { displayName: "Adrianto Prasetyo", jobTitle: "FULLSTACK DEVELOPER" },
  { displayName: "Haris Saputra", jobTitle: "Fullstack Developer" },
  { displayName: "Tia Sarwoedhi Pratama", jobTitle: "ANDROID DEVELOPER" },
  { displayName: "Adam Afgani", jobTitle: "Business Analyst" },
  { displayName: "Ibnu Bagus Syahputra", jobTitle: "PROJECT MANAGER / SCRUM MASTER" },
  { displayName: "Fatah Fadhlurrohman", jobTitle: "ANDROID DEVELOPER" },
  { displayName: "Ariyanto Sani", jobTitle: "IOS DEVELOPER" },
  { displayName: "Valerian Mahdi Pratama", jobTitle: "IT Data Engineer" },
  { displayName: "Ario Hardi Wibowo", jobTitle: "Project Manager" },
  { displayName: "Davin Suteja", jobTitle: "Digital Product Manager" },
  { displayName: "Made Arbi Parameswara", jobTitle: "Data Engineer" },
  { displayName: "Rahmah Nur Rizki", jobTitle: "Data Analyst" },
  { displayName: "Rio Arjuna", jobTitle: "ANDROID DEVELOPER" },
  { displayName: "Rivaldo Fernandes", jobTitle: "IOS DEVELOPER" },
]

const generateDeviceId = () => {
  const timestamp = Date.now().toString(36)
  const randomPart = Math.random().toString(36).substring(2, 15)
  const navigatorInfo = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
  ].join("-")
  const hash = btoa(navigatorInfo).substring(0, 12)
  return `${timestamp}-${randomPart}-${hash}`
}

const getDeviceId = () => {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY)
  if (!deviceId) {
    deviceId = generateDeviceId()
    localStorage.setItem(DEVICE_ID_KEY, deviceId)
  }
  return deviceId
}

const isRegistrationTime = () => {
  const now = new Date()
  const hours = now.getHours()
  return hours === 17
}

const formatCurrentTime = () => {
  const now = new Date()
  return now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

export default function WarYuhuUser() {
  const [queue, setQueue] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [lastTicket, setLastTicket] = useState(null)
  const [error, setError] = useState("")
  const [deviceId] = useState(getDeviceId())
  const [currentTime, setCurrentTime] = useState(formatCurrentTime())
  const [canRegister, setCanRegister] = useState(isRegistrationTime())

  useEffect(() => {
    loadQueue()
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) loadQueue()
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(formatCurrentTime())
      setCanRegister(isRegistrationTime())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const loadQueue = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      setQueue(raw ? JSON.parse(raw) : [])
    } catch {
      setQueue([])
    }
  }

  const getNextTicketNumber = () => {
    const current = parseInt(localStorage.getItem(COUNTER_KEY) || "0", 10)
    const next = current + 1
    localStorage.setItem(COUNTER_KEY, String(next))
    return next
  }

  const hasDeviceRegistered = () => {
    return queue.some((entry) => entry.deviceId === deviceId)
  }

  const hasNameRegistered = (displayName) => {
    return queue.some((entry) => entry.displayName === displayName)
  }

  const getMyTicket = () => {
    return queue.find((entry) => entry.deviceId === deviceId)
  }

  useEffect(() => {
    const myTicket = getMyTicket()
    if (myTicket && !lastTicket) {
      setLastTicket(myTicket)
    }
  }, [queue])

  const handleSubmit = () => {
    setError("")

    if (!canRegister) {
      setError("Pendaftaran hanya bisa jam 17:00!")
      return
    }

    if (!selectedUser) {
      setError("Pilih nama dari daftar!")
      return
    }

    if (hasDeviceRegistered()) {
      setError("Lo udah daftar! Satu device cuma bisa ambil satu tiket.")
      return
    }

    if (hasNameRegistered(selectedUser.displayName)) {
      setError(`${selectedUser.displayName} udah ada yang ambil! Pilih nama lain.`)
      return
    }

    setSubmitting(true)
    try {
      const ticketNumber = getNextTicketNumber()
      const entry = {
        ticket: ticketNumber,
        displayName: selectedUser.displayName,
        jobTitle: selectedUser.jobTitle,
        timestamp: new Date().toISOString(),
        deviceId: deviceId,
      }

      const updated = [...queue, entry]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      setQueue(updated)
      setLastTicket(entry)
      setSelectedUser(null)
    } catch (err) {
      setError("Gagal daftar, coba lagi ya!")
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (iso) => {
    const d = new Date(iso)
    return d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const availableNames = WHITELISTED_USERS.filter((u) => !hasNameRegistered(u.displayName))

  return (
    <div
      className="min-h-screen w-full"
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

      <div className="relative max-w-6xl mx-auto px-6 py-10">
        <div className="mb-10 border-b-2 border-red-900/50 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <Swords className="w-10 h-10 text-red-500" strokeWidth={1.5} />
            <div>
              <h1
                className="text-5xl md:text-7xl font-black tracking-tighter leading-none"
                style={{
                  background: "linear-gradient(180deg, #ff3b3b 0%, #8b0000 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontFamily: "'Bebas Neue', 'Arial Black', sans-serif",
                  letterSpacing: "-0.02em",
                }}
              >
                WAR<span className="text-yellow-500">YUHU</span>
              </h1>
              <p className="text-red-300/60 text-xs md:text-sm tracking-[0.3em] uppercase mt-1">
                Berjuang hingga yuhu penghabisan
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-red-400/70 uppercase tracking-widest">
            <span className="flex items-center gap-1">
              <Flame className="w-3 h-3" /> Live Queue
            </span>
            <span>•</span>
            <span>{queue.length} prajurit terdaftar</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {currentTime}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <div
              className="relative p-6 border-2 border-red-900/40 bg-black/60 backdrop-blur"
              style={{
                clipPath:
                  "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))",
              }}
            >
              <div className="flex items-center gap-2 mb-6">
                <Zap className="w-5 h-5 text-yellow-500" />
                <h2 className="text-yellow-500 uppercase tracking-[0.25em] text-sm font-bold">
                  {hasDeviceRegistered() ? "Tiket Lo Udah Ada" : "Daftar Perang"}
                </h2>
              </div>

              {!canRegister && !hasDeviceRegistered() && (
                <div className="text-center py-6 mb-4 border-2 border-red-500/50 bg-red-950/30">
                  <Clock className="w-12 h-12 text-red-500 mx-auto mb-3 animate-pulse" />
                  <div className="text-red-400 text-sm uppercase tracking-widest">
                    Pendaftaran hanya jam 17:00
                  </div>
                  <div className="text-red-500/70 text-xs mt-2">Waktu now: {currentTime}</div>
                </div>
              )}

              {hasDeviceRegistered() ? (
                <div className="text-center py-4">
                  <Ban className="w-10 h-10 text-red-500 mx-auto mb-3" />
                  <div className="text-red-400 text-xs uppercase tracking-widest">
                    Satu device cuma bisa satu tiket
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-red-300/80 text-xs uppercase tracking-widest mb-2">
                      &gt; Pilih Nama
                    </label>
                    <select
                      value={selectedUser ? selectedUser.displayName : ""}
                      onChange={(e) => {
                        const user = WHITELISTED_USERS.find((u) => u.displayName === e.target.value)
                        setSelectedUser(user || null)
                      }}
                      disabled={!canRegister}
                      className="w-full bg-red-950/20 border border-red-800/50 text-red-100 px-4 py-3 focus:outline-none focus:border-yellow-500 focus:bg-red-950/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">-- Pilih nama lo --</option>
                      {availableNames.map((u) => (
                        <option key={u.displayName} value={u.displayName}>
                          {u.displayName} ({u.jobTitle})
                        </option>
                      ))}
                    </select>
                    {availableNames.length === 0 && canRegister && (
                      <div className="text-red-500 text-xs mt-2 uppercase tracking-widest">
                        Semua nama udah diambil!
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="text-red-400 text-xs uppercase tracking-widest border-l-2 border-red-500 pl-3 py-1">
                      [!] {error}
                    </div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !canRegister || !selectedUser}
                    className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-yellow-500 hover:to-red-600 text-black font-black uppercase tracking-[0.25em] py-4 text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-red-500 hover:border-yellow-400 shadow-lg shadow-red-900/50"
                  >
                    {submitting ? "▸ PROSES..." : "▸ AMBIL TIKET"}
                  </button>
                </div>
              )}

              {lastTicket && (
                <div
                  className="mt-6 p-4 border-2 border-yellow-500/60 bg-gradient-to-br from-yellow-500/10 to-red-900/20"
                  style={{
                    animation: "pulse-glow 2s ease-in-out infinite",
                  }}
                >
                  <div className="text-yellow-500/70 text-xs uppercase tracking-widest mb-1">
                    Tiket Lo:
                  </div>
                  <div className="flex items-baseline gap-3">
                    <Ticket className="w-6 h-6 text-yellow-500" />
                    <span
                      className="text-5xl font-black text-yellow-400"
                      style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                    >
                      #{String(lastTicket.ticket).padStart(3, "0")}
                    </span>
                  </div>
                  <div className="text-red-200 text-sm mt-2">{lastTicket.displayName}</div>
                  <div className="text-red-400/60 text-xs mt-1 uppercase tracking-widest">
                    {lastTicket.jobTitle}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="border border-red-900/40 bg-black/40 p-4">
                <div className="text-red-400/60 text-[10px] uppercase tracking-widest mb-1">
                  Total Pejuang
                </div>
                <div
                  className="text-3xl font-black text-red-400"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                  {String(queue.length).padStart(3, "0")}
                </div>
              </div>
              <div className="border border-red-900/40 bg-black/40 p-4">
                <div className="text-red-400/60 text-[10px] uppercase tracking-widest mb-1">
                  Tersedia
                </div>
                <div
                  className="text-3xl font-black text-yellow-500"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                  {String(availableNames.length).padStart(2, "0")}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="border-2 border-red-900/40 bg-black/60 backdrop-blur">
              <div className="flex items-center justify-between border-b-2 border-red-900/40 px-5 py-3 bg-red-950/20">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-red-400" />
                  <h2 className="text-red-300 uppercase tracking-[0.25em] text-xs font-bold">
                    Garis Depan
                  </h2>
                </div>
                <button
                  onClick={loadQueue}
                  className="text-red-400/70 hover:text-yellow-500 transition-colors p-1"
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {queue.length === 0 ? (
                <div className="p-12 text-center">
                  <Trophy className="w-12 h-12 text-red-900 mx-auto mb-3" strokeWidth={1} />
                  <div className="text-red-500/60 uppercase tracking-widest text-xs">
                    Belum ada yang war
                  </div>
                  <div className="text-red-800 text-xs mt-2">Jadilah yang pertama!</div>
                </div>
              ) : (
                <div className="max-h-[600px] overflow-y-auto">
                  {queue.map((entry, idx) => (
                    <div
                      key={entry.ticket}
                      className={`flex items-center gap-4 px-5 py-4 border-b border-red-900/20 hover:bg-red-950/20 transition-colors ${
                        idx === 0 ? "bg-gradient-to-r from-yellow-500/10 to-transparent" : ""
                      }`}
                    >
                      <div className="w-10 text-center">
                        {idx === 0 ? (
                          <Trophy className="w-5 h-5 text-yellow-500 mx-auto" />
                        ) : (
                          <span className="text-red-600/60 text-xs font-bold">
                            {String(idx + 1).padStart(2, "0")}
                          </span>
                        )}
                      </div>

                      <div className="min-w-[80px]">
                        <div
                          className={`text-2xl font-black leading-none ${
                            idx === 0 ? "text-yellow-400" : "text-red-400"
                          }`}
                          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                        >
                          #{String(entry.ticket).padStart(3, "0")}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="text-red-100 font-bold truncate">
                          {entry.displayName || entry.name}
                        </div>
                        <div className="text-red-500/70 text-xs uppercase tracking-widest truncate">
                          {entry.jobTitle || entry.department || ""}
                        </div>
                      </div>

                      <div className="text-red-600/60 text-[10px] uppercase tracking-widest tabular-nums hidden sm:block">
                        {formatTime(entry.timestamp)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a
            href="#/admin"
            className="text-red-600/60 text-xs uppercase tracking-widest hover:text-red-400 transition-colors"
          >
            Admin Login
          </a>
        </div>
      </div>

      <style>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(234, 179, 8, 0.2); }
          50% { box-shadow: 0 0 40px rgba(234, 179, 8, 0.4); }
        }

        select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23ef4444' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          background-size: 16px;
        }

        select option {
          background: #1a0a0a;
          color: #fef2f2;
        }

        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(185, 28, 28, 0.4);
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(234, 179, 8, 0.6);
        }
      `}</style>
    </div>
  )
}
