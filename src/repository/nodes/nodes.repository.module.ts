import { NodesRepository } from '@/repository/nodes/nodes.repository';
import { Node, nodeSchema } from '@/schema/node.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Node.name, schema: nodeSchema }]),
  ],
  controllers: [],
  providers: [NodesRepository],
  exports: [NodesRepository],
})
export class NodesRepositoryModule {}
