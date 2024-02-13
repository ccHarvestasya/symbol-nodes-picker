import { PeersController } from '@/controllers/peers.controller';
import { PeersRepositoryModule } from '@/repository/peers/peers.repository.module';
import { SettingsRepositoryModule } from '@/repository/settings/settings.repository.module';
import { PeersService } from '@/services/peers.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [SettingsRepositoryModule, PeersRepositoryModule],
  controllers: [PeersController],
  providers: [PeersService],
  exports: [PeersService],
})
export class PeersModule {}
