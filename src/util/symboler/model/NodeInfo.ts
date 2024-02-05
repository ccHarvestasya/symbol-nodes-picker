import { NodePeer } from '@/util/symboler/model/NodePeer';

export class NodeInfo extends NodePeer {
  /**
   * Peer 死活
   */
  isAvailable: boolean;

  /**
   * HTTPS 有無
   */
  isHttpsEnabled: boolean;

  /**
   * ノード公開鍵
   */
  nodePublicKey: string;

  /**
   * 証明書有効期限
   */
  certificateExpirationDate?: Date;
}
