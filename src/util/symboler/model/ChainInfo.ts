export class ChainInfo {
  /**
   * ブロック高
   */
  height: bigint;

  /**
   * スコア高
   */
  scoreHigh: bigint;

  /**
   * スコア低
   */
  scoreLow: bigint;

  /**
   * ファイナライズブロック
   */
  latestFinalizedBlock: {
    /**
     * ファイナライゼーションエポック
     */
    finalizationEpoch: number;

    /**
     * ファイナライゼーションポイント
     */
    finalizationPoint: number;

    /**
     * ファイナライズブロック高
     */
    height: bigint;

    /**
     * ファイナライズハッシュ
     */
    hash: string;
  };
}
