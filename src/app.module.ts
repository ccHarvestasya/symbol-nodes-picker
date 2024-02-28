import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import configuration from '@/config/configuration';
import { ChainModule } from '@/modules/chain.module';
import { PeersModule } from '@/modules/peers.module';
import { ChainRepositoryModule } from '@/repository/chain/chain.repository.module';
import { PeersRepositoryModule } from '@/repository/peers/peers.repository.module';
import { SettingsRepositoryModule } from '@/repository/settings/settings.repository.module';
import { ChainService } from '@/services/chain.service';
import { PeersService } from '@/services/peers.service';
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
    ChainRepositoryModule,
    ChainModule,
  ],
  controllers: [AppController],
  providers: [AppService, PeersService, ChainService],
})
export class AppModule {}
