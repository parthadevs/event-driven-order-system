import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class GetUserUseCase {
    private readonly log = new Logger(GetUserUseCase.name)


    async execute(id: string) {
        this.log.log(`Request: Get User`);
        return;
    }
}