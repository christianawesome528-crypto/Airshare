const { Pool } = require('pg');
const { nanoid } = require('nanoid');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

exports.handler = async (event) => {
  try {
    const fileName = event.headers['x-file-name'] || 'file-' + Date.now();
    const fileSize = event.headers['x-file-size'] || 0;
    const fileId = require('crypto').randomUUID();
    const slug = nanoid(8);

    await pool.query(
      `INSERT INTO files (id, original_name, stored_name, size, mime_type, created_at)
       VALUES ($1,$2,$3,$4,$5,NOW())`,
      [fileId, fileName, fileName, fileSize, 'application/octet-stream']
    );

    await pool.query(
      `INSERT INTO share_links (id, slug, file_id, downloads_count, created_at)
       VALUES (gen_random_uuid(), $1, $2, 0, NOW())`,
      [slug, fileId]
    );

    return { statusCode: 200, body: JSON.stringify({ slug, fileId }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
