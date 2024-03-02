import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTimestampsConfig } from 'mongoose';

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
  @Prop({ required: true })
  publicKey: string;

  /**
   * RESTゲートウェイURL
   */
  @Prop()
  restGatewayUrl: string;

  /**
   * HTTPs利用可否
   */
  @Prop()
  isHttpsEnabled: boolean;

  /**
   * ハーベスター数
   */
  @Prop()
  harvesters: number;

  /**
   * WebSocket
   */
  @Prop(
    raw({
      /**
       * 利用可否
       */
      isAvailable: { type: Boolean },

      /**
       * WebSocket(SSL)利用可否
       */
      wss: { type: Boolean },

      /**
       * WebSocketURL
       */
      url: { type: String },
    }),
  )
  webSocket: Record<string, any>;

  /**
   * Api利用可否
   */
  @Prop()
  isAvailable: boolean;

  /**
   * 1ページ毎のトランザクション検索数
   */
  @Prop()
  txSearchCountPerPage: number;

  /**
   * チェック日時
   */
  @Prop()
  lastStatusCheck: Date;
}

export type ApiDocument = HydratedDocument<Api, SchemaTimestampsConfig>;
export const ApiSchema = SchemaFactory.createForClass(Api);

ApiSchema.index({ host: 1, publicKey: 1 }, { unique: true });
