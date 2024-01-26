import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Peer, PeerDocument } from '../../schema/peer.schema';
import { PeerCreateDto } from './dto/peerCreateDto';
import { PeerKeyDto } from './dto/peerKeyDto';
import { PeerUpdateDto } from './dto/peerUpdateDto';
import { PeersFindDto } from './dto/peersFindDto';

@Injectable()
export class PeersRepository {
  constructor(@InjectModel(Peer.name) private peerModel: Model<PeerDocument>) {}

  async create(peerCreateDto: PeerCreateDto): Promise<PeerDocument> {
    const createdPeer = await this.peerModel.create(peerCreateDto);
    return createdPeer;
  }

  async updateOne(peerKeyDto: PeerKeyDto, peerUpdateDto: PeerUpdateDto) {
    return this.peerModel.updateOne(peerKeyDto, peerUpdateDto).exec();
  }

  async findAll(): Promise<PeerDocument[]> {
    return this.peerModel.find().exec();
  }

  async findLimit(peersFindDto: PeersFindDto, limit: number): Promise<PeerDocument[]> {
    return this.peerModel.find(peersFindDto).limit(limit).exec();
  }

  async find(peersFindDto: PeersFindDto): Promise<PeerDocument[]> {
    return this.peerModel.find(peersFindDto).exec();
  }

  /**
   * Peer Find One
   * @returns Peer コレクション
   */
  async findOne(peersFindDto?: PeersFindDto): Promise<PeerDocument> {
    return this.peerModel.findOne(peersFindDto).exec();
  }
}
