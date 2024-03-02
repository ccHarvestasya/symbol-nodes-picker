import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, SchemaTimestampsConfig } from 'mongoose';

/**
 * ピア
 * /node/info, /node/peersの情報を格納する。
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
  @Prop({ required: true })
  publicKey: string;

  /**
   * ノード公開鍵
   */
  @Prop()
  nodePublicKey: string;

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
   * 証明書有効期限
   */
  @Prop()
  certificateExpirationDate: Date;

  /**
   * Peer利用可否
   */
  @Prop()
  isAvailable: boolean;

  /**
   * チェック日時
   */
  @Prop()
  lastStatusCheck: Date;
}

export type PeerDocument = HydratedDocument<Peer, SchemaTimestampsConfig>;
export const PeerSchema = SchemaFactory.createForClass(Peer);

PeerSchema.index({ host: 1, publicKey: 1 }, { unique: true });
