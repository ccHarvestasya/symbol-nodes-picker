export class ChainUpdateDto {
  /**
   * ブロック高
   */
  chainHeight: bigint;

  /**
   * ファイナライゼーション
   */
  finalization: {
    /**
     * ファイナライズブロック高
     */
    height: bigint;

    /**
     * ファイナライズエポック
     */
    epoch: number;

    /**
     * ファイナライズポイント
     */
    point: number;

    /**
     * ファイナライズハッシュ
     */
    hash: string;
  };
}
