import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { CraftyModule } from '@crafty/crafty';
import { PrismaMessageRepository } from '@crafty/crafty/infra/message.prisma.repository';
import { PrimaFolloweeRepository } from '@crafty/crafty/infra/followee.prisma.repository';
import { RealDateProvider } from '@crafty/crafty/infra/real-date.provider';
import { PrismaService } from '@crafty/crafty/infra/prisma.service';

@Module({
  imports: [
    CraftyModule.register({
      MessageRepository: PrismaMessageRepository,
      FolloweeRepository: PrimaFolloweeRepository,
      DateProvider: RealDateProvider,
      PrismaClient: PrismaService
    })
  ],
  controllers: [ApiController],
  providers: [],
})
export class ApiModule {}
