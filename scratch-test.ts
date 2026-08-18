import axios from 'axios';

async function test() {
    try {
        // 1. Login
        const loginRes = await axios.post('http://localhost:3000/auth/login', {
            email: "test@example.com", // Assume a user exists
            password: "password123"
        }).catch(e => e.response);

        if (loginRes.status !== 200) {
            console.error("Login failed:", loginRes.data);
            return;
        }

        const refreshToken = loginRes.data.data.refreshToken;
        console.log("Got refresh token:", refreshToken);

        // 2. Refresh
        const refreshRes = await axios.post('http://localhost:3000/auth/refresh', {
            refreshToken
        }).catch(e => e.response);

        console.log("Refresh status:", refreshRes.status);
        console.log("Refresh data:", refreshRes.data);

    } catch (e) {
        console.error("Script error:", e);
    }
}
test();
