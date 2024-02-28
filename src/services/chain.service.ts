// import { ChainRepository } from '@/repository/chain/chain.repository';
// import { SettingsRepository } from '@/repository/settings/settings.repository';
// import { Injectable, Logger } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { ChainCat, ChainHttp } from 'symbol-sdk-ext';
// import { ChainInfo } from 'symbol-sdk-ext/dist/model/ChainInfo';

// export class NodeKey {
//   host: string;
//   publicKey: string;
//   port: number;
//   isHttps: boolean;
// }

// @Injectable()
// export class ChainService {
//   private readonly _logger = new Logger(ChainService.name);

//   constructor(
//     private readonly configService: ConfigService,
//     private readonly settingsRepository: SettingsRepository,
//     private readonly chainRepository: ChainRepository,
//   ) {}

//   async updateChainInfo(nodeKeys: NodeKey[]) {
//     const methodName = 'registerNewPeer';
//     this._logger.verbose('start - ' + methodName);

//     // コピー
//     const socketProcessLists = nodeKeys.concat();
//     const restGwProcessLists = nodeKeys.concat();

//     // チャンク数取得
//     let chunk = this.configService.get<number>('connection.request-chunk');
//     if (nodeKeys.length < chunk) {
//       chunk = nodeKeys.length;
//     }

//     // チャンク数分並列処理
//     // ソケット通信
//     const socketPromises: Promise<void>[] = [];
//     const scoketChainInfoMap = new Map<string, ChainInfo>();
//     for (let i = 0; i < chunk; i++) {
//       socketPromises.push(this.getSocketChainInfoParallel(socketProcessLists, scoketChainInfoMap));
//     }
//     // 並列処理
//     await Promise.all([Promise.all(socketPromises)]);
//     // HTTP通信
//     const restGwPromises: Promise<void>[] = [];
//     const restGwChainInfoMap = new Map<string, ChainInfo>();
//     for (let i = 0; i < chunk; i++) {
//       restGwPromises.push(this.getRestGwChainInfoParallel(restGwProcessLists, restGwChainInfoMap));
//     }
//     // 並列処理
//     await Promise.all([await Promise.all(socketPromises), await Promise.all(restGwPromises)]);

//     this._logger.verbose('e n d - ' + methodName);
//   }

//   private async getSocketChainInfoParallel(
//     nodeKeys: NodeKey[],
//     chainInfoMap: Map<string, ChainInfo>,
//   ) {
//     const timeout = this.configService.get<number>('connection.timeout');
//     let nodeKey: NodeKey;
//     while ((nodeKey = nodeKeys.shift()) !== undefined) {
//       const host = nodeKey.host;
//       const publicKey = nodeKey.publicKey;
//       const port = nodeKey.port;
//       const chainCat = new ChainCat(host, port, timeout);
//       const chainInfo = await chainCat.getChainInfo();
//       if (chainInfo) {
//         const mapKey = [host, publicKey];
//         chainInfoMap.set(mapKey.toString(), chainInfo);
//       }
//     }
//   }

//   private async getRestGwChainInfoParallel(
//     nodeKeys: NodeKey[],
//     isHttps: boolean,
//     chainInfoMap: Map<string, ChainInfo>,
//   ) {
//     const timeout = this.configService.get<number>('connection.timeout');
//     let nodeKey: NodeKey;
//     while ((nodeKey = nodeKeys.shift()) !== undefined) {
//       const host = nodeKey.host;
//       const publicKey = nodeKey.publicKey;
//       const chainCat = new ChainHttp(host, isHttps, timeout);
//       const chainInfo = await chainCat.getChainInfo();
//       if (chainInfo) {
//         const mapKey = [host, publicKey];
//         chainInfoMap.set(mapKey.toString(), chainInfo);
//       }
//     }
//   }
// }
