import { NodesCreateDto } from '@/repository/nodes/dto/NodesCreateDto';
import {
  NodesFindCondition,
  NodesFindDto,
} from '@/repository/nodes/dto/NodesFindDto';
import { NodesUpdateDto } from '@/repository/nodes/dto/NodesUpdateDto';
import { NodesKeyDto } from '@/repository/nodes/dto/nodesKeyDto';
import { Node, NodeDocument } from '@/schema/node.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateWriteOpResult } from 'mongoose';

/**
 * Nodeリポジトリ
 */
@Injectable()
export class NodesRepository {
  /**
   * コンストラクタ
   * @param nodeModel Nodeモデル
   */
  constructor(@InjectModel(Node.name) private nodeModel: Model<NodeDocument>) {}

  /**
   * Nodesコレクション登録
   * @param createDto 登録DTO
   * @returns Nodesドキュメント
   */
  async create(createDto: NodesCreateDto) {
    return await this.nodeModel.create(createDto);
  }

  /**
   * Nodesコレクション単一更新
   * @param keyDto キーDTO
   * @param updateDto 更新DTO
   * @returns 更新結果
   */
  async updateOne(
    keyDto: NodesKeyDto,
    updateDto: NodesUpdateDto,
  ): Promise<UpdateWriteOpResult> {
    return this.nodeModel.updateOne(keyDto, updateDto).exec();
  }

  /**
   * Nodesコレクション検索
   * チェック日時が古い方から取得件数指定で検索
   * @param findDto 検索DTO
   * @param limit 取得件数
   * @returns Nodesドキュメント配列
   */
  async findIsOldLimit(
    findDto: NodesFindDto,
    limit: number,
  ): Promise<NodeDocument[]> {
    return this.nodeModel
      .find(findDto)
      .sort({ 'peer.lastStatusCheck': 1 })
      .limit(limit)
      .exec();
  }

  /**
   * Apiリミット検索（古い順）
   * チェック日時が古い方から取得件数指定で検索
   * @param findDto 検索DTO
   * @param limit 取得件数
   * @returns Nodesドキュメント配列
   */
  async findApiIsOldLimit(
    findDto: NodesFindDto,
    limit: number,
  ): Promise<NodeDocument[]> {
    return this.nodeModel
      .find(findDto)
      .sort({ 'api.lastStatusCheck': 1 })
      .limit(limit)
      .exec();
  }

  /**
   * Votingリミット検索（古い順）
   * チェック日時が古い方から取得件数指定で検索
   * @param findDto 検索DTO
   * @param limit 取得件数
   * @returns Nodesドキュメント配列
   */
  async findVotingIsOldLimit(
    findDto: NodesFindDto,
    limit: number,
  ): Promise<NodeDocument[]> {
    return this.nodeModel
      .find(findDto)
      .sort({ 'voting.lastStatusCheck': 1 })
      .limit(limit)
      .exec();
  }

  /**
   * Nodesコレクション検索
   * @param findDto 検索DTO
   * @returns Nodesドキュメント配列
   */
  async find(condition: NodesFindCondition, limit: number) {
    if (limit === 0) {
      return this.nodeModel.find(condition).exec();
    }
    // return this.nodeModel.find(condition).limit(limit).exec();
    return this.nodeModel
      .aggregate([{ $match: condition }, { $sample: { size: limit } }])
      .limit(limit)
      .exec();
  }

  /**
   * Nodesコレクション単一検索
   * @returns Nodesドキュメント
   */
  async findOne(keyDto?: NodesKeyDto): Promise<NodeDocument> {
    return this.nodeModel.findOne(keyDto).exec();
  }

  /**
   * Apiが活きているノードをランダムに1件取得
   * @returns Nodeドキュメント
   */
  async findOneRandomAvailable() {
    return this.nodeModel
      .find({ 'api.isAvailable': true })
      .skip(
        Math.floor(
          Math.random() *
            (await this.nodeModel.find({ 'api.isAvailable': true }).exec())
              .length,
        ),
      )
      .limit(1)
      .exec();
  }

  /**
   * Nodesコレクション検索更新
   * @returns Nodesドキュメント
   */
  async findOneAndUpdate(
    keyDto: NodesKeyDto,
    nodeDoc: NodeDocument,
  ): Promise<NodeDocument> {
    return this.nodeModel.findOneAndUpdate(keyDto, nodeDoc).exec();
  }

  /**
   * Nodesコレクション全件検索
   * @returns Nodesドキュメント配列
   */
  async findAll(): Promise<NodeDocument[]> {
    return this.nodeModel.find().exec();
  }
}
