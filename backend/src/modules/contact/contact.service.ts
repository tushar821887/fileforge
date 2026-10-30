import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateContactDto } from './contact.dto.js';

export interface ContactMessageRecord extends CreateContactDto {
  id: string;
  createdAt: string;
}

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);
  private readonly messages: ContactMessageRecord[] = [];

  readonly officialContactDetails = {
    name: 'Tushar Sharma',
    address: '127, Bhatwara, Bagh Wali Gali, Meerut - 250002, Uttar Pradesh, India',
    phone: '+91 8218870579',
    email: 'tusharmanusharma@gmail.com',
    hours: 'Monday – Saturday: 9:00 AM – 7:00 PM IST',
    supportResponseTime: 'Within 24 hours',
  };

  getContactInfo() {
    return this.officialContactDetails;
  }

  async saveMessage(dto: CreateContactDto): Promise<{ success: boolean; messageId: string; responseTime: string }> {
    const record: ContactMessageRecord = {
      id: uuidv4(),
      name: dto.name.trim(),
      email: dto.email?.trim() || 'Not provided',
      phone: dto.phone?.trim() || 'Not provided',
      message: dto.message.trim(),
      createdAt: new Date().toISOString(),
    };

    this.messages.push(record);
    this.logger.log(`New contact message received from ${record.name} (${record.email}): ${record.message.slice(0, 50)}...`);

    return {
      success: true,
      messageId: record.id,
      responseTime: 'We will respond within 24 hours.',
    };
  }

  getAllMessages(): ContactMessageRecord[] {
    return this.messages;
  }
}
