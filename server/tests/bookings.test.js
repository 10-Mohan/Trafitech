const request = require('supertest');
const express = require('express');

// Minimal in-memory bookings store for testing (bypasses MongoDB)
let bookingsStore = [];

function createBookingsTestApp() {
  const app = express();
  app.use(express.json());

  // POST /api/bookings — create a booking
  app.post('/api/bookings', (req, res) => {
    const { zone, spotId, userId, startTime, duration } = req.body;

    // Validate required fields
    if (!zone || !spotId || !userId || !startTime || !duration) {
      return res.status(400).json({
        error: 'Missing required fields: zone, spotId, userId, startTime, duration',
      });
    }

    if (typeof duration !== 'number' || duration <= 0) {
      return res.status(400).json({ error: 'duration must be a positive number (hours)' });
    }

    const booking = {
      id: `booking_${Date.now()}`,
      zone,
      spotId,
      userId,
      startTime,
      duration,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    bookingsStore.push(booking);
    return res.status(201).json({ success: true, booking });
  });

  // GET /api/bookings — list bookings
  app.get('/api/bookings', (req, res) => {
    res.json({ bookings: bookingsStore });
  });

  return app;
}

describe('Bookings API', () => {
  let app;

  beforeAll(() => {
    app = createBookingsTestApp();
  });

  beforeEach(() => {
    // Reset store between tests
    bookingsStore = [];
  });

  // --- POST /api/bookings ---
  describe('POST /api/bookings', () => {
    it('should create a booking and return 201 with valid data', async () => {
      const res = await request(app).post('/api/bookings').send({
        zone: 'Zone A — Central Hub',
        spotId: 'A-12',
        userId: 'user_abc123',
        startTime: '2026-07-17T09:00:00Z',
        duration: 2,
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.booking).toHaveProperty('id');
      expect(res.body.booking.zone).toBe('Zone A — Central Hub');
      expect(res.body.booking.status).toBe('confirmed');
    });

    it('should return 400 when zone is missing', async () => {
      const res = await request(app).post('/api/bookings').send({
        spotId: 'A-12',
        userId: 'user_abc123',
        startTime: '2026-07-17T09:00:00Z',
        duration: 2,
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should return 400 when userId is missing', async () => {
      const res = await request(app).post('/api/bookings').send({
        zone: 'Zone B',
        spotId: 'B-05',
        startTime: '2026-07-17T09:00:00Z',
        duration: 1,
      });

      expect(res.statusCode).toBe(400);
    });

    it('should return 400 when duration is invalid (zero)', async () => {
      const res = await request(app).post('/api/bookings').send({
        zone: 'Zone A',
        spotId: 'A-01',
        userId: 'user_xyz',
        startTime: '2026-07-17T10:00:00Z',
        duration: 0,
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatch(/duration/);
    });

    it('should return 400 when body is empty', async () => {
      const res = await request(app).post('/api/bookings').send({});
      expect(res.statusCode).toBe(400);
    });
  });

  // --- GET /api/bookings ---
  describe('GET /api/bookings', () => {
    it('should return empty array initially', async () => {
      const res = await request(app).get('/api/bookings');
      expect(res.statusCode).toBe(200);
      expect(res.body.bookings).toEqual([]);
    });

    it('should return created bookings', async () => {
      // First create a booking
      await request(app).post('/api/bookings').send({
        zone: 'Zone C',
        spotId: 'C-03',
        userId: 'user_test',
        startTime: '2026-07-17T11:00:00Z',
        duration: 3,
      });

      const res = await request(app).get('/api/bookings');
      expect(res.statusCode).toBe(200);
      expect(res.body.bookings).toHaveLength(1);
      expect(res.body.bookings[0].zone).toBe('Zone C');
    });
  });
});
