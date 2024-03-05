import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTimestampsConfig } from 'mongoose';

/** ノード */
@Schema({ timestamps: true })
export class Node {
  /** ホスト */
  @Prop({ required: true })
  host: string;

  /** 公開鍵 */
  @Prop({ required: true })
  publicKey: string;

  /** ピア */
  @Prop(
    raw({
      /** ノード公開鍵 */
      nodePublicKey: { type: String },

      /** ポート */
      port: { type: Number },

      /** フレンドリー名 */
      friendlyName: { type: String },

      /** バージョン */
      version: { type: Number },

      /** ジェネレーションハッシュシード */
      networkGenerationHashSeed: { type: String },

      /** ロール */
      roles: { type: Number },

      /** ネットワークID */
      networkIdentifier: { type: Number },

      /** ブロック高 */
      chainHeight: { type: BigInt },

      /** ファイナライゼーション */
      finalization: {
        type: {
          height: { type: BigInt },
          epoch: { type: Number },
          point: { type: Number },
          hash: { type: String },
        },
      },

      /** 証明書有効期限 */
      certificateExpirationDate: { type: Date },

      /** Peer利用可否 */
      isAvailable: { type: Boolean },

      /** チェック日時 */
      lastStatusCheck: { type: Date },
    }),
  )
  peer: Record<string, any>;

  /** Api */
  @Prop(
    raw({
      /** RESTゲートウェイURL */
      restGatewayUrl: { type: String },

      /** HTTPs利用可否 */
      isHttpsEnabled: { type: Boolean },

      /** ハーベスター数 */
      harvesters: { type: Number },

      /** WebSocket */
      webSocket: {
        type: {
          /** 利用可否 */
          isAvailable: { type: Boolean },

          /** WebSocket(SSL)利用可否 */
          wss: { type: Boolean },

          /** WebSocketURL */
          url: { type: String },
        },
      },

      /** Api利用可否 */
      isAvailable: { type: Boolean },

      /** 1ページ毎のトランザクション検索数 */
      txSearchCountPerPage: { type: Number },

      /** チェック日時 */
      lastStatusCheck: { type: Date },
    }),
  )
  api: Record<string, any>;

  /** Voting */
  @Prop(
    raw({
      /** Votingキー */
      votingKey: {
        type: {
          /** 公開鍵 */
          publicKey: { Type: String },

          /** 開始エポック */
          startEpoch: { Type: Number },

          /** 終了エポック */
          endEpoch: { Type: Number },
        },
      },

      /** アカウント残高 */
      accountBalance: { type: BigInt },

      /**
       * 投票有無
       * /finalization/proof/epoch/{epoch} にVoting公開鍵があれば有効
       */
      isVotingEnabled: { type: Boolean },

      /** チェック日時 */
      lastStatusCheck: { type: Date },
    }),
  )
  voting: Record<string, any>;
}

export type NodeDocument = HydratedDocument<Node, SchemaTimestampsConfig>;
export const nodeSchema = SchemaFactory.createForClass(Node);
nodeSchema.index({ host: 1, publicKey: 1 }, { unique: true });
