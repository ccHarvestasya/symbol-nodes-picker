import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, SchemaTimestampsConfig } from 'mongoose';

/**
 * Api
 */
@Schema({ timestamps: true })
export class Api {
  /**
   * ホスト
   */
  @Prop({ required: true })
  host: string;

  /**
   * 公開鍵
   */
  @Prop()
  publicKey: string;

  /**
   * ポート
   */
  @Prop()
  port: number;

  /**
   * フレンドリー名
   */
  @Prop()
  friendlyName: string;

  /**
   * バージョン
   */
  @Prop()
  version: number;

  /**
   * ジェネレーションハッシュシード
   */
  @Prop()
  networkGenerationHashSeed: string;

  /**
   * ロール
   */
  @Prop()
  roles: number;

  /**
   * ネットワークID
   */
  @Prop()
  networkIdentifier: number;

  /**
   * Peer 死活
   */
  @Prop()
  isAvailable: boolean;

  /**
   * HTTPS 有無
   */
  @Prop()
  isHttpsEnabled: boolean;

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

  /**
   * WebSocket
   */
  @Prop(
    raw({
      isAvailable: { type: Boolean },
      isHttpsEnabled: { type: Boolean },
    }),
  )
  websocket: Record<string, any>;
}

export type ApiDocument = HydratedDocument<Api, SchemaTimestampsConfig>;
export const ApiSchema = SchemaFactory.createForClass(Api);

ApiSchema.index({ host: 1, publicKey: 1 }, { unique: true });
