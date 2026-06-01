import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { staticPlugin } from "@elysiajs/static";
import postgres from "postgres";

const DATABASE_URL = process.env.DATABASE_URL!;

const sql = postgres(DATABASE_URL);

// Wait for db connection
await sql`SELECT 1`;

// Initialize tables
await sql`
  CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )
`;

await sql`
  CREATE TABLE IF NOT EXISTS song_ratings (
    id SERIAL PRIMARY KEY,
    song_title TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    username TEXT DEFAULT 'Anonymous Comet',
    created_at TIMESTAMPTZ DEFAULT NOW()
  )
`;

await sql`
  CREATE TABLE IF NOT EXISTS visitor_count (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    count BIGINT DEFAULT 0
  )
`;

// Initialize visitor count if not exists
await sql`
  INSERT INTO visitor_count (id, count)
  VALUES (1, 0)
  ON CONFLICT (id) DO NOTHING
`;

const app = new Elysia()
  .use(cors())
  .use(staticPlugin({ assets: "./public", prefix: "/" }))
  .get("/", ({ set }) => {
    set.headers["content-type"] = "text/html";
    return Bun.file("./public/index.html");
  })
  // --- API Routes ---
  .get("/api/health", () => ({ status: "ok", service: "hoshi-sui-fan-site", timestamp: new Date().toISOString() }))
  .get("/api/info", () => ({
    name: "Hoshimachi Suisei",
    nickname: "Suichan",
    birthday: "March 22",
    debut: "2018-03-22",
    affiliation: "hololive",
    color: "#00C8FF",
    motto: "Comet that never stops shining ✨",
    description:
      "Hoshimachi Suisei (星街すいせい) is a virtual singer and VTuber affiliated with hololive. Known for her exceptional singing ability, gaming skills, and infectious personality. She debuted as an independent VTuber before joining hololive. Her signature color is cyan/blue, and she's often associated with comets and stars.",
    facts: [
      "Born March 22, making her an Aries",
      "Originally debuted as an independent VTuber in March 2018",
      "Joined hololive in 2019, initially as part of INoNaKa before becoming a full member",
      "Her original song 'Comet' has over 10M views",
      "First hololive member to reach 1 million YouTube subscribers while still active",
      "Released her major debut album 'Still Still Stellar' in 2022",
      "Known for her Tetris skills and competitive gaming",
      "Her fanbase is called 'Hoshiyomi' (星詠み, Star Watchers)",
      "Her character designer is Mika Pikazo",
      "Hosted the first-ever VTuber concert at Tokyo Dome in 2024 with 'The First Take' collaboration",
      "Her mascot is a small star/comet character",
      "Collaborated with numerous major Japanese artists including TK from Ling Tosite Sigure",
    ],
  }))
  .get("/api/messages", async () => {
    const messages = await sql`
      SELECT id, username, message, created_at
      FROM messages
      ORDER BY created_at DESC
      LIMIT 100
    `;
    return messages;
  })
  .post("/api/messages", async ({ body }) => {
    const { username, message } = body as { username: string; message: string };
    if (!username || !message) {
      return { error: "Username and message are required" };
    }
    if (message.length > 500) {
      return { error: "Message too long (max 500 chars)" };
    }
    const result = await sql`
      INSERT INTO messages (username, message)
      VALUES (${username}, ${message})
      RETURNING id, username, message, created_at
    `;
    return result[0];
  })
  .get("/api/ratings", async () => {
    const ratings = await sql`
      SELECT song_title, AVG(rating)::numeric(10,2) as avg_rating, COUNT(*) as total_ratings
      FROM song_ratings
      GROUP BY song_title
      ORDER BY avg_rating DESC
    `;
    return ratings;
  })
  .post("/api/ratings", async ({ body }) => {
    const { song_title, rating, username } = body as {
      song_title: string;
      rating: number;
      username?: string;
    };
    if (!song_title || !rating) {
      return { error: "Song title and rating are required" };
    }
    if (rating < 1 || rating > 5) {
      return { error: "Rating must be between 1 and 5" };
    }
    const result = await sql`
      INSERT INTO song_ratings (song_title, rating, username)
      VALUES (${song_title}, ${rating}, ${username || "Anonymous Comet"})
      RETURNING id, song_title, rating, username, created_at
    `;
    return result[0];
  })
  .get("/api/visitors", async () => {
    const result = await sql`SELECT count FROM visitor_count WHERE id = 1`;
    return { count: result[0]?.count ?? 0 };
  })
  .post("/api/visitors", async () => {
    const result = await sql`
      UPDATE visitor_count SET count = count + 1 WHERE id = 1
      RETURNING count
    `;
    return { count: result[0]?.count ?? 1 };
  })
  .listen(3000);

console.log(`🚀 Hoshi-sui fan site running at http://localhost:${app.server?.port}`);
