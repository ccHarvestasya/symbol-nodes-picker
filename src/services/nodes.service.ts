import { BaseNodesDto } from '@/repository/nodes/dto/BaseNodesDto';
import { NodesCreateDto } from '@/repository/nodes/dto/NodesCreateDto';
import { NodesFindDto } from '@/repository/nodes/dto/NodesFindDto';
import { NodesUpdateDto } from '@/repository/nodes/dto/NodesUpdateDto';
import { NodesKeyDto } from '@/repository/nodes/dto/nodesKeyDto';
import { NodesRepository } from '@/repository/nodes/nodes.repository';
import { SettingKeyDto } from '@/repository/settings/dto/SettingKeyDto';
import { SettingsRepository } from '@/repository/settings/settings.repository';
import { NodeDocument } from '@/schema/node.schema';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  RepositoryFactoryHttp,
  RepositoryFactorySocket,
  SymbolSdkExt,
} from 'symbol-sdk-ext';
import { ChainInfo } from 'symbol-sdk-ext/dist/model/blockchain';
import { NodeInfo, NodePeer } from 'symbol-sdk-ext/dist/model/node';

/** Nodesサービス */
@Injectable()
export class NodesService {
  /** ロガー */
  private readonly logger = new Logger(NodesService.name);

  /**
   * コンストラクタ
   * @param configService コンフィグサービス
   * @param nodesRepository Nodesリポジトリ
   */
  constructor(
    private readonly configService: ConfigService,
    private readonly settingsRepository: SettingsRepository,
    private readonly nodesRepository: NodesRepository,
  ) {}

  /**
   * NodePeersマップ取得
   * @param nodeDocs Nodeドキュメント
   * @param networkGenerationHashSeed ネットワークジェネレーションハッシュ
   * @returns NodePeersマップ
   */
  async getNodePeersMap(
    nodeDocs: NodeDocument[],
    networkGenerationHashSeed: string,
  ) {
    // 設定からタイムアウトを取得
    const timeout = this.configService.get<number>('connection.timeout');

    // チャンク数取得
    let chunk = this.configService.get<number>('connection.request-chunk');
    if (nodeDocs.length < chunk) {
      chunk = nodeDocs.length;
    }
    // チャンク毎にまとめる
    const chunkNodeDoc: NodeDocument[][] = new Array(chunk);
    for (let i = 0; i < chunk; i++) {
      chunkNodeDoc[i] = [];
    }
    let chunkIndex = 0;
    for (const doc of nodeDocs) {
      const index = chunkIndex % chunk;
      chunkNodeDoc[index].push(doc);
      chunkIndex++;
    }

    // NodePeersマップ取得
    const nodePeersPromises: Promise<void>[] = [];
    const nodePeersMap = new Map<string, NodePeer>();
    for (let i = 0; i < chunk; i++) {
      nodePeersPromises.push(
        this.getNodePeers(
          chunkNodeDoc[i],
          timeout,
          networkGenerationHashSeed,
          nodePeersMap,
        ),
      );
    }
    await Promise.all(nodePeersPromises);

    return nodePeersMap;
  }

  async updateNodesCollection(
    nodePeersMap: Map<string, NodePeer>,
    networkGenerationHashSeed: string,
  ) {
    // マップを配列に変換
    const nodePeers: NodePeer[] = [...nodePeersMap.values()];

    // 設定からタイムアウトを取得
    const timeout = this.configService.get<number>('connection.timeout');

    // チャンク数取得
    let chunk = this.configService.get<number>('connection.request-chunk');
    if (nodePeers.length < chunk) {
      chunk = nodePeers.length;
    }
    // チャンク毎にまとめる
    const chunkNodePeers: NodePeer[][] = new Array(chunk);
    for (let i = 0; i < chunk; i++) {
      chunkNodePeers[i] = [];
    }
    let chunkIndex = 0;
    for (const nodePeer of nodePeers) {
      const index = chunkIndex % chunk;
      chunkNodePeers[index].push(nodePeer);
      chunkIndex++;
    }

    // Nodesコレクション更新
    const nodePeersPromises: Promise<void>[] = [];
    for (let i = 0; i < chunk; i++) {
      nodePeersPromises.push(
        this.updateNodes(chunkNodePeers[i], timeout, networkGenerationHashSeed),
      );
    }
    await Promise.all(nodePeersPromises);
  }

