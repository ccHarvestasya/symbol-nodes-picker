import configuration from '@/config/configuration';
import { PeersRepositoryModule } from '@/repository/peers/peers.repository.module';
import { SettingsRepositoryModule } from '@/repository/settings/settings.repository.module';
import { PeersService } from '@/services/peers.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { PeersController } from './peers.controller';

describe('PeersController', () => {
  let controller: PeersController;
  let service: PeersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        SettingsRepositoryModule,
        PeersRepositoryModule,
        MongooseModule.forRootAsync({
          imports: [
            ConfigModule.forRoot({
              isGlobal: true,
              load: [configuration],
            }),
          ],
          inject: [ConfigService],
          useFactory: async (config: ConfigService) => ({
            retryAttempts: 3,
            uri: config.get<string>('db.mongo.uri'),
          }),
        }),
      ],
      controllers: [PeersController],
      providers: [PeersService],
    }).compile();

    controller = module.get<PeersController>(PeersController);
    service = module.get<PeersService>(PeersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('registerNewPeer', async () => {
    /** モック */
    const mockPeerDocCheckedOldest = [
      {
        host: '4t.dusanjp.com',
        publicKey: '4540B7010550CAA12F78DD3466A2645212F705F39E25A2333E9CB12DFF1A91A0',
        nodePublicKey: '4F9575A9630EA3546476043FEA8B2A8FEA81E77BAFD9D997B86BDF8908FB2170',
        port: 7900,
        friendlyName: 'peervoting@4',
        version: 16777990,
        networkGenerationHashSeed:
          '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
        roles: 5,
        networkIdentifier: 152,
        isHttpsEnabled: false,
        lastCheck: {
          $date: new Date('2024-01-29T04:52:19.527Z'),
        },
        lastSyncCheck: {
          $date: '2024-01-29T04:52:27.012Z',
        },
        createdAt: {
          $date: '2024-01-28T12:26:34.797Z',
        },
        updatedAt: {
          $date: '2024-01-29T04:52:27.012Z',
        },
        isAvailable: true,
        certificateExpirationDate: {
          $date: '2025-01-31T23:22:32.000Z',
        },
      },
      {
        host: '201-sai-dual.symboltest.net',
        publicKey: '645E2E56B5F8680B69BC0255F4930169DBC052BB25F8121055DE2072D37E2C30',
        nodePublicKey: '74A443A184CD2BB6164A831C8F245CA87A9B64BDA696A2A17D524F2FF1A2B074',
        port: 7900,
        friendlyName: '201-sai-dual',
        version: 16777990,
        networkGenerationHashSeed:
          '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
        roles: 3,
        networkIdentifier: 152,
        isHttpsEnabled: true,
        lastCheck: {
          $date: '2024-01-29T04:52:19.512Z',
        },
        lastSyncCheck: {
          $date: '2024-01-29T04:52:27.031Z',
        },
        createdAt: {
          $date: '2024-01-28T12:26:34.818Z',
        },
        updatedAt: {
          $date: '2024-01-29T04:52:27.031Z',
        },
        isAvailable: true,
        certificateExpirationDate: {
          $date: '2024-11-20T21:15:23.000Z',
        },
      },
      {
        host: 'mikun-testnet.tk',
        publicKey: 'CEAAE51C6D294AEFC1A3C84FEFE9D60B0CE815DBC66567211A41B7DE2DC164B8',
        nodePublicKey: '45AF1B5B8F83EA2F1E0701C50203BAB7BBBDE8F06E5547354D2DD1EF586B0507',
        port: 7900,
        friendlyName: 'mikun_test1',
        version: 16777990,
        networkGenerationHashSeed:
          '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
        roles: 7,
        networkIdentifier: 152,
        isHttpsEnabled: true,
        isAvailable: true,
        lastCheck: {
          $date: '2024-01-29T04:52:19.535Z',
        },
        lastSyncCheck: {
          $date: '2024-01-29T04:52:27.035Z',
        },
        createdAt: {
          $date: '2024-01-28T12:26:05.526Z',
        },
        updatedAt: {
          $date: '2024-01-29T04:52:27.035Z',
        },
        certificateExpirationDate: {
          $date: '2024-09-20T16:09:24.000Z',
        },
      },
      {
        host: '001-sai-dual.symboltest.net',
        publicKey: '07D38BAE29464C1F54CC1C8202DD83B65AF21C8E5FF1FB01ACEEE2243C55EF2A',
        nodePublicKey: 'AAC168F82C89AAA5EC72B3E93C8F2F1E84D2C6D38CA98A7D93F5F8ACD9AE3490',
        port: 7900,
        friendlyName: '001-sai-dual',
        version: 16777990,
        networkGenerationHashSeed:
          '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
        roles: 7,
        networkIdentifier: 152,
        isHttpsEnabled: true,
        isAvailable: true,
        lastCheck: {
          $date: '2024-01-29T04:52:19.537Z',
        },
        lastSyncCheck: {
          $date: '2024-01-29T04:52:26.957Z',
        },
        createdAt: {
          $date: '2024-01-28T12:26:06.117Z',
        },
        updatedAt: {
          $date: '2024-01-29T04:52:26.957Z',
        },
        certificateExpirationDate: {
          $date: '2024-11-20T22:07:13.000Z',
        },
      },
    ];
    jest
      .spyOn(service, 'getPeerDocCheckedOldest')
      .mockResolvedValue(Promise.resolve(mockPeerDocCheckedOldest) as any);
    const spyRegisterNewPeer = jest.spyOn(service, 'registerNewPeer').mockReturnValue(null);

    /** 実行 */
    await controller.registerNewNodePeer();

    /** 検証 */
    expect(spyRegisterNewPeer.mock.calls[0][1]).toEqual([
      {
        host: '4t.dusanjp.com',
        publicKey: '4540B7010550CAA12F78DD3466A2645212F705F39E25A2333E9CB12DFF1A91A0',
        port: 7900,
      },
      {
        host: '201-sai-dual.symboltest.net',
        publicKey: '645E2E56B5F8680B69BC0255F4930169DBC052BB25F8121055DE2072D37E2C30',
        port: 7900,
      },
      {
        host: 'mikun-testnet.tk',
        publicKey: 'CEAAE51C6D294AEFC1A3C84FEFE9D60B0CE815DBC66567211A41B7DE2DC164B8',
        port: 7900,
      },
      {
        host: '001-sai-dual.symboltest.net',
        publicKey: '07D38BAE29464C1F54CC1C8202DD83B65AF21C8E5FF1FB01ACEEE2243C55EF2A',
        port: 7900,
      },
    ]);
  });
});
