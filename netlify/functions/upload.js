const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'POST only' };
  try {
    const { fileName, fileSize, fileType } = JSON.parse(event.body);
    const fileId = require('crypto').randomUUID();
    const slug = nanoid(8);

    await pool.query(
      `INSERT INTO airshare (id, original_name, stored_name, size, mime_type) VALUES ($1,$2,$3,$4,$5)`,
      [fileId, fileName, fileName, fileSize, fileType]
    );
    await pool.query(
      `INSERT INTO airshare_link (slug, file_id) VALUES ($1,$2)`,
      [slug, fileId]
    );
    return { statusCode: 200, body: JSON.stringify({ slug }) };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
