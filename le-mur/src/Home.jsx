import { useState, useEffect, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';

/* ============================================================
   LE MUR — config à personnaliser
   ============================================================
   GROUP_PHOTOS : vos photos de groupe (souvenirs). En local,
   remplacez chaque "src" par le chemin réel une fois le site
   sorti des artifacts, ex: "/photos/vacances-2022.jpg".
============================================================ */
// Remplace ton tableau GROUP_PHOTOS par ceci :
const images = import.meta.glob('./img/*.{jpg,jpeg,png,webp,svg}', { eager: true });




const GROUP_PHOTOS = Object.values(images)
  .map((img, index) => ({ src: img.default, id: index }))
  .sort(() => Math.random() - 0.5); // <-- Mélange aléatoire ici
const PALETTE = ["#FF6B57", "#FFC145", "#3ABE8E", "#4E8FE0", "#B168E8"];

// petites inclinaisons variées pour un effet "collé à la main"
const TILTS = [-6, 4, -3, 7, -5, 2, -8, 5, -2];

function splitColumns(items, cols) {
  const out = Array.from({ length: cols }, () => []);
  items.forEach((item, i) => out[i % cols].push(item));
  return out;
}

function PhotoColumn({ photos, direction, duration, colorOffset  }) {
  const loop = [...photos, ...photos];
  return (
    <div className="marquee-track">
      <div
        className="marquee-col"
        style={{
          animationDuration: `${duration}s`,
          animationDirection: direction === "up" ? "normal" : "reverse",
        }}
      >
        {loop.map((p, i) => (
          <div
            className="polaroid"
            key={i}
            style={{
              "--tilt": `${TILTS[(i + colorOffset) % TILTS.length]}deg`,
              "--tape": PALETTE[(i + colorOffset) % PALETTE.length],
            }}
          >
            <img src={p.src} alt="Souvenir du groupe" draggable={false} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Note({ entry, index }) {
  const rotations = [-3, 2, -1.5, 3, -2.5, 1];
  const rot = rotations[index % rotations.length];
  const color = PALETTE[index % PALETTE.length];
  const date = new Date(entry.created_at).toLocaleString("fr-FR", { 
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <div className="note" style={{ "--rot": `${rot}deg`, "--tape": color }}>
      <p className="note-text">{entry.message}</p>
      <div className="note-footer">
        <span className="note-signature">— {entry.name}</span>
        <span className="note-date">{date}</span>
      </div>
    </div>
  );
}

export default function LeMur() {
  const navigate = useNavigate(); 
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [entries, setEntries] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', text: string }
  const columns = useMemo(() => splitColumns(GROUP_PHOTOS, 3), []);

  useEffect(() => {
(async () => {
    const { data, error } = await supabase
      .from('messages')
      .select()
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      setStatus('error')
      return
    }
    setEntries(data)
    setStatus('ready')
  })()
}, [])

async function handleSubmit(e) {
  e.preventDefault();
  if (!name.trim() || !message.trim()) return;
  setSubmitting(true);

  const { data, error } = await supabase
    .from('messages')
    .insert({ name: name.trim(), message: message.trim() })
    .select();

  if (error) {
    console.error(error);
    setStatus('error');
    setToast({ type: 'error', text: "Oups, ça n'a pas pu s'envoyer 😕" });
  } else {
    setEntries([data[0], ...entries]);
    setMessage('');
    setToast({ type: 'success', text: "C'est envoyé ! 🎉" });
  }
  setSubmitting(false);

  // Le toast disparaît tout seul après 3 secondes
  setTimeout(() => setToast(null), 3000);
}

  return (
    <div className="page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&family=Nunito:wght@400;600;700&display=swap');

        :root{
          --paper:#FFF7EC;
          --ink:#291F3D;
          --coral:#FF6B57;
          --sun:#FFC145;
          --mint:#3ABE8E;
          --sky:#4E8FE0;
          --grape:#B168E8;
        }
        *{box-sizing:border-box;}
        .page{
          min-height:100%;
          background:
            radial-gradient(circle at 15% 8%, rgba(255,107,87,0.10), transparent 40%),
            radial-gradient(circle at 85% 5%, rgba(78,143,224,0.10), transparent 40%),
            var(--paper);
          font-family:'Nunito', sans-serif;
          color:var(--ink);
          padding-bottom:48px;
        }
        .hero{
          text-align:center;
          padding:28px 20px 8px;
        }
        .hero h1{
          font-family:'Baloo 2', sans-serif;
          font-weight:800;
          font-size:clamp(2.2rem, 9vw, 2.8rem);
          margin:0;
          letter-spacing:0.5px;
          color:var(--ink);
        }
        .hero p{
          margin:6px auto 0;
          max-width:320px;
          font-size:0.98rem;
          color:#5c5270;
        }

        /* --- Guirlande de photos de groupe --- */
        .garland{
          display:flex;
          gap:14px;
          justify-content:center;
          margin:20px 0 6px;
          height:250px;
          overflow:hidden;
          -webkit-mask-image:linear-gradient(to bottom, transparent, black 15%, black 85%, transparent);
          mask-image:linear-gradient(to bottom, transparent, black 15%, black 85%, transparent);
        }
        .marquee-track{ flex:1; max-width:120px; overflow:visible; }
        .marquee-col{
          display:flex;
          flex-direction:column;
          gap:22px;
          animation-name:scrollY;
          animation-timing-function:linear;
          animation-iteration-count:infinite;
          width:100%;
        }
        @keyframes scrollY{
          from{ transform:translateY(0); }
          to{ transform:translateY(-50%); }
        }
        .polaroid{
          background:#fff;
          border-radius:8px;
          padding:6px 6px 10px;
          box-shadow:0 8px 16px rgba(41,31,61,0.14);
          position:relative;
          transform:rotate(var(--tilt));
        }
        .polaroid::before{
          content:"";
          position:absolute;
          top:-7px; left:50%;
          transform:translateX(-50%) rotate(-4deg);
          width:34px; height:12px;
          background:var(--tape);
          opacity:0.8;
          border-radius:2px;
        }
        .polaroid img{
          width:100%;
          aspect-ratio:1/1;
          border-radius:4px;
          display:block;
          background:#f1ede4;
          object-fit:cover;
        }

        /* --- Formulaire --- */
        .form-wrap{ padding:14px 18px 6px; }
        .form-card{
          background:#fff;
          border-radius:18px;
          padding:20px 18px 18px;
          box-shadow:0 10px 24px rgba(41,31,61,0.10);
          max-width:460px;
          margin:0 auto;
          transform:rotate(-0.6deg);
        }
        .form-card h2{
          font-family:'Baloo 2', sans-serif;
          font-size:1.3rem;
          margin:0 0 12px;
        }
        .field{ margin-bottom:14px; }
        .field label{
          display:block;
          font-size:0.82rem;
          font-weight:700;
          margin-bottom:5px;
          color:#6b6180;
        }
        :root{
  --paper:#FFF7EC;
  --ink:#291F3D;
  --coral:#FF6B57;
  --sun:#FFC145;
  --mint:#3ABE8E;
  --sky:#4E8FE0;
  --grape:#B168E8;
  color-scheme: light; /* ← empêche Safari de forcer le mode sombre sur les champs */
}

.field input, .field textarea{
  width:100%;
  border:2px solid #ECE4F5;
  border-radius:12px;
  padding:10px 12px;
  font-family:'Nunito', sans-serif;
  font-size:1rem;
  background:#FDFBF7;
  resize:vertical;
  color: var(--ink);              /* ← force explicitement le texte tapé */
  -webkit-text-fill-color: var(--ink); /* ← nécessaire spécifiquement sur Safari/iOS */
}
        .field input:focus, .field textarea:focus{
          outline:none;
          border-color:var(--sky);
        }
        .field textarea{ min-height:110px; }
        .submit-btn{
          width:100%;
          border:none;
          border-radius:14px;
          padding:13px;
          font-family:'Baloo 2', sans-serif;
          font-weight:700;
          font-size:1.05rem;
          color:#fff;
          background:var(--coral);
          cursor:pointer;
          transition:transform 0.12s ease, box-shadow 0.12s ease;
          box-shadow:0 6px 0 #d4503f;
        }
        .submit-btn:active{ transform:translateY(4px); box-shadow:0 2px 0 #d4503f; }
        .submit-btn:disabled{ opacity:0.6; cursor:default; }

        /* --- Mur de mots --- */
        .wall{
          padding:22px 16px 0;
          max-width:520px;
          margin:0 auto;
        }
        .wall h2{
          font-family:'Baloo 2', sans-serif;
          text-align:center;
          font-size:1.15rem;
          margin:0 0 16px;
          color:#544a68;
        }
        .empty{
          text-align:center;
          color:#8a8098;
          font-size:0.95rem;
          padding:20px;
        }
        .notes{
          display:flex;
          flex-direction:column;
          gap:20px;
        }
        .note{
          background:#FFFDF8;
          border-radius:4px;
          padding:18px 16px 14px;
          box-shadow:0 8px 16px rgba(41,31,61,0.10);
          transform:rotate(var(--rot));
          position:relative;
        }
        .note::before{
          content:"";
          position:absolute;
          top:-8px; left:50%;
          transform:translateX(-50%) rotate(-2deg);
          width:46px; height:14px;
          background:var(--tape);
          opacity:0.7;
          border-radius:2px;
        }
        .note-text{
          margin:4px 0 10px;
          font-size:1.02rem;
          line-height:1.45;
          white-space:pre-wrap;
        }
        .note-footer{
          display:flex;
          justify-content:space-between;
          align-items:baseline;
        }
        .note-signature{
          font-family:'Baloo 2', sans-serif;
          font-weight:700;
          font-size:0.95rem;
        }
        .note-date{
          font-size:0.72rem;
          color:#a89dbb;
        }

        @media (prefers-reduced-motion: reduce){
          .marquee-col{ animation:none; }
        }

          .mots-button {
          padding: 10px 20px;
          background: #8957ff;
          color: white;
          border: none;
          border-radius: 12px;
          font-family: 'Baloo 2', sans-serif;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          box-shadow: 0 4px 0 #41277e;
          transition: transform 0.12s ease, box-shadow 0.12s ease;
        }
        .mots-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 0 #41277e;
        }
        .mots-button:active {
          transform: translateY(2px);
          box-shadow: 0 2px 0 #41277e;
        }

        .toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 22px;
  border-radius: 999px;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 700;
  font-size: 0.95rem;
  color: #fff;
  box-shadow: 0 8px 20px rgba(41,31,61,0.25);
  z-index: 50;
  animation: toast-in 0.25s ease;
}
.toast-success { background: var(--mint); }
.toast-error   { background: var(--coral); }

@keyframes toast-in {
  from { opacity: 0; transform: translate(-50%, 16px); }
  to   { opacity: 1; transform: translate(-50%, 0); }
}

@media (prefers-reduced-motion: reduce) {
  .toast { animation: none; }
}
          
      `}</style>

      <div className="hero">
        <h1>Le Mur</h1>
        <p>Dis ce que tu as sur le cœur, et sauvons antifun.</p>
      </div>

      <div className="garland">
        <PhotoColumn photos={columns[0]} direction="up" duration={75} colorOffset={0} />
        <PhotoColumn photos={columns[1]} direction="down" duration={80} colorOffset={1} />
        <PhotoColumn photos={columns[2]} direction="up" duration={90} colorOffset={2} />
      </div>

      <div className="form-wrap">
        <form className="form-card" onSubmit={handleSubmit}>
          <h2>Écrire sur le mur</h2>
          <div className="field">
            <label htmlFor="name">Ton prénom</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex : Lucile"
              maxLength={30}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="message">Ton message</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Écris ce que tu ressens…"
              maxLength={600}
              required
            />
          </div>
          <button 
          className="submit-btn" type="submit" disabled={submitting}>
            {submitting ? "Ça s'accroche…" : "Accrocher au mur"}
          </button>
        </form>
      </div>

      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <button
        onClick={() => navigate('/mots')}
          className="mots-button"
        >
          Voir le ressenti de mes amis
        </button>
      </div>
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.text}
        </div>      )}

    </div>
  );
}
