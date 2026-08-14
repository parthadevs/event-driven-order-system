import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import { UserRepository } from "@auth-service/modules/users/domain/repositories/user.repository";
import { PasswordResetTokenRepository } from "@auth-service/modules/auth/domain/repositories/password-reset-token.repository";
import { ForgotPasswordDto } from "../dto/forgot-password.dto";
import * as crypto from "crypto";
import { ApiResponse } from "@shared/types/api.types";

@Injectable()
export class ForgotPasswordUseCase {
    private readonly log = new Logger(ForgotPasswordUseCase.name);

    constructor(
        private readonly userRepository: UserRepository,
        private readonly passwordResetTokenRepository: PasswordResetTokenRepository,
        // private readonly mailerService: MailerService,
    ) { }

    async execute(input: ForgotPasswordDto): Promise<ApiResponse<null>> {
        this.log.log(`Password reset requested for email: ${input.email}`);

        const user = await this.userRepository.findByEmail(input.email);

        if (!user) {
            this.log.warn(`Password reset requested for non-existing email: ${input.email}`);
            return {
                success: true,
                message: "If an account with this email exists, a password reset link has been sent.",
                code: 200,
                timestamp: new Date().toISOString(),
                data: null,
            };
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        await this.passwordResetTokenRepository.create({
            tokenHash: hashedToken,
            userId: user.id,
            expiresAt,
        });

        const resetUrl = `https://yourdomain.com/reset-password?token=${resetToken}&email=${user.email}`;

        this.log.log(`Reset URL generated: ${resetUrl}`);

        return {
            success: true,
            code: 200,
            message: "If an account with this email exists, a password reset link has been sent.",
            timestamp: new Date().toISOString(),
            data: null,
        };
    }
}