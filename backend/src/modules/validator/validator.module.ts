import { Module, Global } from '@nestjs/common';
import { FileValidatorService } from './file-validator.service.js';

@Global()
@Module({
  providers: [FileValidatorService],
  exports: [FileValidatorService],
})
export class ValidatorModule {}
