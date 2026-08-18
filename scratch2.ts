import { JwtService } from '@nestjs/jwt';

async function test() {
    const jwtService = new JwtService();
    const token = await jwtService.signAsync({ sub: 123 }, { secret: "my_secret_key" });
    
    try {
        await jwtService.verifyAsync(token, { secret: undefined });
        console.log("Success with undefined secret!");
    } catch (e) {
        console.error("Error verifying:", e.message);
    }
}
test();
