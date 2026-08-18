import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { JwtTokenService } from '@auth-service/security/jwt/jwt-token.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtTokenService: JwtTokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException('Access token is missing');
    }
    
    try {
      const payload = await this.jwtTokenService.verifyToken(token);
      if (payload.type !== 'access') {
          throw new UnauthorizedException('Invalid token type');
      }
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
