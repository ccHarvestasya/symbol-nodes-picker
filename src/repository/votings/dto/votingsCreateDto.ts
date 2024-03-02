import { BaseVotingsDto } from '@/repository/votings/dto/BaseVotingsDto';

export class VotingsCreateDto extends BaseVotingsDto {
  /**
   * ホスト
   */
  host: string;

  /**
   * 公開鍵
   */
  publicKey: string;
}
