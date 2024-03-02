import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class VotingsService {
  /**
   * ロガー
   */
  private readonly logger = new Logger(VotingsService.name);
}
