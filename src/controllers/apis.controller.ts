import { Controller, Get, Logger } from '@nestjs/common';

@Controller('apis')
export class ApiController {
  /**
   * ロガー
   */
  private readonly logger = new Logger(ApiController.name);

  @Get()
  async getUpdateApisCollection(): Promise<void> {
    const methodName = 'getUpdateApisCollection';
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
