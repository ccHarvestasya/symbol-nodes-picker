import { ChainInfo } from '@/util/symboler/model/ChainInfo';
import { NodeInfo } from '@/util/symboler/model/NodeInfo';
import { NodePeer } from '@/util/symboler/model/NodePeer';
import { NodeUnlockedAccount } from '@/util/symboler/model/NodeUnlockedAccount';
import { Logger } from '@nestjs/common';
import { X509Certificate } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as tls from 'tls';

/**
 * パケットタイプ
 */
enum PacketType {
  CHAIN_STATISTICS = 5,
  FINALIZATION_STATISTICS = 0x132,
  NODE_DISCOVERY_PULL_PING = 0x111,
  NODE_DISCOVERY_PULL_PEERS = 0x113,
  UNLOCKED_ACCOUNTS = 0x304,
}

/**
 * ソケットデータ
 */
type SocketData = {
  x509: X509Certificate;
  data: Uint8Array;
  message: string;
};

/**
 * ソケット通信で値を取得する
 */
export class SslSocket {
  /**
   * ロガー
   */
  private readonly logger = new Logger(SslSocket.name);

  /**
   * コンストラクタ
   * @param timeout タイムアウト
   */
  constructor(private readonly timeout: number = 3000) {}

  /**
   * ChainInfo取得
   * @param host ホスト名
   * @param port ポート
   * @returns 成功: ChainInfo, 失敗: undefined
   */
  async getChainInfo(host: string, port: number): Promise<ChainInfo> {
    let chainInfo: ChainInfo = undefined;

    try {
      this.logger.log(`socket://${host}:${port}/chain/info`);
      const promises: Promise<SocketData>[] = [];
      promises.push(this.getSocketData(host, port, PacketType.CHAIN_STATISTICS));
      promises.push(this.getSocketData(host, port, PacketType.FINALIZATION_STATISTICS));
      const socketDatas = await Promise.all(promises);
      if (socketDatas[0].data === undefined) return undefined;
      if (socketDatas[1].data === undefined) return undefined;
      try {
        // 編集
        const chainBufferView = Buffer.from(socketDatas[0].data.buffer);
        const finalBufferView = Buffer.from(socketDatas[1].data.buffer);
        chainInfo = new ChainInfo();
        chainInfo.height = BigInt(chainBufferView.readBigUint64LE(0));
        chainInfo.scoreHigh = BigInt(chainBufferView.readBigUint64LE(16));
        chainInfo.scoreLow = BigInt(chainBufferView.readBigUint64LE(24));
        chainInfo.latestFinalizedBlock = {
          finalizationEpoch: finalBufferView.readUInt32LE(0),
          finalizationPoint: finalBufferView.readUInt32LE(4),
          height: finalBufferView.readBigUInt64LE(8),
          hash: finalBufferView.toString('hex', 16, 48).toUpperCase(),
        };
      } catch (e) {
        chainInfo = undefined;
        this.logger.error(`socket://${host}:${port}`);
        this.logger.error(e);
      }
    } catch (e) {
      this.logger.error(`socket://${host}:${port}:${e.message}`);
    }

    return chainInfo;
  }

