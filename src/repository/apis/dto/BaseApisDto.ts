export abstract class BaseApisDto {
  /**
   * RESTゲートウェイURL
   */
  restGatewayUrl: string;

  /**
   * HTTPs利用可否
   */
  isHttpsEnabled: boolean;

  /**
   * ハーベスター数
   */
  harvesters: number;

  /**
   * WebSocket
   */
  webSocket: {
    /**
     * 利用可否
     */
    isAvailable: boolean;

    /**
     * WebSocket(SSL)利用可否
     */
    wss: boolean;

    /**
     * WebSocketURL
     */
    url: string;
  };

  /**
   * Api利用可否
   */
  isAvailable: boolean;

  /**
   * 1ページ毎のトランザクション検索数
   */
  txSearchCountPerPage: number;

  /**
   * チェック日時
   */
  lastStatusCheck: Date;
}
