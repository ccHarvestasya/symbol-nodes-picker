import { PeerCreateDto } from '@/repository/peers/dto/peerCreateDto';
import { PeersRepository } from '@/repository/peers/peers.repository';
import { RestGateway } from '@/util/symboler/RestGateway';
import { SslSocket } from '@/util/symboler/SslSocket';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  /**
   * ロガー
   */
  private readonly logger = new Logger(AppService.name);

  /**
   * コンストラクタ
   * @param configService コンフィグサービス
   * @param peersRepository Peerリポジトリ
   */
  constructor(
    private readonly configService: ConfigService,
    private readonly peersRepository: PeersRepository,
  ) {}

  /**
   * 初回処理
   * RestGatewayから情報を取得し、Peerコレクションを登録する。
   */
  async initPeersCollection() {
    const methodName = 'initPeersCollection';
    this.logger.verbose('start - ' + methodName);

    // Peerコレクションから1件取得
    const peersDoc = await this.peersRepository.findOne();
    if (peersDoc === null) {
      this.logger.debug('コレクションが存在しません。初期データを読み込みます。');
      // 設定から初期ノードホストを取得
      const initNodeHosts = this.configService.get<string[]>('connection.init-host');
      // ノード情報登録
      for (const initNodeHost of initNodeHosts) {
        const restGw = new RestGateway(this.configService.get<number>('connection.timeout'));
        const nodeInfo = await restGw.tryHttpsNodeInfo(initNodeHost);
        if (nodeInfo !== undefined) {
          const peerCreateDto = new PeerCreateDto();
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
          peerCreateDto.certificateExpirationDate = nodeInfo.certificateExpirationDate;
          peerCreateDto.isAvailable = true;
          peerCreateDto.lastCheck = new Date();
          peerCreateDto.lastSyncCheck = new Date();
          await this.peersRepository.create(peerCreateDto);
        }
      }
    }

    this.logger.verbose(' end  - ' + methodName);
  }

  async registerPeer2Peers() {
    const methodName = 'registerPeer2Peers';
    this.logger.verbose('start - ' + methodName);

    const sslScoket = new SslSocket();
    await sslScoket.getNodeInfo('symbol02.harvestasya.com', 7900);

    //   // リクエスト上限まで取得
    //   const peersDocs = await this.peersRepository.findLimit(
    //     new PeersFindDto(),
    //     this.configService.get<number>('request-count'),
    //   );

    //   // チャンク数
    //   const chunk =
    //     peersDocs.length < this.configService.get<number>('request-chunk')
    //       ? peersDocs.length
    //       : this.configService.get<number>('request-chunk');

    //   // チャンク数分並列処理
    //   const promises: Promise<void>[] = [];
    //   for (let i = 0; i < chunk; i++) {
    //     promises.push(this.getNodePeers(peers));
    //   }
    //   await Promise.all(promises);

    this.logger.verbose(' end  - ' + methodName);
  }

  getHello(): string {
    return 'Hello World!';
  }

  // private async registerPeer2PeersParallel() {}
}
