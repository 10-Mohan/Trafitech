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

const fetchWithRetry = async (url, options = {}, retries = 3, delayMs = 2000) => {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const response = await fetch(url, options);

            // If Render backend is spinning up (502/503/504), retry up to `retries` times
            if ([502, 503, 504].includes(response.status) && attempt < retries) {
                console.warn(`[Render Warmup] Status ${response.status}. Retrying attempt ${attempt + 1}/${retries} in ${delayMs}ms...`);
                await new Promise(r => setTimeout(r, delayMs));
                continue;
            }

            return await handleResponse(response);
        } catch (err) {
            const isRetryable = attempt < retries && (
                err.message.includes('502') ||
                err.message.includes('503') ||
                err.message.includes('504') ||
                err.message.includes('Failed to fetch') ||
                err.message.includes('NetworkError')
            );
            if (isRetryable) {
                console.warn(`[Render Warmup] Network notice: ${err.message}. Retrying attempt ${attempt + 1}/${retries} in ${delayMs}ms...`);
                await new Promise(r => setTimeout(r, delayMs));
                continue;
            }
            throw err;
        }
    }
};

export const authAPI = {
    login: async (email, password, role) => {
        const data = await fetchWithRetry(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, role })
        });
        if (data?.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
        }
        return data;
    },
    register: async (username, email, password, role = 'user', adminSecret = '') => {
        const data = await fetchWithRetry(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, role, adminSecret })
        });
        if (data?.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
        }
        return data;
    },
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },
    getUsers: async () => {
        return fetchWithRetry(`${API_URL}/auth`, {
            headers: getHeaders()
        });
    }
};

export const bookingAPI = {
    getAll: async () => {
        return fetchWithRetry(`${API_URL}/bookings`, {
            headers: getHeaders()
        });
    },
    getActiveSlots: async (zoneId) => {
        return fetchWithRetry(`${API_URL}/bookings/active-slots?zoneId=${zoneId}`, {
            headers: getHeaders()
        });
    },
    create: async (bookingData) => {
        return fetchWithRetry(`${API_URL}/bookings`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(bookingData)
        });
    },
    update: async (bookingId, updateData) => {
        return fetchWithRetry(`${API_URL}/bookings/${bookingId}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(updateData)
        });
    },
    cancel: async (bookingId) => {
        return fetchWithRetry(`${API_URL}/bookings/${bookingId}/cancel`, {
            method: 'POST',
            headers: getHeaders()
        });
    },
    createPaymentIntent: async (bookingId) => {
        return fetchWithRetry(`${API_URL}/payments/create-payment-intent`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ bookingId })
        });
    }
};

export const rapidsAnalyticsAPI = {
    getData: async () => {
        return fetchWithRetry(`${API_URL}/rapids-analytics/data`, {
            headers: getHeaders()
        });
    },
    runBenchmark: async () => {
        return fetchWithRetry(`${API_URL}/rapids-analytics/run-benchmark`, {
            method: 'POST',
            headers: getHeaders()
        });
    },
    query: async (sqlQuery) => {
        return fetchWithRetry(`${API_URL}/rapids-analytics/query`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ query: sqlQuery })
        });
    },
    askGemini: async (prompt, dataContext) => {
        return fetchWithRetry(`${API_URL}/rapids-analytics/gemini`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ prompt, dataContext })
        });
    }
};
