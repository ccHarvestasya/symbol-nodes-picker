import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { PeersModule } from './repository/peers/peers.module';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
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
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
