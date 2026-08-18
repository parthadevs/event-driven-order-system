import axios from 'axios';

async function test() {
    try {
        // 1. Login via API Gateway (Port 3001)
        const loginRes = await axios.post('http://localhost:3001/auth/login', {
            email: "test2@example.com", 
            password: "password123"
        }).catch(e => e.response);

        const refreshToken = loginRes.data.data.refreshToken;
        
        // 2. Refresh via API Gateway (Port 3001) - FIRST TIME
        const refreshRes1 = await axios.post('http://localhost:3001/auth/refresh', {
            refreshToken
        }).catch(e => e.response);
        console.log("Refresh 1 status:", refreshRes1.status);

        // 3. Refresh via API Gateway (Port 3001) - SECOND TIME WITH SAME TOKEN
        const refreshRes2 = await axios.post('http://localhost:3001/auth/refresh', {
            refreshToken
        }).catch(e => e.response);
        console.log("Refresh 2 status:", refreshRes2.status);
        console.log("Refresh 2 data:", refreshRes2.data);

    } catch (e) {
        console.error("Script error:", e);
    }
}
test();
