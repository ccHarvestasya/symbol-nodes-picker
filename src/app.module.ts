import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import configuration from '@/config/configuration';
import { NodesModule } from '@/modules/nodes.module';
import { NodesRepositoryModule } from '@/repository/nodes/nodes.repository.module';
import { SettingsRepositoryModule } from '@/repository/settings/settings.repository.module';
import { NodesService } from '@/services/nodes.service';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [configuration],
        }),
      ],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        retryAttempts: 3,
        uri: config.get<string>('db.mongo.uri'),
      }),
    }),
    SettingsRepositoryModule,
    NodesRepositoryModule,
    NodesModule,
  ],
  controllers: [AppController],
  providers: [AppService, NodesService],
})
export class AppModule {}
