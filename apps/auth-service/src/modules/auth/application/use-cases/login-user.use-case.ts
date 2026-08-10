import { Injectable } from "@nestjs/common";
import { Logger } from "@nestjs/common";

@Injectable()
export class LoginUserUseCase {
    private readonly log = new Logger(LoginUserUseCase.name)


    async execute(input: any) {
        return {
            success: true,
            code: 200,
            message: "User logged in successfully",
            data: input
        };
    }
}