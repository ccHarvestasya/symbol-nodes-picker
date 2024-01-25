import { Logger } from '@nestjs/common';

export enum RequestType {
  ChainInfo,
  NodeInfo,
  NodePeers,
  NodeUnlockedaccount,
}

// enum PacketType {
//   CHAIN_STATISTICS = 5,
//   FINALIZATION_STATISTICS = 0x132,
//   NODE_DISCOVERY_PULL_PING = 0x111,
//   NODE_DISCOVERY_PULL_PEERS = 0x113,
//   UNLOCKED_ACCOUNTS = 0x304,
// }

export class SslSocket {
  /**
   * ロガー
   */
  private readonly logger = new Logger(SslSocket.name);

  // getSslSocket(host: string, port: number, requestType: RequestType) {}

  // private execSslScocketCommunicatioon() {
  //   const socket = tls.connect(
  //     {
  //       host: host,
  //       port: port,
  //       cert: readFileSync(join(__dirname, '../cert/node.full.crt.pem', 'utf8')),
  //       key: readFileSync(join(__dirname, '../cert/node.key.pem', 'utf8')),
  //       rejectUnauthorized: false,
  //     },
  //     () => {
  //       // Symbolヘッダー作成
  //       const symbolHeaderBuffer = new ArrayBuffer(8);
  //       const symbolHeaderView = new DataView(symbolHeaderBuffer);
  //       symbolHeaderView.setUint32(0, 8, true);
  //       symbolHeaderView.setUint32(4, NODE_DISCOVERY_PULL_PING, true);
  //       // ヘッダ送信
  //       socket.write(new Uint8Array(symbolHeaderBuffer));
  //     },
  //   );

  //   socket.on('connect', () => {
  //     console.log('client connected');
  //   });

  //   socket.on('secureConnect', () => {
  //     const peerX509 = socket.getPeerX509Certificate();
  //     if (peerX509 === undefined) return;

  //     const validTo = peerX509.validTo;
  //     const validToDate = new Date(validTo);
  //     console.log('notAfter                  : ' + validToDate);
  //     console.log(
  //       'nodePublicKey             : ' +
  //         peerX509.publicKey
  //           .export({ format: 'der', type: 'spki' })
  //           .toString('hex', 12, 44)
  //           .toUpperCase(),
  //     );
  //   });

  //   socket.once('data', (data) => {
  //     // レスポンスデータ（ヘッダ）取得
  //     const nodeBufferView = Buffer.from(new Uint8Array(data).buffer);
  //     // レスポンスサイズチェック
  //     const resSize = nodeBufferView.readUInt32LE(0);
  //     if (resSize === 0) {
  //       console.error(`${HOST}から受信したデータが空です。`);
  //       socket.end();
  //       return;
  //     }
  //     // レスポンスパケットタイプチェック
  //     const packetType = nodeBufferView.readUInt32LE(4);
  //     if (packetType !== NODE_DISCOVERY_PULL_PING) {
  //       console.error(
  //         `パケットタイプ${NODE_DISCOVERY_PULL_PING}を期待しましたが、${packetType}でした。`,
  //       );
  //       socket.end();
  //       return;
  //     }

  //     // ヘッダが問題なければノード情報解析
  //     socket.on('data', (data) => {
  //       const nodeBufferView = Buffer.from(new Uint8Array(data).buffer);
  //       const resSize = nodeBufferView.readUInt32LE(0);
  //       const version = nodeBufferView.readUInt32LE(4);
  //       const publicKey = nodeBufferView.toString('hex', 8, 40).toUpperCase();
  //       const networkGenerationHashSeed = nodeBufferView.toString('hex', 40, 72).toUpperCase();
  //       const roles = nodeBufferView.readUInt32LE(72);
  //       const port = nodeBufferView.readUInt16LE(76);
  //       const networkIdentifier = nodeBufferView.readUInt8(78);
  //       const hostLength = nodeBufferView.readUInt8(79);
  //       const friendlyNameLength = nodeBufferView.readUInt8(80);
  //       const host = nodeBufferView.toString('utf8', 81, 81 + hostLength);
  //       const friendlyName = nodeBufferView.toString(
  //         'utf8',
  //         81 + hostLength,
  //         81 + hostLength + friendlyNameLength,
  //       );
  //       console.log(`version                   : ${version}`);
  //       console.log(`publicKey                 : ${publicKey}`);
  //       console.log(`networkGenerationHashSeed : ${networkGenerationHashSeed}`);
  //       console.log(`roles                     : ${roles}`);
  //       console.log(`port                      : ${port}`);
  //       console.log(`networkIdentifier         : ${networkIdentifier}`);
  //       console.log(`host                      : ${host}`);
  //       console.log(`friendlyName              : ${friendlyName}`);

  //       socket.end();
  //     });
  //   });

  //   socket.on('end', function () {
  //     console.log('Connection ended');
  //   });

  //   socket.on('close', function () {
  //     console.log('Connection closed');
  //   });

  //   socket.on('error', function (error) {
  //     console.error(error);
  //     socket.destroy();
  //   });
  // }
}
