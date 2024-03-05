export abstract class BaseNodesDto {
  /** コンストラクタ */
  constructor() {
    this.peer = new Peer();
    this.peer.finalization = new Finalization();
    this.api = new Api();
    this.api.webSocket = new WebSocket();
    this.voting = new Voting();
    this.voting.votingKey = new VotingKey();
  }

  /** Peer */
  peer: Peer;

  /** Api */
  api: Api;

  /** Voting */
  voting: Voting;
}

/** Peer */
class Peer {
  /** ノード公開鍵 */
  nodePublicKey: string;

  /** ポート */
  port: number;

  /** フレンドリー名 */
  friendlyName: string;

  /** バージョン */
  version: number;

  /** ジェネレーションハッシュシード */
  networkGenerationHashSeed: string;

  /** ロール */
  roles: number;

  /** ネットワークID */
  networkIdentifier: number;

  /** ブロック高 */
  chainHeight: bigint;

  /** ファイナライゼーション */
  finalization: Finalization;

  /** 証明書有効期限 */
  certificateExpirationDate: Date;

  /** Peer利用可否 */
  isAvailable: boolean;

  /** チェック日時 */
  lastStatusCheck: Date;
}

/** ファイナライゼーション */
class Finalization {
  /** ブロック高 */
  height: bigint;

  /** エポック */
  epoch: number;

  /** ポイント */
  point: number;

  /** ハッシュ */
  hash: string;
}

/** Api */
class Api {
  /** RESTゲートウェイURL */
  restGatewayUrl: string;

  /** HTTPs利用可否 */
  isHttpsEnabled: boolean;

  /** ハーベスター数 */
  harvesters: number;

  /** WebSocket */
  webSocket: WebSocket;

  /** Api利用可否 */
  isAvailable: boolean;

  /** 1ページ毎のトランザクション検索数 */
  txSearchCountPerPage: number;

  /** チェック日時 */
  lastStatusCheck: Date;
}

/** WebSocket */
class WebSocket {
  /** 利用可否 */
  isAvailable: boolean;

  /** WebSocket(SSL)利用可否 */
  wss: boolean;

  /** WebSocketURL */
  url: string;
}

/** Voting */
class Voting {
  /** ホスト */
  host: string;

  /** 公開鍵 */
  publicKey: string;

  /** Votingキー */
  votingKey: VotingKey;

  /** アカウント残高 */
  accountBalance: bigint;

  /**
   * 投票有無
   * /finalization/proof/epoch/{epoch} にVoting公開鍵があれば有効
   */
  isVotingEnabled: boolean;

  /** チェック日時 */
  lastStatusCheck: Date;
}

/** Voting Key */
class VotingKey {
  /** 公開鍵 */
  publicKey: string;

  /** 開始エポック */
  startEpoch: number;

  /** 終了エポック */
  endEpoch: number;
}