  /**
   * NodeInfo取得
   * @param host ホスト名
   * @param port ポート
   * @returns 成功: NodeInfo, 失敗: undefined
   */
  async getNodeInfo(host: string, port: number): Promise<NodeInfo> {
    let nodeInfo: NodeInfo = undefined;

    try {
      this.logger.log(`socket://${host}:${port}/node/info`);
      const socketData = await this.getSocketData(host, port, PacketType.NODE_DISCOVERY_PULL_PING);
      if (socketData.data === undefined) return undefined;
      try {
        // 編集
        nodeInfo = new NodeInfo();
        const nodeBufferView = Buffer.from(socketData.data.buffer);
        nodeInfo.version = nodeBufferView.readUInt32LE(4);
        nodeInfo.publicKey = nodeBufferView.toString('hex', 8, 40).toUpperCase();
        nodeInfo.networkGenerationHashSeed = nodeBufferView.toString('hex', 40, 72).toUpperCase();
        nodeInfo.roles = nodeBufferView.readUInt32LE(72);
        nodeInfo.port = nodeBufferView.readUInt16LE(76);
        nodeInfo.networkIdentifier = nodeBufferView.readUInt8(78);
        const hostLength = nodeBufferView.readUInt8(79);
        const friendlyNameLength = nodeBufferView.readUInt8(80);
        nodeInfo.host = nodeBufferView.toString('utf8', 81, 81 + hostLength);
        nodeInfo.friendlyName = nodeBufferView.toString(
          'utf8',
          81 + hostLength,
          81 + hostLength + friendlyNameLength,
        );
        nodeInfo.isHttpsEnabled = false;
        nodeInfo.isAvailable = true;
        // 証明書有効期限、ノード公開鍵取得
        const validTo = socketData.x509.validTo;
        const validToDate = new Date(validTo);
        const nodePublicKey = socketData.x509.publicKey
          .export({ format: 'der', type: 'spki' })
          .toString('hex', 12, 44)
          .toUpperCase();
        nodeInfo.certificateExpirationDate = validToDate;
        nodeInfo.nodePublicKey = nodePublicKey;
      } catch (e) {
        nodeInfo = undefined;
        this.logger.error(e);
      }
    } catch (e) {
      this.logger.error(`socket://${host}:${port}:${e.message}`);
    }

    return nodeInfo;
  }

  /**
   * NodePeers取得
   * @param host ホスト名
   * @param port ポート
   * @returns 成功: NodePeer[], 失敗: undefined
   */
  async getNodePeers(host: string, port: number): Promise<NodePeer[]> {
    let nodePeers: NodePeer[] = [];
    let nodePeer: NodePeer = undefined;

    try {
      this.logger.log(`socket://${host}:${port}/node/peers`);
      const socketData = await this.getSocketData(host, port, PacketType.NODE_DISCOVERY_PULL_PEERS);
      if (socketData.data === undefined) return undefined;
      try {
        let index = 0;
        const nodeBufferView = Buffer.from(socketData.data.buffer);
        // 編集
        while (index < nodeBufferView.length) {
          nodePeer = new NodePeer();
          index += 4;
          nodePeer.version = nodeBufferView.readUInt32LE(index);
          index += 4;
          nodePeer.publicKey = nodeBufferView.toString('hex', index, index + 32).toUpperCase();
          index += 32;
          nodePeer.networkGenerationHashSeed = nodeBufferView
            .toString('hex', index, index + 32)
            .toUpperCase();
          index += 32;
          nodePeer.roles = nodeBufferView.readUInt32LE(index);
          index += 4;
          nodePeer.port = nodeBufferView.readUInt16LE(index);
          index += 2;
          nodePeer.networkIdentifier = nodeBufferView.readUInt8(index);
          index += 1;
          const hostLength = nodeBufferView.readUInt8(index);
          index += 1;
          const friendlyNameLength = nodeBufferView.readUInt8(index);
          index += 1;
          nodePeer.host = nodeBufferView.toString('utf8', index, index + hostLength);
          nodePeer.friendlyName = nodeBufferView.toString(
            'utf8',
            index + hostLength,
            index + hostLength + friendlyNameLength,
          );
          index += hostLength + friendlyNameLength;
          nodePeers.push(nodePeer);
        }
      } catch (e) {
        nodePeers = undefined;
        this.logger.error(`socket://${host}:${port}`);
        this.logger.error(e);
      }
    } catch (e) {
      nodePeers = undefined;
      this.logger.error(`socket://${host}:${port}:${e.message}`);
    }

    return nodePeers;
  }

  /**
   * NodeUnlockedAccount取得
   * @param host ホスト名
   * @param port ポート
   * @returns 成功: NodeUnlockedAccount, 失敗: undefined
   */
  async getNodeUnlockedAccount(host: string, port: number): Promise<NodeUnlockedAccount> {
    let nodeUnlockedAccount: NodeUnlockedAccount = undefined;

    try {
      this.logger.log(`socket://${host}:${port}/node/unlockedAccount`);
      const socketData = await this.getSocketData(host, port, PacketType.UNLOCKED_ACCOUNTS);
      if (socketData.data === undefined) return undefined;
      try {
        let index = 0;
        const nodeBufferView = Buffer.from(socketData.data.buffer);
        // 編集
        nodeUnlockedAccount = new NodeUnlockedAccount();
        while (index < nodeBufferView.length) {
          nodeUnlockedAccount.unlockedAccount.push(
            nodeBufferView.toString('hex', index, index + 32).toUpperCase(),
          );
          index += 32;
        }
      } catch (e) {
        nodeUnlockedAccount = undefined;
        this.logger.error(`socket://${host}:${port}`);
        this.logger.error(e);
      }
    } catch (e) {
      nodeUnlockedAccount = undefined;
      this.logger.error(`socket://${host}:${port}:${e.message}`);
    }

    return nodeUnlockedAccount;
  }

