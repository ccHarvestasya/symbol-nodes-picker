import configuration from '@/config/configuration';
import { PeersRepository } from '@/repository/peers/peers.repository';
import { Peer, PeerDocument } from '@/schema/peer.schema';
import { PeersService } from '@/services/peers.service';
import { RestGateway } from '@/util/symboler/RestGateway';
import { SslSocket } from '@/util/symboler/SslSocket';
import { NodeInfo } from '@/util/symboler/model/NodeInfo';
import { NodePeer } from '@/util/symboler/model/NodePeer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';

// const mockPeerDocCheckedOldest = [
//   {
//     host: '4t.dusanjp.com',
//     publicKey: '4540B7010550CAA12F78DD3466A2645212F705F39E25A2333E9CB12DFF1A91A0',
//     nodePublicKey: '4F9575A9630EA3546476043FEA8B2A8FEA81E77BAFD9D997B86BDF8908FB2170',
//     port: 7900,
//     friendlyName: 'peervoting@4',
//     version: 16777990,
//     networkGenerationHashSeed: '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
//     roles: 5,
//     networkIdentifier: 152,
//     isHttpsEnabled: false,
//     lastCheck: {
//       $date: '2024-01-29T04:52:19.527Z',
//     },
//     lastSyncCheck: {
//       $date: '2024-01-29T04:52:27.012Z',
//     },
//     createdAt: {
//       $date: '2024-01-28T12:26:34.797Z',
//     },
//     updatedAt: {
//       $date: '2024-01-29T04:52:27.012Z',
//     },
//     isAvailable: true,
//     certificateExpirationDate: {
//       $date: '2025-01-31T23:22:32.000Z',
//     },
//   },
//   {
//     host: '201-sai-dual.symboltest.net',
//     publicKey: '645E2E56B5F8680B69BC0255F4930169DBC052BB25F8121055DE2072D37E2C30',
//     nodePublicKey: '74A443A184CD2BB6164A831C8F245CA87A9B64BDA696A2A17D524F2FF1A2B074',
//     port: 7900,
//     friendlyName: '201-sai-dual',
//     version: 16777990,
//     networkGenerationHashSeed: '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
//     roles: 3,
//     networkIdentifier: 152,
//     isHttpsEnabled: true,
//     lastCheck: {
//       $date: '2024-01-29T04:52:19.512Z',
//     },
//     lastSyncCheck: {
//       $date: '2024-01-29T04:52:27.031Z',
//     },
//     createdAt: {
//       $date: '2024-01-28T12:26:34.818Z',
//     },
//     updatedAt: {
//       $date: '2024-01-29T04:52:27.031Z',
//     },
//     isAvailable: true,
//     certificateExpirationDate: {
//       $date: '2024-11-20T21:15:23.000Z',
//     },
//   },
//   {
//     host: 'mikun-testnet.tk',
//     publicKey: 'CEAAE51C6D294AEFC1A3C84FEFE9D60B0CE815DBC66567211A41B7DE2DC164B8',
//     nodePublicKey: '45AF1B5B8F83EA2F1E0701C50203BAB7BBBDE8F06E5547354D2DD1EF586B0507',
//     port: 7900,
//     friendlyName: 'mikun_test1',
//     version: 16777990,
//     networkGenerationHashSeed: '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
//     roles: 7,
//     networkIdentifier: 152,
//     isHttpsEnabled: true,
//     isAvailable: true,
//     lastCheck: {
//       $date: '2024-01-29T04:52:19.535Z',
//     },
//     lastSyncCheck: {
//       $date: '2024-01-29T04:52:27.035Z',
//     },
//     createdAt: {
//       $date: '2024-01-28T12:26:05.526Z',
//     },
//     updatedAt: {
//       $date: '2024-01-29T04:52:27.035Z',
//     },
//     certificateExpirationDate: {
//       $date: '2024-09-20T16:09:24.000Z',
//     },
//   },
//   {
//     host: '001-sai-dual.symboltest.net',
//     publicKey: '07D38BAE29464C1F54CC1C8202DD83B65AF21C8E5FF1FB01ACEEE2243C55EF2A',
//     nodePublicKey: 'AAC168F82C89AAA5EC72B3E93C8F2F1E84D2C6D38CA98A7D93F5F8ACD9AE3490',
//     port: 7900,
//     friendlyName: '001-sai-dual',
//     version: 16777990,
//     networkGenerationHashSeed: '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
//     roles: 7,
//     networkIdentifier: 152,
//     isHttpsEnabled: true,
//     isAvailable: true,
//     lastCheck: {
//       $date: '2024-01-29T04:52:19.537Z',
//     },
//     lastSyncCheck: {
//       $date: '2024-01-29T04:52:26.957Z',
//     },
//     createdAt: {
//       $date: '2024-01-28T12:26:06.117Z',
//     },
//     updatedAt: {
//       $date: '2024-01-29T04:52:26.957Z',
//     },
//     certificateExpirationDate: {
//       $date: '2024-11-20T22:07:13.000Z',
//     },
//   },
// ];

