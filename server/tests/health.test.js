const request = require('supertest');
const express = require('express');

// Create a minimal test app (mirrors server/index.js without DB connection)
function createTestApp() {
  const app = express();
  app.use(express.json());

  app.get('/', (req, res) => {
    res.json({
      message: 'TraffiTech API is running',
      mode: 'Test Mode',
    });
  });

  return app;
}

describe('Health Check — GET /', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  it('should return 200 status', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
  });

  it('should return correct message', async () => {
    const res = await request(app).get('/');
    expect(res.body.message).toBe('TraffiTech API is running');
  });

  it('should return JSON content type', async () => {
    const res = await request(app).get('/');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('should include a mode field', async () => {
    const res = await request(app).get('/');
    expect(res.body).toHaveProperty('mode');
  });
});
