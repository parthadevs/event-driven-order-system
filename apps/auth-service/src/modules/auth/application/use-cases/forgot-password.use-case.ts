import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class ForgotPasswordUseCase {
    private readonly log = new Logger(ForgotPasswordUseCase.name)

    async execute(input: any) {
        this.log.log(`Request: Password Reset`);

    }
}