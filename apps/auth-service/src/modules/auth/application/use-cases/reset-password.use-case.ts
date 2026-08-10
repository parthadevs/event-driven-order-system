import { Logger, Injectable } from "@nestjs/common";

@Injectable()
export class ResetPasswordUseCase {
    private readonly log = new Logger(ResetPasswordUseCase.name)


    async execute(input: any) {
        this.log.log(`Request: Reset Password`);
        return;
    }
}