/**
 * NodePeerモックデータ(Socket)
 */
const mockSocketNodePeer = new Map<string, NodePeer[]>();
mockSocketNodePeer.set(
  '4t.dusanjp.com.test,4540B7010550CAA12F78DD3466A2645212F705F39E25A2333E9CB12DFF1A91A0',
  [
    {
      version: 16777990,
      publicKey: '154A2B669BDE15924FF6FEE9ECB9CDD79EEADA4131665748A12132EAA465E575',
      networkGenerationHashSeed: '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
      roles: 7,
      port: 7900,
      networkIdentifier: 152,
      host: 'sym-test-03.opening-line.jp.test',
      friendlyName: 'sym-test-03.opening-line.jp.',
    },
  ],
);
mockSocketNodePeer.set(
  '201-sai-dual.symboltest.net.test,645E2E56B5F8680B69BC0255F4930169DBC052BB25F8121055DE2072D37E2C30',
  [
    {
      version: 16777990,
      publicKey: 'BF61564C09B8A44A940EB09B9D062020A39BA848BAB838D597F27B11F1FBE717',
      networkGenerationHashSeed: '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
      roles: 7,
      port: 7900,
      networkIdentifier: 152,
      host: 'sym-test-01.opening-line.jp.test',
      friendlyName: 'sym-test-01.opening-line.jp.',
    },
  ],
);
mockSocketNodePeer.set(
  'mikun-testnet.tk.test,CEAAE51C6D294AEFC1A3C84FEFE9D60B0CE815DBC66567211A41B7DE2DC164B8',
  [
    {
      version: 16777990,
      publicKey: '100037D00EC47399FF1883A59A9F4808CA37433D7268926F57E3A1ED981427AA',
      networkGenerationHashSeed: '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
      roles: 3,
      port: 7900,
      networkIdentifier: 152,
      host: 'testnet.shizuilab.com.test',
      friendlyName: 'ibone61@shizuilab',
    },
  ],
);
mockSocketNodePeer.set(
  '001-sai-dual.symboltest.net.test,07D38BAE29464C1F54CC1C8202DD83B65AF21C8E5FF1FB01ACEEE2243C55EF2A',
  [
    {
      version: 16777990,
      publicKey: '1AE10C596BFFF509278A4EA12DAF4B89185ED29EFC6275867502AC7226E794F9',
      networkGenerationHashSeed: '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
      roles: 3,
      port: 7900,
      networkIdentifier: 152,
      host: 'finnel.harvestasya.com',
      friendlyName: 'HarvestasyaNodeFinnel/.',
    },
  ],
);

/**
 * NodePeerモックデータ(RestGW)
 */
const mockRestGwNodePeer = new Map<string, NodePeer[]>();
mockRestGwNodePeer.set(
  '4t.dusanjp.com.test,4540B7010550CAA12F78DD3466A2645212F705F39E25A2333E9CB12DFF1A91A0',
  [
    {
      version: 16777990,
      publicKey: '154A2B669BDE15924FF6FEE9ECB9CDD79EEADA4131665748A12132EAA465E575',
      networkGenerationHashSeed: '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
      roles: 7,
      port: 7900,
      networkIdentifier: 152,
      host: 'sym-test-03.opening-line.jp.test',
      friendlyName: 'sym-test-03.opening-line.jp.',
    },
  ],
);

