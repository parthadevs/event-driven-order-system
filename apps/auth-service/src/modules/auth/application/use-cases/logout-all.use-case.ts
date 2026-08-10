import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class LogoutAllUseCase {
    private readonly log = new Logger(LogoutAllUseCase.name)

    async execute(input: any) {
        this.log.log(`Request: Logout All`);
        return;
    }
}