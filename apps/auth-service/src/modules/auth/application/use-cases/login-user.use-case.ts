import { Injectable } from "@nestjs/common";
import { UserRepository } from "../../../users/domain/repositories/user.repository";
import { AuthSessionRepository } from "../../domain/repositories/auth-session.repository";

@Injectable()
export class LoginUserUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly authSessionRepository: AuthSessionRepository,
        // private readonly passwordHasher: PasswordHasher,
        // private readonly jwtService: JwtService,
    ) { }

    async execute(input: any) {
        throw new Error("Method not implemented.");
    }
}