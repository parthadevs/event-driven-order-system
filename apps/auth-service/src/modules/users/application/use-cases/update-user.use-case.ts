import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class UpdateUserUseCase {
    private readonly log = new Logger(UpdateUserUseCase.name)

    async execute(id: string, input: any) {
        this.log.log(`Request: Update User ${id}`);
        return;
    }
}