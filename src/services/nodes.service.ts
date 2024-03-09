import { BaseNodesDto } from '@/repository/nodes/dto/BaseNodesDto';
import { NodesCreateDto } from '@/repository/nodes/dto/NodesCreateDto';
import {
  NodesFindCondition,
  NodesFindDto,
} from '@/repository/nodes/dto/NodesFindDto';
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
import { Listener } from 'symbol-sdk-ext/dist/infrastructure';
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
   * NodesコレクションApi更新
   * @param nodeDocs Nodeドキュメント
   */
  async updateNodesCollectionOfApi(nodeDocs: NodeDocument[]) {
    // 設定からタイムアウトを取得
    const timeout = this.configService.get<number>('connection.timeout');

    // チャンク数取得
    let chunk = this.configService.get<number>('connection.request-chunk');
    if (nodeDocs.length < chunk) {
      chunk = nodeDocs.length;
    }
    // チャンク毎にまとめる
    const chunkNodeDocs: NodeDocument[][] = new Array(chunk);
    for (let i = 0; i < chunk; i++) {
      chunkNodeDocs[i] = [];
    }
    let chunkIndex = 0;
    for (const nodeDoc of nodeDocs) {
      const index = chunkIndex % chunk;
      chunkNodeDocs[index].push(nodeDoc);
      chunkIndex++;
    }

    // NodesコレクションApi更新
    const nodePeersPromises: Promise<void>[] = [];
    for (let i = 0; i < chunk; i++) {
      nodePeersPromises.push(
        this.updateNodesCollectionOfApiAsync(chunkNodeDocs[i], timeout),
      );
    }
    await Promise.all(nodePeersPromises);
  }

  /**
   * NodesコレクションVoting更新
   * @param nodeDocs Nodeドキュメント
   */
  async updateNodesCollectionOfVoting(nodeDocs: NodeDocument[]) {
    // 設定からタイムアウトを取得
    const timeout = this.configService.get<number>('connection.timeout');

    // チャンク数取得
    let chunk = this.configService.get<number>('connection.request-chunk');
    if (nodeDocs.length < chunk) {
      chunk = nodeDocs.length;
    }
    // チャンク毎にまとめる
    const chunkNodeDocs: NodeDocument[][] = new Array(chunk);
    for (let i = 0; i < chunk; i++) {
      chunkNodeDocs[i] = [];
    }
    let chunkIndex = 0;
    for (const nodeDoc of nodeDocs) {
      const index = chunkIndex % chunk;
      chunkNodeDocs[index].push(nodeDoc);
      chunkIndex++;
    }

    // NodesコレクションVoting更新
    const nodePeersPromises: Promise<void>[] = [];
    for (let i = 0; i < chunk; i++) {
      nodePeersPromises.push(
        this.updateNodesCollectionOfVotingAsync(chunkNodeDocs[i], timeout),
      );
    }
    await Promise.all(nodePeersPromises);
  }

  /**
   * NodesコレクションからPeerチェック日時が古い方から取得
   * @returns Nodeドキュメント配列
   */
  async getNodeDocCheckedOldest() {
    const findDto = new NodesFindDto();
    const limit = this.configService.get<number>('connection.request-count');
    const nodeDocs = await this.nodesRepository.findIsOldLimit(findDto, limit);
    return nodeDocs;
  }

  /**
   * NodesコレクションからApiチェック日時が古い方から取得
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
   * NodesコレクションからVotingチェック日時が古い方から取得
   * @returns Nodeドキュメント配列
   */
  async getNodeDocVotingCheckedOldest() {
    const findDto = new NodesFindDto();
    const limit = this.configService.get<number>('connection.request-count');
    const nodeDocs = await this.nodesRepository.findVotingIsOldLimit(
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
   * ノードリスト
   * @returns ノードリスト
   */
  async getNodesList(condition: NodesFindCondition, limit: number) {
    const nodeDocs = await this.nodesRepository.find(condition, limit);

    const outputJson = [];
    for (const nodeDoc of nodeDocs) {
      let finalization = {
        height: nodeDoc.peer.finalization.height?.toString(),
        epoch: nodeDoc.peer.finalization.epoch,
        point: nodeDoc.peer.finalization.point,
        hash: nodeDoc.peer.finalization.hash,
      };
      if (finalization.height === undefined) finalization = undefined;

      let votingKey = {
        publicKey: nodeDoc.voting.votingKey.publicKey,
        startEpoch: nodeDoc.voting.votingKey.startEpoch,
        endEpoch: nodeDoc.voting.votingKey.endEpoch,
      };
      if (votingKey.publicKey === undefined) votingKey = undefined;

      const json = {
        version: nodeDoc.peer.version,
        host: nodeDoc.host,
        friendlyName: nodeDoc.peer.friendlyName,
        publicKey: nodeDoc.publicKey,
        port: nodeDoc.peer.port,
        roles: nodeDoc.peer.roles,
        networkIdentifier: nodeDoc.peer.networkIdentifier,
        networkGenerationHashSeed: nodeDoc.peer.networkGenerationHashSeed,
        certificateExpirationDate:
          nodeDoc.peer.certificateExpirationDate?.getTime(),
        peerStatus: {
          isAvailable: nodeDoc.peer.isAvailable,
          lastStatusCheck: nodeDoc.peer.lastStatusCheck?.getTime(),
        },
        apiStatus: {
          restGatewayUrl: nodeDoc.api.restGatewayUrl,
          isAvailable: nodeDoc.api.isAvailable,
          isHttpsEnabled: nodeDoc.api.isHttpsEnabled,
          harvesters: nodeDoc.api.harvesters,
          lastStatusCheck: nodeDoc.api.lastStatusCheck?.getTime(),
          webSocket: {
            isAvailable: nodeDoc.api.webSocket.isAvailable,
            wss: nodeDoc.api.webSocket.wss,
            url: nodeDoc.api.webSocket.url,
          },
          nodePublicKey: nodeDoc.peer.nodePublicKey,
          chainHeight: nodeDoc.peer.chainHeight?.toString(),
          finalization: finalization,
          txSearchCountPerPage: nodeDoc.api.txSearchCountPerPage,
        },
        votingStatus: {
          votingKey: votingKey,
          balance: nodeDoc.voting.balance?.toString(),
          isVotingEnabled: nodeDoc.voting.isVotingEnabled,
          lastStatusCheck: nodeDoc.voting.lastStatusCheck?.getTime(),
        },
        lastAvailable: nodeDoc.peer.lastStatusCheck?.getTime(),
      };

      outputJson.push(json);
    }

    return outputJson;
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
        const keyDto = new NodesKeyDto(nodePeer.host, nodePeer.publicKey);
        const nodeDoc = await this.nodesRepository.findOne(keyDto);

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
          const updateNodeDoc = await this.nodesRepository.findOne(keyDto);
          this.editNodeCreateDto(updateNodeDoc, nodePeer, nodeInfo, chainInfo);
          await this.nodesRepository.findOneAndUpdate(keyDto, updateNodeDoc);
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
    nodeDto: BaseNodesDto | NodeDocument,
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

  /**
   * NodesコレクションのApi情報を更新する
   * @param host ホスト
   * @param publicKey 公開鍵
   * @param timeout タイムアウト
   */
  private async updateNodesCollectionOfApiAsync(
    nodeDocs: NodeDocument[],
    timeout: number,
  ) {
    for (const nodeDoc of nodeDocs) {
      const host = nodeDoc.host;
      const publicKey = nodeDoc.publicKey;
      const port = nodeDoc.peer.port;

      this.logger.log(`[Api Check] ${host}`);
      const sdkExt = new SymbolSdkExt(timeout);

      // HTTPs利用可否
      const isEnableHttps = await sdkExt.isEnableHttps(host);

      // ハーベスタ数
      // socket
      const repoFactorySocket = new RepositoryFactorySocket(
        host,
        port,
        timeout,
      );
      let nodeRepo = repoFactorySocket.createNodeRepository();
      let unlockedAccount = await nodeRepo.getNodeUnlockedAccount();
      if (unlockedAccount === undefined) {
        // http
        const repoFactoryHttp = new RepositoryFactoryHttp(
          host,
          isEnableHttps,
          timeout,
        );
        nodeRepo = repoFactoryHttp.createNodeRepository();
        unlockedAccount = await nodeRepo.getNodeUnlockedAccount();
      }
      let harvesters = 0;
      if (unlockedAccount?.unlockedAccount !== undefined) {
        harvesters = unlockedAccount.unlockedAccount.length;
      }

      // WebSocket
      let webSocketUrl = '';
      let isWss = false;
      let isWsAvailable = false;
      try {
        if (isEnableHttps) {
          webSocketUrl = `wss://${host}:3001/ws`;
          isWsAvailable = await new Listener(
            host,
            true,
            false,
          ).isWebsokectAvailable();
          isWss = isWsAvailable;
        }
        if (!isWsAvailable) {
          webSocketUrl = `ws://${host}:3000/ws`;
          isWsAvailable = await new Listener(
            host,
            false,
            false,
          ).isWebsokectAvailable();
        }
      } catch (e) {
        this.logger.error(e);
      }

      // Api利用可否
      const repoFactoryHttp = new RepositoryFactoryHttp(
        host,
        isEnableHttps,
        timeout,
      );
      const networkRepo = repoFactoryHttp.createNetworkRepository();
      const isAvailable = await networkRepo.isAvailableNetworkProperties();

      // RESTゲートウェイURL
      let restGatewayUrl = '';
      if (isAvailable) {
        if (isEnableHttps) {
          restGatewayUrl = `https://${host}:3001`;
        } else {
          restGatewayUrl = `http://${host}:3000`;
        }
      }

      // トランザクション検索数
      const txSearchCountPerPage = await sdkExt.getTxSearchCountPerPage(
        host,
        isEnableHttps,
      );

      try {
        // Nodesコレクション検索
        const keyDto = new NodesKeyDto(host, publicKey);
        const nodeDoc = await this.nodesRepository.findOne(keyDto);
        // Nodesコレクション更新
        nodeDoc.api.restGatewayUrl = restGatewayUrl;
        nodeDoc.api.isHttpsEnabled = isEnableHttps;
        nodeDoc.api.harvesters = harvesters;
        nodeDoc.api.webSocket.isAvailable = isWsAvailable;
        nodeDoc.api.webSocket.wss = isWss;
        nodeDoc.api.webSocket.url = webSocketUrl;
        nodeDoc.api.isAvailable = isAvailable;
        nodeDoc.api.txSearchCountPerPage = txSearchCountPerPage;
        nodeDoc.api.lastStatusCheck = new Date();
        await this.nodesRepository.findOneAndUpdate(keyDto, nodeDoc);
      } catch (e) {
        this.logger.error(e);
      }
    }
  }

  /**
   * NodesコレクションのVoting情報を更新する
   * @param host ホスト
   * @param publicKey 公開鍵
   * @param timeout タイムアウト
   */
  private async updateNodesCollectionOfVotingAsync(
    nodeDocs: NodeDocument[],
    timeout: number,
  ) {
    for (const nodeDoc of nodeDocs) {
      const host = nodeDoc.host;
      const publicKey = nodeDoc.publicKey;

      this.logger.log(`[Voting Check] ${host}`);

      let restGatewayHost = host;
      if (!nodeDoc.api.isAvailable) {
        const randNode = await this.nodesRepository.findOneRandomAvailable();
        if (randNode[0]?.host === undefined) return;
        restGatewayHost = randNode[0].host;
        this.logger.log(`[Voting Check] 確認ノード: ${restGatewayHost}`);
      }

      // HTTPs利用可否
      const sdkExt = new SymbolSdkExt(timeout);
      const isEnableHttps = await sdkExt.isEnableHttps(restGatewayHost);

      // アカウント
      const repoFactoryHttp = new RepositoryFactoryHttp(
        restGatewayHost,
        isEnableHttps,
        timeout,
      );
      const accountRepo = repoFactoryHttp.createAccountRepository();
      const accountInfo = await accountRepo.getAccountInfo(publicKey);

      let votingPublicKey: string | undefined;
      let startEpoch: number | undefined;
      let endEpoch: number | undefined;
      let accountBalance = 0n;
      let isVotingEnabled = false;
      if (accountInfo !== undefined) {
        const votingKeys =
          accountInfo.account.supplementalPublicKeys?.voting?.publicKeys;
        if (votingKeys !== undefined) {
          const maxIndex = votingKeys?.length - 1;
          votingPublicKey = votingKeys[maxIndex]?.publicKey;
          startEpoch = votingKeys[maxIndex]?.startEpoch;
          endEpoch = votingKeys[maxIndex]?.endEpoch;
        }
        // カレンシーモザイクID
        const currencyMosaicId = await this.getCurrencyMosaicId();
        const currencyMosaic = accountInfo.account.mosaics?.filter(
          (item) => item.id === currencyMosaicId.toString(16).toUpperCase(),
        );
        accountBalance = BigInt(currencyMosaic[0]?.amount);
        // MinVoter
        const minVoterBalance = await this.getMinVoterBalance();
        if (
          3000000000000n <= minVoterBalance &&
          startEpoch <= nodeDoc.peer.finalization.epoch &&
          nodeDoc.peer.finalization.epoch <= endEpoch
        ) {
          isVotingEnabled = true;
        } else {
          isVotingEnabled = false;
        }
      }

      try {
        // Nodesコレクション検索
        const keyDto = new NodesKeyDto(host, publicKey);
        const nodeDoc = await this.nodesRepository.findOne(keyDto);
        // Nodesコレクション更新
        nodeDoc.voting.balance = accountBalance;
        nodeDoc.voting.votingKey.publicKey = votingPublicKey;
        nodeDoc.voting.votingKey.startEpoch = startEpoch;
        nodeDoc.voting.votingKey.endEpoch = endEpoch;
        nodeDoc.voting.isVotingEnabled = isVotingEnabled;
        nodeDoc.voting.lastStatusCheck = new Date();
        await this.nodesRepository.findOneAndUpdate(keyDto, nodeDoc);
      } catch (e) {
        this.logger.error(e);
      }
    }
  }

  /**
   * カレンシーモザイクID取得
   * @returns カレンシーモザイクID
   */
  private async getCurrencyMosaicId() {
    const keyDto = new SettingKeyDto('currencyMosaicId');
    const settingDoc = await this.settingsRepository.findOne(keyDto);
    return BigInt(settingDoc.value);
  }

  /**
   * 最小投票残高取得
   * @returns 最小投票残高
   */
  private async getMinVoterBalance() {
    const keyDto = new SettingKeyDto('minVoterBalance');
    const settingDoc = await this.settingsRepository.findOne(keyDto);
    return BigInt(settingDoc.value);
  }
}
