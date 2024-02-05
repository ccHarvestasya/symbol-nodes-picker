export class PeerUpdateDto {
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
   * HTTPs有無
   */
  isHttpsEnabled: boolean;

  /**
   * 証明書有効期限
   */
  certificateExpirationDate: Date;

  /**
   * Peer死活
   */
  isAvailable: boolean;

  /**
   * チェック日時
   */
  lastCheck: Date;

  /**
   * 同期チェック日時
   * 他ノードの/node/peersに載っているか確認出来た日時
   */
  lastSyncCheck: Date;
}
