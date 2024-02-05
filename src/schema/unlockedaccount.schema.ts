import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTimestampsConfig } from 'mongoose';

/**
 * アンロックドアカウント
 */
@Schema({ timestamps: true })
export class UnlockedAccount {
  /**
   * ホスト
   */
  @Prop({ required: true })
  host: string;

  /**
   * ノード公開鍵
   */
  @Prop({ required: true })
  nodePublicKey: string;

  /**
   * アドレス
   */
  @Prop()
  address: string;
}

export type UnlockedAccountDocument = HydratedDocument<UnlockedAccount, SchemaTimestampsConfig>;
export const UnlockedAccountSchema = SchemaFactory.createForClass(UnlockedAccount);

UnlockedAccountSchema.index({ host: 1, nodePublicKey: 1 }, { unique: true });
