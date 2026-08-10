import { Controller, Post, Body, Put, Delete, Get, Param } from "@nestjs/common";
import { CreateUserUseCase } from "../../../auth/application/use-cases/create-user.use-case";
import { RegisterDto } from "../../../auth/application/dto/register.dto";
import { DeleteUserUseCase } from "../../application/use-cases/delete-user.use-case";
import { GetUserUseCase } from "../../application/use-cases/get-user.use-case";
import { UpdateUserUseCase } from "../../application/use-cases/update-user.use-case";

@Controller('users')
export class UsersController {
    constructor(
        private readonly deleteUserUseCase: DeleteUserUseCase,
        private readonly getUserUseCase: GetUserUseCase,
        private readonly updateUserUseCase: UpdateUserUseCase,
    ) { }

    // GET    /users/:id
    // PATCH  /users/:id
    // DELETE /users/:id


    @Get(":id")
    async get(@Param('id') id: string) {
        return this.getUserUseCase.execute(id);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() input: RegisterDto) {
        return this.updateUserUseCase.execute(id, input);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.deleteUserUseCase.execute(id);
    }




}