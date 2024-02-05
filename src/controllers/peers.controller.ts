import { NodeKey, PeersService } from '@/services/peers.service';
import { Controller, Logger } from '@nestjs/common';
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

  @Cron('0 */10 * * * *')
  async registerNewPeer() {
    const methodName = 'getTest';
    this.logger.verbose('start - ' + methodName);

    /** Peersコレクション取得 */
    // Peersコレクションからチェック日時が古い方から取得
    const peerDocs = await this.peersService.getPeerDocCheckedOldest();
    const nodeKeys: NodeKey[] = [];
    for (const peerDoc of peerDocs) {
      const nodeKey = new NodeKey();
      nodeKey.host = peerDoc.host;
      nodeKey.publicKey = peerDoc.publicKey;
      nodeKey.port = peerDoc.port;
      nodeKeys.push(nodeKey);
    }

    this.peersService.registerNewPeer(nodeKeys);

    this.logger.verbose(' end  - ' + methodName);
  }

  // @Get()
  // async getPeer2peer(): Promise<void> {
  //   const methodName = 'getPeer2peer';
  //   this.logger.verbose('start - ' + methodName);

  //   await this.peer2peerService.registerNewPeer();

  //   this.logger.verbose(' end  - ' + methodName);
  // }

  //   @Cron(CronExpression.EVERY_30_SECONDS)
  //   handleCron() {
  //     this.logger.debug('Called every 30 seconds');
  //   }
}
