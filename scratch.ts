import { JwtService } from '@nestjs/jwt';

async function test() {
    const jwtService = new JwtService();
    const secret = "my_secret_key";
    
    // Generate
    const token = await jwtService.signAsync({ sub: 123, type: 'refresh' }, { secret, expiresIn: "30d" });
    console.log("Token:", token);
    
    // Verify
    try {
        const payload = await jwtService.verifyAsync(token, { secret });
        console.log("Payload:", payload);
    } catch (e) {
        console.error("Error verifying:", e.message);
    }
}
test();
