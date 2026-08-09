import { Injectable } from "@nestjs/common";
import { AuthSessionRepository } from "../../domain/repositories/auth-session.repository";

@Injectable()
export class LogoutUseCase {
    constructor(
        private readonly authSessionRepository: AuthSessionRepository,
    ) { }

    async execute(input: any) {
        throw new Error("Method not implemented.");
    }
}