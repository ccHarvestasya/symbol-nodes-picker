export class ChainCreateDto {
  /**
   * ホスト
   */
  host: string;

  /**
   * 公開鍵
   */
  publicKey: string;

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
