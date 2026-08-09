import { Module } from '@nestjs/common';
import { AuthServiceController } from './modules/auth/presentation/controllers/auth.controller';
import { AuthServiceService } from './modules/auth/application/use-cases/auth.service';
import { ConfigModule } from '@app/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
@Module({
  imports: [
    ConfigModule,
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
  controllers: [AuthServiceController],
  providers: [AuthServiceService],
})
export class AppModule { }
