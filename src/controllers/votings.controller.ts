import { Controller, Logger } from '@nestjs/common';

@Controller('votings')
export class VotingsController {
  /**
   * ロガー
   */
  private readonly logger = new Logger(VotingsController.name);
}
