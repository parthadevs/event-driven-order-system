import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class DeleteUserUseCase {
    private readonly log = new Logger(DeleteUserUseCase.name)


    async execute(id: string) {
        this.log.log(`Request: Delete User ${id}`);

        return;
    }
}