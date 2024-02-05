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
  @Prop()
  publicKey: string;

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

  /**
   * ネットワークプロパティ死活
   */
  isNetworkPropertiesAvailable: boolean;
}

export type ApiDocument = HydratedDocument<Api, SchemaTimestampsConfig>;
export const ApiSchema = SchemaFactory.createForClass(Api);

ApiSchema.index({ host: 1, publicKey: 1 }, { unique: true });
