import { ChainRepository } from '@/repository/chain/chain.repository';
import { ChainFindDto } from '@/repository/chain/dto/chainFindDto';
import { ChainKeyDto } from '@/repository/chain/dto/chainKeyDto';
import { ChainUpdateDto } from '@/repository/chain/dto/chainUpdateDto';
import { PeerDocument } from '@/schema/peer.schema';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  RepositoryFactoryHttp,
  RepositoryFactorySocket,
} from 'symbol-sdk-ext/dist/infrastructure';
import { ChainInfo } from 'symbol-sdk-ext/dist/model/blockchain';
import { ChainCreateDto } from './../repository/chain/dto/chainCreateDto';

@Injectable()
export class ChainService {
  /**
   * ロガー
   */
  private readonly logger = new Logger(ChainService.name);

  /**
   * コンストラクタ
   * @param configService コンフィグサービス
   * @param chainRepository Chainリポジトリ
   */
  constructor(
    private readonly configService: ConfigService,
    private readonly chainRepository: ChainRepository,
  ) {}

  /**
   * Chainコレクション更新
   * @param peerDocs Peerドキュメント
   */
  async updateChainCollection(peerDocs: PeerDocument[]) {
    // 設定からタイムアウトを取得
    const timeout = this.configService.get<number>('connection.timeout');

    // チャンク数取得
    let chunk = this.configService.get<number>('connection.request-chunk');
    if (peerDocs.length < chunk) {
      chunk = peerDocs.length;
    }

    //処理リスト作成
    const peerDocProcesses: PeerDocument[][] = new Array(chunk);
    for (let i = 0; i < chunk; i++) {
      peerDocProcesses[i] = [];
    }
    let chunkIndex = 0;
    for (const peerDoc of peerDocs) {
      const index = chunkIndex % chunk;
      peerDocProcesses[index].push(peerDoc);
      chunkIndex++;
    }

    // /chain/info取得して更新
    const chainInfoPromises: Promise<void>[] = [];
    for (let i = 0; i < chunk; i++) {
      chainInfoPromises.push(
        this.updateGetChainInfo(peerDocProcesses[i], timeout),
      );
    }
    await Promise.all(chainInfoPromises);
  }

  /**
   * ChainInfo取得して更新
   * @param peerDocs Peerドキュメント
   * @param timeout タイムアウト
   */
  private async updateGetChainInfo(peerDocs: PeerDocument[], timeout: number) {
    for (const peerDoc of peerDocs) {
      const nodeHost = peerDoc.host;
      const nodePort = peerDoc.port;
      const isHttps = peerDoc.isHttpsEnabled;

      try {
        // ソケットからピアリスト取得
        const socketRepositoryFactory = new RepositoryFactorySocket(
          nodeHost,
          nodePort,
          timeout,
        );
        let chainRepo = socketRepositoryFactory.createChainRepository();
        let chainInfo = await chainRepo.getChainInfo();
        if (chainInfo !== undefined) {
          this.logger.log(`[OK] ${nodeHost}:${nodePort}/chain/info`);
        } else if (chainInfo === undefined) {
          // ソケットで取得出来ない場合はRestから取得
          this.logger.warn(`[NG] ${nodeHost}:${nodePort}/chain/info`);
          const httpRepositoryFactory = new RepositoryFactoryHttp(
            nodeHost,
            isHttps,
            timeout,
          );
          chainRepo = httpRepositoryFactory.createChainRepository();
          chainInfo = await chainRepo.getChainInfo();
          if (chainInfo !== undefined) {
            this.logger.log(
              `[OK] ${nodeHost}:${isHttps ? 3001 : 3000}/chain/info`,
            );
          } else {
            this.logger.warn(
              `[NG] ${nodeHost}:${isHttps ? 3001 : 3000}/chain/info`,
            );
          }
        }
        // 更新
        if (chainInfo !== undefined) {
          this.updateChainInfo(peerDoc, chainInfo);
        }
      } catch (e) {
        this.logger.error(e);
      }
    }
  }

  /**
   * Chainコレクション更新
   * @param peerDoc Peerドキュメント
   * @param chainInfo ChainInfo
   */
  private async updateChainInfo(peerDoc: PeerDocument, chainInfo: ChainInfo) {
    try {
      // Chainコレクション存在チェック
      const findDto = new ChainFindDto();
      findDto.host = peerDoc.host;
      findDto.publicKey = peerDoc.publicKey;
      const chainDoc = await this.chainRepository.findOne(findDto);

      if (!chainDoc) {
        //登録
        const chainCreateDto = new ChainCreateDto();
        chainCreateDto.host = peerDoc.host;
        chainCreateDto.publicKey = peerDoc.publicKey;
        chainCreateDto.chainHeight = BigInt(chainInfo.height);
        chainCreateDto.finalization = {
          height: BigInt(chainInfo.latestFinalizedBlock.height),
          epoch: chainInfo.latestFinalizedBlock.finalizationEpoch,
          point: chainInfo.latestFinalizedBlock.finalizationPoint,
          hash: chainInfo.latestFinalizedBlock.hash,
        };
        await this.chainRepository.create(chainCreateDto);
      } else {
        // 更新
        const keyDto = new ChainKeyDto(peerDoc.host, peerDoc.publicKey);
        const updateDto = new ChainUpdateDto();
        updateDto.chainHeight = BigInt(chainInfo.height);
        updateDto.finalization = {
          height: BigInt(chainInfo.latestFinalizedBlock.height),
          epoch: chainInfo.latestFinalizedBlock.finalizationEpoch,
          point: chainInfo.latestFinalizedBlock.finalizationPoint,
          hash: chainInfo.latestFinalizedBlock.hash,
        };
        await this.chainRepository.updateOne(keyDto, updateDto);
      }
    } catch (e) {
      this.logger.error(e);
    }
  }
}
