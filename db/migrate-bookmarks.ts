import { getDb } from "../api/queries/connection";
import { sql } from "drizzle-orm";

async function migrate() {
  const db = getDb();
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS bookmarks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        article_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        note TEXT,
        UNIQUE KEY unique_user_article (user_id, article_id)
      )
    `);
    console.log("Bookmarks table created successfully");
  } catch (err) {
    console.error("Migration failed:", err);
  }
}

migrate();
