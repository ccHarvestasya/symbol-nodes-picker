import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, SchemaTimestampsConfig } from 'mongoose';

/**
 * チェーン
 * /chain/infoの情報を格納する。
 */
@Schema({ timestamps: true })
export class Chain {
  /**
   * ホスト
   */
  @Prop({ required: true })
  host: string;

  /**
   * 公開鍵
   */
  @Prop({ required: true })
  publicKey: string;

  /**
   * ブロック高
   */
  @Prop({ type: mongoose.Schema.Types.BigInt })
  chainHeight: bigint;

  /**
   * ファイナライゼーション
   */
  @Prop(
    raw({
      height: { type: mongoose.Schema.Types.BigInt },
      epoch: { type: Number },
      point: { type: Number },
      hash: { type: String },
    }),
  )
  finalization: Record<string, any>;
}

export type ChainDocument = HydratedDocument<Chain, SchemaTimestampsConfig>;
export const ChainSchema = SchemaFactory.createForClass(Chain);

ChainSchema.index({ host: 1, publicKey: 1 }, { unique: true });
