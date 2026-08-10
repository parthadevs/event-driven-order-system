import { Module } from '@nestjs/common';
import { ConfigModule } from '@app/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
@Module({
  imports: [
    ConfigModule,
    AuthModule,
    UsersModule,
    ClientsModule.register([
      {
        name: "AUTH_SERVICE",
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: "auth-service",
            brokers: ["localhost:9092"],
          },
        },
      },
    ]),
  ],
  providers: [],
})
export class AppModule { }
