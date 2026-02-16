import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHealth', () => {
    it('should return an object with status "ok"', () => {
      expect(controller.getHealth()).toEqual({ status: 'ok' });
    });

    it('should return status as a string', () => {
      const result = controller.getHealth();
      expect(typeof result.status).toBe('string');
    });

    it('should only expose the status field', () => {
      const result = controller.getHealth();
      expect(Object.keys(result)).toEqual(['status']);
    });
  });
});
