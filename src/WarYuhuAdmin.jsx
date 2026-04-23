import React, { useState, useEffect } from "react"
import {
  Swords,
  Users,
  Trophy,
  RefreshCw,
  Flame,
  LogOut,
  Shield,
  Trash2,
  ArrowUp,
  ArrowDown,
  Crown,
  Clock,
  Save,
} from "lucide-react"
import { supabase } from "./supabaseClient"

const MAX_QUEUE_SIZE = 10

export default function WarYuhuAdmin() {
  const [queue, setQueue] = useState([])
  const [openHour, setOpenHour] = useState(17)
  const [openHourInput, setOpenHourInput] = useState("17")
  const [savingTime, setSavingTime] = useState(false)
  const [timeSaved, setTimeSaved] = useState(false)

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem("waryuhu:admin")
    if (!isLoggedIn) {
      window.location.hash = "#/admin"
      return
    }
    loadQueue()
    loadSettings()
    const channel = supabase
      .channel("queue-changes-admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "queue" }, () => {
        loadQueue()
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleLogout = () => {
    sessionStorage.removeItem("waryuhu:admin")
    window.location.hash = "#/"
  }

  const loadSettings = async () => {
    try {
      const { data } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "queue_open_hour")
        .single()
      if (data) {
        setOpenHour(parseInt(data.value))
        setOpenHourInput(data.value)
      }
    } catch {
      // fallback to default
    }
  }

  const handleSaveOpenHour = async () => {
    const hour = parseInt(openHourInput)
    if (isNaN(hour) || hour < 0 || hour > 23) return
    setSavingTime(true)
    try {
      const { error } = await supabase
        .from("settings")
        .upsert({ key: "queue_open_hour", value: String(hour) }, { onConflict: "key" })
      if (error) throw error
      setOpenHour(hour)
      setTimeSaved(true)
      setTimeout(() => setTimeSaved(false), 2000)
    } catch (err) {
      console.error("Failed to save open hour:", err)
      alert("Gagal simpan: " + (err.message || err))
    } finally {
      setSavingTime(false)
    }
  }

  const loadQueue = async () => {
    try {
      const { data, error } = await supabase
        .from("queue")
        .select("*")
        .order("ticket", { ascending: true })

      if (error) throw error
      setQueue(data || [])
    } catch {
      setQueue([])
    }
  }

  const handleReset = async () => {
    if (!confirm("Yakin mau reset semua antrian? Data bakal ilang permanen.")) return
    const { error } = await supabase.from("queue").delete().gte("ticket", 0)
    if (error) {
      alert("Gagal reset: " + error.message)
      return
    }
    localStorage.removeItem("waryuhu:queue")
    setQueue([])
  }

  const handleMoveUp = async (entry) => {
    const idx = queue.findIndex((e) => e.ticket === entry.ticket)
    if (idx <= 0) return

    const prevEntry = queue[idx - 1]

    try {
      await supabase.from("queue").update({ ticket: prevEntry.ticket }).eq("ticket", entry.ticket)
      await supabase.from("queue").update({ ticket: entry.ticket }).eq("ticket", prevEntry.ticket)
      await loadQueue()
    } catch (err) {
      console.error(err)
    }
  }

  const handleMoveDown = async (entry) => {
    const idx = queue.findIndex((e) => e.ticket === entry.ticket)
    if (idx >= queue.length - 1) return

    const nextEntry = queue[idx + 1]

    try {
      await supabase.from("queue").update({ ticket: nextEntry.ticket }).eq("ticket", entry.ticket)
      await supabase.from("queue").update({ ticket: entry.ticket }).eq("ticket", nextEntry.ticket)
      await loadQueue()
    } catch (err) {
      console.error(err)
    }
  }

  const handleRemove = async (entry) => {
    if (!confirm(`Yakin mau hapus ${entry.displayName || entry.name}?`)) return

    try {
      await supabase.from("queue").delete().eq("ticket", entry.ticket)
      await loadQueue()
    } catch (err) {
      console.error(err)
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

      <div className="relative max-w-4xl mx-auto px-6 py-10">
        <div className="mb-10 border-b-2 border-red-900/50 pb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
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
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-yellow-500 text-xs uppercase tracking-widest border border-yellow-500/30 px-2 py-1">
                <Shield className="w-3 h-3" /> Admin
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-red-400/70 hover:text-red-400 text-xs uppercase tracking-widest border border-red-800/50 px-2 py-1 hover:border-red-500 transition-colors"
              >
                <LogOut className="w-3 h-3" /> Logout
              </button>
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
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
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
              Slot Tersisa
            </div>
            <div
              className={`text-3xl font-black ${MAX_QUEUE_SIZE - queue.length <= 2 ? "text-red-500" : "text-yellow-500"}`}
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              {String(MAX_QUEUE_SIZE - queue.length).padStart(2, "0")}
            </div>
          </div>
        </div>

        <div className="border border-yellow-500/20 bg-black/40 p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-yellow-500" />
            <span className="text-yellow-500 text-xs uppercase tracking-widest font-bold">
              Jam Buka Queue
            </span>
            <span className="text-red-500/50 text-xs ml-auto">
              Sekarang: {String(openHour).padStart(2, "0")}:00
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="0"
              max="23"
              value={openHourInput}
              onChange={(e) => setOpenHourInput(e.target.value)}
              className="w-20 bg-red-950/20 border border-red-800/50 text-red-100 px-3 py-2 text-center focus:outline-none focus:border-yellow-500 transition-all"
            />
            <span className="text-red-400/60 text-sm">:00</span>
            <button
              onClick={handleSaveOpenHour}
              disabled={savingTime}
              className="flex items-center gap-1 text-xs uppercase tracking-widest border border-yellow-500/50 text-yellow-500 px-3 py-2 hover:bg-yellow-500/10 disabled:opacity-50 transition-colors"
            >
              <Save className="w-3 h-3" />
              {savingTime ? "Saving..." : timeSaved ? "Saved!" : "Simpan"}
            </button>
            <span className="text-red-500/40 text-xs">0–23</span>
          </div>
        </div>

        <div className="border-2 border-red-900/40 bg-black/60 backdrop-blur">
          <div className="flex items-center justify-between border-b-2 border-red-900/40 px-5 py-3 bg-red-950/20">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-red-400" />
              <h2 className="text-red-300 uppercase tracking-[0.25em] text-xs font-bold">
                Garis Depan
              </h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={loadQueue}
                className="text-red-400/70 hover:text-yellow-500 transition-colors p-1"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              {queue.length > 0 && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 text-red-400/70 hover:text-red-500 text-[10px] uppercase tracking-widest border border-red-800/50 px-2 py-1 hover:border-red-500 transition-colors"
                >
                  <Trash2 className="w-3 h-3" /> Reset All
                </button>
              )}
            </div>
          </div>

          {queue.length === 0 ? (
            <div className="p-12 text-center">
              <Trophy className="w-12 h-12 text-red-900 mx-auto mb-3" strokeWidth={1} />
              <div className="text-red-500/60 uppercase tracking-widest text-xs">
                Belum ada yang war
              </div>
              <div className="text-red-800 text-xs mt-2">Antrian kosong</div>
            </div>
          ) : (
            <div className="max-h-[600px] overflow-y-auto">
              {queue.map((entry, idx) => {
                const isWahyudi =
                  entry.displayName?.toLowerCase() === "wahyudi" ||
                  entry.name?.toLowerCase() === "wahyudi"
                return (
                  <div
                    key={entry.ticket}
                    className={`flex items-center gap-2 px-5 py-4 border-b border-red-900/20 hover:bg-red-950/20 transition-colors ${
                      idx === 0 ? "bg-gradient-to-r from-yellow-500/10 to-transparent" : ""
                    }`}
                  >
                    <div className="w-8 text-center">
                      {idx === 0 ? (
                        isWahyudi ? (
                          <Crown className="w-5 h-5 text-yellow-500 mx-auto" />
                        ) : (
                          <Trophy className="w-5 h-5 text-yellow-500 mx-auto" />
                        )
                      ) : (
                        <span className="text-red-600/60 text-xs font-bold">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                      )}
                    </div>

                    <div className="min-w-[60px]">
                      <div
                        className={`text-xl font-black leading-none ${
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
                        {isWahyudi && <span className="text-yellow-500 text-xs ml-2">(VIP)</span>}
                      </div>
                    </div>

                    <div className="text-red-600/60 text-[10px] uppercase tracking-widest tabular-nums hidden sm:block">
                      {formatTime(entry.timestamp)}
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={() => handleMoveUp(entry)}
                        disabled={idx === 0}
                        className="text-red-400/70 hover:text-yellow-500 disabled:opacity-30 disabled:cursor-not-allowed p-1"
                        title="Move Up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMoveDown(entry)}
                        disabled={idx === queue.length - 1}
                        className="text-red-400/70 hover:text-yellow-500 disabled:opacity-30 disabled:cursor-not-allowed p-1"
                        title="Move Down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemove(entry)}
                        className="text-red-400/70 hover:text-red-500 p-1"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="mt-4 text-center text-red-500/60 text-xs uppercase tracking-widest">
          * Admin dapat mengatur urutan queue dengan tombol ↑ ↓
        </div>
      </div>

      <style>{`
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

        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          opacity: 0.3;
        }
      `}</style>
    </div>
  )
}
