const request = require('supertest');
const express = require('express');

// Mock User model before importing auth routes
jest.mock('../models/User');
const User = require('../models/User');

// Mock getAdminSecret to return a known test value
jest.mock('../config/adminSecret', () => ({
  getAdminSecret: () => 'test-admin-secret-12345',
}));

// Mock getJwtSecret for token generation
jest.mock('../config/jwt', () => ({
  getJwtSecret: () => 'test-jwt-secret',
}));

const authRoutes = require('../routes/auth');

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  return app;
}

describe('Auth API — POST /api/auth/register', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock: no existing user found
    User.findOne.mockResolvedValue(null);

    // Mock User constructor and save
    User.mockImplementation((data) => ({
      ...data,
      _id: 'mock-user-id-123',
      save: jest.fn().mockResolvedValue(),
    }));
  });

  describe('Normal user registration', () => {
    it('should register a user without role specified and return 201', async () => {
      const res = await request(app).post('/api/auth/register').send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.role).toBe('user');
    });

    it('should register a user with explicit role="user" and return 201', async () => {
      const res = await request(app).post('/api/auth/register').send({
        username: 'testuser2',
        email: 'test2@example.com',
        password: 'password123',
        role: 'user',
      });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.role).toBe('user');
    });
  });

  describe('Admin registration with correct secret', () => {
    it('should register an admin with correct secret and return 201', async () => {
      const res = await request(app).post('/api/auth/register').send({
        username: 'adminuser',
        email: 'admin@example.com',
        password: 'adminpass123',
        role: 'admin',
        adminSecret: 'test-admin-secret-12345',
      });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.role).toBe('admin');
    });
  });

  describe('Admin registration with invalid secret', () => {
    it('should reject admin registration with wrong secret and return 403', async () => {
      const res = await request(app).post('/api/auth/register').send({
        username: 'badactor',
        email: 'bad@example.com',
        password: 'password123',
        role: 'admin',
        adminSecret: 'wrong-secret',
      });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe('Invalid or missing admin secret');
      // Verify User model was never called (no user created)
      expect(User).not.toHaveBeenCalled();
    });

    it('should reject admin registration without secret and return 403', async () => {
      const res = await request(app).post('/api/auth/register').send({
        username: 'badactor2',
        email: 'bad2@example.com',
        password: 'password123',
        role: 'admin',
      });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe('Invalid or missing admin secret');
      expect(User).not.toHaveBeenCalled();
    });

    it('should reject admin registration with empty secret and return 403', async () => {
      const res = await request(app).post('/api/auth/register').send({
        username: 'badactor3',
        email: 'bad3@example.com',
        password: 'password123',
        role: 'admin',
        adminSecret: '',
      });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe('Invalid or missing admin secret');
      expect(User).not.toHaveBeenCalled();
    });
  });
});
