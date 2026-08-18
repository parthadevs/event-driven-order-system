import axios from 'axios';

async function test() {
    try {
        // 0. Register
        await axios.post('http://localhost:3000/auth/register', {
            email: "test2@example.com",
            password: "password123",
            firstName: "Test",
            lastName: "User"
        }).catch(e => e.response);

        // 1. Login
        const loginRes = await axios.post('http://localhost:3000/auth/login', {
            email: "test2@example.com", 
            password: "password123"
        }).catch(e => e.response);

        if (loginRes.status !== 200 && loginRes.status !== 201) {
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
