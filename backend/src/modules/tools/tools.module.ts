import { Module } from '@nestjs/common';
import { ToolsController } from './tools.controller.js';

@Module({
  controllers: [ToolsController],
})
export class ToolsModule {}
