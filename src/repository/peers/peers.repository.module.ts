import { PeersRepository } from '@/repository/peers/peers.repository';
import { Peer, PeerSchema } from '@/schema/peer.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forFeature([{ name: Peer.name, schema: PeerSchema }])],
  controllers: [],
  providers: [PeersRepository],
  exports: [PeersRepository],
})
export class PeersRepositoryModule {}
