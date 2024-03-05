import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTimestampsConfig } from 'mongoose';

/**
 * 設定
 */
@Schema({ timestamps: true })
export class Setting {
  /**
   * キー
   */
  @Prop({ required: true })
  key: string;

  /**
   * 値
   */
  @Prop()
  value: string;
}

export type SettingDocument = HydratedDocument<Setting, SchemaTimestampsConfig>;
export const settingSchema = SchemaFactory.createForClass(Setting);
settingSchema.index({ key: 1 }, { unique: true });
