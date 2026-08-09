import { Injectable } from "@nestjs/common";
import { UserRepository } from "../../../users/domain/repositories/user.repository";
import { EmailVerificationTokenRepository } from "../../domain/repositories/email-verification-token.repository";

@Injectable()
export class VerifyEmailUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly emailVerificationTokenRepository: EmailVerificationTokenRepository,
    ) { }

    async execute(input: any) {
        throw new Error("Method not implemented.");
    }
}