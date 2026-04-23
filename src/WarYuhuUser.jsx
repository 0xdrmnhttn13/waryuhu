import React, { useState, useEffect, useRef } from "react"
import { Users, Ticket, Trophy, RefreshCw, Clock, X, CheckCircle, Sun, Moon } from "lucide-react"
import confetti from "canvas-confetti"
import { supabase } from "./supabaseClient"

const STORAGE_KEY = "waryuhu:queue"
const DEVICE_ID_KEY = "waryuhu:deviceId"
const MAX_QUEUE_SIZE = 10

const WHITELISTED_USERS = [
  "Wahyudi","Silvia Phungky","Aditya Brahmayoga","Mira Iskarnita A","Reno Rizdano",
  "Fadilla Tourizqua Zain","Teguh Riyanto","Karina Nuzul Fitria","Anis Ferisa Nurlistiani",
  "Yesty Desca Refita Putri","Widya Sitaresmi","Rafli Putra","Ilyyas Sukmadjarna",
  "Joshua Pohan","Muhammad Yuka Langbuana","Rizky Muhammad Reza","Muhammad Revy Saladdin",
  "Said Muhammad Yahya","Ruth Marlina Hutabarat","Hendra Nugraha","Ayodhia Tri Harmanto",
  "Marsel Widjaja","Ari Arsadi","Irfan Asidiq","Handik Yuwono",
  "Michael Sotaronggal Manurung","Rezha Satria","Ivan Julius Liefrance","Yulia Melda",
  "Poppy Buana Mega Putri","Muhammad Ahadian Razzaq","Paramita Sari","Rheco Paradhika Kusuma",
  "Rifqi Dika Hamana","Gagah Kharismanuary","Andi Danca Prima Raharja","Achmad Fauzi",
  "Hakki Haromain","Aditya Fabio Hariawan","Hendra Pria Utama","Alfina Megasiwi",
  "Rafli Hidayat","Nur Choirudin","Muhammad Noor","Sri Wahyuni",
  "Muhammad Afifuddin Al Rasyid","Aliffia Permata Sakarosa","Carmudi","Eko Fajar Putra",
  "Daniel Henry","Meidiana Monica","Marsha Nayla Zulkarnain","Alya Natasha Andriani",
  "Wresni Wahyu Widodo","I Putu Wisnuadi Prabawa Bukian","Alvin Lander",
  "Hollyana Puteri Haryono","M Sidik Augi Rahmat","Thariq Alfa Benriska","Muhammad Husein",
  "Hendy Arin Wijaya","Aldyaz Gusti Nugroho","Kadek Wikananda Laksmana Priambada",
  "Adrianto Prasetyo","Haris Saputra","Tia Sarwoedhi Pratama","Adam Afgani",
  "Ibnu Bagus Syahputra","Fatah Fadhlurrohman","Ariyanto Sani","Valerian Mahdi Pratama",
  "Ario Hardi Wibowo","Davin Suteja","Made Arbi Parameswara","Rahmah Nur Rizki",
  "Rio Arjuna","Rivaldo Fernandes",
]

const generateDeviceId = () => {
  const timestamp = Date.now().toString(36)
  const randomPart = Math.random().toString(36).substring(2, 15)
  const navigatorInfo = [navigator.userAgent, navigator.language, screen.width, screen.height, new Date().getTimezoneOffset()].join("-")
  return `${timestamp}-${randomPart}-${btoa(navigatorInfo).substring(0, 12)}`
}

const getDeviceId = () => {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY)
  if (!deviceId) { deviceId = generateDeviceId(); localStorage.setItem(DEVICE_ID_KEY, deviceId) }
  return deviceId
}

