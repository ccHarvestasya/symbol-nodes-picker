import { VotingsController } from '@/controllers/votings.controller';
import { SettingsRepositoryModule } from '@/repository/settings/settings.repository.module';
import { VotingsRepositoryModule } from '@/repository/votings/votings.repository.module';
import { VotingsService } from '@/services/votings.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [SettingsRepositoryModule, VotingsRepositoryModule],
  controllers: [VotingsController],
  providers: [VotingsService],
  exports: [VotingsService],
})
export class VotingsModule {}
