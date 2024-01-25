import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { PeersModule } from './repository/peers/peers.module';

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
    PeersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
