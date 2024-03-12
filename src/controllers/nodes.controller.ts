import { NodesFindCondition } from '@/repository/nodes/dto/NodesFindDto';
import { NodesService } from '@/services/nodes.service';
import { Controller, Get, Logger, Query } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { URL } from 'url';

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
   * [Get]Nodes
   */
  @Get('/')
  async getNodes(
    @Query('limit') limit: string,
    @Query('ssl') ssl: string,
    @Query('peerAvailable') peerAvailable: string,
    @Query('apiAvailable') apiAvailable: string,
    @Query('wsAvailable') wsAvailable: string,
    @Query('votingAvailable') votingAvailable: string,
    @Query('fromTxSearchCount') fromTxSearchCount: string,
  ) {
    const condition: NodesFindCondition = {};

    if (ssl === undefined || ssl === 'true') {
      condition['api.isHttpsEnabled'] = true;
    } else if (ssl === 'false') {
      condition['api.isHttpsEnabled'] = false;
    }

    if (peerAvailable === 'true') {
      condition['peer.isAvailable'] = true;
    } else if (peerAvailable === 'false') {
      condition['peer.isAvailable'] = false;
    }

    if (apiAvailable === undefined || apiAvailable === 'true') {
      condition['api.isAvailable'] = true;
    } else if (apiAvailable === 'false') {
      condition['api.isAvailable'] = false;
    }

    if (wsAvailable === undefined || wsAvailable === 'true') {
      condition['api.webSocket.isAvailable'] = true;
    } else if (wsAvailable === 'false') {
      condition['api.webSocket.isAvailable'] = false;
    }

    if (votingAvailable === 'true') {
      condition['voting.isAvailable'] = true;
    } else if (votingAvailable === 'false') {
      condition['voting.isAvailable'] = false;
    }

    const numFromTxSearchCount = this.parseNumber(fromTxSearchCount);
    if (!isNaN(numFromTxSearchCount)) {
      condition['api.txSearchCountPerPage'] = { $gte: numFromTxSearchCount };
    }

    let numLimit = 4;
    if (limit !== undefined) {
      numLimit = this.parseNumber(limit);
      if (isNaN(numLimit)) {
        numLimit = 0;
      }
    }

    const outputJson = await this.nodesService.getNodesList(
      condition,
      numLimit,
    );

    return outputJson;
  }

  /**
   * [Cron]Peer更新
   */
  @Cron('0 */7 * * * *')
  async cronUpdatePeer() {
    const methodName = 'cronUpdatePeer';
    this.logger.log('start - ' + methodName);

    await this.updatePeer();

    this.logger.log('e n d - ' + methodName);
  }

  // /**
  //  * [Get]Peer更新
  //  */
  // @Get('peer')
  // async getUpdatePeer(): Promise<void> {
  //   const methodName = 'getUpdatePeer';
  //   this.logger.log('start - ' + methodName);

  //   await this.updatePeer();

  //   this.logger.log('e n d - ' + methodName);
  // }

  /**
   * [Cron]Api更新
   */
  @Cron('0 */11 * * * *')
  async cronUpdateApi() {
    const methodName = 'cronUpdateApi';
    this.logger.log('start - ' + methodName);

    await this.updateApi();

    this.logger.log('e n d - ' + methodName);
  }

  // /**
  //  * [Get]Api更新
  //  */
  // @Get('api')
  // async getUpdateApi(): Promise<void> {
  //   const methodName = 'getUpdateApi';
  //   this.logger.log('start - ' + methodName);

  //   await this.updateApi();

  //   this.logger.log('e n d - ' + methodName);
  // }

  /**
   * [Cron]Voting更新
   */
  @Cron('0 */13 * * * *')
  async cronUpdateVoting() {
    const methodName = 'cronUpdateVoting';
    this.logger.log('start - ' + methodName);

    await this.updateVoting();

    this.logger.log('e n d - ' + methodName);
  }

  // /**
  //  * [Get]Voting更新
  //  */
  // @Get('voting')
  // async getUpdateVoting(): Promise<void> {
  //   const methodName = 'getUpdateVoting';
  //   this.logger.log('start - ' + methodName);

  //   await this.updateVoting();

  //   this.logger.log('e n d - ' + methodName);
  // }

  /**
   * Peer更新
   */
  private async updatePeer() {
    // Nodesコレクションからチェック日時が古い方から取得
    let nodeDocs = await this.nodesService.getNodeDocCheckedOldest();
    nodeDocs = nodeDocs.filter((item) => {
      if (URL.canParse(`http://${item.host}`)) {
        return true;
      }
      return false;
    });

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
    let nodeDocs = await this.nodesService.getNodeDocApiCheckedOldest();
    nodeDocs = nodeDocs.filter((item) => {
      if (URL.canParse(`http://${item.host}`)) {
        return true;
      }
      return false;
    });
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

  private parseNumber(str: string): number {
    if (typeof str !== 'string') return NaN;
    return Number(str);
  }
}
