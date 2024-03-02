import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, SchemaTimestampsConfig } from 'mongoose';

@Schema({ timestamps: true })
export class Voting {
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
   * Votingキー
   */
  @Prop(
    raw({
      /**
       * 公開鍵
       */
      publicKey: { Type: String },
      /**
       * 開始エポック
       */
      startEpoch: { Type: Number },

      /**
       * 終了エポック
       */
      endEpoch: { Type: Number },
    }),
  )
  votingKey: Record<string, any>;

  /**
   * アカウント残高
   */
  @Prop()
  accountBalance: mongoose.Schema.Types.BigInt;

  /**
   * 投票有無
   * /finalization/proof/epoch/{epoch} にVoting公開鍵があれば有効
   */
  @Prop()
  isVotingEnabled: boolean;
}

export type VotingDocument = HydratedDocument<Voting, SchemaTimestampsConfig>;
export const VotingSchema = SchemaFactory.createForClass(Voting);

VotingSchema.index({ host: 1, publicKey: 1 }, { unique: true });
