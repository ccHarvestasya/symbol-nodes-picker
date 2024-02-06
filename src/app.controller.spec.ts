import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import configuration from '@/config/configuration';
import { PeersRepositoryModule } from '@/repository/peers/peers.repository.module';
import { PeersService } from '@/services/peers.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        PeersRepositoryModule,
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
      ],
      controllers: [AppController],
      providers: [AppService, PeersService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
