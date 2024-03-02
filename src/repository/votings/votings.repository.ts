import { VotingsCreateDto } from '@/repository/votings/dto/votingsCreateDto';
import { VotingsFindDto } from '@/repository/votings/dto/votingsFindDto';
import { VotingsKeyDto } from '@/repository/votings/dto/votingsKeyDto';
import { VotingsUpdateDto } from '@/repository/votings/dto/votingsUpdateDto';
import { Voting, VotingDocument } from '@/schema/voting.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateWriteOpResult } from 'mongoose';

@Injectable()
export class VotingsRepository {
  /**
   * コンストラクタ
   * @param votingModel Votingモデル
   */
  constructor(
    @InjectModel(Voting.name) private votingModel: Model<VotingDocument>,
  ) {}

  /**
   * ピアコレクション登録
   * @param createDto 登録DTO
   * @returns ピアドキュメント
   */
  async create(createDto: VotingsCreateDto): Promise<VotingDocument> {
    return await this.votingModel.create(createDto);
  }

  /**
   * ピアコレクション単一更新
   * @param keyDto キーDTO
   * @param updateDto 更新DTO
   * @returns 更新結果
   */
  async updateOne(
    keyDto: VotingsKeyDto,
    updateDto: VotingsUpdateDto,
  ): Promise<UpdateWriteOpResult> {
    return this.votingModel.updateOne(keyDto, updateDto).exec();
  }

  /**
   * ピアコレクション検索
   * @param findDto 検索DTO
   * @returns ピアドキュメント配列
   */
  async find(findDto: VotingsFindDto): Promise<VotingDocument[]> {
    return this.votingModel.find(findDto).exec();
  }

  /**
   * ピアコレクション単一検索
   * @returns ピアドキュメント
   */
  async findOne(findDto?: VotingsFindDto): Promise<VotingDocument> {
    return this.votingModel.findOne(findDto).exec();
  }

  /**
   * ピアコレクション全件検索
   * @returns ピアドキュメント配列
   */
  async findAll(): Promise<VotingDocument[]> {
    return this.votingModel.find().exec();
  }
}
