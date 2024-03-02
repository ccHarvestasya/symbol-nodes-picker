import { PeersService } from '@/services/peers.service';
import { Controller, Get, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

/**
 * Peers コントローラ
 */
@Controller('peers')
export class PeersController {
  /**
   * ロガー
   */
  private readonly logger = new Logger(PeersController.name);

  constructor(private readonly peersService: PeersService) {}

  @Cron('0 */13 * * * *')
  async cronUpdatePeersCollection() {
    const methodName = 'cronUpdatePeersCollection';
    this.logger.log('start - ' + methodName);

    // Peersコレクションからチェック日時が古い方から取得
    const peerDocs = await this.peersService.getPeerDocCheckedOldest();
    // ジェネレーションハッシュシード
    const networkGenerationHashSeed =
      await this.peersService.getNetworkGenerationHashSeed();
    // NodePeersマップ取得
    const nodePeersMap = await this.peersService.getNodePeersMap(
      peerDocs,
      networkGenerationHashSeed,
    );

    // Peersコレクション登録/更新
    await this.peersService.updatePeersCollection(
      nodePeersMap,
      networkGenerationHashSeed,
    );

    this.logger.log(' end  - ' + methodName);
  }

  @Get()
  async getUpdatePeersCollection(): Promise<void> {
    const methodName = 'getUpdatePeersCollection';
    this.logger.log('start - ' + methodName);

    // Peersコレクションからチェック日時が古い方から取得
    const peerDocs = await this.peersService.getPeerDocCheckedOldest();
    // ジェネレーションハッシュシード
    const networkGenerationHashSeed =
      await this.peersService.getNetworkGenerationHashSeed();
    // NodePeersマップ取得
    const nodePeersMap = await this.peersService.getNodePeersMap(
      peerDocs,
      networkGenerationHashSeed,
    );

    // Peersコレクション登録/更新
    await this.peersService.updatePeersCollection(
      nodePeersMap,
      networkGenerationHashSeed,
    );

    this.logger.log('e n d - ' + methodName);
  }
}
