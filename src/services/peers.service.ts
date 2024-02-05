import { PeerCreateDto } from '@/repository/peers/dto/peerCreateDto';
import { PeerKeyDto } from '@/repository/peers/dto/peerKeyDto';
import { PeerUpdateDto } from '@/repository/peers/dto/peerUpdateDto';
import { PeersFindDto } from '@/repository/peers/dto/peersFindDto';
import { PeersRepository } from '@/repository/peers/peers.repository';
import { PeerDocument } from '@/schema/peer.schema';
import { RestGateway } from '@/util/symboler/RestGateway';
import { SslSocket } from '@/util/symboler/SslSocket';
import { NodeInfo } from '@/util/symboler/model/NodeInfo';
import { NodePeer } from '@/util/symboler/model/NodePeer';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export class NodeKey {
  host: string;
  publicKey: string;
  port: number;
}

/**
 * Peersサービス
 */
@Injectable()
export class PeersService {
  /**
   * ロガー
   */
  private readonly logger = new Logger(PeersService.name);

  /**
   * コンストラクタ
   * @param configService コンフィグサービス
   * @param peersRepository Peersリポジトリ
   */
  constructor(
    private readonly configService: ConfigService,
    private readonly peersRepository: PeersRepository,
  ) {}

  /**
   * 新しいPeerの登録
   * @param nodeKeys ノードキー配列
   */
  async registerNewPeer(nodeKeys: NodeKey[]): Promise<void> {
    const methodName = 'registerNewPeer';
    this.logger.verbose('start - ' + methodName);

    // 取得したPeerのPeersを取得
    const nodePeerMaps = await this.getNodePeers(nodeKeys);

    // 登録/未登録ピアリスト作成
    for (const processList of nodeKeys) {
      // HTTP通信で取得したデータを優先する
      const mapKey = [processList.host, processList.publicKey];
      let nodePeers: NodePeer[] = undefined;
      if (nodePeerMaps.restGw.has(mapKey.toString())) {
        nodePeers = nodePeerMaps.restGw.get(mapKey.toString());
      } else if (nodePeerMaps.socket.has(mapKey.toString())) {
        nodePeers = nodePeerMaps.socket.get(mapKey.toString());
      }

      if (!nodePeers) continue;

      const registrationPeers: NodePeer[] = [];
      const unregistrationPeers: NodePeer[] = [];
      // 未登録ピアリスト作成
      for (const nodePeer of nodePeers) {
        this.logger.debug(`${processList.host}:${nodePeer.host}:${nodePeer.friendlyName}`);
        // Peersコレクション存在チェック
        const findDto = new PeersFindDto();
        findDto.host = nodePeer.host;
        findDto.publicKey = nodePeer.publicKey;
        const peer = await this.peersRepository.findOne(findDto);
        if (!peer) {
          // 未登録分をリスト化
          unregistrationPeers.push(nodePeer);
        } else {
          registrationPeers.push(nodePeer);
        }
      }

      // NodeInfo取得
      const processLists: NodeKey[] = [];
      for (const unregistrationPeer of unregistrationPeers) {
        processLists.push({
          host: unregistrationPeer.host,
          publicKey: unregistrationPeer.publicKey,
          port: unregistrationPeer.port,
        });
      }
      const nodeInfoMaps = await this.getNodeInfo(processLists);

      // 既存のPeers更新
      for (const registrationPeer of registrationPeers) {
        // 既存の場合は同期チェック日時を更新する
        const keyDto = new PeerKeyDto(registrationPeer.host, registrationPeer.publicKey);
        const updateDto = new PeerUpdateDto();
        updateDto.lastSyncCheck = new Date();
        await this.peersRepository.updateOne(keyDto, updateDto);
      }

      // 新しいPeers登録
      for (const unregistrationPeer of unregistrationPeers) {
        try {
          // HTTP通信で取得したデータを優先する
          const mapKey = [unregistrationPeer.host, unregistrationPeer.publicKey];
          let nodeInfo: NodeInfo = undefined;
          let socketNodeInfo: NodeInfo = undefined;
          if (nodeInfoMaps.restGw.has(mapKey.toString())) {
            nodeInfo = nodeInfoMaps.restGw.get(mapKey.toString());
            socketNodeInfo = nodeInfoMaps.socket.get(mapKey.toString());
          } else if (nodeInfoMaps.socket.has(mapKey.toString())) {
            nodeInfo = nodeInfoMaps.socket.get(mapKey.toString());
          }

          const peerCreateDto = new PeerCreateDto();
          if (nodeInfo !== undefined) {
            peerCreateDto.host = nodeInfo.host;
            peerCreateDto.publicKey = nodeInfo.publicKey;
            peerCreateDto.nodePublicKey = nodeInfo.nodePublicKey;
            peerCreateDto.port = nodeInfo.port;
            peerCreateDto.friendlyName = nodeInfo.friendlyName;
            peerCreateDto.version = nodeInfo.version;
            peerCreateDto.networkGenerationHashSeed = nodeInfo.networkGenerationHashSeed;
            peerCreateDto.roles = nodeInfo.roles;
            peerCreateDto.networkIdentifier = nodeInfo.networkIdentifier;
            peerCreateDto.isHttpsEnabled = nodeInfo.isHttpsEnabled;
            peerCreateDto.certificateExpirationDate = socketNodeInfo?.certificateExpirationDate;
            peerCreateDto.isAvailable = true;
            peerCreateDto.lastCheck = new Date();
            peerCreateDto.lastSyncCheck = new Date();
          } else {
            peerCreateDto.host = unregistrationPeer.host;
            peerCreateDto.publicKey = unregistrationPeer.publicKey;
            peerCreateDto.port = unregistrationPeer.port;
            peerCreateDto.friendlyName = unregistrationPeer.friendlyName;
            peerCreateDto.version = unregistrationPeer.version;
            peerCreateDto.networkGenerationHashSeed = unregistrationPeer.networkGenerationHashSeed;
            peerCreateDto.roles = unregistrationPeer.roles;
            peerCreateDto.networkIdentifier = unregistrationPeer.networkIdentifier;
            peerCreateDto.isHttpsEnabled = false;
            peerCreateDto.isAvailable = false;
            peerCreateDto.lastCheck = new Date();
            peerCreateDto.lastSyncCheck = new Date();
          }
          await this.peersRepository.create(peerCreateDto);
        } catch (e) {
          this.logger.error(e);
        }
      }
    }

    this.logger.verbose(' end  - ' + methodName);
  }

