import { ApisCreateDto } from '@/repository/apis/dto/apisCreateDto';
import { ApisFindDto } from '@/repository/apis/dto/apisFindDto';
import { ApisKeyDto } from '@/repository/apis/dto/apisKeyDto';
import { ApisUpdateDto } from '@/repository/apis/dto/apisUpdateDto';
import { Api, ApiDocument } from '@/schema/api.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateWriteOpResult } from 'mongoose';

@Injectable()
export class ApisRepository {
  /**
   * コンストラクタ
   * @param apiModel Apiモデル
   */
  constructor(@InjectModel(Api.name) private apiModel: Model<ApiDocument>) {}

  /**
   * ピアコレクション登録
   * @param createDto 登録DTO
   * @returns ピアドキュメント
   */
  async create(createDto: ApisCreateDto): Promise<ApiDocument> {
    return await this.apiModel.create(createDto);
  }

  /**
   * ピアコレクション単一更新
   * @param keyDto キーDTO
   * @param updateDto 更新DTO
   * @returns 更新結果
   */
  async updateOne(
    keyDto: ApisKeyDto,
    updateDto: ApisUpdateDto,
  ): Promise<UpdateWriteOpResult> {
    return this.apiModel.updateOne(keyDto, updateDto).exec();
  }

  /**
   * ピアコレクション検索
   * @param findDto 検索DTO
   * @returns ピアドキュメント配列
   */
  async find(findDto: ApisFindDto): Promise<ApiDocument[]> {
    return this.apiModel.find(findDto).exec();
  }

  /**
   * ピアコレクション単一検索
   * @returns ピアドキュメント
   */
  async findOne(findDto?: ApisFindDto): Promise<ApiDocument> {
    return this.apiModel.findOne(findDto).exec();
  }

  /**
   * ピアコレクション全件検索
   * @returns ピアドキュメント配列
   */
  async findAll(): Promise<ApiDocument[]> {
    return this.apiModel.find().exec();
  }
}
