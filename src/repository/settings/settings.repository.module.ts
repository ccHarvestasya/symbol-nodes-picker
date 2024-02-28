import { SettingsRepository } from '@/repository/settings/settings.repository';
import { Setting, SettingSchema } from '@/schema/setting.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Setting.name, schema: SettingSchema }]),
  ],
  controllers: [],
  providers: [SettingsRepository],
  exports: [SettingsRepository],
})
export class SettingsRepositoryModule {}
