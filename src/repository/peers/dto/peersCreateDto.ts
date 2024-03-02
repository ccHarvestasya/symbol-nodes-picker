import { BasePeersDto } from '@/repository/peers/dto/BasePeersDto';

export class PeersCreateDto extends BasePeersDto {
  /**
   * ホスト
   */
  host: string;

  /**
   * 公開鍵
   */
  publicKey: string;
}
