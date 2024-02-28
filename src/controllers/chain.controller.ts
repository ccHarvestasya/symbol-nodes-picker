import { ChainService } from '@/services/chain.service';
import { PeersService } from '@/services/peers.service';
import { Controller, Logger } from '@nestjs/common';
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
   * Chainコレクション更新
   */
  @Cron('0 */3 * * * *')
  async updateChainCollection(): Promise<void> {
    const methodName = 'updateChainCollection';
    this.logger.verbose('start - ' + methodName);

    // Peersコレクションからチェック日時が古い方から取得
    const peerDocs = await this.peersService.getPeerDocCheckedOldest();

    // Chainコレクション更新
    this.chainService.updateChainCollection(peerDocs);

    this.logger.verbose('e n d - ' + methodName);
  }
}
