import { Injectable } from "@nestjs/common";
import { UserRepository } from "../../../users/domain/repositories/user.repository";
import { AuthSessionRepository } from "../../domain/repositories/auth-session.repository";

@Injectable()
export class ResetPasswordUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly authSessionRepository: AuthSessionRepository,
    ) { }

    async execute(input: any) {
        throw new Error("Method not implemented.");
    }
}