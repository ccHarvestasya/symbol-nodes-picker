import { Controller, Get, Logger } from '@nestjs/common';
import { NodePeer2peersService } from '../services/nodepeer2peers.service';

/**
 * Peer to Peer コントローラ
 */
@Controller('peer2peer')
export class Peer2peerController {
  /**
   * ロガー
   */
  private readonly logger = new Logger(Peer2peerController.name);

  constructor(private readonly peer2peerService: NodePeer2peersService) {}

  getTest() {
    const methodName = 'getTest';
    this.logger.verbose('start - ' + methodName);
    this.logger.verbose(' end  - ' + methodName);
  }

  @Get()
  async getPeer2peer(): Promise<void> {
    const methodName = 'getPeer2peer';
    this.logger.verbose('start - ' + methodName);

    await this.peer2peerService.registerNewPeer();

    this.logger.verbose(' end  - ' + methodName);
  }

  //   @Cron(CronExpression.EVERY_30_SECONDS)
  //   handleCron() {
  //     this.logger.debug('Called every 30 seconds');
  //   }
}
