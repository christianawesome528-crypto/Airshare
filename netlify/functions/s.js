const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

exports.handler = async (event) => {
  const slug = event.queryStringParameters?.slug || event.path.split('/s/').pop();
  try {
    const res = await pool.query('SELECT * FROM airshare_link WHERE slug=$1', [slug]);
    if(!res.rows[0]) return { statusCode: 404, body: 'Link not found' };
    const fileId = res.rows[0].file_id;
    const fileRes = await pool.query('SELECT * FROM airshare WHERE id=$1', [fileId]);
    if(!fileRes.rows[0]) return { statusCode: 404, body: 'File not found' };
    const file = fileRes.rows[0];
    await pool.query('UPDATE airshare_link SET downloads_count = downloads_count + 1 WHERE slug=$1', [slug]);
    return {
      statusCode: 200,
      headers: { 'Content-Type': file.mime_type || 'application/octet-stream', 'Content-Disposition': `attachment; filename="${file.original_name}"` },
      body: `File: ${file.original_name} - Stored as ${file.stored_name} size ${file.size}`,
    };
  } catch(e){
    return { statusCode: 500, body: e.message };
  }
};
