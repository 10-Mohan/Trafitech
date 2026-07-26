const API_URL = '/api';

const handleResponse = async (response) => {
    if (!response.ok) {
        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
        let errorMessage = 'Something went wrong';
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch {
            errorMessage = `Backend server error (${response.status}). The server may be spinning up — please try again.`;
        }
        throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return response.json();
    }

    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch {
        throw new Error('Server returned non-JSON response.');
    }
};

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'x-auth-token': token || ''
    };
};

export const authAPI = {
    login: async (email, password, role) => {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, role })
        });
        const data = await handleResponse(response);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data;
    },
    register: async (username, email, password, role = 'user', adminSecret = '') => {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, role, adminSecret })
        });
        const data = await handleResponse(response);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data;
    },
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },
    getUsers: async () => {
        const response = await fetch(`${API_URL}/auth`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    }
};

export const bookingAPI = {
    getAll: async () => {
        const response = await fetch(`${API_URL}/bookings`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },
    getActiveSlots: async (zoneId) => {
        const response = await fetch(`${API_URL}/bookings/active-slots?zoneId=${zoneId}`, {
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
    update: async (bookingId, updateData) => {
        const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(updateData)
        });
        return handleResponse(response);
    },
    cancel: async (bookingId) => {
        const response = await fetch(`${API_URL}/bookings/${bookingId}/cancel`, {
            method: 'POST',
            headers: getHeaders()
        });
        return handleResponse(response);
    },
    createPaymentIntent: async (bookingId) => {
        const response = await fetch(`${API_URL}/payments/create-payment-intent`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ bookingId })
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

