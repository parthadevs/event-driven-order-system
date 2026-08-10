import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class RefreshTokenUseCase {
    private readonly log = new Logger(RefreshTokenUseCase.name)

    async execute(input: any) {
        this.log.log(`Request: Refresh Token`);
        return;
    }
}