import { PeersCreateDto } from '@/repository/peers/dto/peersCreateDto';
import { PeersRepository } from '@/repository/peers/peers.repository';
import { SettingCreateDto } from '@/repository/settings/dto/settingCreateDto';
import { SettingsRepository } from '@/repository/settings/settings.repository';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  RepositoryFactoryHttp,
  RepositoryFactorySocket,
  SymbolSdkExt,
} from 'symbol-sdk-ext';

@Injectable()
export class AppService {
  /**
   * ロガー
   */
  private readonly logger = new Logger(AppService.name);

  /**
   * コンストラクタ
   * @param configService コンフィグサービス
   * @param settingsRepository Settingリポジトリ
   * @param peersRepository Peerリポジトリ
   */
  constructor(
    private readonly configService: ConfigService,
    private readonly settingsRepository: SettingsRepository,
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

    if (!peersDoc) {
      this.logger.log('コレクションが存在しません。初期データを読み込みます。');

      // 設定から初期ノードホストを取得
      const initNodeHosts = this.configService.get<string[]>(
        'connection.init-host',
      );
      // 設定からタイムアウトを取得
      const timeout = this.configService.get<number>('connection.timeout');

      let networkGenerationHashSeed = '';
      // ノード情報登録
      for (const initNodeHost of initNodeHosts) {
        const symbolSdkExt = new SymbolSdkExt(timeout);
        const isHttps = await symbolSdkExt.isEnableHttps(initNodeHost);
        // ソケットでノード情報取得
        const socketRepositoryFactory = new RepositoryFactorySocket(
          initNodeHost,
          7900,
          timeout,
        );
        let nodeRepo = socketRepositoryFactory.createNodeRepository();
        let nodeInfo = await nodeRepo.getNodeInfo();
        if (!nodeInfo) {
          // ソケットで取得出来ない場合はRestから取得
          const httpRepositoryFactory = new RepositoryFactoryHttp(
            initNodeHost,
            isHttps,
            timeout,
          );
          nodeRepo = httpRepositoryFactory.createNodeRepository();
          nodeInfo = await nodeRepo.getNodeInfo();
        }

        try {
          if (nodeInfo) {
            const peerCreateDto = new PeersCreateDto();
            peerCreateDto.host = initNodeHost;
            peerCreateDto.publicKey = nodeInfo.publicKey;
            peerCreateDto.nodePublicKey = nodeInfo.nodePublicKey;
            peerCreateDto.port = nodeInfo.port;
            peerCreateDto.friendlyName = nodeInfo.friendlyName;
            peerCreateDto.version = nodeInfo.version;
            peerCreateDto.networkGenerationHashSeed =
              nodeInfo.networkGenerationHashSeed;
            peerCreateDto.roles = nodeInfo.roles;
            peerCreateDto.networkIdentifier = nodeInfo.networkIdentifier;
            peerCreateDto.certificateExpirationDate =
              nodeInfo.certificateExpirationDate;

            await this.peersRepository.create(peerCreateDto);
            // ジェネレーションハッシュシード退避
            networkGenerationHashSeed = nodeInfo.networkGenerationHashSeed;
          }
        } catch (e) {
          this.logger.error(e);
        }
      }

      // ジェネレーションハッシュシードを保存
      const settingCreateDto = new SettingCreateDto();
      settingCreateDto.key = 'networkGenerationHashSeed';
      settingCreateDto.value = networkGenerationHashSeed;
      await this.settingsRepository.create(settingCreateDto);
    }

    this.logger.verbose('e n d - ' + methodName);
  }
}
