import { Injectable, Logger } from "@nestjs/common";
import { RegisterDto } from "../dto/register.dto";

@Injectable()
export class CreateUserUseCase {
    private readonly log = new Logger(CreateUserUseCase.name)


    async execute(input: RegisterDto) {
        this.log.log(`Request: Create User`);
        return;
    }
}