  /**
   * Peerコレクションからチェック日時が古い方から取得
   * @returns Peersドキュメント配列
   */
  async getPeerDocCheckedOldest(): Promise<PeerDocument[]> {
    const methodName = 'registerNewPeerToPeers';
    this.logger.verbose('start - ' + methodName);

    const findDto = new PeersFindDto();
    const limit = this.configService.get<number>('connection.request-count');
    const peerDocs = await this.peersRepository.findIsOldLimit(findDto, limit);

    this.logger.verbose(' end  - ' + methodName);
    return peerDocs;
  }

  /**
   * NodeInfo取得
   * ソケットとHTTPからNodeInfoを取得する
   * @param nodeKeys ノードキー配列
   * @returns ソケットとHTTPから取得したNodeInfo
   */
  async getNodeInfo(
    nodeKeys: NodeKey[],
  ): Promise<{ socket: Map<string, NodeInfo>; restGw: Map<string, NodeInfo> }> {
    const methodName = 'getNodeInfo';
    this.logger.verbose('start - ' + methodName);

    // コピー
    const socketProcessLists = nodeKeys.concat();
    const restGwProcessLists = nodeKeys.concat();

    // チャンク数取得
    let chunk = this.configService.get<number>('connection.request-chunk');
    if (nodeKeys.length < chunk) {
      chunk = nodeKeys.length;
    }

    // チャンク数分並列処理
    // ソケット通信
    const socketPromises: Promise<void>[] = [];
    const scoketNodeInfoMap = new Map<string, NodeInfo>();
    for (let i = 0; i < chunk; i++) {
      socketPromises.push(this.getSocketNodeInfoParallel(socketProcessLists, scoketNodeInfoMap));
    }
    // HTTP通信
    const restGwPromises: Promise<void>[] = [];
    const restGwNodeInfoMap = new Map<string, NodeInfo>();
    for (let i = 0; i < chunk; i++) {
      restGwPromises.push(this.getRestGwNodeInfoParallel(restGwProcessLists, restGwNodeInfoMap));
    }
    // 並列処理
    await Promise.all([await Promise.all(socketPromises), await Promise.all(restGwPromises)]);

    this.logger.verbose(' end  - ' + methodName);
    return { socket: scoketNodeInfoMap, restGw: restGwNodeInfoMap };
  }

