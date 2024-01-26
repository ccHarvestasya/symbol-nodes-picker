import { Logger } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { NodeInfo } from './model/NodeInfo';

/**
 * Rest Gateway から値を取得する
 */
export class RestGateway {
  /**
   * ロガー
   */
  private readonly logger = new Logger(RestGateway.name);

  /**
   * コンストラクタ
   * @param timeout タイムアウト
   */
  constructor(private readonly timeout: number = 3000) {}

  /**
   * NodeInfo取得(トライSSL)
   * @param host ホスト名
   * @returns 成功: NodeInfo, 失敗: undefined
   */
  async trySslNodeInfo(host: string): Promise<NodeInfo> {
    const path = '/node/info';
    const baseUrl = `https://${host}:3001`;
    this.logger.debug(`${baseUrl}${path}`);

    let nodeInfo = undefined;
    try {
      nodeInfo = await this.requestRestGateway<NodeInfo>(baseUrl, path);
      nodeInfo.isHttpsEnabled = true;
      nodeInfo.host = host; // たまに空の奴がいる
    } catch (e) {
      nodeInfo = await this.getNodeInfo(host);
    }

    return nodeInfo;
  }

  /**
   * NodeInfo取得
   * @param host ホスト名
   * @returns 成功: NodeInfo, 失敗: undefined
   */
  async getNodeInfo(host: string): Promise<NodeInfo> {
    const path = '/node/info';
    const baseUrl = `http://${host}:3000`;
    this.logger.debug(`${baseUrl}${path}`);

    let nodeInfo = undefined;
    try {
      nodeInfo = await this.requestRestGateway<NodeInfo>(baseUrl, path);
      nodeInfo.isHttpsEnabled = false;
      nodeInfo.host = host; // たまに空の奴がいる
    } catch (e) {
      this.logger.warn(`アクセスできませんでした: ${baseUrl}${path}`);
    }

    return nodeInfo;
  }

  /**
   * Restゲートウェイから値を取得する
   * @param baseURL ベースURL
   * @param path パス
   * @returns Restゲートウェイ応答結果
   */
  private async requestRestGateway<T>(baseURL: string, path: string): Promise<T> {
    try {
      const restGwAxios = axios.create({
        baseURL: baseURL,
        timeout: this.timeout,
        headers: { 'Content-Type': 'application/json' },
      });
      const restGwResponseData = await restGwAxios.get(path).then((res: AxiosResponse<T>): T => {
        return res.data;
      });
      return restGwResponseData;
    } catch (e) {
      this.logger.warn(e);
      throw e;
    }
  }
}
