import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';

const PALETTE = ["#FF6B57", "#FFC145", "#3ABE8E", "#4E8FE0", "#B168E8"];
const ROTATIONS = [-3, 2, -1.5, 3, -2.5, 1, -2, 2.5];
const avatarFiles = import.meta.glob(
  './avatars/*.{jpg,jpeg,JPG,JPEG,png,PNG,webp,WEBP}',
  { eager: true }
);function normalize(str) {
  return str.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

const AVATARS = {};
Object.entries(avatarFiles).forEach(([path, mod]) => {
  const fileName = path.split('/').pop().split('.')[0];
  AVATARS[normalize(fileName)] = mod.default; // ← normalize() ici aussi
});

function getAvatar(name) {
  const AVATARS = {};
Object.entries(avatarFiles).forEach(([path, mod]) => {
  const fileName = path.split('/').pop().split('.')[0];
  AVATARS[normalize(fileName)] = mod.default;
});

console.log("Fichiers trouvés :", Object.keys(avatarFiles));
console.log("Clés AVATARS :", Object.keys(AVATARS));
  return AVATARS[normalize(name)] || null;
}

function NoteCard({ entry, index }) {
  const rot = ROTATIONS[index % ROTATIONS.length];
  const color = PALETTE[index % PALETTE.length];
  const avatar = getAvatar(entry.name);
  const date = new Date(entry.created_at).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className="note-card"
      style={{
        "--rot": `${rot}deg`,
        "--tape": color,
        "--delay": `${Math.min(index * 60, 600)}ms`,
      }}
    >
      <p className="note-text">{entry.message}</p>
      <div className="note-footer">
        <span className="note-signature">   {avatar && <img className="note-avatar" src={avatar} alt={entry.name} />}
  — {entry.name}</span>
        <span className="note-date">{date}</span>
      </div>
    </div>
  );
}

export default function LeMurDesMots() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('messages')
        .select()
        .order('created_at', { ascending: false });

      if (error) {
        console.error(error);
        setStatus('error');
        return;
      }
      setEntries(data);
      setStatus('ready');
    })();
  }, []);

  return (
    <div className="page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&family=Nunito:wght@400;600;700&display=swap');

        :root {
          --paper: #FFF7EC;
          --ink: #291F3D;
          --coral: #FF6B57;
          --sky: #4E8FE0;
        }

        * { box-sizing: border-box; }

        .page {
          min-height: 100%;
          background:
            radial-gradient(circle at 15% 8%, rgba(255,107,87,0.10), transparent 40%),
            radial-gradient(circle at 85% 5%, rgba(78,143,224,0.10), transparent 40%),
            var(--paper);
          font-family: 'Nunito', sans-serif;
          color: var(--ink);
          padding-bottom: 48px;
        }

        .hero {
          text-align: center;
          padding: 28px 20px 8px;
        }

        .hero h1 {
          font-family: 'Baloo 2', sans-serif;
          font-weight: 800;
          font-size: clamp(2.2rem, 9vw, 2.8rem);
          margin: 0;
        }

        .hero p {
          margin: 6px auto 0;
          max-width: 320px;
          font-size: 0.98rem;
          color: #5c5270;
        }

        .empty {
          text-align: center;
          color: #8a8098;
          font-size: 0.95rem;
          padding: 40px 20px;
        }

        /* --- Grille de post-it --- */
        .notes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 20px;
          padding: 24px 18px 0;
          max-width: 900px;
          margin: 0 auto;
        }

        .note-card {
          background: #FFFDF8;
          border-radius: 4px;
          padding: 18px 16px 14px;
          box-shadow: 0 8px 16px rgba(41, 31, 61, 0.10);
          transform: rotate(var(--rot));
          position: relative;
          opacity: 0;
          animation: appear 0.5s ease forwards;
          animation-delay: var(--delay);
        }

        @keyframes appear {
          from { opacity: 0; transform: rotate(var(--rot)) translateY(14px) scale(0.96); }
          to   { opacity: 1; transform: rotate(var(--rot)) translateY(0) scale(1); }
        }

        .note-card:hover {
          transform: rotate(0deg) scale(1.03);
          box-shadow: 0 14px 26px rgba(41, 31, 61, 0.18);
          z-index: 2;
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }

        .note-card::before {
          content: "";
          position: absolute;
          top: -8px; left: 50%;
          transform: translateX(-50%) rotate(-2deg);
          width: 46px; height: 14px;
          background: var(--tape);
          opacity: 0.75;
          border-radius: 2px;
        }

        .note-text {
          margin: 4px 0 10px;
          font-size: 1rem;
          line-height: 1.45;
          white-space: pre-wrap;
        }

        .note-footer {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
        }

        .note-signature {
          font-family: 'Baloo 2', sans-serif;
          font-weight: 700;
          font-size: 0.95rem;
        }

        .note-date {
          font-size: 0.72rem;
          color: #a89dbb;
        }

        @media (prefers-reduced-motion: reduce) {
          .note-card { animation: none; opacity: 1; }
        }

        .home-button {
          padding: 10px 20px;
          background: var(--sky);
          color: white;
          border: none;
          border-radius: 12px;
          font-family: 'Baloo 2', sans-serif;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          box-shadow: 0 4px 0 #3a6db8;
          transition: transform 0.12s ease, box-shadow 0.12s ease;
        }
        .home-button:hover { transform: translateY(-2px); box-shadow: 0 6px 0 #3a6db8; }
        .home-button:active { transform: translateY(2px); box-shadow: 0 2px 0 #3a6db8; }

        .note-signature {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.note-avatar {
  width: 44px;   /* au lieu de 22px */
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(41,31,61,0.25);
}
      `}</style>

      <div className="hero">
        <h1>Le Mur des Mots</h1>
        <p>Découvrons ensemble ce que chacun a sur le cœur.</p>
      </div>

      {status === "loading" && <p className="empty">Chargement des mots…</p>}
      {status === "error" && (
        <p className="empty">Impossible de charger les mots. Réessaie plus tard.</p>
      )}
      {status === "ready" && entries.length === 0 && (
        <p className="empty">Aucun mot n'a encore été accroché. Retourne sur "Le Mur" pour en ajouter !</p>
      )}

      {status === "ready" && entries.length > 0 && (
        <div className="notes-grid">
          {entries.map((entry, i) => (
            <NoteCard entry={entry} index={i} key={entry.id} />
          ))}
        </div>
      )}

      <div style={{ textAlign: 'center', margin: '28px 0 0' }}>
        <button onClick={() => navigate('/')} className="home-button">
          Retour au Mur
        </button>
      </div>
    </div>
  );
}
