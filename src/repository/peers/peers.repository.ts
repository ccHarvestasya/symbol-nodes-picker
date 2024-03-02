import { PeersCreateDto } from '@/repository/peers/dto/peersCreateDto';
import { PeersFindDto } from '@/repository/peers/dto/peersFindDto';
import { PeersKeyDto } from '@/repository/peers/dto/peersKeyDto';
import { PeersUpdateDto } from '@/repository/peers/dto/peersUpdateDto';
import { Peer, PeerDocument } from '@/schema/peer.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateWriteOpResult } from 'mongoose';

/**
 * Peerリポジトリ
 */
@Injectable()
export class PeersRepository {
  /**
   * コンストラクタ
   * @param peerModel Peerモデル
   */
  constructor(@InjectModel(Peer.name) private peerModel: Model<PeerDocument>) {}

  /**
   * ピアコレクション登録
   * @param createDto 登録DTO
   * @returns ピアドキュメント
   */
  async create(createDto: PeersCreateDto): Promise<PeerDocument> {
    return await this.peerModel.create(createDto);
  }

  /**
   * ピアコレクション単一更新
   * @param keyDto キーDTO
   * @param updateDto 更新DTO
   * @returns 更新結果
   */
  async updateOne(
    keyDto: PeersKeyDto,
    updateDto: PeersUpdateDto,
  ): Promise<UpdateWriteOpResult> {
    return this.peerModel.updateOne(keyDto, updateDto).exec();
  }

  /**
   * ピアコレクション検索
   * チェック日時が古い方から取得件数指定で検索
   * @param findDto 検索DTO
   * @param limit 取得件数
   * @returns ピアドキュメント配列
   */
  async findIsOldLimit(
    findDto: PeersFindDto,
    limit: number,
  ): Promise<PeerDocument[]> {
    return this.peerModel
      .find(findDto)
      .sort({ lastCheck: -1 })
      .limit(limit)
      .exec();
  }

  /**
   * ピアコレクション検索
   * @param findDto 検索DTO
   * @returns ピアドキュメント配列
   */
  async find(findDto: PeersFindDto): Promise<PeerDocument[]> {
    return this.peerModel.find(findDto).exec();
  }

  /**
   * ピアコレクション単一検索
   * @returns ピアドキュメント
   */
  async findOne(findDto?: PeersFindDto): Promise<PeerDocument> {
    return this.peerModel.findOne(findDto).exec();
  }

  /**
   * ピアコレクション全件検索
   * @returns ピアドキュメント配列
   */
  async findAll(): Promise<PeerDocument[]> {
    return this.peerModel.find().exec();
  }
}
