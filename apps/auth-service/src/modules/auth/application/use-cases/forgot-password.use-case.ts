import { Injectable } from "@nestjs/common";
import { UserRepository } from "../../../users/domain/repositories/user.repository";
import { PasswordResetTokenRepository } from "../../domain/repositories/password-reset-token.repository";

@Injectable()
export class ForgotPasswordUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly passwordResetTokenRepository: PasswordResetTokenRepository,
    ) { }

    async execute(input: any) {
        throw new Error("Method not implemented.");
    }
}