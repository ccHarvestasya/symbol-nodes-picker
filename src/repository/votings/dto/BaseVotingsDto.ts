export abstract class BaseVotingsDto {
  /**
   * Votingキー
   */
  votingKey: {
    /**
     * 公開鍵
     */
    publicKey: string;
    /**
     * 開始エポック
     */
    startEpoch: number;

    /**
     * 終了エポック
     */
    endEpoch: number;
  };

  /**
   * アカウント残高
   */
  accountBalance: bigint;

  /**
   * 投票有無
   * /finalization/proof/epoch/{epoch} にVoting公開鍵があれば有効
   */
  isVotingEnabled: boolean;
}
