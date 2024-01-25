import { Test, TestingModule } from '@nestjs/testing';
import { Peer2peerController } from './peer2peer.controller';

describe('Peer2peerController', () => {
  let controller: Peer2peerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Peer2peerController],
    }).compile();

    controller = module.get<Peer2peerController>(Peer2peerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
