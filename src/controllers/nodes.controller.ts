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
  @Cron('0 */7 * * * *')
  async cronUpdatePeer() {
    const methodName = 'cronUpdatePeer';
    this.logger.log('start - ' + methodName);

    await this.updatePeer();

    this.logger.log(' end  - ' + methodName);
  }

  /**
   * [Get]Peer更新
   */
  @Get('peer')
  async getUpdatePeer(): Promise<void> {
    const methodName = 'getUpdatePeer';
    this.logger.log('start - ' + methodName);

    await this.updatePeer();

    this.logger.log('e n d - ' + methodName);
  }

  /**
   * [Cron]Api更新
   */
  @Cron('0 */13 * * * *')
  async cronUpdateApi() {
    const methodName = 'cronUpdateApi';
    this.logger.log('start - ' + methodName);

    await this.updateApi();

    this.logger.log(' end  - ' + methodName);
  }

  /**
   * [Get]Api更新
   */
  @Get('api')
  async getUpdateApi(): Promise<void> {
    const methodName = 'getUpdateApi';
    this.logger.log('start - ' + methodName);

    await this.updateApi();

    this.logger.log('e n d - ' + methodName);
  }

  /**
   * [Cron]Voting更新
   */
  @Cron('0 */27 * * * *')
  async cronUpdateVoting() {
    const methodName = 'cronUpdateVoting';
    this.logger.log('start - ' + methodName);

    await this.updateVoting();

    this.logger.log(' end  - ' + methodName);
  }

  /**
   * [Get]Voting更新
   */
  @Get('voting')
  async getUpdateVoting(): Promise<void> {
    const methodName = 'getUpdateVoting';
    this.logger.log('start - ' + methodName);

    await this.updateVoting();

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
    // NodesコレクションApi更新
    await this.nodesService.updateNodesCollectionOfApi(nodeDocs);
  }

  /**
   * Voting更新
   */
  private async updateVoting() {
    // Nodesコレクションからチェック日時が古い方から取得
    const nodeDocs = await this.nodesService.getNodeDocVotingCheckedOldest();
    // NodesコレクションVoting更新
    await this.nodesService.updateNodesCollectionOfVoting(nodeDocs);
  }
}
