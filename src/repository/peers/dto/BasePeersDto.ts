export abstract class BasePeersDto {
  /**
   * ノード公開鍵
   */
  nodePublicKey: string;

  /**
   * ポート
   */
  port: number;

  /**
   * フレンドリー名
   */
  friendlyName: string;

  /**
   * バージョン
   */
  version: number;

  /**
   * ジェネレーションハッシュシード
   */
  networkGenerationHashSeed: string;

  /**
   * ロール
   */
  roles: number;

  /**
   * ネットワークID
   */
  networkIdentifier: number;

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

  /**
   * 証明書有効期限
   */
  certificateExpirationDate: Date;

  /**
   * Peer利用可否
   */
  isAvailable: boolean;

  /**
   * チェック日時
   */
  lastStatusCheck: Date;
}
