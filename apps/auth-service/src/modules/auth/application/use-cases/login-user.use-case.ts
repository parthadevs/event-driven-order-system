import { Injectable } from "@nestjs/common";
import { Logger } from "@nestjs/common";

@Injectable()
export class LoginUserUseCase {
    private readonly log = new Logger(LoginUserUseCase.name)


    async execute(input: any) {
        this.log.log(`Request: Login User`);
        return;
    }
}