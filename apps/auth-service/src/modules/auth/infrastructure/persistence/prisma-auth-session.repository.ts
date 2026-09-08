import { Injectable } from '@nestjs/common';
import { AuthSessionRepository } from '../../domain/repositories/auth-session.repository';
import { AuthSessionEntity } from '../../domain/entities/auth-session.entity';
import { PrismaService } from '../../../../infrastructure/persistence/prisma/prisma.service';
import { CreateAuthSessionData } from '../../domain/types/auth-session.types';
import { AuthSessionMapper } from '../../domain/mapper/auth-session.mapper';

@Injectable()
export class PrismaAuthSessionRepository implements AuthSessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateAuthSessionData): Promise<AuthSessionEntity> {
    const authSession = await this.prisma.authSession.create({
      data: {
        userId: data.userId,
        tokenHash: data.tokenHash,
        family: data.family,
        expiresAt: data.expiresAt,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });

    return AuthSessionMapper.toDomain(authSession);
  }

  async update(authSession: AuthSessionEntity): Promise<AuthSessionEntity> {
    const updatedAuthSession = await this.prisma.authSession.update({
      where: { id: authSession.id },
      data: {
        userId: authSession.userId,
        tokenHash: authSession.tokenHash,
        family: authSession.family,
        expiresAt: authSession.expiresAt,
        ipAddress: authSession.ipAddress,
        userAgent: authSession.userAgent,
        revokedAt: authSession.revokedAt,
        revocationReason: authSession.revocationReason,
        replacedTokenHash: authSession.replacedTokenHash,
      },
    });

    return AuthSessionMapper.toDomain(updatedAuthSession);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.authSession.delete({ where: { id } });
  }

  async findById(id: string): Promise<AuthSessionEntity | null> {
    const session = await this.prisma.authSession.findUnique({
      where: { id },
    });

    if (!session) return null;
    return AuthSessionMapper.toDomain(session);
  }

  async findAll(): Promise<AuthSessionEntity[]> {
    const sessions = await this.prisma.authSession.findMany();
    return sessions.map((session) => AuthSessionMapper.toDomain(session));
  }

  async findByTokenHash(tokenHash: string): Promise<AuthSessionEntity | null> {
    const session = await this.prisma.authSession.findUnique({
      where: { tokenHash },
    });

    if (!session) return null;
    return AuthSessionMapper.toDomain(session);
  }

  async findByFamily(family: string): Promise<AuthSessionEntity[]> {
    const sessions = await this.prisma.authSession.findMany({
      where: { family },
    });
    return sessions.map((session) => AuthSessionMapper.toDomain(session));
  }
}
