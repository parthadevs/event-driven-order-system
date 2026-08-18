import { JwtService } from '@nestjs/jwt';

async function test() {
    const jwtService = new JwtService();
    try {
        const token = await jwtService.signAsync({ sub: 123 }, { secret: undefined });
        console.log("Token with undefined secret:", token);
    } catch (e) {
        console.error("Error signing:", e.message);
    }
}
test();