/**
 * NodeInfoモックデータ(Socket)
 */
const certDate = new Date('2024-02-04T21:14:06.072Z');
const mockSocketNodeInfo = new Map<string, NodeInfo>();
mockSocketNodeInfo.set(
  'sym-test-03.opening-line.jp.test,154A2B669BDE15924FF6FEE9ECB9CDD79EEADA4131665748A12132EAA465E575',
  {
    version: 16777990,
    publicKey: '154A2B669BDE15924FF6FEE9ECB9CDD79EEADA4131665748A12132EAA465E575',
    networkGenerationHashSeed: '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
    roles: 7,
    port: 7900,
    networkIdentifier: 152,
    host: 'sym-test-03.opening-line.jp.test',
    friendlyName: 'sym-test-03.opening-line.jp.',
    nodePublicKey: '85B0EBA30EE575754BD4A424E1244649E37BEC03C9E83F37F3B3A8B2C02F7E36',
    isAvailable: true,
    isHttpsEnabled: false,
    certificateExpirationDate: new Date('2024-02-04T21:14:06.072Z'),
  },
);
mockSocketNodeInfo.set(
  'sym-test-01.opening-line.jp.test,BF61564C09B8A44A940EB09B9D062020A39BA848BAB838D597F27B11F1FBE717',
  {
    version: 16777990,
    publicKey: 'BF61564C09B8A44A940EB09B9D062020A39BA848BAB838D597F27B11F1FBE717',
    networkGenerationHashSeed: '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
    roles: 7,
    port: 7900,
    networkIdentifier: 152,
    host: 'sym-test-01.opening-line.jp.test',
    friendlyName: 'sym-test-01.opening-line.jp.',
    nodePublicKey: 'D8321F96114BE0BB7C2D3D27574A108C00990D6D6F4C604E232A62BFAD247540',
    isAvailable: true,
    isHttpsEnabled: false,
    certificateExpirationDate: new Date('2024-02-04T21:14:06.072Z'),
  },
);
mockSocketNodeInfo.set(
  'testnet.shizuilab.com.test,100037D00EC47399FF1883A59A9F4808CA37433D7268926F57E3A1ED981427AA',
  {
    version: 16777990,
    publicKey: '100037D00EC47399FF1883A59A9F4808CA37433D7268926F57E3A1ED981427AA',
    networkGenerationHashSeed: '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
    roles: 3,
    port: 7900,
    networkIdentifier: 152,
    host: 'testnet.shizuilab.com.test',
    friendlyName: 'ibone61@shizuilab',
    nodePublicKey: 'D8321F96114BE0BB7C2D3D27574A108C00990D6D6F4C604E232A62BFAD247540',
    isAvailable: true,
    isHttpsEnabled: false,
    certificateExpirationDate: new Date('2024-02-04T21:14:06.072Z'),
  },
);

/**
 * NodeInfoモックデータ(RestGw)
 */
const mockRestGwNodeInfo = new Map<string, NodeInfo>();
mockRestGwNodeInfo.set(
  'sym-test-03.opening-line.jp.test,154A2B669BDE15924FF6FEE9ECB9CDD79EEADA4131665748A12132EAA465E575',
  {
    version: 16777990,
    publicKey: '154A2B669BDE15924FF6FEE9ECB9CDD79EEADA4131665748A12132EAA465E575',
    networkGenerationHashSeed: '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
    roles: 7,
    port: 7900,
    networkIdentifier: 152,
    host: 'sym-test-03.opening-line.jp.test',
    friendlyName: 'sym-test-03.opening-line.jp.',
    nodePublicKey: '85B0EBA30EE575754BD4A424E1244649E37BEC03C9E83F37F3B3A8B2C02F7E36',
    isAvailable: true,
    isHttpsEnabled: true,
  },
);

/**
 * Mongo検索
 */
