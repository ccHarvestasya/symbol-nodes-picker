import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import configuration from '@/config/configuration';
import { ApisModule } from '@/modules/apis.module';
import { PeersModule } from '@/modules/peers.module';
import { VotingsModule } from '@/modules/votings.module';
import { ApisRepositoryModule } from '@/repository/apis/apis.repository.module';
import { PeersRepositoryModule } from '@/repository/peers/peers.repository.module';
import { SettingsRepositoryModule } from '@/repository/settings/settings.repository.module';
import { VotingsRepositoryModule } from '@/repository/votings/votings.repository.module';
import { ApisService } from '@/services/apis.service';
import { PeersService } from '@/services/peers.service';
import { VotingsService } from '@/services/votings.service';
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
    PeersRepositoryModule,
    PeersModule,
    ApisRepositoryModule,
    ApisModule,
    VotingsRepositoryModule,
    VotingsModule,
  ],
  controllers: [AppController],
  providers: [AppService, PeersService, ApisService, VotingsService],
})
export class AppModule {}
