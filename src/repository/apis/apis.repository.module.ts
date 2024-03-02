import { ApisRepository } from '@/repository/apis/apis.repository';
import { Api, ApiSchema } from '@/schema/api.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forFeature([{ name: Api.name, schema: ApiSchema }])],
  controllers: [],
  providers: [ApisRepository],
  exports: [ApisRepository],
})
export class ApisRepositoryModule {}
