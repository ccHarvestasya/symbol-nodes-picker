import { NodesService } from '@/services/nodes.service';
import { Controller, Get, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

/**
 * Nodes コントローラ
 */
@Controller('nodes')
export class NodesController {
  /**  ロガー */
  private readonly logger = new Logger(NodesController.name);

  /**
   * コンストラクタ
   * @param nodesService Nodesサービス
   */
  constructor(private readonly nodesService: NodesService) {}

  /**
   * [Cron]Peer更新
   */
  @Cron('0 */13 * * * *')
  async cronUpdatePeer() {
    const methodName = 'cronUpdatePeer';
    this.logger.log('start - ' + methodName);

    this.updatePeer();

    this.logger.log(' end  - ' + methodName);
  }

  /**
   * [Get]Peer更新
   */
  @Get()
  async getUpdatePeer(): Promise<void> {
    const methodName = 'getUpdatePeer';
    this.logger.log('start - ' + methodName);

    this.updatePeer();

    this.logger.log('e n d - ' + methodName);
  }

  /**
   * [Get]Api更新
   */
  @Get('api')
  async getUpdateApi(): Promise<void> {
    const methodName = 'getUpdateApi';
    this.logger.log('start - ' + methodName);

    this.updateApi();

    this.logger.log('e n d - ' + methodName);
  }

  /**
   * Peer更新
   */
  private async updatePeer() {
    // Nodesコレクションからチェック日時が古い方から取得
    const nodeDocs = await this.nodesService.getNodeDocCheckedOldest();
    // ジェネレーションハッシュシード
    const networkGenerationHashSeed =
      await this.nodesService.getNetworkGenerationHashSeed();
    // NodeNodesマップ取得
    const nodePeersMap = await this.nodesService.getNodePeersMap(
      nodeDocs,
      networkGenerationHashSeed,
    );

    // Nodesコレクション登録/更新
    await this.nodesService.updateNodesCollection(
      nodePeersMap,
      networkGenerationHashSeed,
    );
  }

  /**
   * Api更新
   */
  private async updateApi() {
    // Nodesコレクションからチェック日時が古い方から取得
    const nodeDocs = await this.nodesService.getNodeDocApiCheckedOldest();
    // Api持ちのみにフィルタ
    // const apiNodeDoc = nodeDocs.filter((item) => item.peer?.roles & 2);

    for (const doc of nodeDocs) {
      console.log(
        '%o:%o:%o',
        doc.api?.lastStatusCheck,
        doc.host,
        doc.peer?.roles,
      );
    }
    await this.nodesService.updateNodesCollectionOfApi(nodeDocs);
  }
}