const mockFindOne = {
  version: 16777990,
  publicKey: '154A2B669BDE15924FF6FEE9ECB9CDD79EEADA4131665748A12132EAA465E575',
  networkGenerationHashSeed: '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
  roles: 7,
  port: 7900,
  networkIdentifier: 152,
  host: 'sym-test-03.opening-line.jp.test',
  friendlyName: 'sym-test-03.opening-line.jp.',
  nodePublicKey: '85B0EBA30EE575754BD4A424E1244649E37BEC03C9E83F37F3B3A8B2C02F7E36',
  isAvailable: true,
  isHttpsEnabled: false,
  certificateExpirationDate: new Date('2024-02-04T21:14:06.072Z'),
};

/**
 * Mongo検索(limit)
 */
const mockNodePeer = {
  host: '4t.dusanjp.com.test',
  publicKey: '4540B7010550CAA12F78DD3466A2645212F705F39E25A2333E9CB12DFF1A91A0',
  nodePublicKey: '4F9575A9630EA3546476043FEA8B2A8FEA81E77BAFD9D997B86BDF8908FB2170',
  port: 7900,
  friendlyName: 'peervoting@4',
  version: 16777990,
  networkGenerationHashSeed: '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
  roles: 5,
  networkIdentifier: 152,
  isHttpsEnabled: false,
  lastCheck: {
    $date: '2024-01-29T04:52:19.527Z',
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
};

describe('PeersService', () => {
  let service: PeersService;
  let model: Model<PeerDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [configuration],
        }),
      ],
      providers: [
        ConfigService,
        PeersService,
        PeersRepository,
        {
          provide: getModelToken(Peer.name),
          useValue: {
            constructor: jest.fn().mockResolvedValue(mockNodePeer),
            new: jest.fn().mockResolvedValue(mockNodePeer),
            find: jest.fn().mockResolvedValue(mockNodePeer),
            findOne: jest.fn(),
            updateOne: jest.fn(),
            create: jest.fn(),
            exec: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PeersService>(PeersService);
    model = module.get<Model<PeerDocument>>(getModelToken(Peer.name));

    const mockDate = new Date(1706444794110);
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
  });

  it('PeersService定義の確認', () => {
    expect(service).toBeDefined();
  });

  // it('updatePeersCollection Peerの登録', async () => {
  //   /** モック */
  //   jest.spyOn(service, 'getPeerDocCheckedOldest').mockReturnValue(mockPeerDocCheckedOldest as any);

  //   /** テスト実行 */
  //   await service.updatePeersCollection();

  //   /** 検証 */
  // });

  it('registerNewPeer 新しいPeerの登録', async () => {
    /** モック **/
    jest
      .spyOn(service, 'getNodePeers')
      .mockReturnValue({ socket: mockSocketNodePeer, restGw: mockRestGwNodePeer } as any);
    jest
      .spyOn(service, 'getNodeInfo')
      .mockReturnValue({ socket: mockSocketNodeInfo, restGw: mockRestGwNodeInfo } as any);
    jest.spyOn(model, 'findOne').mockReturnValue({
      exec: jest.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(mockFindOne),
    } as any);
    const updateOneJest = jest.spyOn(model, 'updateOne').mockReturnValue({
      exec: jest.fn().mockImplementationOnce(() => {}),
    } as any);
    const createJest = jest.spyOn(model, 'create').mockReturnValue({
      exec: jest.fn().mockImplementationOnce(() => {}),
    } as any);

    /** テスト実行 **/
    const nodeKeys = [
      {
        host: '4t.dusanjp.com.test',
        publicKey: '4540B7010550CAA12F78DD3466A2645212F705F39E25A2333E9CB12DFF1A91A0',
        port: 7900,
      },
      {
        host: '201-sai-dual.symboltest.net.test',
        publicKey: '645E2E56B5F8680B69BC0255F4930169DBC052BB25F8121055DE2072D37E2C30',
        port: 7900,
      },
      {
        host: 'mikun-testnet.tk.test',
        publicKey: 'CEAAE51C6D294AEFC1A3C84FEFE9D60B0CE815DBC66567211A41B7DE2DC164B8',
        port: 7900,
      },
      {
        host: '001-sai-dual.symboltest.net.test',
        publicKey: '07D38BAE29464C1F54CC1C8202DD83B65AF21C8E5FF1FB01ACEEE2243C55EF2A',
        port: 7900,
      },
    ];
    await service.registerNewPeer(nodeKeys);

    /** 検証 **/
    expect(updateOneJest.mock.calls.length).toEqual(1);
    expect(updateOneJest.mock.calls[0][0]).toEqual({
      host: 'sym-test-01.opening-line.jp.test',
      publicKey: 'BF61564C09B8A44A940EB09B9D062020A39BA848BAB838D597F27B11F1FBE717',
    });
    expect(createJest.mock.calls.length).toEqual(3);
    expect(createJest.mock.calls[0][0]).toEqual({
      host: 'sym-test-03.opening-line.jp.test',
      publicKey: '154A2B669BDE15924FF6FEE9ECB9CDD79EEADA4131665748A12132EAA465E575',
      nodePublicKey: '85B0EBA30EE575754BD4A424E1244649E37BEC03C9E83F37F3B3A8B2C02F7E36',
      port: 7900,
      friendlyName: 'sym-test-03.opening-line.jp.',
      version: 16777990,
      networkGenerationHashSeed: '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
      roles: 7,
      networkIdentifier: 152,
      isHttpsEnabled: true,
      certificateExpirationDate: certDate,
      isAvailable: true,
      lastCheck: new Date('2024-01-28T12:26:34.110Z'),
      lastSyncCheck: new Date('2024-01-28T12:26:34.110Z'),
    });
    expect(createJest.mock.calls[1][0]).toEqual({
      host: 'testnet.shizuilab.com.test',
      publicKey: '100037D00EC47399FF1883A59A9F4808CA37433D7268926F57E3A1ED981427AA',
      nodePublicKey: 'D8321F96114BE0BB7C2D3D27574A108C00990D6D6F4C604E232A62BFAD247540',
      port: 7900,
      friendlyName: 'ibone61@shizuilab',
      version: 16777990,
      networkGenerationHashSeed: '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
      roles: 3,
      networkIdentifier: 152,
      isHttpsEnabled: false,
      certificateExpirationDate: undefined,
      isAvailable: true,
      lastCheck: new Date('2024-01-28T12:26:34.110Z'),
      lastSyncCheck: new Date('2024-01-28T12:26:34.110Z'),
    });
    expect(createJest.mock.calls[2][0]).toEqual({
      host: 'finnel.harvestasya.com',
      publicKey: '1AE10C596BFFF509278A4EA12DAF4B89185ED29EFC6275867502AC7226E794F9',
      port: 7900,
      friendlyName: 'HarvestasyaNodeFinnel/.',
      version: 16777990,
      networkGenerationHashSeed: '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
      roles: 3,
      networkIdentifier: 152,
      isHttpsEnabled: false,
      isAvailable: false,
      lastCheck: new Date('2024-01-28T12:26:34.110Z'),
      lastSyncCheck: new Date('2024-01-28T12:26:34.110Z'),
    });
  });

  it('getPeerDocCheckedOldest Peerコレクションからチェック日時が古い方から取得', async () => {
    /** モック */
    jest.spyOn(model, 'find').mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValueOnce([mockNodePeer]),
        }),
      }),
    } as any);

    /** 実行 */
    const peerDocCheckedOldest = await service.getPeerDocCheckedOldest();

    /** 検証 */
    expect(peerDocCheckedOldest).toEqual([mockNodePeer]);
  });

  it('NodeInfo取得', async () => {
    // モック
    jest.spyOn(SslSocket.prototype as any, 'getNodeInfo').mockImplementationOnce(() =>
      Promise.resolve({
        host: '4t.dusanjp.com.test',
        publicKey: '4540B7010550CAA12F78DD3466A2645212F705F39E25A2333E9CB12DFF1A91A0',
        port: 7900,
        friendlyName: 'peervoting@4',
        version: 16777990,
        networkGenerationHashSeed:
          '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
        roles: 5,
        networkIdentifier: 152,
        isHttpsEnabled: false,
        isAvailable: true,
        certificateExpirationDate: new Date('2025-01-31T23:22:32.000Z'),
        nodePublicKey: '4F9575A9630EA3546476043FEA8B2A8FEA81E77BAFD9D997B86BDF8908FB2170',
      }),
    );
    jest.spyOn(RestGateway.prototype as any, 'tryHttpsNodeInfo').mockImplementationOnce(() =>
      Promise.resolve({
        host: '4t.dusanjp.com.test',
        publicKey: '4540B7010550CAA12F78DD3466A2645212F705F39E25A2333E9CB12DFF1A91A0',
        port: 7900,
        friendlyName: 'peervoting@4',
        version: 16777990,
        networkGenerationHashSeed:
          '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
        roles: 5,
        networkIdentifier: 152,
        nodePublicKey: '4F9575A9630EA3546476043FEA8B2A8FEA81E77BAFD9D997B86BDF8908FB2170',
        isHttpsEnabled: true,
        isAvailable: true,
      }),
    );

    // テスト実行
    const processList = [
      {
        host: '4t.dusanjp.com.test',
        publicKey: '4540B7010550CAA12F78DD3466A2645212F705F39E25A2333E9CB12DFF1A91A0',
        port: 7900,
      },
    ];
    const nodeInfoMap = await service.getNodeInfo(processList);
    console.log(nodeInfoMap);

    // 検証
    const socket = new Map<string, NodeInfo>();
    socket.set(
      '4t.dusanjp.com.test,4540B7010550CAA12F78DD3466A2645212F705F39E25A2333E9CB12DFF1A91A0',
      {
        version: 16777990,
        publicKey: '4540B7010550CAA12F78DD3466A2645212F705F39E25A2333E9CB12DFF1A91A0',
        networkGenerationHashSeed:
          '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
        roles: 5,
        port: 7900,
        networkIdentifier: 152,
        host: '4t.dusanjp.com.test',
        friendlyName: 'peervoting@4',
        isHttpsEnabled: false,
        isAvailable: true,
        certificateExpirationDate: new Date('2025-01-31T23:22:32.000Z'),
        nodePublicKey: '4F9575A9630EA3546476043FEA8B2A8FEA81E77BAFD9D997B86BDF8908FB2170',
      },
    );
    const restGw = new Map<string, NodeInfo>();
    restGw.set(
      '4t.dusanjp.com.test,4540B7010550CAA12F78DD3466A2645212F705F39E25A2333E9CB12DFF1A91A0',
      {
        version: 16777990,
        publicKey: '4540B7010550CAA12F78DD3466A2645212F705F39E25A2333E9CB12DFF1A91A0',
        networkGenerationHashSeed:
          '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
        roles: 5,
        port: 7900,
        networkIdentifier: 152,
        host: '4t.dusanjp.com.test',
        friendlyName: 'peervoting@4',
        isHttpsEnabled: true,
        isAvailable: true,
        nodePublicKey: '4F9575A9630EA3546476043FEA8B2A8FEA81E77BAFD9D997B86BDF8908FB2170',
      } as any,
    );
    expect(nodeInfoMap).toEqual({ socket: socket, restGw: restGw });
  });

  it('NodePeers取得', async () => {
    // モック
    jest.spyOn(SslSocket.prototype as any, 'getNodePeers').mockImplementationOnce(() =>
      Promise.resolve([
        {
          version: 16777989,
          publicKey: 'E31806D8D180DE025529095E90D792F8C492F628E293C628A2DD8A2312841721',
          networkGenerationHashSeed:
            '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
          roles: 1,
          port: 7900,
          networkIdentifier: 152,
          host: 'onem style',
          friendlyName: 'onem mobile',
        },
        {
          version: 16777990,
          publicKey: '645E2E56B5F8680B69BC0255F4930169DBC052BB25F8121055DE2072D37E2C30',
          networkGenerationHashSeed:
            '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
          roles: 3,
          port: 7900,
          networkIdentifier: 152,
          host: '201-sai-dual.symboltest.net.test',
          friendlyName: '201-sai-dual',
        },
        {
          version: 16777990,
          publicKey: '04C8854EF30A510916C4E1C2DBA7B180FC3783040F7FD8F53398104802FD55BB',
          networkGenerationHashSeed:
            '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
          roles: 2,
          port: 7900,
          networkIdentifier: 152,
          host: '35.243.113.177.test',
          friendlyName: '04C8854',
        },
      ]),
    );
    jest.spyOn(RestGateway.prototype as any, 'tryHttpsNodePeers').mockImplementationOnce(() =>
      Promise.resolve([
        {
          version: 16777989,
          publicKey: 'E31806D8D180DE025529095E90D792F8C492F628E293C628A2DD8A2312841721',
          networkGenerationHashSeed:
            '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
          roles: 1,
          port: 7900,
          networkIdentifier: 152,
          host: 'onem style',
          friendlyName: 'onem mobile',
        },
        {
          version: 16777990,
          publicKey: '645E2E56B5F8680B69BC0255F4930169DBC052BB25F8121055DE2072D37E2C30',
          networkGenerationHashSeed:
            '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
          roles: 3,
          port: 7900,
          networkIdentifier: 152,
          host: '201-sai-dual.symboltest.net.test',
          friendlyName: '201-sai-dual',
        },
        {
          version: 16777990,
          publicKey: '04C8854EF30A510916C4E1C2DBA7B180FC3783040F7FD8F53398104802FD55BB',
          networkGenerationHashSeed:
            '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
          roles: 2,
          port: 7900,
          networkIdentifier: 152,
          host: '35.243.113.177.test',
          friendlyName: '04C8854',
        },
      ]),
    );

    // テスト実行
    const nodeKeys = [
      {
        host: '4t.dusanjp.com.test',
        publicKey: '4540B7010550CAA12F78DD3466A2645212F705F39E25A2333E9CB12DFF1A91A0',
        port: 7900,
      },
    ];
    const nodePeersMap = await service.getNodePeers(nodeKeys);

    // 検証
    const socket = new Map<string, NodePeer[]>();
    socket.set(
      '4t.dusanjp.com.test,4540B7010550CAA12F78DD3466A2645212F705F39E25A2333E9CB12DFF1A91A0',
      [
        {
          version: 16777989,
          publicKey: 'E31806D8D180DE025529095E90D792F8C492F628E293C628A2DD8A2312841721',
          networkGenerationHashSeed:
            '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
          roles: 1,
          port: 7900,
          networkIdentifier: 152,
          host: 'onem style',
          friendlyName: 'onem mobile',
        },
        {
          version: 16777990,
          publicKey: '645E2E56B5F8680B69BC0255F4930169DBC052BB25F8121055DE2072D37E2C30',
          networkGenerationHashSeed:
            '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
          roles: 3,
          port: 7900,
          networkIdentifier: 152,
          host: '201-sai-dual.symboltest.net.test',
          friendlyName: '201-sai-dual',
        },
        {
          version: 16777990,
          publicKey: '04C8854EF30A510916C4E1C2DBA7B180FC3783040F7FD8F53398104802FD55BB',
          networkGenerationHashSeed:
            '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
          roles: 2,
          port: 7900,
          networkIdentifier: 152,
          host: '35.243.113.177.test',
          friendlyName: '04C8854',
        },
      ],
    );
    const restGw = new Map<string, NodePeer[]>();
    restGw.set(
      '4t.dusanjp.com.test,4540B7010550CAA12F78DD3466A2645212F705F39E25A2333E9CB12DFF1A91A0',
      [
        {
          version: 16777989,
          publicKey: 'E31806D8D180DE025529095E90D792F8C492F628E293C628A2DD8A2312841721',
          networkGenerationHashSeed:
            '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
          roles: 1,
          port: 7900,
          networkIdentifier: 152,
          host: 'onem style',
          friendlyName: 'onem mobile',
        },
        {
          version: 16777990,
          publicKey: '645E2E56B5F8680B69BC0255F4930169DBC052BB25F8121055DE2072D37E2C30',
          networkGenerationHashSeed:
            '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
          roles: 3,
          port: 7900,
          networkIdentifier: 152,
          host: '201-sai-dual.symboltest.net.test',
          friendlyName: '201-sai-dual',
        },
        {
          version: 16777990,
          publicKey: '04C8854EF30A510916C4E1C2DBA7B180FC3783040F7FD8F53398104802FD55BB',
          networkGenerationHashSeed:
            '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
          roles: 2,
          port: 7900,
          networkIdentifier: 152,
          host: '35.243.113.177.test',
          friendlyName: '04C8854',
        },
      ],
    );
    expect(nodePeersMap).toEqual({ socket: socket, restGw: restGw });
  });
});