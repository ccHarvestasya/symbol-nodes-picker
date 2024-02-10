import { SettingKeyDto } from '@/repository/settings/dto/settingKeyDto';
import { SettingUpdateDto } from '@/repository/settings/dto/settingUpdateDto';
import { SettingsRepository } from '@/repository/settings/settings.repository';
import { SettingDocument } from '@/schema/setting.schema';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';

const mockSetting = {
  key: 'test-key',
  value: 'test-value',
};

describe('SettingsRepository', () => {
  let service: SettingsRepository;
  let model: Model<SettingDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsRepository,
        {
          provide: getModelToken('Setting'),
          useValue: {
            new: jest.fn().mockResolvedValue(mockSetting),
            constructor: jest.fn().mockResolvedValue(mockSetting),
            find: jest.fn(),
            findOne: jest.fn(),
            updateOne: jest.fn(),
            create: jest.fn(),
            exec: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SettingsRepository>(SettingsRepository);
    model = module.get<Model<SettingDocument>>(getModelToken('Setting'));
  });

  it('定義の確認', () => {
    expect(service).toBeDefined();
  });

  it('登録', async () => {
    /** モック設定 */
    jest.spyOn(model, 'create').mockImplementationOnce(() => Promise.resolve(mockSetting as any));
    /** テスト実行 */
    const newDocument = await service.create(mockSetting);
    /** 検証 */
    expect(newDocument).toEqual(mockSetting);
  });

  it('単一更新', async () => {
    /** モック設定 */
    jest.spyOn(model, 'updateOne').mockReturnValue({
      exec: jest.fn().mockResolvedValueOnce(mockSetting),
    } as any);
    /** テスト実行 */
    const keyDto = new SettingKeyDto('test-key');
    const dto = new SettingUpdateDto();
    dto.value = 'test-value';
    const setting = await service.updateOne(keyDto, dto);
    /** 検証 */
    expect(setting).toEqual(mockSetting);
  });

  it('単一検索', async () => {
    /** モック設定 */
    jest.spyOn(model, 'findOne').mockReturnValue({
      exec: jest.fn().mockResolvedValueOnce(mockSetting),
    } as any);
    /** テスト実行 */
    const setting = await service.findOne(new SettingKeyDto('test-key'));
    /** 検証 */
    expect(setting).toEqual(mockSetting);
  });
});
