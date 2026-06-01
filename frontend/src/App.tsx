import { useState, useEffect } from "react";
import "./index.css";

// ── Types ──────────────────────────────────────────
interface Message {
  id: number;
  username: string;
  message: string;
  created_at: string;
}

interface Rating {
  song_title: string;
  avg_rating: string;
  total_ratings: string;
}

interface SuiseiInfo {
  name: string;
  nickname: string;
  birthday: string;
  debut: string;
  affiliation: string;
  color: string;
  motto: string;
  description: string;
  facts: string[];
}

// ── Star Field Background ─────────────────────────
function StarField() {
  const stars = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2.5 + 0.5,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 5,
  }));

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {stars.map((s) => (
        <div
          key={s.id}
          className="star absolute rounded-full bg-white"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            "--duration": `${s.duration}s`,
            "--delay": `${s.delay}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

// ── Hero Section ───────────────────────────────────
function Hero({ info, visitorCount }: { info: SuiseiInfo; visitorCount: number }) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20">
      <div className="absolute inset-0 bg-gradient-to-b from-hoshi-cyan/10 via-transparent to-hoshi-darker" />
      <div className="relative z-10 text-center max-w-3xl">
        <div className="text-8xl mb-6 animate-bounce">☄️</div>
        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-hoshi-cyan via-hoshi-blue to-hoshi-pink bg-clip-text text-transparent mb-4">
          星街すいせい
        </h1>
        <p className="text-2xl md:text-3xl text-hoshi-cyan mb-2">Hoshimachi Suisei</p>
        <p className="text-lg text-slate-400 mb-8 italic">"{info.motto}"</p>
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <span className="px-4 py-2 rounded-full bg-hoshi-card border border-hoshi-border text-sm">
            🎂 {info.birthday}
          </span>
          <span className="px-4 py-2 rounded-full bg-hoshi-card border border-hoshi-border text-sm">
            🏢 {info.affiliation}
          </span>
          <span className="px-4 py-2 rounded-full bg-hoshi-card border border-hoshi-border text-sm">
            ⭐ Since {info.debut}
          </span>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-hoshi-cyan/10 border border-hoshi-cyan/30 text-hoshi-cyan text-sm">
          <span>👁️</span>
          <span>{visitorCount.toLocaleString()} Hoshiyomi visitors</span>
        </div>
      </div>
      <div className="absolute bottom-8 animate-bounce">
        <svg className="w-6 h-6 text-hoshi-cyan/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}

// ── About Section ───────────────────────────────────
function About({ info }: { info: SuiseiInfo }) {
  return (
    <section className="relative z-10 max-w-4xl mx-auto px-4 py-20">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
        <span className="text-hoshi-cyan">✦</span> About Suisei <span className="text-hoshi-cyan">✦</span>
      </h2>
      <div className="bg-hoshi-card border border-hoshi-border rounded-2xl p-8 mb-12">
        <p className="text-lg leading-relaxed text-slate-300">{info.description}</p>
      </div>
      <h3 className="text-2xl font-bold text-center mb-6 text-hoshi-blue">Fun Facts</h3>
      <div className="grid md:grid-cols-2 gap-4">
        {info.facts.map((fact, i) => (
          <div
            key={i}
            className="bg-hoshi-card border border-hoshi-border rounded-xl p-4 hover:border-hoshi-cyan/50 transition-colors"
          >
            <p className="text-sm text-slate-300">
              <span className="text-hoshi-star mr-2">⭐</span>
              {fact}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Message Board ───────────────────────────────────
function MessageBoard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/messages")
      .then((r) => r.json())
      .then(setMessages)
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !message.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), message: message.trim() }),
      });
      const newMsg = await res.json();
      if (newMsg.error) {
        alert(newMsg.error);
        return;
      }
      setMessages((prev) => [newMsg, ...prev]);
      setMessage("");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative z-10 max-w-4xl mx-auto px-4 py-20">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
        <span className="text-hoshi-pink">💌</span> Comet Messages <span className="text-hoshi-pink">💌</span>
      </h2>
      <form onSubmit={handleSubmit} className="bg-hoshi-card border border-hoshi-border rounded-2xl p-6 mb-8">
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Your name (Hoshiyomi)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={50}
            className="px-4 py-3 rounded-xl bg-hoshi-darker border border-hoshi-border text-slate-200 placeholder-slate-500 focus:outline-none focus:border-hoshi-cyan transition-colors"
          />
          <input
            type="text"
            placeholder="Send a message to Suisei..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={500}
            className="px-4 py-3 rounded-xl bg-hoshi-darker border border-hoshi-border text-slate-200 placeholder-slate-500 focus:outline-none focus:border-hoshi-cyan transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-hoshi-cyan to-hoshi-blue text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Message ✨"}
        </button>
      </form>
      <div className="space-y-4">
        {messages.length === 0 && (
          <p className="text-center text-slate-500 py-8">No messages yet... be the first Hoshiyomi! 🌟</p>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className="bg-hoshi-card border border-hoshi-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-hoshi-cyan/10 text-hoshi-cyan text-xs font-medium">
                {msg.username}
              </span>
              <span className="text-xs text-slate-500">
                {new Date(msg.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="text-slate-300">{msg.message}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Song Rating Section ─────────────────────────────
const SONGS = [
  "Comet",
  "NEXT COLOR PLANET",
  "Ghost",
  "The First Take - Stellar Stellar",
  "Butai ni Naritai!",
  "Template",
  "Bamboo Sword",
  "Tenkai",
  "SOS",
  "Kakumei",
];

function SongRatings() {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [selectedSong, setSelectedSong] = useState(SONGS[0]);
  const [selectedRating, setSelectedRating] = useState(5);
  const [ratingName, setRatingName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/ratings")
      .then((r) => r.json())
      .then(setRatings)
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          song_title: selectedSong,
          rating: selectedRating,
          username: ratingName.trim() || undefined,
        }),
      });
      const res = await fetch("/api/ratings");
      setRatings(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative z-10 max-w-4xl mx-auto px-4 py-20">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
        <span className="text-hoshi-star">🎵</span> Rate Suisei's Songs <span className="text-hoshi-star">🎵</span>
      </h2>
      <form onSubmit={handleSubmit} className="bg-hoshi-card border border-hoshi-border rounded-2xl p-6 mb-8">
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <select
            value={selectedSong}
            onChange={(e) => setSelectedSong(e.target.value)}
            className="px-4 py-3 rounded-xl bg-hoshi-darker border border-hoshi-border text-slate-200 focus:outline-none focus:border-hoshi-cyan"
          >
            {SONGS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <div className="flex items-center gap-1 px-4 py-2 rounded-xl bg-hoshi-darker border border-hoshi-border">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setSelectedRating(n)}
                className={`text-2xl transition-transform hover:scale-125 ${n <= selectedRating ? "" : "opacity-30"}`}
              >
                ⭐
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Your name (optional)"
            value={ratingName}
            onChange={(e) => setRatingName(e.target.value)}
            maxLength={50}
            className="px-4 py-3 rounded-xl bg-hoshi-darker border border-hoshi-border text-slate-200 placeholder-slate-500 focus:outline-none focus:border-hoshi-cyan"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-hoshi-star to-yellow-400 text-hoshi-dark font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "Rating..." : "Submit Rating ⭐"}
        </button>
      </form>
      {ratings.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          {ratings.map((r) => (
            <div key={r.song_title} className="bg-hoshi-card border border-hoshi-border rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-200">{r.song_title}</p>
                <p className="text-xs text-slate-500">{r.total_ratings} ratings</p>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-2xl">⭐</span>
                <span className="text-lg font-bold text-hoshi-star">{Number(r.avg_rating).toFixed(1)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ── Footer ──────────────────────────────────────────
function Footer() {
  return (
    <footer className="relative z-10 border-t border-hoshi-border py-8 text-center">
      <p className="text-slate-500 text-sm">
        Made with 💙 by a Hoshiyomi | Not affiliated with hololive/Cover Corp
      </p>
      <p className="text-slate-600 text-xs mt-2">
        ☄️ 星街すいせい — The comet that never stops shining ✨
      </p>
    </footer>
  );
}

// ── App ────────────────────────────────────────────
function App() {
  const [info, setInfo] = useState<SuiseiInfo | null>(null);
  const [visitorCount, setVisitorCount] = useState(0);

  useEffect(() => {
    fetch("/api/info")
      .then((r) => r.json())
      .then(setInfo)
      .catch(console.error);

    fetch("/api/visitors", { method: "POST" })
      .then((r) => r.json())
      .then((data) => setVisitorCount(data.count ?? 0))
      .catch(() => {});
  }, []);

  if (!info) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-hoshi-darker">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">☄️</div>
          <p className="text-hoshi-cyan">Loading Suisei's world...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <StarField />
      <Hero info={info} visitorCount={visitorCount} />
      <About info={info} />
      <SongRatings />
      <MessageBoard />
      <Footer />
    </div>
  );
}

export default App;
