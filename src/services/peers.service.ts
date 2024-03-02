import { BasePeersDto } from '@/repository/peers/dto/BasePeersDto';
import { PeersCreateDto } from '@/repository/peers/dto/peersCreateDto';
import { PeersFindDto } from '@/repository/peers/dto/peersFindDto';
import { PeersKeyDto } from '@/repository/peers/dto/peersKeyDto';
import { PeersUpdateDto } from '@/repository/peers/dto/peersUpdateDto';
import { PeersRepository } from '@/repository/peers/peers.repository';
import { SettingKeyDto } from '@/repository/settings/dto/settingKeyDto';
import { SettingsRepository } from '@/repository/settings/settings.repository';
import { PeerDocument } from '@/schema/peer.schema';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  RepositoryFactoryHttp,
  RepositoryFactorySocket,
  SymbolSdkExt,
} from 'symbol-sdk-ext';
import { ChainInfo } from 'symbol-sdk-ext/dist/model/blockchain';
import { NodeInfo, NodePeer } from 'symbol-sdk-ext/dist/model/node';

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
    private readonly settingsRepository: SettingsRepository,
    private readonly peersRepository: PeersRepository,
  ) {}

  /**
   * NodePeersマップ取得
   * @param peerDocs Peerドキュメント
   * @param networkGenerationHashSeed ネットワークジェネレーションハッシュ
   * @returns NodePeersマップ
   */
  async getNodePeersMap(
    peerDocs: PeerDocument[],
    networkGenerationHashSeed: string,
  ) {
    // 設定からタイムアウトを取得
    const timeout = this.configService.get<number>('connection.timeout');

    // チャンク数取得
    let chunk = this.configService.get<number>('connection.request-chunk');
    if (peerDocs.length < chunk) {
      chunk = peerDocs.length;
    }
    // チャンク毎にまとめる
    const peerDocProcesses: PeerDocument[][] = new Array(chunk);
    for (let i = 0; i < chunk; i++) {
      peerDocProcesses[i] = [];
    }
    let chunkIndex = 0;
    for (const peerDoc of peerDocs) {
      const index = chunkIndex % chunk;
      peerDocProcesses[index].push(peerDoc);
      chunkIndex++;
    }

    // NodePeersマップ取得
    const nodePeersPromises: Promise<void>[] = [];
    const nodePeersMap = new Map<string, NodePeer>();
    for (let i = 0; i < chunk; i++) {
      nodePeersPromises.push(
        this.getNodePeers(
          peerDocProcesses[i],
          timeout,
          networkGenerationHashSeed,
          nodePeersMap,
        ),
      );
    }
    await Promise.all(nodePeersPromises);

    return nodePeersMap;
  }

  async updatePeersCollection(
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

    // Peersコレクション更新
    const nodePeersPromises: Promise<void>[] = [];
    for (let i = 0; i < chunk; i++) {
      nodePeersPromises.push(
        this.updatePeers(chunkNodePeers[i], timeout, networkGenerationHashSeed),
      );
    }
    await Promise.all(nodePeersPromises);
  }

  /**
   * Peerコレクションからチェック日時が古い方から取得
   * @returns Peersドキュメント配列
   */
  async getPeerDocCheckedOldest(): Promise<PeerDocument[]> {
    const findDto = new PeersFindDto();
    const limit = this.configService.get<number>('connection.request-count');
    const peerDocs = await this.peersRepository.findIsOldLimit(findDto, limit);

    return peerDocs;
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
   * @param peerDocs Peerドキュメント
   * @param timeout タイムアウト
   * @param networkGenerationHashSeed ネットワークジェネレーションハッシュシード
   * @param nodePeersMap NodePeersマップ
   */
  private async getNodePeers(
    peerDocs: PeerDocument[],
    timeout: number,
    networkGenerationHashSeed: string,
    nodePeersMap: Map<string, NodePeer>,
  ) {
    for (const peerDoc of peerDocs) {
      const nodeHost = peerDoc.host;
      const nodePort = peerDoc.port;
      const isHttps = await new SymbolSdkExt().isEnableHttps(nodeHost);

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

  private async updatePeers(
    nodePeers: NodePeer[],
    timeout: number,
    networkGenerationHashSeed: string,
  ) {
    for (const nodePeer of nodePeers) {
      // HTTPs判定
      const isHttps = await new SymbolSdkExt().isEnableHttps(nodePeer.host);
      // NodeInfo取得
      const nodeInfo = await this.getNodeInfo(
        nodePeer,
        isHttps,
        timeout,
        networkGenerationHashSeed,
      );
      // ChainInfo取得
      const chainInfo = await this.getChainInfo(nodePeer, isHttps, timeout);

      // Peersコレクション更新
      try {
        // Peersコレクション存在チェック
        const findDto = new PeersFindDto();
        findDto.host = nodePeer.host;
        findDto.publicKey = nodePeer.publicKey;
        const peerDoc = await this.peersRepository.findOne(findDto);

        if (!peerDoc) {
          // 登録
          const createDto = new PeersCreateDto();
          createDto.host = nodePeer.host;
          createDto.publicKey = nodePeer.publicKey;
          if (nodeInfo !== undefined) {
            createDto.port = nodeInfo.port;
            createDto.friendlyName = nodeInfo.friendlyName;
          }
          this.editPeerCreateDto(createDto, nodePeer, nodeInfo, chainInfo);
          await this.peersRepository.create(createDto);
        } else {
          // 更新
          const keyDto = new PeersKeyDto(nodePeer.host, nodePeer.publicKey);
          const updateDto = new PeersUpdateDto();
          this.editPeerCreateDto(updateDto, nodePeer, nodeInfo, chainInfo);
          await this.peersRepository.updateOne(keyDto, updateDto);
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
          this.logger.log(
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

  private editPeerCreateDto(
    peerDto: BasePeersDto,
    nodePeer: NodePeer,
    nodeInfo: NodeInfo | undefined,
    chainInfo: ChainInfo | undefined,
  ) {
    // チェック日時
    peerDto.lastStatusCheck = new Date();

    // ポート
    peerDto.port = nodePeer.port;
    // フレンドリー名
    peerDto.friendlyName = nodePeer.friendlyName;
    // バージョン
    peerDto.version = nodePeer.version;
    // ジェネレーションハッシュシード
    peerDto.networkGenerationHashSeed = nodePeer.networkGenerationHashSeed;
    // ロール
    peerDto.roles = nodePeer.roles;
    // ネットワーク識別子
    peerDto.networkIdentifier = nodePeer.networkIdentifier;
    // Peer利用可否
    peerDto.isAvailable = false;

    if (nodeInfo !== undefined) {
      // ポート
      peerDto.port = nodeInfo.port;
      // フレンドリー名
      peerDto.friendlyName = nodeInfo.friendlyName;
      // バージョン
      peerDto.version = nodeInfo.version;
      // ジェネレーションハッシュシード
      peerDto.networkGenerationHashSeed = nodeInfo.networkGenerationHashSeed;
      // ロール
      peerDto.roles = nodeInfo.roles;
      // ネットワーク識別子
      peerDto.networkIdentifier = nodeInfo.networkIdentifier;
      // ノード公開鍵
      peerDto.nodePublicKey = nodeInfo.nodePublicKey;
      // 証明書有効期限
      peerDto.certificateExpirationDate = nodeInfo.certificateExpirationDate;
      // Peer利用可否
      peerDto.isAvailable = true;
    }

    if (chainInfo !== undefined) {
      // ブロック高
      peerDto.chainHeight = BigInt(chainInfo.height);
      // ファイナライゼーション
      peerDto.finalization = {
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
