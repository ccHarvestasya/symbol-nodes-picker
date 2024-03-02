import { ApiController } from '@/controllers/apis.controller';
import { ApisRepositoryModule } from '@/repository/apis/apis.repository.module';
import { SettingsRepositoryModule } from '@/repository/settings/settings.repository.module';
import { ApisService } from '@/services/apis.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [SettingsRepositoryModule, ApisRepositoryModule],
  controllers: [ApiController],
  providers: [ApisService],
  exports: [ApisService],
})
export class ApisModule {}
