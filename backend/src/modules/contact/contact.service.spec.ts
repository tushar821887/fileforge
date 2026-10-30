import { describe, it, expect, beforeEach } from 'vitest';
import { ContactService } from './contact.service.js';

describe('ContactService', () => {
  let service: ContactService;

  beforeEach(() => {
    service = new ContactService();
  });

  it('should return official contact details matching FoodyBhai', () => {
    const info = service.getContactInfo();
    expect(info.email).toBe('tusharmanusharma@gmail.com');
    expect(info.phone).toBe('+91 8218870579');
    expect(info.address).toContain('127, Bhatwara');
    expect(info.address).toContain('Meerut - 250002');
  });

  it('should save and acknowledge incoming contact inquiries', async () => {
    const result = await service.saveMessage({
      name: 'Client Tester',
      email: 'client@example.com',
      message: 'Interested in file conversion API integrations.',
    });

    expect(result.success).toBe(true);
    expect(result.messageId).toBeDefined();

    const messages = service.getAllMessages();
    expect(messages.length).toBe(1);
    expect(messages[0].name).toBe('Client Tester');
  });
});