  /**
   * ソケット通信データ取得
   * @param host ホスト名
   * @param port ポート
   * @param packetType パケットタイプ
   * @returns ソケット通信データ
   */
  private getSocketData(host: string, port: number, packetType: number): Promise<SocketData> {
    return new Promise((resolve, reject) => {
      let responsedSize = 8; // ヘッダ分のサイズを前もって付与
      const socketData: SocketData = {
        x509: undefined,
        data: undefined,
        message: undefined,
      };

      // 証明書の文字コードはSJIS
      const connectionOptions: tls.ConnectionOptions = {
        host: host,
        port: port,
        timeout: this.timeout,
        cert: readFileSync(join(__dirname, './cert/node.full.crt.pem')),
        key: readFileSync(join(__dirname, './cert/node.key.pem')),
        rejectUnauthorized: false,
      };

      const socket = tls.connect(connectionOptions, () => {
        // Symbolヘッダー作成
        const symbolHeaderBuffer = new ArrayBuffer(8);
        const symbolHeaderView = new DataView(symbolHeaderBuffer);
        symbolHeaderView.setUint32(0, 8, true);
        symbolHeaderView.setUint32(4, packetType, true);
        // ヘッダ送信
        socket.write(new Uint8Array(symbolHeaderBuffer));
      });

      // 接続時
      socket.on('connect', () => {
        // this.logger.verbose('connect');
      });

      // SSL接続時
      socket.on('secureConnect', () => {
        // this.logger.verbose('secureConnect');
        const peerX509 = socket.getPeerX509Certificate();
        if (peerX509 === undefined) return;
        socketData.x509 = peerX509;
      });

      // データ受信
      socket.once('data', (data) => {
        // レスポンスデータ（ヘッダ）取得
        const nodeBufferView = Buffer.from(new Uint8Array(data).buffer);
        // レスポンスサイズチェック
        const responseDataSize = nodeBufferView.readUInt32LE(0);
        if (responseDataSize === 0) {
          this.logger.warn(`受信したデータが空です: ${host}`);
          socket.end();
          socketData.message = 'empty data';
          reject(socketData);
        }
        // レスポンスパケットタイプチェック
        const responsePacketType = nodeBufferView.readUInt32LE(4);
        if (responsePacketType !== packetType) {
          this.logger.warn(
            `パケットタイプ${packetType}を期待しましたが、${responsePacketType}でした。`,
          );
          socket.end();
          socketData.message = 'mismatch packet type';
          reject(socketData);
        }

        // ヘッダが問題なければデータ部取得
        socket.on('data', (data) => {
          const responseData = new Uint8Array(data);
          responsedSize += responseData.length;
          if (socketData.data === undefined) {
            // 初回
            socketData.data = responseData;
          } else {
            // 初回移行は連結
            const merged = new Uint8Array(socketData.data.length + responseData.length);
            merged.set(socketData.data);
            merged.set(responseData, socketData.data.length);
            socketData.data = merged;
          }
          if (responseDataSize <= responsedSize) {
            // 受信が終わったら終了
            socket.end();
          }
        });
      });

      // タイムアウト時
      socket.on('timeout', () => {
        // this.logger.verbose('timeout');
        socketData.message = 'timeout';
        socket.end();
        reject(socketData);
      });

      // 終了
      socket.on('end', () => {
        // this.logger.verbose('end');
      });

      // ソケットを閉じた
      socket.on('close', () => {
        // this.logger.verbose('close');
        resolve(socketData);
      });

      // エラー時
      socket.on('error', (error) => {
        this.logger.error(error);
        socket.destroy();
        socketData.message = 'unknown error';
        reject(socketData);
      });
    });
  }
}