  /**
   * Nodesコレクションからチェック日時が古い方から取得
   * @returns Nodeドキュメント配列
   */
  async getNodeDocCheckedOldest() {
    const findDto = new NodesFindDto();
    const limit = this.configService.get<number>('connection.request-count');
    const nodeDocs = await this.nodesRepository.findIsOldLimit(findDto, limit);
    return nodeDocs;
  }

  /**
   * Nodesコレクションからチェック日時が古い方から取得
   * @returns Nodeドキュメント配列
   */
  async getNodeDocApiCheckedOldest() {
    const findDto = new NodesFindDto();
    const limit = this.configService.get<number>('connection.request-count');
    const nodeDocs = await this.nodesRepository.findApiIsOldLimit(
      findDto,
      limit,
    );
    return nodeDocs;
  }

  /**
   * ジェネレーションハッシュシード取得
   * @returns ジェネレーションハッシュシード
   */
  async getNetworkGenerationHashSeed(): Promise<string> {
    const keyDto = new SettingKeyDto('networkGenerationHashSeed');
    const settingDoc = await this.settingsRepository.findOne(keyDto);
    return settingDoc.value;
  }

  /**
   * NodePeers取得
   * @param nodeDocs Peerドキュメント
   * @param timeout タイムアウト
   * @param networkGenerationHashSeed ネットワークジェネレーションハッシュシード
   * @param nodePeersMap NodePeersマップ
   */
  private async getNodePeers(
    nodeDocs: NodeDocument[],
    timeout: number,
    networkGenerationHashSeed: string,
    nodePeersMap: Map<string, NodePeer>,
  ) {
    for (const doc of nodeDocs) {
      const nodeHost = doc.host;
      const nodePort = doc.peer.port;
      const isHttps = await new SymbolSdkExt(timeout).isEnableHttps(nodeHost);

      try {
        // ソケットからピアリスト取得
        const socketRepositoryFactory = new RepositoryFactorySocket(
          nodeHost,
          nodePort,
          timeout,
        );
        let nodeRepo = socketRepositoryFactory.createNodeRepository();
        let nodePeers = await nodeRepo.getNodePeers();
        if (nodePeers !== undefined) {
          this.logger.log(`[OK] ${nodeHost}:${nodePort}/node/peers`);
        } else {
          // ソケットで取得出来ない場合はRestから取得
          this.logger.warn(`[NG] ${nodeHost}:${nodePort}/node/peers`);
          const httpRepositoryFactory = new RepositoryFactoryHttp(
            nodeHost,
            isHttps,
            timeout,
          );
          nodeRepo = httpRepositoryFactory.createNodeRepository();
          nodePeers = await nodeRepo.getNodePeers();
          if (nodePeers !== undefined) {
            this.logger.log(
              `[OK] ${nodeHost}:${isHttps ? 3001 : 3000}/node/peers`,
            );
          } else {
            this.logger.warn(
              `[NG] ${nodeHost}:${isHttps ? 3001 : 3000}/node/peers`,
            );
          }
        }

        // 対象のネットワークジェネレーションハッシュのみ取り出す
        if (nodePeers !== undefined) {
          nodePeers = nodePeers.filter((item) => {
            if (item.networkGenerationHashSeed === networkGenerationHashSeed) {
              return true;
            }
            return false;
          });

          for (const nodePeer of nodePeers) {
            const mapKey = [nodePeer.host, nodePeer.publicKey];
            nodePeersMap.set(mapKey.toString(), nodePeer);
          }
        }
      } catch (e) {
        this.logger.error(e);
      }
    }
  }

