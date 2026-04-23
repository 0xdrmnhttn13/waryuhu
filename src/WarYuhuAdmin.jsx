import React, { useState, useEffect } from "react"
import {
  Users,
  Trophy,
  RefreshCw,
  LogOut,
  Shield,
  Trash2,
  ArrowUp,
  ArrowDown,
  Crown,
  Clock,
  Save,
  Search,
} from "lucide-react"
import { supabase } from "./supabaseClient"

const MAX_QUEUE_SIZE = 10

export default function WarYuhuAdmin() {
  const [queue, setQueue] = useState([])
  const [openHour, setOpenHour] = useState(17)
  const [openHourInput, setOpenHourInput] = useState("17")
  const [savingTime, setSavingTime] = useState(false)
  const [timeSaved, setTimeSaved] = useState(false)
  const [search, setSearch] = useState("")

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

  const filteredQueue = queue.filter((e) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      (e.displayName || e.name || "").toLowerCase().includes(q) ||
      (e.deviceId || "").toLowerCase().includes(q)
    )
  })

  return (
    <div style={{ minHeight: "100vh", fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif", position: "relative", background: "#0D0D0D" }}>

      {/* MBG Background */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: "url('/bg-mbg.jpg')",
        backgroundSize: "cover", backgroundPosition: "center", opacity: 0.12,
      }} />
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "linear-gradient(160deg, rgba(255,140,0,0.10) 0%, rgba(40,167,69,0.08) 60%, rgba(28,171,226,0.08) 100%)",
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: "900px", margin: "0 auto", padding: "24px 20px" }}>

        {/* Header */}
        <div style={{
          background: "#1A1A1A", borderRadius: "20px", padding: "18px 28px", marginBottom: "20px",
          boxShadow: "0 2px 16px rgba(0,0,0,0.5)", display: "flex", alignItems: "center",
          justifyContent: "space-between", flexWrap: "wrap", gap: "12px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{
              width: "48px", height: "48px", borderRadius: "13px",
              background: "linear-gradient(135deg, #F26A21, #E8A020)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px",
            }}>🍱</div>
            <div>
              <div style={{ fontSize: "22px", fontWeight: "800", color: "#EFEFEF", lineHeight: 1 }}>
                War<span style={{ color: "#F26A21" }}>YUHUUU</span>
              </div>
              <div style={{ fontSize: "10px", color: "#666666", textTransform: "uppercase", letterSpacing: "1.5px", marginTop: "2px" }}>
                Program Makan Bergizi Gratis
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{
              display: "flex", alignItems: "center", gap: "5px",
              background: "#2A1800", color: "#F26A21", padding: "5px 12px",
              borderRadius: "8px", fontSize: "12px", fontWeight: "700",
            }}>
              <Shield size={12} /> Admin
            </span>
            <button
              onClick={handleLogout}
              style={{
                display: "flex", alignItems: "center", gap: "5px",
                background: "#1A1A1A", border: "1.5px solid #2E2E2E", color: "#777777",
                padding: "5px 12px", borderRadius: "8px", fontSize: "12px",
                cursor: "pointer", fontWeight: "600",
              }}
            >
              <LogOut size={12} /> Logout
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "18px" }}>
          <div style={{ background: "#1A1A1A", borderRadius: "14px", padding: "18px", boxShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
            <div style={{ fontSize: "10px", color: "#666666", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Total Peserta</div>
            <div style={{ fontSize: "30px", fontWeight: "800", color: "#1CABE2", fontFamily: "monospace" }}>
              {String(queue.length).padStart(3, "0")}
            </div>
          </div>
          <div style={{ background: "#1A1A1A", borderRadius: "14px", padding: "18px", boxShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
            <div style={{ fontSize: "10px", color: "#666666", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Slot Tersisa</div>
            <div style={{
              fontSize: "30px", fontWeight: "800", fontFamily: "monospace",
              color: MAX_QUEUE_SIZE - queue.length <= 2 ? "#EF5350" : "#28A745",
            }}>
              {String(MAX_QUEUE_SIZE - queue.length).padStart(2, "0")}
            </div>
          </div>
        </div>

        {/* Open hour setting */}
        <div style={{
          background: "#1A1A1A", borderRadius: "16px", padding: "18px 24px",
          marginBottom: "18px", boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
            <Clock size={15} color="#F26A21" />
            <span style={{ fontSize: "13px", fontWeight: "700", color: "#DDDDDD", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Jam Buka Antrian
            </span>
            <span style={{ fontSize: "12px", color: "#444444", marginLeft: "auto" }}>
              Sekarang: {String(openHour).padStart(2, "0")}:00
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <input
              type="number" min="0" max="23"
              value={openHourInput}
              onChange={(e) => setOpenHourInput(e.target.value)}
              style={{
                width: "72px", padding: "9px 12px", textAlign: "center",
                border: "1.5px solid #2E2E2E", borderRadius: "8px",
                fontSize: "16px", fontWeight: "700", color: "#DDDDDD", outline: "none",
              }}
            />
            <span style={{ color: "#666666", fontSize: "14px" }}>:00</span>
            <button
              onClick={handleSaveOpenHour}
              disabled={savingTime}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "9px 16px",
                background: timeSaved ? "#E8F5E9" : "linear-gradient(135deg, #F26A21, #E85D0E)",
                border: "none", borderRadius: "8px",
                color: timeSaved ? "#2E7D32" : "white",
                fontWeight: "600", fontSize: "13px",
                cursor: savingTime ? "not-allowed" : "pointer",
                opacity: savingTime ? 0.7 : 1,
              }}
            >
              <Save size={13} />
              {savingTime ? "Menyimpan..." : timeSaved ? "Tersimpan!" : "Simpan"}
            </button>
            <span style={{ fontSize: "11px", color: "#3F3F3F" }}>0–23</span>
          </div>
        </div>

        {/* Queue list */}
        <div style={{ background: "#1A1A1A", borderRadius: "20px", boxShadow: "0 2px 16px rgba(0,0,0,0.5)", overflow: "hidden" }}>
          {/* List header */}
          <div style={{
            padding: "16px 24px", borderBottom: "1.5px solid #252525",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "#161616", flexWrap: "wrap", gap: "10px",
          }}>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "#DDDDDD", display: "flex", alignItems: "center", gap: "8px" }}>
              <Users size={15} color="#1CABE2" />
              Daftar Antrian
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button
                onClick={loadQueue}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#444444", padding: "4px" }}
                title="Refresh"
              >
                <RefreshCw size={15} />
              </button>
              {queue.length > 0 && (
                <button
                  onClick={handleReset}
                  style={{
                    display: "flex", alignItems: "center", gap: "5px",
                    padding: "6px 12px", background: "#2A0808",
                    border: "1.5px solid #5A1010", borderRadius: "8px",
                    color: "#EF5350", fontSize: "12px", fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  <Trash2 size={12} /> Reset Semua
                </button>
              )}
            </div>
          </div>

          {/* Search bar */}
          <div style={{ padding: "12px 24px", borderBottom: "1px solid #F3F4F6", background: "#161616" }}>
            <div style={{ position: "relative" }}>
              <Search size={14} color="#CCC" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama atau device ID..."
                style={{
                  width: "100%", padding: "9px 12px 9px 34px",
                  border: "1.5px solid #2E2E2E", borderRadius: "8px",
                  fontSize: "13px", color: "#DDDDDD", outline: "none", boxSizing: "border-box",
                  background: "#1A1A1A",
                }}
              />
            </div>
          </div>

          {queue.length === 0 ? (
            <div style={{ padding: "60px 24px", textAlign: "center" }}>
              <div style={{ fontSize: "40px", marginBottom: "10px" }}>🍽️</div>
              <div style={{ color: "#555555", fontSize: "14px" }}>Antrian kosong</div>
            </div>
          ) : filteredQueue.length === 0 ? (
            <div style={{ padding: "40px 24px", textAlign: "center", color: "#444444", fontSize: "13px" }}>
              Tidak ada hasil untuk "{search}"
            </div>
          ) : (
            <div style={{ maxHeight: "600px", overflowY: "auto" }}>
              {filteredQueue.map((entry, idx) => {
                const isWahyudi =
                  entry.displayName?.toLowerCase() === "wahyudi" ||
                  entry.name?.toLowerCase() === "wahyudi"
                const realIdx = queue.findIndex((e) => e.ticket === entry.ticket)
                return (
                  <div
                    key={entry.ticket}
                    style={{
                      display: "flex", alignItems: "center", gap: "12px",
                      padding: "13px 24px", borderBottom: "1px solid #222222",
                      background: realIdx === 0 ? "#1A1800" : "#1A1A1A",
                      transition: "background 0.15s",
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = "#252525"}
                    onMouseOut={(e) => e.currentTarget.style.background = realIdx === 0 ? "#FFFBF5" : "white"}
                  >
                    {/* Rank */}
                    <div style={{ width: "28px", textAlign: "center", flexShrink: 0 }}>
                      {realIdx === 0 ? (
                        isWahyudi
                          ? <Crown size={17} color="#F26A21" />
                          : <Trophy size={17} color="#F26A21" />
                      ) : (
                        <span style={{ fontSize: "12px", fontWeight: "700", color: "#3F3F3F" }}>
                          {String(realIdx + 1).padStart(2, "0")}
                        </span>
                      )}
                    </div>

                    {/* Ticket */}
                    <div style={{ minWidth: "56px", flexShrink: 0 }}>
                      <span style={{
                        fontSize: "18px", fontWeight: "800", fontFamily: "monospace",
                        color: realIdx === 0 ? "#F26A21" : "#1CABE2",
                      }}>
                        #{String(entry.ticket).padStart(3, "0")}
                      </span>
                    </div>

                    {/* Name */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "#EFEFEF", display: "flex", alignItems: "center", gap: "6px" }}>
                        {entry.displayName || entry.name}
                        {isWahyudi && (
                          <span style={{
                            fontSize: "10px", background: "#2A1800", color: "#F26A21",
                            padding: "2px 6px", borderRadius: "4px", fontWeight: "700",
                          }}>VIP</span>
                        )}
                      </div>
                      {search && (entry.deviceId || "").toLowerCase().includes(search.toLowerCase()) && (
                        <div style={{ fontSize: "10px", color: "#444444", fontFamily: "monospace", marginTop: "2px" }}>
                          {entry.deviceId}
                        </div>
                      )}
                    </div>

                    {/* Time */}
                    <div style={{ fontSize: "11px", color: "#3F3F3F", fontFamily: "monospace", flexShrink: 0 }}>
                      {formatTime(entry.timestamp)}
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                      <button
                        onClick={() => handleMoveUp(entry)}
                        disabled={realIdx === 0}
                        title="Naikan"
                        style={{
                          background: "none", border: "none", cursor: realIdx === 0 ? "not-allowed" : "pointer",
                          color: realIdx === 0 ? "#DDD" : "#888", padding: "4px", borderRadius: "5px",
                        }}
                        onMouseOver={(e) => realIdx !== 0 && (e.currentTarget.style.background = "#252525")}
                        onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
                      >
                        <ArrowUp size={15} />
                      </button>
                      <button
                        onClick={() => handleMoveDown(entry)}
                        disabled={realIdx === queue.length - 1}
                        title="Turunkan"
                        style={{
                          background: "none", border: "none",
                          cursor: realIdx === queue.length - 1 ? "not-allowed" : "pointer",
                          color: realIdx === queue.length - 1 ? "#DDD" : "#888", padding: "4px", borderRadius: "5px",
                        }}
                        onMouseOver={(e) => realIdx !== queue.length - 1 && (e.currentTarget.style.background = "#252525")}
                        onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
                      >
                        <ArrowDown size={15} />
                      </button>
                      <button
                        onClick={() => handleRemove(entry)}
                        title="Hapus"
                        style={{
                          background: "none", border: "none", cursor: "pointer",
                          color: "#EF5350", padding: "4px", borderRadius: "5px",
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = "#2A0808"}
                        onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: "20px", fontSize: "12px", color: "#3F3F3F" }}>
          Admin dapat mengatur urutan antrian dengan tombol ↑ ↓
        </div>
      </div>

      <style>{`
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #1A1A1A; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #F26A21; }
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button { opacity: 0.3; }
      `}</style>
    </div>
  )
}
