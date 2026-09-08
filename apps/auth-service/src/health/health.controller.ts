import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AuthHealthController {
  
  @MessagePattern({ cmd: 'health' })
  ping() {
    return { 
      service: 'auth-service', 
      status: 'ok', 
      timestamp: new Date().toISOString() 
    };
  }
}
