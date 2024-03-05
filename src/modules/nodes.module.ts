import { NodesController } from '@/controllers/nodes.controller';
import { NodesRepositoryModule } from '@/repository/nodes/nodes.repository.module';
import { SettingsRepositoryModule } from '@/repository/settings/settings.repository.module';
import { NodesService } from '@/services/nodes.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [SettingsRepositoryModule, NodesRepositoryModule],
  controllers: [NodesController],
  providers: [NodesService],
  exports: [NodesService],
})
export class NodesModule {}
