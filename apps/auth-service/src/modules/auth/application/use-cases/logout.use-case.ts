import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class LogoutUseCase {
    private readonly log = new Logger(LogoutUseCase.name)

    async execute(input: any) {
        this.log.log(`Request: Logout`);
        return;
    }
}