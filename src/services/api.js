const API_URL = '/api';

const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong');
    }
    return response.json();
};

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'x-auth-token': token || ''
    };
};

export const authAPI = {
    login: async (email, password) => {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await handleResponse(response);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data;
    },
    register: async (username, email, password) => {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        const data = await handleResponse(response);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data;
    },
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};

export const bookingAPI = {
    getAll: async () => {
        const response = await fetch(`${API_URL}/bookings`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },
    create: async (bookingData) => {
        const response = await fetch(`${API_URL}/bookings`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(bookingData)
        });
        return handleResponse(response);
    },
    createPaymentIntent: async (amount) => {
        const response = await fetch(`${API_URL}/payments/create-payment-intent`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ amount })
        });
        return handleResponse(response);
    }
};

export const rapidsAnalyticsAPI = {
    getData: async () => {
        const response = await fetch(`${API_URL}/rapids-analytics/data`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },
    runBenchmark: async () => {
        const response = await fetch(`${API_URL}/rapids-analytics/run-benchmark`, {
            method: 'POST',
            headers: getHeaders()
        });
        return handleResponse(response);
    },
    query: async (sqlQuery) => {
        const response = await fetch(`${API_URL}/rapids-analytics/query`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ query: sqlQuery })
        });
        return handleResponse(response);
    },
    askGemini: async (prompt, dataContext) => {
        const response = await fetch(`${API_URL}/rapids-analytics/gemini`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ prompt, dataContext })
        });
        return handleResponse(response);
    }
};

