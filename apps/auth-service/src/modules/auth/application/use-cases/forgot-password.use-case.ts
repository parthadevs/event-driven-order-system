import { Injectable, Logger } from "@nestjs/common";
import { PrismaUserRepository } from "../../../users/infrastructure/persistence/prisma-user.repository";

@Injectable()
export class ForgotPasswordUseCase {
    private readonly log = new Logger(ForgotPasswordUseCase.name)

    constructor(
        private readonly userRepository: PrismaUserRepository,
    ) { }

    private isValidEmail(email: string | undefined): boolean {
        if (!email) return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    async execute(input: any) {
        this.log.log(`Request: Password Reset`);

        // validate email
        if (!this.isValidEmail(input.email)) {
            this.log.error(`Invalid email`);
            throw new Error(`Invalid email`);
        }

        // check user exists or not
        const user = await this.userRepository.findByEmail(input.email);
        if (!user) {
            this.log.error(`User not found`);
            throw new Error(`User not found`);
        }



    }
}