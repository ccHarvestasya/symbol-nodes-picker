import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Peer, PeerSchema } from '../../schema/peer.schema';
import { PeersRepository } from './peers.repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: Peer.name, schema: PeerSchema }])],
  controllers: [],
  providers: [PeersRepository],
  exports: [PeersRepository],
})
export class PeersModule {}
