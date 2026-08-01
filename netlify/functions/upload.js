const { getStore } = require('@netlify/blobs');
const { nanoid } = require('nanoid');

exports.handler = async (event) => {
  if (event.httpMethod!== 'POST') return { statusCode: 405, body: 'POST only' };
  try {
    const { fileName, fileType, fileData } = JSON.parse(event.body);
    const slug = nanoid(8);
    const store = getStore('files');
    await store.setJSON(slug, { fileName, fileType, fileData, created: Date.now() });
    return { statusCode: 200, body: JSON.stringify({ slug }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
