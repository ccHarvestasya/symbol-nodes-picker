import { NodesCreateDto } from '@/repository/nodes/dto/NodesCreateDto';
import { NodesRepository } from '@/repository/nodes/nodes.repository';
import { SettingCreateDto } from '@/repository/settings/dto/SettingCreateDto';
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
   * @param nodesRepository Nodesリポジトリ
   */
  constructor(
    private readonly configService: ConfigService,
    private readonly settingsRepository: SettingsRepository,
    private readonly nodesRepository: NodesRepository,
  ) {}

  /**
   * 初回処理
   * RestGatewayから情報を取得し、Nodesコレクションを登録する。
   */
  async initNodesCollection() {
    const methodName = 'initNodesCollection';
    this.logger.verbose('start - ' + methodName);

    // Nodesコレクションから1件取得
    const nodesDoc = await this.nodesRepository.findOne();

    if (!nodesDoc) {
      this.logger.log(
        'Nodesコレクションが存在しません。初期データを読み込みます。',
      );

      // 設定から初期ノードホストを取得
      const initNodeHosts = this.configService.get<string[]>(
        'connection.init-host',
      );
      // 設定からタイムアウトを取得
      const timeout = this.configService.get<number>('connection.timeout');

      let host = '';
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
            const createDto = new NodesCreateDto();
            createDto.host = initNodeHost;
            createDto.publicKey = nodeInfo.publicKey;
            createDto.peer.nodePublicKey = nodeInfo.nodePublicKey;
            createDto.peer.port = nodeInfo.port;
            createDto.peer.friendlyName = nodeInfo.friendlyName;
            createDto.peer.version = nodeInfo.version;
            createDto.peer.networkGenerationHashSeed =
              nodeInfo.networkGenerationHashSeed;
            createDto.peer.roles = nodeInfo.roles;
            createDto.peer.networkIdentifier = nodeInfo.networkIdentifier;
            createDto.peer.certificateExpirationDate =
              nodeInfo.certificateExpirationDate;
            await this.nodesRepository.create(createDto);
            // ホスト退避
            host = nodeInfo.host;
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
      // ネットワークプロパティ保存
      const repoFactory = new RepositoryFactoryHttp(host);
      const networkRepo = repoFactory.createNetworkRepository();
      const networkProperties = await networkRepo.getNetworkProperties();
      // カレンシーモザイクID
      settingCreateDto.key = 'currencyMosaicId';
      settingCreateDto.value =
        networkProperties.chain.currencyMosaicId.replaceAll("'", '');
      await this.settingsRepository.create(settingCreateDto);
      // 最小投票残高
      settingCreateDto.key = 'minVoterBalance';
      settingCreateDto.value =
        networkProperties.chain.minVoterBalance.replaceAll("'", '');
      await this.settingsRepository.create(settingCreateDto);
    }

    this.logger.verbose('e n d - ' + methodName);
  }
}
