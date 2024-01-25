import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PeersRepository } from './repository/peers/peers.repository';
import { RestGateway } from './util/symboler/RestGateway';

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
        const nodeInfo = await restGw.trySslNodeInfo(initNodeHost);
        if (nodeInfo !== undefined) {
          nodeInfo.isAvailable = true;
          await this.peersRepository.create(nodeInfo);
        }
      }
    }

    this.logger.verbose(' end  - ' + methodName);
  }

  getHello(): string {
    return 'Hello World!';
  }
}
