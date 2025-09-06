import { Test, TestingModule } from '@nestjs/testing';
import { IncidentMediaService } from './incident-media.service';

describe('IncidentMediaService', () => {
  let service: IncidentMediaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IncidentMediaService],
    }).compile();

    service = module.get<IncidentMediaService>(IncidentMediaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
