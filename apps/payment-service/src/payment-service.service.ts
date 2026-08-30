import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentServiceService {
  getHello(): string {
    return 'response from payment service';
  }
}
