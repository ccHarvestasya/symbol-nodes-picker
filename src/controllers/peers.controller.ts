import { PeersService } from '@/services/peers.service';
import { Controller, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { NodeInfo, NodePeer } from 'symbol-sdk-ext/dist/model/node';

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
  async registerNewNodePeer() {
    const methodName = 'registerNewNodePeer';
    this.logger.verbose('start - ' + methodName);

    // Peersコレクションからチェック日時が古い方から取得
    const peerDocs = await this.peersService.getPeerDocCheckedOldest();
    // ジェネレーションハッシュシード
    const networkGenerationHashSeed =
      await this.peersService.getNetworkGenerationHashSeed();
    // /node/peersリストマップ取得
    const nodePeersMap = await this.peersService.getNodePeersMap(
      peerDocs,
      networkGenerationHashSeed,
    );

    // /node/info取得
    const nodePeerInfos =
      await this.peersService.getNodePeerInfos(nodePeersMap);
    for (const nodePeerInfo of nodePeerInfos) {
      // Peersコレクション登録/更新
      this.logger.debug(`update peers: ${nodePeerInfo[0]?.host}`);
      this.peersService.updatePeerInfo(
        nodePeerInfo[0] as NodePeer,
        nodePeerInfo[1] as NodeInfo,
      );
    }

    this.logger.verbose(' end  - ' + methodName);
  }

  // @Get()
  // async getTest(): Promise<void> {
  //   const methodName = 'getTest';
  //   this.logger.verbose('start - ' + methodName);

  //   // Peersコレクションからチェック日時が古い方から取得
  //   const peerDocs = await this.peersService.getPeerDocCheckedOldest();
  //   // ジェネレーションハッシュシード
  //   const networkGenerationHashSeed = await this.peersService.getNetworkGenerationHashSeed();
  //   // /node/peersリストマップ取得
  //   const nodePeersMap = await this.peersService.getNodePeersMap(
  //     peerDocs,
  //     networkGenerationHashSeed,
  //   );

  //   // /node/info取得
  //   const nodePeerInfos = await this.peersService.getNodePeerInfos(nodePeersMap);
  //   for (const nodePeerInfo of nodePeerInfos) {
  //     // Peersコレクション登録/更新
  //     this.logger.debug(`update peers: ${nodePeerInfo[0]?.host}`);
  //     this.peersService.updatePeerInfo(nodePeerInfo[0] as NodePeer, nodePeerInfo[1] as NodeInfo);
  //   }

  //   this.logger.verbose('e n d - ' + methodName);
  // }
}