  private async updateNodes(
    nodePeers: NodePeer[],
    timeout: number,
    networkGenerationHashSeed: string,
  ) {
    for (const nodePeer of nodePeers) {
      // HTTPs判定
      const isHttps = await new SymbolSdkExt(timeout).isEnableHttps(
        nodePeer.host,
      );
      // NodeInfo取得
      const nodeInfo = await this.getNodeInfo(
        nodePeer,
        isHttps,
        timeout,
        networkGenerationHashSeed,
      );
      // ChainInfo取得
      const chainInfo = await this.getChainInfo(nodePeer, isHttps, timeout);

      // Nodesコレクション更新
      try {
        // Nodesコレクション存在チェック
        const findDto = new NodesFindDto();
        findDto.host = nodePeer.host;
        findDto.publicKey = nodePeer.publicKey;
        const nodeDoc = await this.nodesRepository.findOne(findDto);

        if (!nodeDoc) {
          // 登録
          const createDto = new NodesCreateDto();
          createDto.host = nodePeer.host;
          createDto.publicKey = nodePeer.publicKey;
          if (nodeInfo !== undefined) {
            createDto.peer.port = nodeInfo.port;
            createDto.peer.friendlyName = nodeInfo.friendlyName;
          }
          this.editNodeCreateDto(createDto, nodePeer, nodeInfo, chainInfo);
          await this.nodesRepository.create(createDto);
        } else {
          // 更新
          const keyDto = new NodesKeyDto(nodePeer.host, nodePeer.publicKey);
          const updateDto = new NodesUpdateDto();
          this.editNodeCreateDto(updateDto, nodePeer, nodeInfo, chainInfo);
          await this.nodesRepository.updateOne(keyDto, updateDto);
        }
      } catch (e) {
        this.logger.error(`updatePeerInfo: ${e}`);
      }
    }
  }

  private async getNodeInfo(
    nodePeer: NodePeer,
    isHttps: boolean,
    timeout: number,
    networkGenerationHashSeed: string,
  ) {
    const nodeHost = nodePeer.host;
    const nodePort = nodePeer.port;

    let nodeInfo: NodeInfo | undefined;

    try {
      // ソケットからノード情報取得
      const socketRepositoryFactory = new RepositoryFactorySocket(
        nodeHost,
        nodePort,
        timeout,
      );
      let nodeRepo = socketRepositoryFactory.createNodeRepository();
      nodeInfo = await nodeRepo.getNodeInfo();
      if (nodeInfo !== undefined) {
        this.logger.log(`[OK] ${nodeHost}:${nodePort}/node/info`);
      } else {
        // ソケットで取得出来ない場合はRestから取得
        this.logger.warn(`[NG] ${nodeHost}:${nodePort}/node/info`);
        const httpRepositoryFactory = new RepositoryFactoryHttp(
          nodeHost,
          isHttps,
          timeout,
        );
        nodeRepo = httpRepositoryFactory.createNodeRepository();
        nodeInfo = await nodeRepo.getNodeInfo();
        if (nodeInfo !== undefined) {
          this.logger.log(
            `[OK] ${nodeHost}:${isHttps ? 3001 : 3000}/node/info`,
          );
        } else {
          this.logger.warn(
            `[NG] ${nodeHost}:${isHttps ? 3001 : 3000}/node/info`,
          );
        }
      }
      if (nodeInfo?.networkGenerationHashSeed !== networkGenerationHashSeed) {
        nodeInfo = undefined;
      }
    } catch (e) {
      this.logger.error(e);
    }

    return nodeInfo;
  }

