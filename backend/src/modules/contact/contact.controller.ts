import { Controller, Post, Get, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ContactService } from './contact.service.js';
import { CreateContactDto } from './contact.dto.js';

@ApiTags('Contact')
@Controller('api/v1/contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Get('info')
  @ApiOperation({ summary: 'Get official contact details and support hours' })
  getContactInfo() {
    return this.contactService.getContactInfo();
  }

  @Post()
  @ApiOperation({ summary: 'Submit a message or inquiry to the FormatFlow team' })
  @ApiResponse({ status: 201, description: 'Message received successfully' })
  async submitMessage(@Body() dto: CreateContactDto) {
    return await this.contactService.saveMessage(dto);
  }
}
