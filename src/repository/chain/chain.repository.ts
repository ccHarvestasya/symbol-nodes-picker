import { ChainCreateDto } from '@/repository/chain/dto/chainCreateDto';
import { ChainKeyDto } from '@/repository/chain/dto/chainKeyDto';
import { ChainUpdateDto } from '@/repository/chain/dto/chainUpdateDto';
import { Chain, ChainDocument } from '@/schema/chain.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateWriteOpResult } from 'mongoose';

@Injectable()
export class ChainRepository {
  /**
   * コンストラクタ
   * @param chainModel Chainモデル
   */
  constructor(
    @InjectModel(Chain.name) private chainModel: Model<ChainDocument>,
  ) {}

  /**
   * Chainコレクション登録
   * @param createDto 登録DTO
   * @returns ChainDocument
   */
  async create(createDto: ChainCreateDto): Promise<ChainDocument> {
    return await this.chainModel.create(createDto);
  }

  /**
   * Chainコレクション単一更新
   * @param keyDto キーDTO
   * @param updateDto 更新DTO
   * @returns 更新結果
   */
  async updateOne(
    keyDto: ChainKeyDto,
    updateDto: ChainUpdateDto,
  ): Promise<UpdateWriteOpResult> {
    return this.chainModel.updateOne(keyDto, updateDto).exec();
  }
}