  /**
   * NodePeers取得
   * ソケットとHTTPからNodePeersを取得する
   * @param nodeKeys ノードキー配列
   * @returns ソケットとHTTPから取得したNodePeers
   */
  async getNodePeers(
    nodeKeys: NodeKey[],
  ): Promise<{ socket: Map<string, NodePeer[]>; restGw: Map<string, NodePeer[]> }> {
    const methodName = 'getNodePeers';
    this.logger.verbose('start - ' + methodName);

    // コピー
    const socketNodeInfos = nodeKeys.concat();
    const restGwNodeInfos = nodeKeys.concat();

    /** チャンク数取得 **/
    let chunk = this.configService.get<number>('connection.request-chunk');
    if (nodeKeys.length < chunk) {
      chunk = nodeKeys.length;
    }

    /** チャンク数分並列処理 **/
    // ソケット通信
    const socketPromises: Promise<void>[] = [];
    const scoketNodePeersMap = new Map<string, NodePeer[]>();
    for (let i = 0; i < chunk; i++) {
      socketPromises.push(this.getSoketNodePeersParallel(socketNodeInfos, scoketNodePeersMap));
    }
    // HTTP通信
    const restGwPromises: Promise<void>[] = [];
    const restGwNodePeersMap = new Map<string, NodePeer[]>();
    for (let i = 0; i < chunk; i++) {
      restGwPromises.push(this.getRestGwNodePeersParallel(restGwNodeInfos, restGwNodePeersMap));
    }
    // 並列処理
    await Promise.all([await Promise.all(socketPromises), await Promise.all(restGwPromises)]);

    this.logger.verbose(' end  - ' + methodName);
    return { socket: scoketNodePeersMap, restGw: restGwNodePeersMap };
  }

  /**
   * ソケット通信でNodeInfo取得（並列処理）
   * @param nodeKeys ノードキー配列
   * @param nodeInfoMap NodeInfoマップ
   */
  private async getSocketNodeInfoParallel(nodeKeys: NodeKey[], nodeInfoMap: Map<string, NodeInfo>) {
    let processList: NodeKey;
    while ((processList = nodeKeys.shift()) !== undefined) {
      // ピア問い合わせ
      const host = processList.host;
      const publicKey = processList.publicKey;
      const port = processList.port;
      const timeout = this.configService.get<number>('connection.timeout');
      const sslScoket = new SslSocket(timeout);
      const nodeInfo = await sslScoket.getNodeInfo(host, port);
      // マップにセット
      const mapKey = [host, publicKey]; // IPのみはhost入ってないパターンがある
      nodeInfoMap.set(mapKey.toString(), nodeInfo);
    }
  }

  /**
   * HTTP通信でNodeInfo取得（並列処理）
   * @param nodeKeys ノードキー配列
   * @param nodeInfoMap NodeInfoマップ
   */
  private async getRestGwNodeInfoParallel(nodeKeys: NodeKey[], nodeInfoMap: Map<string, NodeInfo>) {
    let processList: NodeKey;
    while ((processList = nodeKeys.shift()) !== undefined) {
      // ピア問い合わせ
      const host = processList.host;
      const publicKey = processList.publicKey;
      const timeout = this.configService.get<number>('connection.timeout');
      const restGateway = new RestGateway(timeout);
      const nodeInfo = await restGateway.tryHttpsNodeInfo(host);
      // マップにセット
      const mapKey = [host, publicKey]; // IPのみはhost入ってないパターンがある
      nodeInfoMap.set(mapKey.toString(), nodeInfo);
    }
  }

  /**
   * ソケット通信でNodePeers取得（並列処理）
   * @param nodeKeys ノードキー配列
   * @param nodePeersMap NodePeersマップ
   */
  private async getSoketNodePeersParallel(
    nodeKeys: NodeKey[],
    nodePeersMap: Map<string, NodePeer[]>,
  ) {
    let processList: NodeKey;
    while ((processList = nodeKeys.shift()) !== undefined) {
      // ピア問い合わせ
      const host = processList.host;
      const publicKey = processList.publicKey;
      const port = processList.port;
      const timeout = this.configService.get<number>('connection.timeout');
      const sslScoket = new SslSocket(timeout);
      const nodePeers = await sslScoket.getNodePeers(host, port);
      // マップにセット
      const mapKey = [host, publicKey]; // IPのみはhost入ってないパターンがある
      nodePeersMap.set(mapKey.toString(), nodePeers);
    }
  }

  /**
   * HTTP通信でNodePeers取得（並列処理）
   * @param nodeKeys ノードキー配列
   * @param nodePeersMap NodePeersマップ
   */
  private async getRestGwNodePeersParallel(
    nodeKeys: NodeKey[],
    nodePeersMap: Map<string, NodePeer[]>,
  ) {
    let processList: NodeKey;
    while ((processList = nodeKeys.shift()) !== undefined) {
      // ピア問い合わせ
      const host = processList.host;
      const publicKey = processList.publicKey;
      const timeout = this.configService.get<number>('connection.timeout');
      const restGateway = new RestGateway(timeout);
      const nodePeers = await restGateway.tryHttpsNodePeers(host);
      // マップにセット
      const mapKey = [host, publicKey]; // IPのみはhost入ってないパターンがある
      nodePeersMap.set(mapKey.toString(), nodePeers);
    }
  }
}
