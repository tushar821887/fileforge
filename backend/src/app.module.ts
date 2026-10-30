import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import configuration from './config/configuration.js';
import { StorageModule } from './modules/storage/storage.module.js';
import { ValidatorModule } from './modules/validator/validator.module.js';
import { ConversionModule } from './modules/conversion/conversion.module.js';
import { ToolsModule } from './modules/tools/tools.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { ContactModule } from './modules/contact/contact.module.js';
import { TranslationModule } from './modules/translation/translation.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 120,
      },
    ]),
    StorageModule,
    ValidatorModule,
    ConversionModule,
    ToolsModule,
    HealthModule,
    ContactModule,
    TranslationModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