  /**
   * ChainInfo取得
   * @param nodePeer Peerドキュメント
   * @param timeout タイムアウト
   */
  private async getChainInfo(
    nodePeer: NodePeer,
    isHttps: boolean,
    timeout: number,
  ) {
    const nodeHost = nodePeer.host;
    const nodePort = nodePeer.port;

    let chainInfo: ChainInfo | undefined;

    try {
      // ソケットからピアリスト取得
      const socketRepositoryFactory = new RepositoryFactorySocket(
        nodeHost,
        nodePort,
        timeout,
      );
      let chainRepo = socketRepositoryFactory.createChainRepository();
      chainInfo = await chainRepo.getChainInfo();
      if (chainInfo !== undefined) {
        this.logger.log(`[OK] ${nodeHost}:${nodePort}/chain/info`);
      } else if (chainInfo === undefined) {
        // ソケットで取得出来ない場合はRestから取得
        this.logger.warn(`[NG] ${nodeHost}:${nodePort}/chain/info`);
        const httpRepositoryFactory = new RepositoryFactoryHttp(
          nodeHost,
          isHttps,
          timeout,
        );
        chainRepo = httpRepositoryFactory.createChainRepository();
        chainInfo = await chainRepo.getChainInfo();
        if (chainInfo !== undefined) {
          this.logger.log(
            `[OK] ${nodeHost}:${isHttps ? 3001 : 3000}/chain/info`,
          );
        } else {
          this.logger.warn(
            `[NG] ${nodeHost}:${isHttps ? 3001 : 3000}/chain/info`,
          );
        }
      }
    } catch (e) {
      this.logger.error(e);
    }

    return chainInfo;
  }

  private editNodeCreateDto(
    nodeDto: BaseNodesDto,
    nodePeer: NodePeer,
    nodeInfo: NodeInfo | undefined,
    chainInfo: ChainInfo | undefined,
  ) {
    // チェック日時
    nodeDto.peer.lastStatusCheck = new Date();

    // ポート
    nodeDto.peer.port = nodePeer.port;
    // フレンドリー名
    nodeDto.peer.friendlyName = nodePeer.friendlyName;
    // バージョン
    nodeDto.peer.version = nodePeer.version;
    // ジェネレーションハッシュシード
    nodeDto.peer.networkGenerationHashSeed = nodePeer.networkGenerationHashSeed;
    // ロール
    nodeDto.peer.roles = nodePeer.roles;
    // ネットワーク識別子
    nodeDto.peer.networkIdentifier = nodePeer.networkIdentifier;
    // Peer利用可否
    nodeDto.peer.isAvailable = false;

    if (nodeInfo !== undefined) {
      // ポート
      nodeDto.peer.port = nodeInfo.port;
      // フレンドリー名
      nodeDto.peer.friendlyName = nodeInfo.friendlyName;
      // バージョン
      nodeDto.peer.version = nodeInfo.version;
      // ジェネレーションハッシュシード
      nodeDto.peer.networkGenerationHashSeed =
        nodeInfo.networkGenerationHashSeed;
      // ロール
      nodeDto.peer.roles = nodeInfo.roles;
      // ネットワーク識別子
      nodeDto.peer.networkIdentifier = nodeInfo.networkIdentifier;
      // ノード公開鍵
      nodeDto.peer.nodePublicKey = nodeInfo.nodePublicKey;
      if (nodeInfo.certificateExpirationDate) {
        // 証明書有効期限
        nodeDto.peer.certificateExpirationDate =
          nodeInfo.certificateExpirationDate;
        // Peer利用可否
        nodeDto.peer.isAvailable = true;
      }
    }

    if (chainInfo !== undefined) {
      // ブロック高
      nodeDto.peer.chainHeight = BigInt(chainInfo.height);
      // ファイナライゼーション
      nodeDto.peer.finalization = {
        // ファイナライゼーションブロック高
        height: BigInt(chainInfo.latestFinalizedBlock.height),
        // ファイナライゼーションエポック
        epoch: chainInfo.latestFinalizedBlock.finalizationEpoch,
        // ファイナライゼーションポイント
        point: chainInfo.latestFinalizedBlock.finalizationPoint,
        // ファイナライゼーションハッシュ
        hash: chainInfo.latestFinalizedBlock.hash,
      };
    }
  }
}
