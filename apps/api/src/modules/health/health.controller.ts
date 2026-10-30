import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { StorageService } from '../storage/storage.service.js';
import { DocumentEngine } from '../conversion/engines/document.engine.js';
import type { SystemHealthResponse } from '@formatflow/shared';

@ApiTags('Health')
@Controller('api/v1')
export class HealthController {
  private readonly startTime = Date.now();

  constructor(
    private readonly storageService: StorageService,
    private readonly documentEngine: DocumentEngine
  ) {}

  @Get('health')
  @ApiOperation({ summary: 'System health check and conversion engine status' })
  async getHealth(): Promise<SystemHealthResponse> {
    const storageStats = await this.storageService.getStorageStats();
    const uptimeSeconds = Math.round((Date.now() - this.startTime) / 1000);

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptimeSeconds,
      storage: {
        tempDirectory: storageStats.storagePath,
        retentionMinutes: storageStats.retentionMinutes,
        activeJobsCount: storageStats.activeJobsCount,
      },
      engines: {
        sharp: true,
        pdfLib: true,
        xlsx: true,
        pdfJs: true,
        libreOffice: this.documentEngine.isLibreOfficeAvailable(),
      },
    };
  }
}
