import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTimestampsConfig } from 'mongoose';

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
   * HTTPs有無
   */
  @Prop()
  isHttpsEnabled: boolean;

  /**
   * 証明書有効期限
   */
  @Prop()
  certificateExpirationDate: Date;

  /**
   * Peer死活
   */
  @Prop()
  isAvailable: boolean;

  /**
   * WebSocket利用可否
   */
  @Prop()
  isWsAvailable: boolean;

  /**
   * WebSocket(SSL)利用可否
   */
  @Prop()
  isWssAvailable: boolean;

  /**
   * チェック日時
   */
  @Prop()
  lastCheck: Date;

  /**
   * 同期チェック日時
   * 他ノードの/node/peersに載っているか確認出来た日時
   */
  @Prop()
  lastSyncCheck: Date;
}

export type PeerDocument = HydratedDocument<Peer, SchemaTimestampsConfig>;
export const PeerSchema = SchemaFactory.createForClass(Peer);

PeerSchema.index({ host: 1, publicKey: 1 }, { unique: true });
