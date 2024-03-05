import { AppService } from '@/app.service';
import { Controller, Logger } from '@nestjs/common';

@Controller()
export class AppController {
  /**
   * ロガー
   */
  private readonly logger = new Logger(AppController.name);

  /**
   * コンストラクタ
   * @param appService Appサービス
   */
  constructor(private readonly appService: AppService) {}

  /**
   * ホストモジュールの依存関係が解決されると呼び出されます。
   */
  onModuleInit(): void {
    const methodName = 'onModuleInit';
    this.logger.verbose('start - ' + methodName);
    this.logger.verbose(' end  - ' + methodName);
  }

  /**
   * すべてのモジュールが初期化された後、接続をリッスンする前に呼び出されます
   */
  async onApplicationBootstrap(): Promise<void> {
    const methodName = 'onApplicationBootstrap';
    this.logger.verbose('start - ' + methodName);

    // Peer コレクション初期セット
    await this.appService.initNodesCollection();

    this.logger.verbose(' end  - ' + methodName);
  }

  /**
   * 終了信号 (例: SIGTERM) を受信した後に呼び出されます。
   */
  onModuleDestroy(): void {
    const methodName = 'onModuleDestroy';
    this.logger.verbose('start - ' + methodName);
    this.logger.verbose(' end  - ' + methodName);
  }

  /**
   * すべてのonModuleDestroy()ハンドラーが完了した (Promise が解決または拒否された) 後に呼び出されます。
   * 完了すると (Promise が解決または拒否されると)、既存の接続はすべて閉じられます (app.close()呼び出されます)。
   */
  beforeApplicationShutdown(): void {
    const methodName = 'beforeApplicationShutdown';
    this.logger.verbose('start - ' + methodName);
    this.logger.verbose(' end  - ' + methodName);
  }

  /**
   * 接続が閉じた (app.close()解決された) 後に呼び出されます。
   */
  onApplicationShutdown(): void {
    const methodName = 'onApplicationShutdown';
    this.logger.verbose('start - ' + methodName);
    this.logger.verbose(' end  - ' + methodName);
  }
}
