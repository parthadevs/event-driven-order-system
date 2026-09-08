import {
  Injectable,
  NotFoundException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRepository } from '@auth-service/modules/users/domain/repositories/user.repository';
import { JwtTokenService } from '@auth-service/security/jwt/jwt-token.service';

@Injectable()
export class GetMeUseCase {
  private readonly log = new Logger(GetMeUseCase.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtTokenService: JwtTokenService,
  ) {}

  async execute(input: { token: string }) {
    const { token } = input;

    if (!token) {
      throw new UnauthorizedException('Access token is missing');
    }

    let payload: any;
    try {
      payload = await this.jwtTokenService.verifyToken(token);
      if (payload.type !== 'access') {
        throw new UnauthorizedException('Invalid token type');
      }
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired access token');
    }

    const userId = payload.sub;
    this.log.log(`Request: Get Me for user ${userId}`);
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      success: true,
      code: 200,
      message: 'Current user retrieved successfully',
      timestamp: new Date().toISOString(),
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }
}
