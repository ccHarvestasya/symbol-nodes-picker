import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';
import { PeerKeyDto } from '../repository/peers/dto/peerKeyDto';
import { PeerUpdateDto } from '../repository/peers/dto/peerUpdateDto';
import { PeersRepository } from '../repository/peers/peers.repository';
import { Peer, PeerDocument } from '../schema/peer.schema';
import { NodePeer } from './nodepeer.interface';

/**
 * Node Peer to Peers サービス
 */
@Injectable()
export class NodePeer2peersService {
  /**
   * ロガー
   */
  private readonly logger = new Logger(NodePeer2peersService.name);

  /**
   * コンストラクタ
   * @param configService
   * @param peersRepository
   */
  constructor(
    private readonly configService: ConfigService,
    private readonly peersRepository: PeersRepository,
  ) {}

  /**
   * 新しいPeerを登録
   * @returns
   */
  async registerNewPeer(): Promise<Peer[]> {
    const methodName = 'registerNewPeer';
    this.logger.verbose('start - ' + methodName);

    // Peers コレクション全検索
    // TODO あとで更新時間が古い方から数件取得するに変更
    const peers = await this.peersRepository.findAll();

    // チャンク数
    const chunk =
      peers.length < this.configService.get<number>('CHUNK')
        ? peers.length
        : this.configService.get<number>('CHUNK');

    // チャンク数分並列処理
    const promises: Promise<void>[] = [];
    for (let i = 0; i < chunk; i++) {
      promises.push(this.registerNodePeer2Peers(peers));
    }
    await Promise.all(promises);

    this.logger.verbose(' end  - ' + methodName);
    return peers;
  }

  sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

  private async registerNodePeer2Peers(peers: PeerDocument[]) {
    let peerDoc: PeerDocument = undefined;
    while ((peerDoc = peers.shift()) !== undefined) {
      // ピア情報問い合わせ
      let isSSL = true;
      let isAvailable = true;
      let url = `https://${peerDoc.host}:3001`;
      let nodePeersResponse = await this.requestNodePeers(url);
      if (nodePeersResponse === undefined) {
        // https不通のためhttpで再度問い合わせ
        isSSL = false;
        url = `http://${peerDoc.host}:3000`;
        nodePeersResponse = await this.requestNodePeers(url);
        if (nodePeersResponse === undefined) {
          // 接続不可
          isAvailable = false;
          this.logger.warn('接続不可: ' + url);
        }
      }

      // Peersコレクション更新
      const peerUpdateKeyDto = new PeerKeyDto();
      peerUpdateKeyDto.host = peerDoc.host;
      peerUpdateKeyDto.publicKey = peerDoc.publicKey;
      const peerUpdateDto = new PeerUpdateDto();
      peerUpdateDto.isHttpsEnabled = isSSL;
      peerUpdateDto.isAvailable = isAvailable;
      await this.peersRepository.updateOne(peerUpdateKeyDto, peerUpdateDto);

      try {
        // Peersコレクション登録
        for (const nodePeer of nodePeersResponse) {
          const peer = new Peer();
          peer.version = nodePeer.version;
          peer.publicKey = nodePeer.publicKey;
          peer.networkGenerationHashSeed = nodePeer.networkGenerationHashSeed;
          peer.roles = nodePeer.roles;
          peer.port = nodePeer.port;
          peer.networkIdentifier = nodePeer.networkIdentifier;
          peer.host = nodePeer.host;
          peer.friendlyName = nodePeer.friendlyName;
          // this.peersRepository.create(dto);
        }
      } catch (e) {
        this.logger.fatal(e);
        throw new Error();
      }

      // await this.sleep(2000);
    }
  }

  /**
   * ピア情報問い合わせ
   * @param url RestGatewayUrl
   * @returns ピア情報
   */
  private async requestNodePeers(url: string) {
    let peersResponse: NodePeer[] = undefined;

    try {
      // Axiosインスタンス生成
      const peersAxios = axios.create({
        baseURL: url,
        timeout: 5000,
        headers: { 'Content-Type': 'application/json' },
      });
      // /node/peers 取得
      peersResponse = await peersAxios.get('/node/peers').then((res: AxiosResponse<NodePeer[]>) => {
        return res.data;
      });
    } catch (e) {
      this.logger.log(url + ': ' + e);
    }

    return peersResponse;
  }
}
