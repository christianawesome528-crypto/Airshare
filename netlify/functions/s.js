const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  const slug = event.path.split('/').pop().split('?')[0];
  try {
    const store = getStore('files');
    const data = await store.get(slug, { type: 'json' });
    if (!data) return { statusCode: 404, body: 'Link not found' };

    const buffer = Buffer.from(data.fileData.split(',')[1] || data.fileData, 'base64');
    return {
      statusCode: 200,
      headers: {
        'Content-Type': data.fileType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${data.fileName}"`
      },
      body: buffer.toString('base64'),
      isBase64Encoded: true
    };
  } catch(e) {
    return { statusCode: 500, body: e.message };
  }
};