const getCountdown = (hour) => {
  const now = new Date()
  const target = new Date()
  target.setHours(hour, 0, 0, 0)
  if (now.getHours() < hour && now >= target) target.setDate(target.getDate() + 1)
  const diff = target - now
  if (diff <= 0) return "00:00:00"
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

const DARK = {
  bg: "#0D0D0D", card: "#1A1A1A", card2: "#161616", card3: "#252525",
  inputBg: "#252525", inputDisabled: "#141414",
  t1: "#EFEFEF", t2: "#DDDDDD", t3: "#AAAAAA", t4: "#888888", t5: "#666666", t6: "#3F3F3F",
  border: "#2E2E2E", border2: "#252525", border3: "#222222",
  orangeBg: "#2A1800", greenBg: "#0A200A", redBg: "#2A0808",
  ownBg: "#0A1E10", firstBg: "#1A1800",
  shadow1: "0 2px 16px rgba(0,0,0,0.55)", shadow2: "0 2px 8px rgba(0,0,0,0.45)",
  green: "#66BB6A", red: "#EF5350", orange: "#FFA040",
  suggHover: "#2A1800", rowHover: "#252525",
}
const LIGHT = {
  bg: "#F5F1EA", card: "#FFFFFF", card2: "#FAFAFA", card3: "#F3F4F6",
  inputBg: "#FFFFFF", inputDisabled: "#F9F9F9",
  t1: "#1A1A1A", t2: "#333333", t3: "#555555", t4: "#666666", t5: "#999999", t6: "#CCCCCC",
  border: "#E5E7EB", border2: "#F3F4F6", border3: "#F5F5F5",
  orangeBg: "#FFF3E0", greenBg: "#E8F5E9", redBg: "#FFEBEE",
  ownBg: "#F1FBF4", firstBg: "#FFFBF5",
  shadow1: "0 2px 16px rgba(0,0,0,0.08)", shadow2: "0 2px 8px rgba(0,0,0,0.06)",
  green: "#2E7D32", red: "#C62828", orange: "#E65100",
  suggHover: "#FFF3E0", rowHover: "#F9F9F9",
}

const HOW_TO_STEPS = [
  {
    step: "01", icon: "✍️", color: "#1CABE2",
    title: "Isi Nama Lengkap",
    desc: "Ketik nama lengkap kamu di kolom yang tersedia, lalu pilih dari daftar yang muncul.",
  },
  {
    step: "02", icon: "🍱", color: "#F26A21",
    title: "Pencet Antri YUHUUU",
    desc: "Klik tombol \"Antri Yuhu\" dan nama kamu akan langsung muncul di Antrian Yuhu.",
  },
  {
    step: "03", icon: "📢", color: "#28A745",
    title: "Teriak ke Mas Norti / Reksa",
    desc: "Setelah masuk antrian, langsung teriak:\n\"MAS SAYA ANTRIAN KE [nomor antrian]\"",
  },
]

export default function WarYuhuUser() {
  const [queue, setQueue] = useState([])
  const [name, setName] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [openHour, setOpenHour] = useState(17)
  const [submitting, setSubmitting] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [lastTicket, setLastTicket] = useState(null)
  const [error, setError] = useState("")
  const [deviceId] = useState(getDeviceId())
  const [countdown, setCountdown] = useState("")
  const [canRegister, setCanRegister] = useState(false)
  const [hoveredTicket, setHoveredTicket] = useState(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successTicketNumber, setSuccessTicketNumber] = useState(null)
  const [isDark, setIsDark] = useState(true)
  const [showPopup, setShowPopup] = useState(true)
  const [popupTime, setPopupTime] = useState({ h: 0, m: 0, s: 0, ms: 0 })
  const [within5min, setWithin5min] = useState(false)
  const inputRef = useRef(null)
  const audioRef = useRef(null)
  const rafRef = useRef(null)

  const th = isDark ? DARK : LIGHT

  useEffect(() => { audioRef.current = new Audio("/antri-success.mp3") }, [])

  const triggerSuccess = (ticketNumber) => {
    setSuccessTicketNumber(ticketNumber)
    setShowSuccessModal(true)
    if (audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.play().catch(() => {}) }
    const canvas = document.createElement("canvas")
    canvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%;z-index:9999;pointer-events:none;"
    document.body.appendChild(canvas)
    const myConfetti = confetti.create(canvas, { resize: true, useWorker: true })
    const colors = ["#F26A21", "#1CABE2", "#28A745", "#FFD700", "#FF6B6B", "#ffffff"]
    const burst = () => myConfetti({ particleCount: 100, spread: 90, origin: { y: 0.5 }, colors })
    burst(); setTimeout(burst, 300); setTimeout(burst, 600)
    setTimeout(() => { myConfetti.reset(); canvas.remove() }, 4000)
  }

  useEffect(() => {
    loadQueue(); loadSettings()
    const channel = supabase.channel("queue-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "queue" }, () => loadQueue())
      .on("postgres_changes", { event: "*", schema: "public", table: "settings" }, () => loadSettings())
      .subscribe()
    return () => supabase.removeChannel(channel)
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

  // RAF-based millisecond countdown for popup
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const target = new Date()
      target.setHours(openHour, 0, 0, 0)
      if (now >= target) {
        setShowPopup(false)
        return
      }
      const diff = target - now
      setPopupTime({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
        ms: diff % 1000,
      })
      setWithin5min(diff <= 15 * 60 * 1000)
      rafRef.current = requestAnimationFrame(tick)
    }
    if (!canRegister && showPopup) {
      rafRef.current = requestAnimationFrame(tick)
    } else if (canRegister) {
      setShowPopup(false)
    }
    return () => cancelAnimationFrame(rafRef.current)
  }, [openHour, canRegister, showPopup])

  const loadSettings = async () => {
    try {
      const { data } = await supabase.from("settings").select("value").eq("key", "queue_open_hour").single()
      if (data) setOpenHour(parseInt(data.value))
    } catch {}
  }

  const loadQueue = async () => {
    try {
      const { data, error } = await supabase.from("queue").select("*").order("ticket", { ascending: true })
      if (error) { const raw = localStorage.getItem(STORAGE_KEY); setQueue(raw ? JSON.parse(raw) : []); return }
      setQueue(data || [])
    } catch { const raw = localStorage.getItem(STORAGE_KEY); setQueue(raw ? JSON.parse(raw) : []) }
  }

  const hasDeviceRegistered = () => queue.some((e) => e.deviceId === deviceId)
  const hasNameRegistered = (n) => queue.some((e) => e.displayName === n || e.name === n)
  const getMyTicket = () => queue.find((e) => e.deviceId === deviceId)

  useEffect(() => {
    const myTicket = getMyTicket()
    if (myTicket && !lastTicket) setLastTicket(myTicket)
  }, [queue])

  const handleSubmit = async () => {
    setError("")
    if (!canRegister) { setError(`Pendaftaran hanya bisa jam ${String(openHour).padStart(2, "0")}:00!`); return }
    if (!name.trim()) { setError("Pilih nama dari daftar!"); return }
    if (!WHITELISTED_USERS.includes(name.trim())) { setError("Nama tidak ada di daftar! Pilih dari rekomendasi."); return }

    setSubmitting(true)
    try {
      const { data: freshQueue, error: fetchError } = await supabase.from("queue").select("*").order("ticket", { ascending: true })
      if (fetchError) { setError("Gagal cek antrian, coba lagi!"); setSubmitting(false); return }
      if (freshQueue.length >= MAX_QUEUE_SIZE) { setError("Antrian penuh! Maksimal 10 peserta."); await loadQueue(); setSubmitting(false); return }
      if (freshQueue.some((e) => e.deviceId === deviceId)) { setError("Anda sudah terdaftar! Satu perangkat hanya bisa satu tiket."); await loadQueue(); setSubmitting(false); return }
      if (freshQueue.some((e) => e.displayName === name.trim() || e.name === name.trim())) { setError(`${name} sudah terdaftar! Pilih nama lain.`); await loadQueue(); setSubmitting(false); return }

      const isWahyudi = name.trim().toLowerCase() === "wahyudi"
      let ticketNumber

      if (isWahyudi) {
        const wahyudiExists = freshQueue.some((e) => e.displayName?.toLowerCase() === "wahyudi" || e.name?.toLowerCase() === "wahyudi")
        if (wahyudiExists) { setError("Wahyudi sudah ada di antrian!"); setSubmitting(false); return }
        ticketNumber = 1
        const { error: updateError } = await supabase.from("queue").update({ ticket: freshQueue.length + 1 }).gte("ticket", 1)
        if (updateError) console.error("Error updating tickets:", updateError)
      } else {
        ticketNumber = freshQueue.length + 1
      }

      const entry = { ticket: ticketNumber, name: name.trim(), displayName: name.trim(), timestamp: new Date().toISOString(), deviceId, priority: isWahyudi ? 1 : 0 }
      const { error: insertError } = await supabase.from("queue").insert([entry])
      if (insertError) { setError(`Gagal daftar: ${insertError.message}`); setSubmitting(false); return }
      await loadQueue()
      setLastTicket(entry); setName(""); triggerSuccess(ticketNumber)
    } catch (err) { setError("Gagal daftar, coba lagi ya!"); console.error(err) }
    finally { setSubmitting(false) }
  }

  const handleCancel = async () => {
    if (!confirm("Yakin mau batalkan antrian Anda?")) return
    setCancelling(true)
    const { error } = await supabase.from("queue").delete().eq("deviceId", deviceId)
    if (error) { alert("Gagal batalkan: " + error.message); setCancelling(false); return }
    setLastTicket(null); setHoveredTicket(null); await loadQueue(); setCancelling(false)
  }

  const formatTime = (iso) => new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })

  const suggestions = WHITELISTED_USERS.filter(
    (n) => !hasNameRegistered(n) && (name.trim() === "" || n.toLowerCase().includes(name.toLowerCase()))
  ).slice(0, 8)

  const isQueueFull = queue.length >= MAX_QUEUE_SIZE
  const myTicket = getMyTicket()

  return (
    <div style={{ minHeight: "100vh", fontFamily: "'Segoe UI', system-ui, sans-serif", position: "relative", background: th.bg, transition: "background 0.3s, color 0.3s" }}>

      {/* Animated BG */}
      <div style={{
        position: "fixed", pointerEvents: "none", zIndex: 0,
        width: "200vmax", height: "200vmax", top: "50%", left: "50%",
        backgroundImage: "url('https://img.harianjogja.com/posts/2025/12/02/1237730/mbg2.jpg')",
        backgroundSize: "cover", backgroundPosition: "center",
        opacity: isDark ? 0.22 : 0.14,
        animation: "bgRotatePulse 8s ease-in-out infinite",
      }} />

      {/* Countdown Popup */}
      {showPopup && !canRegister && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 2000,
          background: within5min ? "#0D2B0D" : "#4A0000",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "24px", overflow: "hidden",
        }}>
          {/* BG image juga di popup */}
          <div style={{
            position: "absolute", pointerEvents: "none",
            width: "200vmax", height: "200vmax", top: "50%", left: "50%",
            backgroundImage: "url('https://img.harianjogja.com/posts/2025/12/02/1237730/mbg2.jpg')",
            backgroundSize: "cover", backgroundPosition: "center",
            opacity: isDark ? 0.07 : 0.06,
            animation: "bgRotatePulse 8s ease-in-out infinite",
          }} />

          <div style={{ position: "relative", textAlign: "center", width: "100%", maxWidth: "800px" }}>

            {/* Label */}
            <div style={{ fontSize: "11px", fontWeight: "700", color: th.t5, textTransform: "uppercase", letterSpacing: "4px", marginBottom: "12px" }}>
              War<span style={{ color: "#F26A21" }}>YUHUUU</span> · Pembukaan Pendaftaran Dalam
            </div>

            {/* Jam buka */}
            <div style={{ fontSize: "13px", color: "#1CABE2", fontWeight: "600", marginBottom: "40px", letterSpacing: "1px" }}>
              Dibuka pukul {String(openHour).padStart(2, "0")}:00:00
            </div>

            {/* Big countdown */}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: "0", marginBottom: "64px", flexWrap: "wrap" }}>
              {[
                { value: popupTime.h, label: "Jam", size: "96px" },
                { sep: ":" },
                { value: popupTime.m, label: "Menit", size: "96px" },
                { sep: ":" },
                { value: popupTime.s, label: "Detik", size: "96px" },
                { sep: "." },
                { value: popupTime.ms, label: "Ms", size: "52px", isMs: true },
              ].map((unit, i) => (
                unit.sep ? (
                  <div key={i} style={{
                    fontSize: unit.sep === "." ? "52px" : "80px",
                    fontWeight: "900", color: "#F26A21",
                    lineHeight: 1, paddingBottom: unit.sep === "." ? "18px" : "20px",
                    margin: "0 2px", fontFamily: "monospace",
                  }}>{unit.sep}</div>
                ) : (
                  <div key={i} style={{ textAlign: "center", minWidth: unit.isMs ? "80px" : "130px" }}>
                    <div style={{
                      fontSize: unit.size, fontWeight: "900", fontFamily: "monospace",
                      lineHeight: 1,
                      background: unit.isMs
                        ? "none"
                        : "linear-gradient(180deg, #F26A21 0%, #1CABE2 100%)",
                      WebkitBackgroundClip: unit.isMs ? "unset" : "text",
                      WebkitTextFillColor: unit.isMs ? "#F26A21" : "transparent",
                      color: unit.isMs ? "#F26A21" : undefined,
                    }}>
                      {String(unit.value).padStart(unit.isMs ? 3 : 2, "0")}
                    </div>
                    <div style={{ fontSize: "10px", color: th.t5, textTransform: "uppercase", letterSpacing: "2px", marginTop: "6px" }}>
                      {unit.label}
                    </div>
                  </div>
                )
              ))}
            </div>

            {/* Button */}
            <div>
              <button
                onClick={() => within5min && setShowPopup(false)}
                disabled={!within5min}
                style={{
                  padding: "18px 56px",
                  background: within5min
                    ? "linear-gradient(135deg, #F26A21, #E85D0E)"
                    : th.card2,
                  border: `2px solid ${within5min ? "#F26A21" : th.border}`,
                  borderRadius: "16px",
                  color: within5min ? "white" : th.t5,
                  fontWeight: "800", fontSize: "18px",
                  cursor: within5min ? "pointer" : "not-allowed",
                  letterSpacing: "0.3px",
                  boxShadow: within5min ? "0 8px 32px rgba(242,106,33,0.45)" : "none",
                  transition: "all 0.3s",
                }}
              >
                🍱 aku mau daftar YUHUUU
              </button>
              <div style={{ fontSize: "12px", color: within5min ? th.green : th.t5, marginTop: "14px", fontWeight: "600" }}>
                {within5min
                  ? "✓ Pendaftaran hampir dibuka — silakan masuk!"
                  : `Kamu bisa daftar YUHUUU 15 menit sebelum jam ${String(openHour).padStart(2, "0")}:00`}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: th.card, borderRadius: "28px", padding: "44px 48px", textAlign: "center", maxWidth: "380px", width: "90%", boxShadow: "0 24px 80px rgba(0,0,0,0.5)", animation: "popIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275)" }}>
            <div style={{ fontSize: "64px", marginBottom: "12px", lineHeight: 1 }}>🎉</div>
            <div style={{ fontSize: "22px", fontWeight: "800", color: th.t1, marginBottom: "6px" }}>Antri Yuhu Berhasil!</div>
            <div style={{ fontSize: "14px", color: th.t4, marginBottom: "16px" }}>Kamu dapat antrian ke</div>
            <div style={{ fontSize: "80px", fontWeight: "900", fontFamily: "monospace", lineHeight: 1, background: "linear-gradient(135deg, #F26A21, #1CABE2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "24px" }}>
              #{String(successTicketNumber).padStart(3, "0")}
            </div>
            <button onClick={() => setShowSuccessModal(false)} style={{ width: "100%", padding: "13px", background: "linear-gradient(135deg, #F26A21, #E85D0E)", border: "none", borderRadius: "12px", color: "white", fontWeight: "700", fontSize: "15px", cursor: "pointer", boxShadow: "0 4px 16px rgba(242,106,33,0.4)" }}>
              Sip, Tutup!
            </button>
          </div>
        </div>
      )}

      <div style={{ position: "relative", zIndex: 1, maxWidth: "1100px", margin: "0 auto", padding: "24px 20px" }}>

        {/* Header */}
        <div style={{ background: th.card, borderRadius: "20px", padding: "20px 28px", marginBottom: "16px", boxShadow: th.shadow1, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "linear-gradient(135deg, #F26A21, #E8A020)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px" }}>🍱</div>
            <div>
              <div style={{ fontSize: "24px", fontWeight: "800", color: th.t1, lineHeight: 1 }}>
                War<span style={{ color: "#F26A21" }}>YUHUUU</span>
              </div>
              <div style={{ fontSize: "11px", color: th.t5, textTransform: "uppercase", letterSpacing: "1.5px", marginTop: "2px" }}>Program Makan Bergizi Gratis</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "13px", color: th.t4 }}>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#28A745", display: "inline-block", animation: "pulse 2s infinite" }} />
                Live Queue
              </span>
              <span style={{ color: th.t2, fontWeight: "600" }}>{queue.length}/{MAX_QUEUE_SIZE} peserta</span>
              {canRegister ? (
                <span style={{ background: th.greenBg, color: th.green, padding: "4px 12px", borderRadius: "20px", fontWeight: "700", fontSize: "12px" }}>✓ Pendaftaran Dibuka!</span>
              ) : (
                <span style={{ background: th.orangeBg, color: th.orange, padding: "4px 12px", borderRadius: "20px", fontWeight: "600", fontSize: "12px" }}>
                  <Clock size={12} style={{ display: "inline", marginRight: "4px", verticalAlign: "middle" }} />
                  Buka dalam <strong style={{ fontFamily: "monospace" }}>{countdown}</strong>
                </span>
              )}
            </div>
            {/* Dark/Light switcher */}
            <button
              onClick={() => setIsDark(!isDark)}
              title={isDark ? "Switch ke Light Mode" : "Switch ke Dark Mode"}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "7px 14px", borderRadius: "20px", border: `1.5px solid ${th.border}`,
                background: th.card2, color: th.t2, cursor: "pointer", fontSize: "12px", fontWeight: "600",
                transition: "all 0.2s",
              }}
            >
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
              {isDark ? "Light" : "Dark"}
            </button>
          </div>
        </div>

        {/* How-to-use Bento */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "20px" }} className="bento-steps">
          {HOW_TO_STEPS.map((item) => (
            <div key={item.step} style={{ background: th.card, borderRadius: "16px", padding: "20px", boxShadow: th.shadow2, borderTop: `3px solid ${item.color}`, display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: item.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>
                  {item.icon}
                </div>
                <span style={{ fontSize: "11px", fontWeight: "800", color: item.color, letterSpacing: "1px", textTransform: "uppercase" }}>
                  Step {item.step}
                </span>
              </div>
              <div style={{ fontSize: "13px", fontWeight: "700", color: th.t1 }}>{item.title}</div>
              <div style={{ fontSize: "12px", color: th.t4, lineHeight: "1.6", whiteSpace: "pre-line" }}>{item.desc}</div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Left: Registration */}
          <div className="lg:col-span-2">
            <div style={{ background: th.card, borderRadius: "20px", padding: "24px", boxShadow: th.shadow1 }}>
              <div style={{ fontSize: "14px", fontWeight: "700", color: th.t2, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Ticket size={16} color="#F26A21" />
                {hasDeviceRegistered() ? "Tiket Anda" : "Daftar Antrian"}
              </div>

              {!canRegister && !hasDeviceRegistered() && (
                <div style={{ background: th.orangeBg, border: `1.5px solid ${isDark ? "#5A3000" : "#FFCC80"}`, borderRadius: "14px", padding: "20px", textAlign: "center", marginBottom: "20px" }}>
                  <Clock size={28} color="#F26A21" style={{ margin: "0 auto 8px" }} />
                  <div style={{ fontSize: "11px", color: th.t5, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>Dibuka jam {String(openHour).padStart(2, "0")}:00</div>
                  <div style={{ fontSize: "34px", fontWeight: "800", color: "#F26A21", fontFamily: "monospace" }}>{countdown}</div>
                </div>
              )}

              {isQueueFull && !hasDeviceRegistered() && (
                <div style={{ background: th.redBg, border: `1.5px solid ${isDark ? "#5A1010" : "#FFCDD2"}`, borderRadius: "10px", padding: "12px 16px", textAlign: "center", marginBottom: "16px", fontSize: "13px", color: th.red, fontWeight: "600" }}>
                  Antrian penuh ({MAX_QUEUE_SIZE} peserta)
                </div>
              )}

              {hasDeviceRegistered() ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ background: isDark ? "linear-gradient(135deg, #2A1800, #1E1200)" : "linear-gradient(135deg, #FFF3E0, #FFF8E1)", border: "2px solid #F26A21", borderRadius: "14px", padding: "20px", textAlign: "center" }}>
                    <CheckCircle size={20} color="#F26A21" style={{ margin: "0 auto 6px" }} />
                    <div style={{ fontSize: "11px", color: th.t5, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Tiket Anda</div>
                    <div style={{ fontSize: "52px", fontWeight: "900", color: "#F26A21", lineHeight: 1, fontFamily: "monospace" }}>#{String(myTicket?.ticket ?? 0).padStart(3, "0")}</div>
                    <div style={{ fontSize: "15px", fontWeight: "600", color: th.t2, marginTop: "8px" }}>{myTicket?.displayName || myTicket?.name}</div>
                  </div>
                  <button onClick={handleCancel} disabled={cancelling} style={{ width: "100%", padding: "11px", background: th.card, border: `1.5px solid ${th.red}`, borderRadius: "10px", color: th.red, fontWeight: "600", fontSize: "13px", cursor: cancelling ? "not-allowed" : "pointer", opacity: cancelling ? 0.6 : 1, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {cancelling ? "Membatalkan..." : "Batalkan Antrian"}
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: th.t3, textTransform: "uppercase", letterSpacing: "0.8px", display: "block", marginBottom: "8px" }}>Nama Anda</label>
                    <div style={{ position: "relative" }}>
                      <input
                        ref={inputRef} type="text" value={name}
                        onChange={(e) => { setName(e.target.value); setShowSuggestions(true) }}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                        placeholder="Ketik nama Anda..."
                        disabled={!canRegister || isQueueFull}
                        style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${th.border}`, borderRadius: "10px", fontSize: "14px", color: th.t1, background: (!canRegister || isQueueFull) ? th.inputDisabled : th.inputBg, outline: "none", boxSizing: "border-box" }}
                      />
                      {showSuggestions && suggestions.length > 0 && (
                        <div style={{ position: "absolute", zIndex: 20, width: "100%", background: th.card, border: `1.5px solid ${th.border}`, borderTop: "none", borderRadius: "0 0 10px 10px", maxHeight: "200px", overflowY: "auto", boxShadow: th.shadow1 }}>
                          {suggestions.map((n) => (
                            <div key={n} onMouseDown={() => { setName(n); setShowSuggestions(false) }}
                              style={{ padding: "10px 14px", fontSize: "13px", color: th.t2, cursor: "pointer", borderBottom: `1px solid ${th.border3}` }}
                              onMouseOver={(e) => e.currentTarget.style.background = th.suggHover}
                              onMouseOut={(e) => e.currentTarget.style.background = th.card}
                            >{n}</div>
                          ))}
                        </div>
                      )}
                      {showSuggestions && name.trim() !== "" && suggestions.length === 0 && (
                        <div style={{ position: "absolute", zIndex: 20, width: "100%", background: th.card, border: `1.5px solid ${th.border}`, borderTop: "none", borderRadius: "0 0 10px 10px", padding: "10px 14px", fontSize: "12px", color: th.t5 }}>Nama tidak ditemukan</div>
                      )}
                    </div>
                  </div>

                  {error && (
                    <div style={{ fontSize: "13px", color: th.red, padding: "10px 14px", background: th.redBg, borderRadius: "8px", borderLeft: "3px solid #EF5350" }}>{error}</div>
                  )}

                  <button onClick={handleSubmit} disabled={submitting || !canRegister || !name.trim() || isQueueFull}
                    style={{ width: "100%", padding: "13px", background: (submitting || !canRegister || !name.trim() || isQueueFull) ? th.card3 : "linear-gradient(135deg, #F26A21, #E85D0E)", border: "none", borderRadius: "10px", color: (submitting || !canRegister || !name.trim() || isQueueFull) ? th.t4 : "white", fontWeight: "700", fontSize: "14px", cursor: (submitting || !canRegister || !name.trim() || isQueueFull) ? "not-allowed" : "pointer", textTransform: "uppercase", letterSpacing: "0.5px", boxShadow: (submitting || !canRegister || !name.trim() || isQueueFull) ? "none" : "0 4px 12px rgba(242,106,33,0.35)" }}>
                    {submitting ? "Mendaftar..." : "Antri Yuhu"}
                  </button>
                </div>
              )}
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "16px" }}>
              <div style={{ background: th.card, borderRadius: "14px", padding: "16px", boxShadow: th.shadow2 }}>
                <div style={{ fontSize: "10px", color: th.t5, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Total Peserta</div>
                <div style={{ fontSize: "30px", fontWeight: "800", color: "#1CABE2", fontFamily: "monospace" }}>{String(queue.length).padStart(3, "0")}</div>
              </div>
              <div style={{ background: th.card, borderRadius: "14px", padding: "16px", boxShadow: th.shadow2 }}>
                <div style={{ fontSize: "10px", color: th.t5, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Slot Tersisa</div>
                <div style={{ fontSize: "30px", fontWeight: "800", fontFamily: "monospace", color: MAX_QUEUE_SIZE - queue.length <= 2 ? "#EF5350" : "#28A745" }}>{String(MAX_QUEUE_SIZE - queue.length).padStart(2, "0")}</div>
              </div>
            </div>
          </div>

          {/* Right: Queue list */}
          <div className="lg:col-span-3">
            <div style={{ background: th.card, borderRadius: "20px", boxShadow: th.shadow1, overflow: "hidden" }}>
              <div style={{ padding: "16px 24px", borderBottom: `1.5px solid ${th.border2}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: th.card2 }}>
                <div style={{ fontSize: "14px", fontWeight: "700", color: th.t2, display: "flex", alignItems: "center", gap: "8px" }}>
                  <Users size={15} color="#1CABE2" />
                  Antrian Yuhu
                </div>
                <button onClick={loadQueue} style={{ background: "none", border: "none", cursor: "pointer", color: th.t6, padding: "4px" }} title="Refresh">
                  <RefreshCw size={15} />
                </button>
              </div>

              {queue.length === 0 ? (
                <div style={{ padding: "60px 24px", textAlign: "center" }}>
                  <div style={{ fontSize: "48px", marginBottom: "10px" }}>🍽️</div>
                  <div style={{ color: th.t5, fontSize: "14px", fontWeight: "500" }}>Belum ada yang antri</div>
                  <div style={{ color: th.t6, fontSize: "12px", marginTop: "4px" }}>Jadilah yang pertama!</div>
                </div>
              ) : (
                <div style={{ maxHeight: "600px", overflowY: "auto" }}>
                  {queue.map((entry, idx) => {
                    const isOwnEntry = entry.deviceId === deviceId
                    const isHovered = hoveredTicket === entry.ticket
                    return (
                      <div
                        key={entry.ticket}
                        onMouseEnter={() => isOwnEntry && setHoveredTicket(entry.ticket)}
                        onMouseLeave={() => setHoveredTicket(null)}
                        className={isOwnEntry ? "own-entry-row" : ""}
                        style={{
                          display: "flex", alignItems: "center", gap: "14px",
                          padding: "14px 24px", borderBottom: `1px solid ${th.border3}`,
                          background: isOwnEntry ? undefined : idx === 0 ? th.firstBg : th.card,
                          transition: "opacity 0.15s",
                        }}
                      >
                        <div style={{ width: "28px", textAlign: "center", flexShrink: 0 }}>
                          {idx === 0 ? <Trophy size={17} color="#F26A21" /> : <span style={{ fontSize: "12px", fontWeight: "700", color: th.t6 }}>{String(idx + 1).padStart(2, "0")}</span>}
                        </div>
                        <div style={{ minWidth: "56px", flexShrink: 0 }}>
                          <span style={{ fontSize: "19px", fontWeight: "800", fontFamily: "monospace", color: isOwnEntry ? "white" : idx === 0 ? "#F26A21" : "#1CABE2", textShadow: isOwnEntry ? "0 1px 4px rgba(0,0,0,0.3)" : "none" }}>
                            #{String(entry.ticket).padStart(3, "0")}
                          </span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "14px", fontWeight: isOwnEntry ? "800" : "600", color: isOwnEntry ? "white" : th.t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "6px", textShadow: isOwnEntry ? "0 1px 3px rgba(0,0,0,0.25)" : "none" }}>
                            {entry.displayName || entry.name}
                            {isOwnEntry && (
                              <span style={{ fontSize: "10px", background: "rgba(255,255,255,0.3)", color: "white", backdropFilter: "blur(4px)", padding: "2px 7px", borderRadius: "4px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", flexShrink: 0, border: "1px solid rgba(255,255,255,0.4)" }}>Anda</span>
                            )}
                          </div>
                        </div>
                        <div style={{ flexShrink: 0 }}>
                          {isOwnEntry && isHovered ? (
                            <button onClick={handleCancel} disabled={cancelling} title="Batalkan antrian"
                              style={{ background: "#EF5350", border: "none", borderRadius: "7px", color: "white", width: "30px", height: "30px", cursor: cancelling ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: cancelling ? 0.6 : 1, boxShadow: "0 2px 8px rgba(239,83,80,0.35)" }}>
                              <X size={14} />
                            </button>
                          ) : (
                            <span style={{ fontSize: "11px", fontFamily: "monospace", color: isOwnEntry ? "rgba(255,255,255,0.75)" : th.t6 }}>
                              {formatTime(entry.timestamp)}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <a href="#/admin" style={{ color: th.t6, fontSize: "11px", textDecoration: "none", textTransform: "uppercase", letterSpacing: "1px" }}>Admin Login</a>
        </div>
      </div>

      <style>{`
        @keyframes bgRotatePulse {
          0%   { transform: translate(-50%, -50%) rotate(0deg)   scale(1); }
          25%  { transform: translate(-50%, -50%) rotate(90deg)  scale(1.4); }
          50%  { transform: translate(-50%, -50%) rotate(180deg) scale(1); }
          75%  { transform: translate(-50%, -50%) rotate(270deg) scale(1.4); }
          100% { transform: translate(-50%, -50%) rotate(360deg) scale(1); }
        }
        @keyframes gradientMove {
          0%   { background-position: 0% 50%; }
          25%  { background-position: 100% 0%; }
          50%  { background-position: 100% 100%; }
          75%  { background-position: 0% 100%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.7); }
          100% { opacity: 1; transform: scale(1); }
        }
        .own-entry-row {
          background: linear-gradient(-45deg, #1CABE2 0%, #0066cc 20%, #F26A21 40%, #ff9900 60%, #1CABE2 80%, #F26A21 100%) !important;
          background-size: 500% 500% !important;
          animation: gradientMove 1s linear infinite !important;
          box-shadow: inset 0 0 20px rgba(255,255,255,0.15) !important;
        }
        .own-entry-row:hover { opacity: 0.9; filter: brightness(1.1); }
        .bento-steps { }
        @media (max-width: 640px) { .bento-steps { grid-template-columns: 1fr !important; } }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #F26A21; }
      `}</style>
    </div>
  )
}
