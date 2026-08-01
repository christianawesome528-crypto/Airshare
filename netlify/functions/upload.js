const { Pool } = require('pg');
const { nanoid } = require('nanoid');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

exports.handler = async (event) => {
  if (event.httpMethod!== 'POST') return { statusCode: 405, body: 'POST only' };
  try {
    const { fileName, fileSize, fileType, fileData } = JSON.parse(event.body);
    if (!fileName) return { statusCode: 400, body: JSON.stringify({ error: 'No file' }) };

    const fileId = require('crypto').randomUUID();
    const slug = nanoid(8);

    // FIXED: Use your actual table names airshare and airshare_link
    await pool.query(
      `INSERT INTO airshare (id, original_name, stored_name, size, mime_type, created_at)
       VALUES ($1,$2,$3,$4,$5,NOW())`,
      [fileId, fileName, fileName, fileSize, fileType]
    );

    await pool.query(
      `INSERT INTO airshare_link (id, slug, file_id, downloads_count, created_at)
       VALUES (gen_random_uuid(), $1, $2, 0, NOW())`,
      [slug, fileId]
    );

    return { statusCode: 200, body: JSON.stringify({ slug }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
