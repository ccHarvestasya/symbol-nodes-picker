import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PeersRepository } from 'src/repository/peers/peers.repository';
import { Peer, PeerSchema } from 'src/schema/peer.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Peer.name, schema: PeerSchema }])],
  controllers: [],
  providers: [PeersRepository],
  exports: [PeersRepository],
})
export class PeersModule {}
