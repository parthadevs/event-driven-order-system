import axios from 'axios';

async function test() {
    try {
        const loginRes = await axios.post('http://localhost:3001/auth/login', {
            email: "test2@example.com", 
            password: "password123"
        }).catch(e => e.response);

        const accessToken = loginRes.data.data.accessToken;
        
        // Refresh with ACCESS TOKEN instead of REFRESH TOKEN
        const refreshRes = await axios.post('http://localhost:3001/auth/refresh', {
            refreshToken: accessToken
        }).catch(e => e.response);
        console.log("Refresh status:", refreshRes.status);
        console.log("Refresh data:", refreshRes.data);

    } catch (e) {
        console.error("Script error:", e);
    }
}
test();
