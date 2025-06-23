import API_URL from '../redux/BaseUrl/baseurl';
import { store } from '../redux/store';
import { logout, setTokens } from '../redux/AuthSlice/authslice';

const getToken = () => store.getState()?.auth?.accessToken || '';
const getRefreshToken = () => store.getState()?.auth?.refershToken || '';

const refreshAccessToken = async () => {
    const refreshToken = getRefreshToken();

    const res = await fetch(`${API_URL}auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "refresh_token": refreshToken
        }),
    });
    
    if (!res.ok) {
        // If refresh token failed
        throw new Error('Refresh token expired');
    }

    const data = await res.json();
    console.log(data, "res");

    if (data?.data?.access_token) {
        // Dispatch to store new token
        store.dispatch(setTokens({ accessToken: data?.data?.access_token }));
        return data?.data?.access_token;
    }

    throw new Error('Invalid refresh response');
};

const request = async (method, endpoint, body = null, customHeaders = {}, retry = false) => {
    let token = getToken();

    const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        // ...customHeaders,
    };
    console.log(headers, "sdsfsf", endpoint);


    const res = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    console.log(data);

    // Check response before parsing
    if (data.status_code === 401 && !retry) {
        try {
            token = await refreshAccessToken();
            // Retry request with new access token
            return await request(method, endpoint, body, customHeaders, true);
        } catch (err) {
            // Both access & refresh failed → logout or fallback
            store.dispatch(logout());
            throw new Error('Session expired. Please login again.');
        }
    }

    if (!res.ok) {
        throw new Error(data?.message || 'API request failed');
    }

    return data;
};

export const customFetch = {
    get: (url, headers = {}) => request('GET', url, null, headers),
    post: (url, payload = {}, headers = {}) => request('POST', url, payload, headers),
    put: (url, payload = {}, headers = {}) => request('PUT', url, payload, headers),
    delete: (url, headers = {}) => request('DELETE', url, null, headers),
};
