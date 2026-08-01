const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

exports.handler = async (event) => {
  const slug = event.queryStringParameters?.slug || event.path.split('/').pop();
  try {
    const res = await pool.query('SELECT * FROM airshare_link WHERE slug=$1', [slug]);
    if(!res.rows[0]) return { statusCode: 404, body: 'Link not found - upload a new file' };

    const fileRes = await pool.query('SELECT * FROM airshare WHERE id=$1', [res.rows[0].file_id]);
    if(!fileRes.rows[0]) return { statusCode: 404, body: 'File record not found' };

    const file = fileRes.rows[0];
    await pool.query('UPDATE airshare_link SET downloads_count = downloads_count + 1 WHERE slug=$1', [slug]);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: `<h1>File: ${file.original_name}</h1><p>Size: ${file.size} bytes</p><p>Type: ${file.mime_type}</p><p>Download count: ${res.rows[0].downloads_count + 1}</p><p>This proves link works! Next we add real storage.</p>`
    };
  } catch(e){
    return { statusCode: 500, body: e.message };
  }
};
