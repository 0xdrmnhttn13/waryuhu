import React, { useState, useEffect, useRef } from "react"
import {
  Swords,
  Ticket,
  Users,
  Trophy,
  RefreshCw,
  Flame,
  Zap,
  Ban,
  Clock,
} from "lucide-react"
import { supabase } from "./supabaseClient"

const STORAGE_KEY = "waryuhu:queue"
const DEVICE_ID_KEY = "waryuhu:deviceId"
const MAX_QUEUE_SIZE = 10

const WHITELISTED_USERS = [
  "Wahyudi",
  "Silvia Phungky",
  "Aditya Brahmayoga",
  "Mira Iskarnita A",
  "Reno Rizdano",
  "Fadilla Tourizqua Zain",
  "Teguh Riyanto",
  "Karina Nuzul Fitria",
  "Anis Ferisa Nurlistiani",
  "Yesty Desca Refita Putri",
  "Widya Sitaresmi",
  "Rafli Putra",
  "Ilyyas Sukmadjarna",
  "Joshua Pohan",
  "Muhammad Yuka Langbuana",
  "Rizky Muhammad Reza",
  "Muhammad Revy Saladdin",
  "Said Muhammad Yahya",
  "Ruth Marlina Hutabarat",
  "Hendra Nugraha",
  "Ayodhia Tri Harmanto",
  "Marsel Widjaja",
  "Ari Arsadi",
  "Irfan Asidiq",
  "Handik Yuwono",
  "Michael Sotaronggal Manurung",
  "Rezha Satria",
  "Ivan Julius Liefrance",
  "Yulia Melda",
  "Poppy Buana Mega Putri",
  "Muhammad Ahadian Razzaq",
  "Paramita Sari",
  "Rheco Paradhika Kusuma",
  "Rifqi Dika Hamana",
  "Gagah Kharismanuary",
  "Andi Danca Prima Raharja",
  "Achmad Fauzi",
  "Hakki Haromain",
  "Aditya Fabio Hariawan",
  "Hendra Pria Utama",
  "Alfina Megasiwi",
  "Rafli Hidayat",
  "Nur Choirudin",
  "Muhammad Noor",
  "Sri Wahyuni",
  "Muhammad Afifuddin Al Rasyid",
  "Aliffia Permata Sakarosa",
  "Carmudi",
  "Eko Fajar Putra",
  "Daniel Henry",
  "Meidiana Monica",
  "Marsha Nayla Zulkarnain",
  "Alya Natasha Andriani",
  "Wresni Wahyu Widodo",
  "I Putu Wisnuadi Prabawa Bukian",
  "Alvin Lander",
  "Hollyana Puteri Haryono",
  "M Sidik Augi Rahmat",
  "Thariq Alfa Benriska",
  "Muhammad Husein",
  "Hendy Arin Wijaya",
  "Aldyaz Gusti Nugroho",
  "Kadek Wikananda Laksmana Priambada",
  "Adrianto Prasetyo",
  "Haris Saputra",
  "Tia Sarwoedhi Pratama",
  "Adam Afgani",
  "Ibnu Bagus Syahputra",
  "Fatah Fadhlurrohman",
  "Ariyanto Sani",
  "Valerian Mahdi Pratama",
  "Ario Hardi Wibowo",
  "Davin Suteja",
  "Made Arbi Parameswara",
  "Rahmah Nur Rizki",
  "Rio Arjuna",
  "Rivaldo Fernandes",
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

const getCountdown = (hour) => {
  const now = new Date()
  const target = new Date()
  target.setHours(hour, 0, 0, 0)
  // Kalau sudah lewat jam buka hari ini, hitung ke besok
  if (now.getHours() < hour && now >= target) target.setDate(target.getDate() + 1)
  const diff = target - now
  if (diff <= 0) return "00:00:00"
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

export default function WarYuhuUser() {
  const [queue, setQueue] = useState([])
  const [name, setName] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [openHour, setOpenHour] = useState(17)
  const [submitting, setSubmitting] = useState(false)
  const [lastTicket, setLastTicket] = useState(null)
  const [error, setError] = useState("")
  const [deviceId] = useState(getDeviceId())
  const [countdown, setCountdown] = useState("")
  const [canRegister, setCanRegister] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    loadQueue()
    loadSettings()
    const channel = supabase
      .channel("queue-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "queue" }, () => {
        loadQueue()
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "settings" }, () => {
        loadSettings()
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    const check = () => {
      const isOpen = new Date().getHours() >= openHour
      setCanRegister(isOpen)
      if (!isOpen) setCountdown(getCountdown(openHour))
    }
    check()
    const timer = setInterval(check, 1000)
    return () => clearInterval(timer)
  }, [openHour])

  const loadSettings = async () => {
    try {
      const { data } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "queue_open_hour")
        .single()
      if (data) setOpenHour(parseInt(data.value))
    } catch {
      // fallback to default 17
    }
  }

  const loadQueue = async () => {
    try {
      const { data, error } = await supabase
        .from("queue")
        .select("*")
        .order("ticket", { ascending: true })

      if (error) {
        const raw = localStorage.getItem(STORAGE_KEY)
        setQueue(raw ? JSON.parse(raw) : [])
        return
      }
      setQueue(data || [])
    } catch {
      const raw = localStorage.getItem(STORAGE_KEY)
      setQueue(raw ? JSON.parse(raw) : [])
    }
  }

  const getNextTicketNumber = () => {
    return queue.length + 1
  }

  const hasDeviceRegistered = () => {
    return queue.some((entry) => entry.deviceId === deviceId)
  }

  const hasNameRegistered = (n) => {
    return queue.some((entry) => entry.displayName === n || entry.name === n)
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

  const handleSubmit = async () => {
    setError("")

    if (!canRegister) {
      setError(`Pendaftaran hanya bisa jam ${String(openHour).padStart(2, "0")}:00!`)
      return
    }

    if (!name.trim()) {
      setError("Pilih nama dari daftar!")
      return
    }

    if (!WHITELISTED_USERS.includes(name.trim())) {
      setError("Nama tidak ada di daftar! Pilih dari rekomendasi.")
      return
    }

    setSubmitting(true)
    try {
      // Fresh check dari DB sebelum insert
      const { data: freshQueue, error: fetchError } = await supabase
        .from("queue")
        .select("*")
        .order("ticket", { ascending: true })

      if (fetchError) {
        setError("Gagal cek antrian, coba lagi!")
        setSubmitting(false)
        return
      }

      if (freshQueue.length >= MAX_QUEUE_SIZE) {
        setError("Queue penuh! Maksimal 10 orang.")
        await loadQueue()
        setSubmitting(false)
        return
      }

      if (freshQueue.some((e) => e.deviceId === deviceId)) {
        setError("Lo udah daftar! Satu device cuma bisa ambil satu tiket.")
        await loadQueue()
        setSubmitting(false)
        return
      }

      if (freshQueue.some((e) => e.displayName === name.trim() || e.name === name.trim())) {
        setError(`${name} udah ada yang ambil! Pilih nama lain.`)
        await loadQueue()
        setSubmitting(false)
        return
      }

      const isWahyudi = name.trim().toLowerCase() === "wahyudi"
      let ticketNumber

      if (isWahyudi) {
        const wahyudiExists = freshQueue.some(
          (e) => e.displayName?.toLowerCase() === "wahyudi" || e.name?.toLowerCase() === "wahyudi"
        )
        if (wahyudiExists) {
          setError("Wahyudi udah ada di queue!")
          setSubmitting(false)
          return
        }
        ticketNumber = 1

        const { error: updateError } = await supabase
          .from("queue")
          .update({ ticket: freshQueue.length + 1 })
          .gte("ticket", 1)

        if (updateError) {
          console.error("Error updating tickets:", updateError)
        }
      } else {
        ticketNumber = freshQueue.length + 1
      }

      const entry = {
        ticket: ticketNumber,
        name: name.trim(),
        displayName: name.trim(),
        timestamp: new Date().toISOString(),
        deviceId: deviceId,
        priority: isWahyudi ? 1 : 0,
      }

      const { error: insertError } = await supabase.from("queue").insert([entry])

      if (insertError) {
        console.error("Insert error:", insertError)
        setError(`DB Error: ${insertError.message}`)
        setSubmitting(false)
        return
      } else {
        await loadQueue()
      }

      setLastTicket(entry)
      setName("")
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

  const suggestions = WHITELISTED_USERS.filter(
    (n) =>
      !hasNameRegistered(n) &&
      (name.trim() === "" || n.toLowerCase().includes(name.toLowerCase()))
  ).slice(0, 8)

  const isQueueFull = queue.length >= MAX_QUEUE_SIZE

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
            <span>
              {queue.length}/{MAX_QUEUE_SIZE} prajurit terdaftar
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {canRegister ? (
                <span className="text-yellow-500 font-bold animate-pulse">PERANG DIMULAI!</span>
              ) : (
                <span>Buka dalam <span className="text-yellow-500 tabular-nums font-bold">{countdown}</span></span>
              )}
            </span>
          </div>
        </div>

        {isQueueFull && !hasDeviceRegistered() && (
          <div className="mb-6 text-center border-2 border-red-600 bg-red-950/40 py-4">
            <Ban className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <div className="text-red-400 text-sm uppercase tracking-widest">
              Queue Penuh! ({MAX_QUEUE_SIZE} orang)
            </div>
          </div>
        )}

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
                  <Clock className="w-10 h-10 text-red-500 mx-auto mb-3 animate-pulse" />
                  <div className="text-red-400 text-xs uppercase tracking-widest mb-3">
                    Perang dibuka jam {String(openHour).padStart(2, "0")}:00
                  </div>
                  <div
                    className="text-4xl font-black text-yellow-400 tabular-nums tracking-widest"
                    style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                  >
                    {countdown}
                  </div>
                  <div className="text-red-600/50 text-[10px] uppercase tracking-widest mt-2">
                    countdown to war
                  </div>
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
                      &gt; Nama Lo
                    </label>
                    <div className="relative">
                      <input
                        ref={inputRef}
                        type="text"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value)
                          setShowSuggestions(true)
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                        placeholder="Ketik nama lo..."
                        disabled={!canRegister || isQueueFull}
                        className="w-full bg-red-950/20 border border-red-800/50 text-red-100 px-4 py-3 focus:outline-none focus:border-yellow-500 focus:bg-red-950/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-red-800/50"
                      />
                      {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute z-10 w-full bg-[#120505] border border-red-800/50 border-t-0 max-h-48 overflow-y-auto">
                          {suggestions.map((n) => (
                            <div
                              key={n}
                              onMouseDown={() => {
                                setName(n)
                                setShowSuggestions(false)
                              }}
                              className="px-4 py-2 text-red-100 text-sm hover:bg-red-950/60 cursor-pointer border-b border-red-900/20"
                            >
                              {n}
                            </div>
                          ))}
                        </div>
                      )}
                      {showSuggestions && name.trim() !== "" && suggestions.length === 0 && (
                        <div className="absolute z-10 w-full bg-[#120505] border border-red-800/50 border-t-0 px-4 py-2 text-red-500 text-xs uppercase tracking-widest">
                          Nama tidak ditemukan
                        </div>
                      )}
                    </div>
                  </div>

                  {error && (
                    <div className="text-red-400 text-xs uppercase tracking-widest border-l-2 border-red-500 pl-3 py-1">
                      [!] {error}
                    </div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !canRegister || !name.trim() || isQueueFull}
                    className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-yellow-500 hover:to-red-600 text-black font-black uppercase tracking-[0.25em] py-4 text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-red-500 hover:border-yellow-400 shadow-lg shadow-red-900/50"
                  >
                    {submitting ? "▸ PROSES..." : "▸ ANTRI YUHU"}
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
                  <div className="text-red-200 text-sm mt-2">
                    {lastTicket.displayName || lastTicket.name}
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
                  Yuhu Tersisa
                </div>
                <div
                  className={`text-3xl font-black ${MAX_QUEUE_SIZE - queue.length <= 2 ? "text-red-500" : "text-yellow-500"}`}
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                  {String(MAX_QUEUE_SIZE - queue.length).padStart(2, "0")}
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
                    Antrian Yuhu
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
                    Belum ada yang antri
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
