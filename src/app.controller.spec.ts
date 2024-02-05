import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { PeersModule } from '@/repository/peers/peers.repository.module';
import { Test, TestingModule } from '@nestjs/testing';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [PeersModule],
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
