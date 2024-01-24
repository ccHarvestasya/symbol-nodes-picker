import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Peer, PeerDocument } from '../../schema/peer.schema';
import { PeersFindDto } from './dto/peersFindDto';

@Injectable()
export class PeersRepository {
  constructor(@InjectModel(Peer.name) private peerModel: Model<PeerDocument>) {}

  async create(peer: Peer): Promise<Peer> {
    const createdPeer = await this.peerModel.create(peer);
    return createdPeer;
    // return createdPeer.save();
  }

  async findAll(peersFindDto?: PeersFindDto): Promise<Peer[]> {
    return this.peerModel.find(peersFindDto).exec();
  }

  /**
   * Peer Find One
   * @returns Peer コレクション
   */
  async findOne(peersFindDto?: PeersFindDto): Promise<Peer> {
    return this.peerModel.findOne(peersFindDto).exec();
  }
}
