import { Test, TestingModule } from '@nestjs/testing';
import { IncidentMediaController } from './incident-media.controller';

describe('IncidentMediaController', () => {
  let controller: IncidentMediaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IncidentMediaController],
    }).compile();

    controller = module.get<IncidentMediaController>(IncidentMediaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
