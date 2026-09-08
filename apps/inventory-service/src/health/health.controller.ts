import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class InventoryHealthController {
  
  @MessagePattern({ cmd: 'health' })
  checkHealth() {
    return { 
      service: 'inventory-service', 
      status: 'ok', 
      timestamp: new Date().toISOString() 
    };
  }
}