import { ChainInfo } from '@/util/symboler/model/ChainInfo';
import { NetworkProperties } from '@/util/symboler/model/NetworkProperties';
import { NodeInfo } from '@/util/symboler/model/NodeInfo';
import { NodePeer } from '@/util/symboler/model/NodePeer';
import { NodeUnlockedAccount } from '@/util/symboler/model/NodeUnlockedAccount';
import { Logger } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';

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
   * ChainInfo取得(トライHTTPs)
   * @param host ホスト名
   * @returns 成功: ChainInfo, 失敗: undefined
   */
  async tryHttpsChainInfo(host: string): Promise<ChainInfo> {
    let chainInfo: ChainInfo = undefined;

    const path = '/chain/info';
    const baseUrl = `https://${host}:3001`;
    this.logger.log(`${baseUrl}${path}`);

    try {
      chainInfo = await this.requestRestGateway<ChainInfo>(baseUrl, path);
    } catch (e) {
      chainInfo = await this.getChainInfo(host);
    }

    return chainInfo;
  }

  /**
   * ChainInfo取得
   * @param host ホスト名
   * @returns 成功: ChainInfo, 失敗: undefined
   */
  async getChainInfo(host: string): Promise<ChainInfo> {
    let chainInfo: ChainInfo = undefined;

    const path = '/chain/info';
    const baseUrl = `http://${host}:3000`;
    this.logger.log(`${baseUrl}${path}`);

    try {
      chainInfo = await this.requestRestGateway<ChainInfo>(baseUrl, path);
    } catch (e) {
      this.logger.error(`${baseUrl}${path}: ${e}`);
    }

    return chainInfo;
  }

  /**
   * NodeInfo取得(トライHTTPs)
   * @param host ホスト名
   * @returns 成功: NodeInfo, 失敗: undefined
   */
  async tryHttpsNodeInfo(host: string): Promise<NodeInfo> {
    const path = '/node/info';
    const baseUrl = `https://${host}:3001`;
    this.logger.log(`${baseUrl}${path}`);

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
    this.logger.log(`${baseUrl}${path}`);

    let nodeInfo = undefined;
    try {
      nodeInfo = await this.requestRestGateway<NodeInfo>(baseUrl, path);
      nodeInfo.isHttpsEnabled = false;
      nodeInfo.host = host; // たまに空の奴がいる
    } catch (e) {
      this.logger.error(`${baseUrl}${path}: ${e}`);
    }

    return nodeInfo;
  }

  /**
   * NodePeers取得(トライHTTPs)
   * @param host ホスト名
   * @returns 成功: NodePeer[], 失敗: undefined
   */
  async tryHttpsNodePeers(host: string): Promise<NodePeer[]> {
    let nodePeers: NodePeer[] = undefined;

    const path = '/node/peers';
    const baseUrl = `https://${host}:3001`;
    this.logger.log(`${baseUrl}${path}`);

    try {
      nodePeers = await this.requestRestGateway<NodePeer[]>(baseUrl, path);
    } catch (e) {
      nodePeers = await this.getNodePeers(host);
    }

    return nodePeers;
  }

  /**
   * NodePeers取得
   * @param host ホスト名
   * @returns 成功: NodePeer[], 失敗: undefined
   */
  async getNodePeers(host: string): Promise<NodePeer[]> {
    let nodePeers: NodePeer[] = undefined;

    const path = '/node/peers';
    const baseUrl = `http://${host}:3000`;
    this.logger.log(`${baseUrl}${path}`);

    try {
      nodePeers = await this.requestRestGateway<NodePeer[]>(baseUrl, path);
    } catch (e) {
      this.logger.error(`${baseUrl}${path}: ${e}`);
    }

    return nodePeers;
  }

  /**
   * NodeUnlockedAccount取得(トライHTTPs)
   * @param host ホスト名
   * @returns 成功: NodeUnlockedAccount, 失敗: undefined
   */
  async tryHttpsNodeUnlockedAccount(host: string): Promise<NodeUnlockedAccount> {
    let nodeUnlockedAccount: NodeUnlockedAccount = undefined;

    const path = '/node/unlockedaccount';
    const baseUrl = `https://${host}:3001`;
    this.logger.log(`${baseUrl}${path}`);

    try {
      nodeUnlockedAccount = await this.requestRestGateway<NodeUnlockedAccount>(baseUrl, path);
    } catch (e) {
      nodeUnlockedAccount = await this.getNodeUnlockedAccount(host);
    }

    return nodeUnlockedAccount;
  }

  /**
   * NodeUnlockedAccount取得
   * @param host ホスト名
   * @returns 成功: NodeUnlockedAccount, 失敗: undefined
   */
  async getNodeUnlockedAccount(host: string): Promise<NodeUnlockedAccount> {
    let nodeUnlockedAccount: NodeUnlockedAccount = undefined;

    const path = '/node/unlockedaccount';
    const baseUrl = `http://${host}:3000`;
    this.logger.log(`${baseUrl}${path}`);

    try {
      nodeUnlockedAccount = await this.requestRestGateway<NodeUnlockedAccount>(baseUrl, path);
    } catch (e) {
      this.logger.error(`${baseUrl}${path}: ${e}`);
    }

    return nodeUnlockedAccount;
  }

  /**
   * NetworkProperties取得(トライHTTPs)
   * @param host ホスト名
   * @returns 成功: NetworkProperties, 失敗: undefined
   */
  async tryHttpsNetworkProperties(host: string): Promise<NetworkProperties> {
    let networkProperties: NetworkProperties = undefined;

    const path = '/network/properties';
    const baseUrl = `https://${host}:3001`;
    this.logger.log(`${baseUrl}${path}`);

    try {
      networkProperties = await this.requestRestGateway<NetworkProperties>(baseUrl, path);
    } catch (e) {
      networkProperties = await this.getNetworkProperties(host);
    }

    return networkProperties;
  }

  /**
   * NetworkProperties取得
   * @param host ホスト名
   * @returns 成功: NetworkProperties, 失敗: undefined
   */
  async getNetworkProperties(host: string): Promise<NetworkProperties> {
    let networkProperties: NetworkProperties = undefined;

    const path = '/network/properties';
    const baseUrl = `http://${host}:3000`;
    this.logger.log(`${baseUrl}${path}`);

    try {
      networkProperties = await this.requestRestGateway<NetworkProperties>(baseUrl, path);
    } catch (e) {
      this.logger.error(`${baseUrl}${path}: ${e}`);
    }

    return networkProperties;
  }

  /**
   * NetworkProperties死活
   * @param host ホスト名
   * @returns 成功: true, 失敗: false
   */
  async isAvailableNetworkProperties(host: string): Promise<boolean> {
    const networkProperties = await this.tryHttpsNetworkProperties(host);
    return networkProperties !== undefined;
  }

  /**
   * Restゲートウェイから値を取得する
   * @param baseUrl ベースURL
   * @param path パス
   * @returns Restゲートウェイ応答結果
   */
  private async requestRestGateway<T>(baseUrl: string, path: string): Promise<T> {
    try {
      const restGwAxios = axios.create({
        baseURL: baseUrl,
        timeout: this.timeout,
        headers: { 'Content-Type': 'application/json' },
      });
      const restGwResponseData = await restGwAxios.get(path).then((res: AxiosResponse<T>): T => {
        return res.data;
      });
      return restGwResponseData;
    } catch (e) {
      this.logger.error(`${baseUrl}${path}: ${e}`);
      throw e;
    }
  }
}
