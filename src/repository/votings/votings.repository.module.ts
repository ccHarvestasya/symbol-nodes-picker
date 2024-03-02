import { VotingsRepository } from '@/repository/votings/votings.repository';
import { Voting, VotingSchema } from '@/schema/voting.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Voting.name, schema: VotingSchema }]),
  ],
  controllers: [],
  providers: [VotingsRepository],
  exports: [VotingsRepository],
})
export class VotingsRepositoryModule {}
