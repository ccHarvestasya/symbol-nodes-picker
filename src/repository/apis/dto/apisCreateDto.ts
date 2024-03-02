import { BaseApisDto } from '@/repository/apis/dto/BaseApisDto';

export class ApisCreateDto extends BaseApisDto {
  /**
   * ホスト
   */
  host: string;

  /**
   * 公開鍵
   */
  publicKey: string;
}
