export class NodePeer {
  /**
   * バージョン
   */
  version: number;

  /**
   * 公開鍵
   */
  publicKey: string;

  /**
   * ネットワークジェネレーションハッシュ
   */
  networkGenerationHashSeed: string;

  /**
   * ロール
   */
  roles: number;

  /**
   * ポート
   */
  port: number;

  /**
   * ネットワークID
   */
  networkIdentifier: number;

  /**
   * ホスト
   */
  host: string;

  /**
   * フレンドリー名
   */
  friendlyName: string;
}
