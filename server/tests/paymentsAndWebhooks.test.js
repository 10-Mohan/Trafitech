/* global jest */
const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

// Mock Stripe before requiring routes
const mockPaymentIntentsCreate = jest.fn();
const mockConstructEvent = jest.fn();

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: mockPaymentIntentsCreate,
    },
    webhooks: {
      constructEvent: mockConstructEvent,
    },
  }));
});

const Booking = require('../models/Booking');
const { getJwtSecret } = require('../config/jwt');
const paymentsRouter = require('../routes/payments');
const webhooksRouter = require('../routes/webhooks');

describe('Payments & Webhooks Routes', () => {
  let app;
  let validToken;
  const testUserId = 'user_test_123';
  const otherUserId = 'user_other_456';

  beforeAll(() => {
    validToken = jwt.sign({ id: testUserId, role: 'user' }, getJwtSecret(), { expiresIn: '1h' });

    app = express();
    // Mirror server/index.js: Mount webhooks with raw parsing before express.json()
    app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhooksRouter);
    app.use(express.json());
    app.use('/api/payments', paymentsRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/payments/create-payment-intent', () => {
    it('should return 401 if unauthenticated (no x-auth-token)', async () => {
      const res = await request(app)
        .post('/api/payments/create-payment-intent')
        .send({ bookingId: 'bk_1' });

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/No token/);
    });

    it('should return 400 if bookingId is missing', async () => {
      const res = await request(app)
        .post('/api/payments/create-payment-intent')
        .set('x-auth-token', validToken)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Booking ID is required');
    });

    it('should return 404 if booking is not found', async () => {
      jest.spyOn(Booking, 'findById').mockResolvedValueOnce(null);

      const res = await request(app)
        .post('/api/payments/create-payment-intent')
        .set('x-auth-token', validToken)
        .send({ bookingId: 'nonexistent_id' });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Booking not found');
    });

    it('should return 403 if user does not own the booking', async () => {
      const mockBooking = {
        _id: 'bk_1',
        user: otherUserId,
        totalPrice: 100,
        paymentStatus: 'pending',
      };
      jest.spyOn(Booking, 'findById').mockResolvedValueOnce(mockBooking);

      const res = await request(app)
        .post('/api/payments/create-payment-intent')
        .set('x-auth-token', validToken)
        .send({ bookingId: 'bk_1' });

      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Unauthorized access to this booking');
    });

    it('should return 400 if booking is already paid', async () => {
      const mockBooking = {
        _id: 'bk_1',
        user: testUserId,
        totalPrice: 100,
        paymentStatus: 'paid',
      };
      jest.spyOn(Booking, 'findById').mockResolvedValueOnce(mockBooking);

      const res = await request(app)
        .post('/api/payments/create-payment-intent')
        .set('x-auth-token', validToken)
        .send({ bookingId: 'bk_1' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Booking is already paid');
      expect(mockPaymentIntentsCreate).not.toHaveBeenCalled();
    });

    it('should return 400 if booking is marked completed', async () => {
      const mockBooking = {
        _id: 'bk_1',
        user: testUserId,
        totalPrice: 100,
        paymentStatus: 'completed',
      };
      jest.spyOn(Booking, 'findById').mockResolvedValueOnce(mockBooking);

      const res = await request(app)
        .post('/api/payments/create-payment-intent')
        .set('x-auth-token', validToken)
        .send({ bookingId: 'bk_1' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Booking is already paid');
      expect(mockPaymentIntentsCreate).not.toHaveBeenCalled();
    });

    it('should return 400 if booking is cancelled', async () => {
      const mockBooking = {
        _id: 'bk_1',
        user: testUserId,
        totalPrice: 100,
        paymentStatus: 'cancelled',
      };
      jest.spyOn(Booking, 'findById').mockResolvedValueOnce(mockBooking);

      const res = await request(app)
        .post('/api/payments/create-payment-intent')
        .set('x-auth-token', validToken)
        .send({ bookingId: 'bk_1' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Booking is cancelled');
      expect(mockPaymentIntentsCreate).not.toHaveBeenCalled();
    });

    it('should return 400 if booking is refunded', async () => {
      const mockBooking = {
        _id: 'bk_1',
        user: testUserId,
        totalPrice: 100,
        paymentStatus: 'refunded',
      };
      jest.spyOn(Booking, 'findById').mockResolvedValueOnce(mockBooking);

      const res = await request(app)
        .post('/api/payments/create-payment-intent')
        .set('x-auth-token', validToken)
        .send({ bookingId: 'bk_1' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Booking is cancelled');
      expect(mockPaymentIntentsCreate).not.toHaveBeenCalled();
    });

    it('should create PaymentIntent and return 200 with clientSecret for valid pending booking', async () => {
      const mockBooking = {
        _id: 'bk_1',
        user: testUserId,
        totalPrice: 75,
        paymentStatus: 'pending',
      };
      jest.spyOn(Booking, 'findById').mockResolvedValueOnce(mockBooking);
      mockPaymentIntentsCreate.mockResolvedValueOnce({
        client_secret: 'pi_test_secret_123',
      });

      const res = await request(app)
        .post('/api/payments/create-payment-intent')
        .set('x-auth-token', validToken)
        .send({ bookingId: 'bk_1', currency: 'inr' });

      expect(res.status).toBe(200);
      expect(res.body.clientSecret).toBe('pi_test_secret_123');
      expect(mockPaymentIntentsCreate).toHaveBeenCalledWith({
        amount: 7500,
        currency: 'inr',
        automatic_payment_methods: { enabled: true },
        metadata: { bookingId: 'bk_1' },
      });
    });

    it('should not leak err.stack in 500 error responses', async () => {
      const mockBooking = {
        _id: 'bk_1',
        user: testUserId,
        totalPrice: 50,
        paymentStatus: 'pending',
      };
      jest.spyOn(Booking, 'findById').mockResolvedValueOnce(mockBooking);
      mockPaymentIntentsCreate.mockRejectedValueOnce(new Error('Stripe API unavailable'));

      const res = await request(app)
        .post('/api/payments/create-payment-intent')
        .set('x-auth-token', validToken)
        .send({ bookingId: 'bk_1' });

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Stripe API unavailable');
      expect(res.body.error).toBeUndefined();
    });
  });

  describe('POST /api/webhooks', () => {
    it('should return 400 if Stripe signature verification fails', async () => {
      mockConstructEvent.mockImplementationOnce(() => {
        throw new Error('Invalid signature');
      });

      const res = await request(app)
        .post('/api/webhooks')
        .set('stripe-signature', 'invalid_sig')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({ id: 'evt_1' }));

      expect(res.status).toBe(400);
      expect(res.text).toContain('Webhook Error: Invalid signature');
    });

    it('should receive raw Buffer and update booking to paid on payment_intent.succeeded', async () => {
      const rawEvent = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_success_999',
            amount: 7500,
            metadata: { bookingId: 'bk_100' },
          },
        },
      };

      mockConstructEvent.mockImplementationOnce((rawBody) => {
        expect(Buffer.isBuffer(rawBody)).toBe(true);
        return rawEvent;
      });

      const mockSave = jest.fn().mockResolvedValue(true);
      const mockBookingInstance = {
        paymentStatus: 'pending',
        paymentId: null,
        save: mockSave,
      };
      jest.spyOn(Booking, 'findById').mockResolvedValueOnce(mockBookingInstance);

      const res = await request(app)
        .post('/api/webhooks')
        .set('stripe-signature', 'valid_test_sig')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(rawEvent));

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ received: true });
      expect(mockBookingInstance.paymentStatus).toBe('paid');
      expect(mockBookingInstance.paymentId).toBe('pi_success_999');
      expect(mockSave).toHaveBeenCalled();
    });

    it('should handle webhook event gracefully if booking is not found', async () => {
      const rawEvent = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_success_888',
            amount: 5000,
            metadata: { bookingId: 'bk_nonexistent' },
          },
        },
      };

      mockConstructEvent.mockReturnValueOnce(rawEvent);
      jest.spyOn(Booking, 'findById').mockResolvedValueOnce(null);

      const res = await request(app)
        .post('/api/webhooks')
        .set('stripe-signature', 'valid_test_sig')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(rawEvent));

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ received: true });
    });
  });
});
