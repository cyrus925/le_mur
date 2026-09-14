import { useState, useEffect, useMemo } from "react";
import { useNavigate } from 'react-router-dom';


const PALETTE = ["#FF6B57", "#FFC145", "#3ABE8E", "#4E8FE0", "#B168E8"];
const TILTS = [-6, 4, -3, 7, -5, 2, -8, 5, -2];

// Petites rotations pour les notes
const NOTE_ROTATIONS = [-3, 2, -1.5, 3, -2.5, 1];

function NotePolaroid({ entry, index }) {
  const rot = NOTE_ROTATIONS[index % NOTE_ROTATIONS.length];
  const color = PALETTE[index % PALETTE.length];
  const date = new Date(entry.timestamp).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className="note-polaroid"
      style={{
        "--rot": `${rot}deg`,
        "--tape": color,
      }}
    >
      <div className="note-content">
        <p className="note-text">{entry.message}</p>
        <div className="note-footer">
          <span className="note-signature">— {entry.name}</span>
          <span className="note-date">{date}</span>
        </div>
      </div>
    </div>
  );
}

function NoteColumn({ notes, direction, duration, colorOffset }) {
  const loop = [...notes, ...notes];
  return (
    <div className="marquee-track">
      <div
        className="marquee-col"
        style={{
          animationDuration: `${duration}s`,
          animationDirection: direction === "up" ? "normal" : "reverse",
        }}
      >
        {loop.map((note, i) => (
          <NotePolaroid
            entry={note}
            index={i + colorOffset}
            key={`${note.id}-${i}`}
          />
        ))}
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
      try {
        const res = await window.storage.get("lemur:messages", true);
        const parsed = res ? JSON.parse(res.value) : [];
        setEntries(Array.isArray(parsed) ? parsed : []);
        setStatus("ready");
      } catch {
        setEntries([]);
        setStatus("ready");
      }
    })();
  }, []);

  const columns = useMemo(() => {
    // On divise les notes en 3 colonnes
    const out = Array.from({ length: 3 }, () => []);
    entries.forEach((entry, i) => out[i % 3].push(entry));
    return out;
  }, [entries]);

  return (
    <div className="page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&family=Nunito:wght@400;600;700&display=swap');

        :root {
          --paper: #FFF7EC;
          --ink: #291F3D;
          --coral: #FF6B57;
          --sun: #FFC145;
          --mint: #3ABE8E;
          --sky: #4E8FE0;
          --grape: #B168E8;
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
          letter-spacing: 0.5px;
          color: var(--ink);
        }

        .hero p {
          margin: 6px auto 0;
          max-width: 320px;
          font-size: 0.98rem;
          color: #5c5270;
        }

        /* --- Guirlande de notes --- */
        .garland {
          display: flex;
          gap: 14px;
          justify-content: center;
          margin: 20px 0 6px;
          height: 300px; /* Hauteur ajustée pour les notes */
          overflow: hidden;
          -webkit-mask-image: linear-gradient(to bottom, transparent, black 15%, black 85%, transparent);
          mask-image: linear-gradient(to bottom, transparent, black 15%, black 85%, transparent);
        }

        .marquee-track {
          flex: 1;
          max-width: 200px; /* Largeur ajustée pour les notes */
          overflow: visible;
        }

        .marquee-col {
          display: flex;
          flex-direction: column;
          gap: 22px;
          animation-name: scrollY;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          width: 100%;
        }

        @keyframes scrollY {
          from { transform: translateY(0); }
          to { transform: translateY(-50%); }
        }

        .note-polaroid {
          background: #fff;
          border-radius: 8px;
          padding: 12px;
          box-shadow: 0 8px 16px rgba(41, 31, 61, 0.14);
          position: relative;
          transform: rotate(var(--rot));
          width: 180px; /* Largeur fixe pour les notes */
          min-height: 120px; /* Hauteur minimale */
        }

        .note-polaroid::before {
          content: "";
          position: absolute;
          top: -7px;
          left: 50%;
          transform: translateX(-50%) rotate(-4deg);
          width: 34px;
          height: 12px;
          background: var(--tape);
          opacity: 0.8;
          border-radius: 2px;
        }

        .note-content {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .note-text {
          margin: 4px 0 10px;
          font-size: 0.9rem;
          line-height: 1.45;
          white-space: pre-wrap;
          flex-grow: 1;
        }

        .note-footer {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-top: auto;
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

        /* --- Message vide --- */
        .empty {
          text-align: center;
          color: #8a8098;
          font-size: 0.95rem;
          padding: 20px;
        }

        @media (prefers-reduced-motion: reduce) {
          .marquee-col { animation: none; }
        }


         .home-button {
          padding: 10px 20px;
          background: #4E8FE0;
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
        .home-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 0 #3a6db8;
        }
        .home-button:active {
          transform: translateY(2px);
          box-shadow: 0 2px 0 #3a6db8;
        }
      `}</style>

      <div className="hero">
        <h1>Le Mur des Mots</h1>
        <p>Découvrons ensemble ce que chacun a sur le cœur.</p>
      </div>

      {status === "loading" && <p className="empty">Chargement des mots...</p>}
      {status === "ready" && entries.length === 0 && (
        <p className="empty">Aucun mot n'a encore été accroché. Retournez sur "Le Mur" pour en ajouter !</p>
      )}
      {status === "error" && (
        <p className="empty">Impossible de charger les mots. Réessayez plus tard.</p>
      )}

      <div className="garland">
        <NoteColumn notes={columns[0]} direction="up" duration={30} colorOffset={0} />
        <NoteColumn notes={columns[1]} direction="down" duration={35} colorOffset={1} />
        <NoteColumn notes={columns[2]} direction="up" duration={25} colorOffset={2} />
      </div>

      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <button
          onClick={() => navigate('/')}
          className="home-button"
        >
          Retour au Mur
        </button>
        </div>
    </div>
  );
}