const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

exports.handler = async (event) => {
  const slug = event.queryStringParameters.slug;
  try {
    const r = await pool.query(`SELECT f.original_name FROM share_links s JOIN files f ON f.id=s.file_id WHERE s.slug=$1`, [slug]);
    if (!r.rows.length) return { statusCode: 404, body: 'Link not found' };
    await pool.query(`UPDATE share_links SET downloads_count = downloads_count + 1 WHERE slug=$1`, [slug]);
    return { statusCode: 200, headers: { 'Content-Type': 'text/html' }, body: `<html><body style="font-family:sans-serif;text-align:center;padding:80px"><h2>File: ${r.rows[0].original_name}</h2><p>Download counted ✓</p><a href="/">Back</a></body></html>` };
  } catch (e) { return { statusCode: 500, body: e.message } }
};
