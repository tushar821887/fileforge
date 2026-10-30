import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module.js';
import { TranslationEngine } from './translation.engine.js';
import { TranslationService } from './translation.service.js';
import { TranslationController } from './translation.controller.js';

@Module({
  imports: [StorageModule],
  controllers: [TranslationController],
  providers: [TranslationEngine, TranslationService],
  exports: [TranslationEngine, TranslationService],
})
export class TranslationModule {}
