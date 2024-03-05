import { SettingsRepository } from '@/repository/settings/settings.repository';
import { Setting, settingSchema } from '@/schema/setting.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Setting.name, schema: settingSchema }]),
  ],
  controllers: [],
  providers: [SettingsRepository],
  exports: [SettingsRepository],
})
export class SettingsRepositoryModule {}
