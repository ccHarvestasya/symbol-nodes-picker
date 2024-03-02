import { BaseVotingsDto } from '@/repository/votings/dto/BaseVotingsDto';

export class VotingsFindDto extends BaseVotingsDto {
  /**
   * ホスト
   */
  host: string;

  /**
   * 公開鍵
   */
  publicKey: string;
}
