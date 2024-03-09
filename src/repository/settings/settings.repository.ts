import { SettingCreateDto } from '@/repository/settings/dto/SettingCreateDto';
import { SettingKeyDto } from '@/repository/settings/dto/SettingKeyDto';
import { SettingUpdateDto } from '@/repository/settings/dto/SettingUpdateDto';
import { Setting, SettingDocument } from '@/schema/setting.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateWriteOpResult } from 'mongoose';

@Injectable()
export class SettingsRepository {
  /**
   * コンストラクタ
   * @param settingModel 設定モデル
   */
  constructor(
    @InjectModel(Setting.name) private settingModel: Model<SettingDocument>,
  ) {}

  /**
   * 登録
   * @param createDto 登録DTO
   * @returns ドキュメント
   */
  async create(createDto: SettingCreateDto): Promise<SettingDocument> {
    return await this.settingModel.create(createDto);
  }

  /**
   * 単一更新
   * @param keyDto キーDTO
   * @param updateDto 更新DTO
   * @returns 更新結果
   */
  async updateOne(
    keyDto: SettingKeyDto,
    updateDto: SettingUpdateDto,
  ): Promise<UpdateWriteOpResult> {
    return this.settingModel.updateOne(keyDto, updateDto).exec();
  }

  /**
   * 単一検索
   * @returns ドキュメント
   */
  async findOne(findDto: SettingKeyDto): Promise<SettingDocument> {
    return this.settingModel.findOne(findDto).exec();
  }
}
