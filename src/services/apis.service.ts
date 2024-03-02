import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ApisService {
  /**
   * ロガー
   */
  private readonly logger = new Logger(ApisService.name);
}
