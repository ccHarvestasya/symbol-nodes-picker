import { NodesCreateDto } from '@/repository/nodes/dto/NodesCreateDto';
import { NodesFindDto } from '@/repository/nodes/dto/NodesFindDto';
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
   * ピアコレクション登録
   * @param createDto 登録DTO
   * @returns ピアドキュメント
   */
  async create(createDto: NodesCreateDto) {
    return await this.nodeModel.create(createDto);
  }

  /**
   * ピアコレクション単一更新
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
   * ピアコレクション検索
   * チェック日時が古い方から取得件数指定で検索
   * @param findDto 検索DTO
   * @param limit 取得件数
   * @returns ピアドキュメント配列
   */
  async findIsOldLimit(
    findDto: NodesFindDto,
    limit: number,
  ): Promise<NodeDocument[]> {
    return this.nodeModel
      .find(findDto)
      .sort({ 'peer.lastStatusCheck': -1 })
      .limit(limit)
      .exec();
  }

  /**
   * Apiリミット検索（古い順）
   * チェック日時が古い方から取得件数指定で検索
   * @param findDto 検索DTO
   * @param limit 取得件数
   * @returns ピアドキュメント配列
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
   * ピアコレクション検索
   * @param findDto 検索DTO
   * @returns ピアドキュメント配列
   */
  async find(findDto: NodesFindDto): Promise<NodeDocument[]> {
    return this.nodeModel.find(findDto).exec();
  }

  /**
   * ピアコレクション単一検索
   * @returns ピアドキュメント
   */
  async findOne(keyDto?: NodesKeyDto): Promise<NodeDocument> {
    return this.nodeModel.findOne(keyDto).exec();
  }

  /**
   * ピアコレクション検索更新
   * @returns ピアドキュメント
   */
  async findOneAndUpdate(
    keyDto: NodesKeyDto,
    nodeDoc: NodeDocument,
  ): Promise<NodeDocument> {
    return this.nodeModel.findOneAndUpdate(keyDto, nodeDoc).exec();
  }

  /**
   * ピアコレクション全件検索
   * @returns ピアドキュメント配列
   */
  async findAll(): Promise<NodeDocument[]> {
    return this.nodeModel.find().exec();
  }
}
