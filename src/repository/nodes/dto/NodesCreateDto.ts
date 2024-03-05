import { BaseNodesDto } from '@/repository/nodes/dto/BaseNodesDto';

export class NodesCreateDto extends BaseNodesDto {
  /** ホスト */
  host: string;

  /** 公開鍵 */
  publicKey: string;
}
