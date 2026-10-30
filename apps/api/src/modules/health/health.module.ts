import { Module } from '@nestjs/common';
import { HealthController } from './health.controller.js';
import { ConversionModule } from '../conversion/conversion.module.js';

@Module({
  imports: [ConversionModule],
  controllers: [HealthController],
})
export class HealthModule {}
