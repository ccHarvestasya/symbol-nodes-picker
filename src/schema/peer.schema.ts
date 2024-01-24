import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, SchemaTimestampsConfig } from 'mongoose';

/**
 * ファイナライゼーション
 */
export class Finalization {
  /**
   * ブロック高
   */
  height: bigint;

  /**
   * エポック
   */
  epoch: number;

  /**
   * ポイント
   */
  point: number;

  /**
   * ハッシュ
   */
  hash: string;
}

/**
 * ピア
 */
@Schema({ timestamps: true })
export class Peer {
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
  @Prop()
  finalization: Finalization;
}

export type PeerDocument = HydratedDocument<Peer, SchemaTimestampsConfig>;
export const PeerSchema = SchemaFactory.createForClass(Peer);

PeerSchema.index({ host: 1, publicKey: 1 }, { unique: true });
