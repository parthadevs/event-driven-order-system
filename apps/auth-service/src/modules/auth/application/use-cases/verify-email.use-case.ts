import { Logger, Injectable } from "@nestjs/common";

@Injectable()
export class VerifyEmailUseCase {
    private readonly log = new Logger(VerifyEmailUseCase.name)

    async execute(input: any) {
        this.log.log(`Request: Verify Email`);
        return;
    }
}