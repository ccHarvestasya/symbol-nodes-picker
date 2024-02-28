import { ChainRepository } from '@/repository/chain/chain.repository';
import { Chain, ChainSchema } from '@/schema/chain.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Chain.name, schema: ChainSchema }]),
  ],
  controllers: [],
  providers: [ChainRepository],
  exports: [ChainRepository],
})
export class PeersRepositoryModule {}
