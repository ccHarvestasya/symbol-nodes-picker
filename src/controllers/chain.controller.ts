import { ChainService } from '@/services/chain.service';
import { PeersService } from '@/services/peers.service';
import { Controller, Get, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Controller('chain')
export class ChainController {
  /**
   * ロガー
   */
  private readonly logger = new Logger(ChainController.name);

  /**
   * コンストラクタ
   * @param peersService Peersサービス
   * @param chainService Chainサービス
   */
  constructor(
    private readonly peersService: PeersService,
    private readonly chainService: ChainService,
  ) {}

  /**
   * [Cron]Chainコレクション更新
   */
  @Cron('0 */3 * * * *')
  async cronUpdateChainCollection(): Promise<void> {
    const methodName = 'cronUpdateChainCollection';
    this.logger.log('start - ' + methodName);

    // Peersコレクションからチェック日時が古い方から取得
    const peerDocs = await this.peersService.getPeerDocCheckedOldest();

    // Chainコレクション更新
    await this.chainService.updateChainCollection(peerDocs);

    this.logger.log('e n d - ' + methodName);
  }

  /**
   * [Get]Chainコレクション更新
   */
  @Get()
  async GetUpdateChainCollection(): Promise<void> {
    const methodName = 'GetUpdateChainCollection';
    this.logger.log('start - ' + methodName);

    // Peersコレクションからチェック日時が古い方から取得
    const peerDocs = await this.peersService.getPeerDocCheckedOldest();

    // Chainコレクション更新
    await this.chainService.updateChainCollection(peerDocs);

    this.logger.log('e n d - ' + methodName);
  }
}
