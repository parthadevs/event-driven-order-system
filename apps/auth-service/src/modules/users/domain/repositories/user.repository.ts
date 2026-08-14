
import { UserEntity } from "@auth-service/modules/users/domain/entities/user.entity";

export abstract class UserRepository {
    abstract findByEmail(
        email: string,
    ): Promise<UserEntity | null>;

    abstract findById(
        id: string,
    ): Promise<UserEntity | null>;

    abstract create(
        user: UserEntity,
    ): Promise<UserEntity>;

    abstract update(
        user: UserEntity,
    ): Promise<UserEntity>;

    abstract delete(
        id: string,
    ): Promise<void>;
}