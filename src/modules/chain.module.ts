import { ChainController } from '@/controllers/chain.controller';
import { ChainRepositoryModule } from '@/repository/chain/chain.repository.module';
import { PeersRepositoryModule } from '@/repository/peers/peers.repository.module';
import { SettingsRepositoryModule } from '@/repository/settings/settings.repository.module';
import { ChainService } from '@/services/chain.service';
import { PeersService } from '@/services/peers.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    SettingsRepositoryModule,
    ChainRepositoryModule,
    PeersRepositoryModule,
  ],
  controllers: [ChainController],
  providers: [ChainService, PeersService],
  exports: [ChainService],
})
export class ChainModule {}
