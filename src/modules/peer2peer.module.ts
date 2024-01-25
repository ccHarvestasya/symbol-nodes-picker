import { Module } from '@nestjs/common';
import { PeersModule } from 'src/repository/peers/peers.module';
import { Peer2peerController } from '../controllers/peer2peer.controller';
import { NodePeer2peersService } from '../services/nodepeer2peers.service';

@Module({
  imports: [PeersModule],
  controllers: [Peer2peerController],
  providers: [NodePeer2peersService],
})
export class Peer2peerModule {}
