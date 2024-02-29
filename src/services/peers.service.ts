import { PeerCreateDto } from '@/repository/peers/dto/peerCreateDto';
import { PeerKeyDto } from '@/repository/peers/dto/peerKeyDto';
import { PeerUpdateDto } from '@/repository/peers/dto/peerUpdateDto';
import { PeersFindDto } from '@/repository/peers/dto/peersFindDto';
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
import { Listener } from 'symbol-sdk-ext/dist/infrastructure';
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

    //処理リスト作成
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

    // /node/peers取得
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

  /**
   * NodePeerとNodeInfoのセットを取得
   * @param nodePeersMap NodePeersマップ
   * @returns NodePeerとNodeInfoのセット
   */
  async getNodePeerInfos(nodePeersMap: Map<string, NodePeer>) {
    // マップを配列に変換
    const nodePeers: NodePeer[] = [...nodePeersMap.values()];

    // 設定からタイムアウトを取得
    const timeout = this.configService.get<number>('connection.timeout');

    // チャンク数取得
    let chunk = this.configService.get<number>('connection.request-chunk');
    if (nodePeers.length < chunk) {
      chunk = nodePeers.length;
    }

    //処理リスト作成
    const processesList: NodePeer[][] = new Array(chunk);
    for (let i = 0; i < chunk; i++) {
      processesList[i] = [];
    }
    let chunkIndex = 0;
    for (const nodePeer of nodePeers) {
      const index = chunkIndex % chunk;
      processesList[index].push(nodePeer);
      chunkIndex++;
    }

    // /node/info取得
    const nodeInfoPromises: Promise<(NodePeer | NodeInfo)[][]>[] = [];
    for (let i = 0; i < chunk; i++) {
      nodeInfoPromises.push(this.getNodePeerInfoSet(processesList[i], timeout));
    }
    const nodePeerInfos = await Promise.all(nodeInfoPromises);

    return nodePeerInfos.flat();
  }

  /**
   * Peerコレクション更新
   * @param nodePeer NodePeer
   * @param nodeInfo NodeInfo
   */
  async updatePeerInfo(nodePeer: NodePeer, nodeInfo: NodeInfo | undefined) {
    try {
      // Peersコレクション存在チェック
      const findDto = new PeersFindDto();
      findDto.host = nodePeer.host;
      findDto.publicKey = nodePeer.publicKey;
      const peerDoc = await this.peersRepository.findOne(findDto);

      if (!peerDoc) {
        // 登録
        const peerCreateDto = new PeerCreateDto();
        peerCreateDto.host = nodePeer.host;
        peerCreateDto.publicKey = nodePeer.publicKey;
        peerCreateDto.port = nodePeer.port;
        peerCreateDto.friendlyName = nodePeer.friendlyName;
        peerCreateDto.version = nodePeer.version;
        peerCreateDto.networkGenerationHashSeed =
          nodePeer.networkGenerationHashSeed;
        peerCreateDto.roles = nodePeer.roles;
        peerCreateDto.networkIdentifier = nodePeer.networkIdentifier;
        peerCreateDto.isHttpsEnabled = false;
        peerCreateDto.isAvailable = false;
        peerCreateDto.isWsAvailable = false;
        peerCreateDto.isWssAvailable = false;
        peerCreateDto.lastCheck = new Date();
        peerCreateDto.lastSyncCheck = new Date();
        if (nodeInfo !== undefined) {
          peerCreateDto.port = nodeInfo.port;
          peerCreateDto.friendlyName = nodeInfo.friendlyName;
          peerCreateDto.version = nodeInfo.version;
          peerCreateDto.networkGenerationHashSeed =
            nodeInfo.networkGenerationHashSeed;
          peerCreateDto.roles = nodeInfo.roles;
          peerCreateDto.networkIdentifier = nodeInfo.networkIdentifier;
          peerCreateDto.nodePublicKey = nodeInfo.nodePublicKey;
          peerCreateDto.isHttpsEnabled = await new SymbolSdkExt().isEnableHttps(
            nodePeer.host,
          );
          peerCreateDto.certificateExpirationDate =
            nodeInfo?.certificateExpirationDate;
          peerCreateDto.isAvailable = true;
          peerCreateDto.isWsAvailable = await new Listener(
            nodePeer.host,
          ).isWebsokectAvailable();
          peerCreateDto.isWssAvailable = false;
          if (peerCreateDto.isHttpsEnabled) {
            peerCreateDto.isWssAvailable = await new Listener(
              nodePeer.host,
              true,
              false,
            ).isWebsokectAvailable();
          }
        }
        await this.peersRepository.create(peerCreateDto);
      } else {
        // 更新
        const keyDto = new PeerKeyDto(nodePeer.host, nodePeer.publicKey);
        const updateDto = new PeerUpdateDto();
        updateDto.port = nodePeer.port;
        updateDto.friendlyName = nodePeer.friendlyName;
        updateDto.version = nodePeer.version;
        updateDto.networkGenerationHashSeed =
          nodePeer.networkGenerationHashSeed;
        updateDto.roles = nodePeer.roles;
        updateDto.networkIdentifier = nodePeer.networkIdentifier;
        updateDto.isHttpsEnabled = false;
        updateDto.isAvailable = false;
        updateDto.isWsAvailable = false;
        updateDto.isWssAvailable = false;
        updateDto.lastCheck = new Date();
        updateDto.lastSyncCheck = new Date();
        if (nodeInfo !== undefined) {
          updateDto.port = nodeInfo.port;
          updateDto.friendlyName = nodeInfo.friendlyName;
          updateDto.version = nodeInfo.version;
          updateDto.networkGenerationHashSeed =
            nodeInfo.networkGenerationHashSeed;
          updateDto.roles = nodeInfo.roles;
          updateDto.networkIdentifier = nodeInfo.networkIdentifier;
          updateDto.nodePublicKey = nodeInfo.nodePublicKey;
          updateDto.isHttpsEnabled = await new SymbolSdkExt().isEnableHttps(
            nodePeer.host,
          );
          updateDto.certificateExpirationDate =
            nodeInfo?.certificateExpirationDate;
          updateDto.isAvailable = true;
          updateDto.isWsAvailable = await new Listener(
            nodePeer.host,
          ).isWebsokectAvailable();
          updateDto.isWssAvailable = false;
          if (updateDto.isHttpsEnabled) {
            updateDto.isWssAvailable = await new Listener(
              nodePeer.host,
              true,
              false,
            ).isWebsokectAvailable();
          }
        }
        await this.peersRepository.updateOne(keyDto, updateDto);
      }
    } catch (e) {
      this.logger.error(`updatePeerInfo: ${e}`);
    }
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
   * /node/peers取得
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
      const isHttps = peerDoc.isHttpsEnabled;

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

  /**
   * NodePeerとNodeInfoのセット取得
   * @param nodePeers NodePeer配列
   * @param timeout タイムアウト
   * @returns NodePeerとNodeInfoのセット
   */
  private async getNodePeerInfoSet(nodePeers: NodePeer[], timeout: number) {
    const nodePeerInfos: (NodePeer | NodeInfo)[][] = [];

    for (const nodePeer of nodePeers) {
      const nodeHost = nodePeer.host;
      const nodePort = nodePeer.port;
      const isHttps = await new SymbolSdkExt().isEnableHttps(nodeHost);

      try {
        // ソケットからノード情報取得
        const socketRepositoryFactory = new RepositoryFactorySocket(
          nodeHost,
          nodePort,
          timeout,
        );
        let nodeRepo = socketRepositoryFactory.createNodeRepository();
        let nodeInfo = await nodeRepo.getNodeInfo();
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
        nodePeerInfos.push([nodePeer, nodeInfo]);
      } catch (e) {
        this.logger.error(e);
      }
    }

    return nodePeerInfos;
  }
}
