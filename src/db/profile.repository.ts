import { Prisma } from '@prisma/client';
import { prismaClient } from './prisma-client';

export class ProfileRepository {
  static create(profile: Prisma.ProfileCreateInput) {
    return prismaClient.profile.create({
      data: profile
    });
  }

  static getByTelegramId(telegramId: string) {
    return prismaClient.profile.findUnique({
      where: { telegramId }
    });
  }

  static updateProfileByTgId(
    telegramId: string,
    updates: Prisma.ProfileUpdateInput
  ) {
    return prismaClient.profile.update({
      where: { telegramId },
      data: updates
    });
  }
}