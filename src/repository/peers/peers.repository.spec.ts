import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { PeerDocument } from '../../schema/peer.schema';
import { PeersRepository } from './peers.repository';

const mockPeer = {
  host: 'vmi831828.contaboserver.net',
  publicKey: '24A1C604DAAB6D23CE19BD00FF272A87382B019ADDEA99193F15E469B5646080',
  port: 7900,
  friendlyName: 'MAMESHIBA',
  version: 16777990,
  networkGenerationHashSeed: '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
  roles: 3,
  networkIdentifier: 152,
  isAvailable: true,
  isHttpsEnabled: true,
  chainHeight: 321654123456987n,
  finalization: {
    height: 3216541238421n,
    epoch: 13,
    point: 54,
    hash: '339E0AB259366BEFE28AE7017A02FA32A6D88736066085C942585B820516EFD2',
  },
};

describe('PeersRepository', () => {
  let service: PeersRepository;
  let model: Model<PeerDocument>;

  const peersArray = [
    {
      host: '4t.dusanjp.com',
      publicKey: '4540B7010550CAA12F78DD3466A2645212F705F39E25A2333E9CB12DFF1A91A0',
      port: 7900,
      friendlyName: 'peervoting@4',
      version: 16777990,
      networkGenerationHashSeed: '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
      roles: 5,
      networkIdentifier: 152,
      createdAt: '2024-01-23T22:25:24.125Z',
      updatedAt: '2024-01-23T22:25:24.125Z',
    },
    {
      host: 'vmi831828.contaboserver.net',
      publicKey: '24A1C604DAAB6D23CE19BD00FF272A87382B019ADDEA99193F15E469B5646080',
      port: 7900,
      friendlyName: 'MAMESHIBA',
      version: 16777990,
      networkGenerationHashSeed: '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
      roles: 3,
      networkIdentifier: 152,
      createdAt: '2024-01-23T22:25:24.126Z',
      updatedAt: '2024-01-23T22:25:24.126Z',
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PeersRepository,
        {
          provide: getModelToken('Peer'),
          useValue: {
            new: jest.fn().mockResolvedValue(mockPeer),
            constructor: jest.fn().mockResolvedValue(mockPeer),
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            exec: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PeersRepository>(PeersRepository);
    model = module.get<Model<PeerDocument>>(getModelToken('Peer'));
  });

  it('定義の確認', () => {
    expect(service).toBeDefined();
  });

  it('Peerの全件検索', async () => {
    jest.spyOn(model, 'find').mockReturnValue({
      exec: jest.fn().mockResolvedValueOnce(peersArray),
    } as any);
    const peers = await service.findAll();
    expect(peers).toEqual(peersArray);
  });

  it('Peerの1件検索', async () => {
    jest.spyOn(model, 'findOne').mockReturnValue({
      exec: jest.fn().mockResolvedValueOnce(mockPeer),
    } as any);
    const peer = await service.findOne();
    expect(peer).toEqual(mockPeer);
  });

  it('Peerの登録', async () => {
    jest.spyOn(model, 'create').mockImplementationOnce(() =>
      Promise.resolve({
        host: 'vmi831828.contaboserver.net',
        publicKey: '24A1C604DAAB6D23CE19BD00FF272A87382B019ADDEA99193F15E469B5646080',
        port: 7900,
        friendlyName: 'MAMESHIBA',
        version: 16777990,
        networkGenerationHashSeed:
          '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
        roles: 3,
        networkIdentifier: 152,
        isAvailable: true,
        isHttpsEnabled: true,
        chainHeight: 321654123456987n,
        finalization: {
          height: 3216541238421n,
          epoch: 13,
          point: 54,
          hash: '339E0AB259366BEFE28AE7017A02FA32A6D88736066085C942585B820516EFD2',
        },
      } as any),
    );
    const newCat = await service.create({
      host: 'vmi831828.contaboserver.net',
      publicKey: '24A1C604DAAB6D23CE19BD00FF272A87382B019ADDEA99193F15E469B5646080',
      port: 7900,
      friendlyName: 'MAMESHIBA',
      version: 16777990,
      networkGenerationHashSeed: '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
      roles: 3,
      networkIdentifier: 152,
      isAvailable: true,
      isHttpsEnabled: true,
      chainHeight: 321654123456987n,
      finalization: {
        height: 3216541238421n,
        epoch: 13,
        point: 54,
        hash: '339E0AB259366BEFE28AE7017A02FA32A6D88736066085C942585B820516EFD2',
      },
    });
    expect(newCat).toEqual(mockPeer);
  });
});
