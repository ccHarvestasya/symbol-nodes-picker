import { SslSocket } from '@/util/symboler/SslSocket';
import { X509Certificate } from 'crypto';

describe('SslScoket', () => {
  let sslScoket: SslSocket;

  beforeEach(async () => {
    sslScoket = new SslSocket(5000);
  });

  it('SslScoket定義の確認', () => {
    expect(sslScoket).toBeDefined();
  });

  it('ChainInfo取得', async () => {
    // モック
    jest
      .spyOn(sslScoket as any, 'getSocketData')
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: Uint8Array.from(
            Buffer.from('5498110000000000389811000000000000000000000000007816F758B7E178A5', 'hex'),
          ),
        } as any),
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: Uint8Array.from(
            Buffer.from(
              '430600001A00000038981100000000002DC3F2422C2039B43F6BAE4147E66906D1A7221858D12CC820534E0469593B38',
              'hex',
            ),
          ),
        } as any),
      );
    // テスト実行
    const chainInfo = await sslScoket.getChainInfo('test.symbolnode..com', 7900);
    // 検証
    expect(chainInfo).toEqual({
      height: 1153108n,
      scoreHigh: 0n,
      scoreLow: 11923528191051241080n,
      latestFinalizedBlock: {
        finalizationEpoch: 1603,
        finalizationPoint: 26,
        height: 1153080n,
        hash: '2DC3F2422C2039B43F6BAE4147E66906D1A7221858D12CC820534E0469593B38',
      },
    });
  });

  it('ChainInfo取得 Socket通信失敗', async () => {
    // モック
    jest
      .spyOn(sslScoket as any, 'getSocketData')
      .mockImplementationOnce(() =>
        Promise.reject({
          message: 'unknown error',
        } as any),
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: Uint8Array.from(
            Buffer.from(
              '430600001A00000038981100000000002DC3F2422C2039B43F6BAE4147E66906D1A7221858D12CC820534E0469593B38',
              'hex',
            ),
          ),
        } as any),
      );
    // テスト実行
    const chainInfo = await sslScoket.getChainInfo('test.symbolnode..com', 7900);
    // 検証
    expect(chainInfo).toEqual(undefined);
  });

  it('ChainInfo取得 Socket通信データ異常', async () => {
    // モック
    jest
      .spyOn(sslScoket as any, 'getSocketData')
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: Uint8Array.from(Buffer.from('5498758B7E178A5', 'hex')),
        } as any),
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: Uint8Array.from(
            Buffer.from(
              '430600001A00000038981100000000002DC3F2422C2039B43F6BAE4147E66906D1A7221858D12CC820534E0469593B38',
              'hex',
            ),
          ),
        } as any),
      );
    // テスト実行
    const chainInfo = await sslScoket.getChainInfo('test.symbolnode..com', 7900);
    // 検証
    expect(chainInfo).toEqual(undefined);
  });

  it('NodeInfo取得', async () => {
    // モック
    jest.spyOn(sslScoket as any, 'getSocketData').mockImplementationOnce(() =>
      Promise.resolve({
        x509: new X509Certificate(
          Buffer.from(
            '-----BEGIN CERTIFICATE-----\n' +
              'MIHfMIGSAhNZlFKqPjyxwJ+f36uKWLzsgt8KMAUGAytlcDAXMRUwEwYDVQQDDAxu\n' +
              'b2RlLWFjY291bnQwHhcNMjMxMTAxMjEyNjI1WhcNMjQxMTEwMjEyNjI1WjAPMQ0w\n' +
              'CwYDVQQDDARub2RlMCowBQYDK2VwAyEAXP9Wdp6rpWMVIzVSyEm6n/anITD2r4Ap\n' +
              'lsLrDqBarW8wBQYDK2VwA0EAd9GDG7fuwoW3v6w6JGanwwz7oZJk865ZzBoQdNB6\n' +
              'gi8jjA9agc2yrelae6OvAr4uYL7IzDzWACQYeAbXgyVQDg==\n' +
              '-----END CERTIFICATE-----\n',
          ),
        ),
        data: Uint8Array.from(
          Buffer.from(
            '6B000000060300014540B7010550CAA12F78DD3466A2645212F705F39E25A233' +
              '3E9CB12DFF1A91A049D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1' +
              '221E79494FC665A405000000DC1E980E0C34742E647573616E6A702E636F6D70' +
              '656572766F74696E674034',
            'hex',
          ),
        ),
      } as any),
    );
    // テスト実行
    const nodeInfo = await sslScoket.getNodeInfo('test.symbolnode..com', 7900);
    // 検証
    expect(nodeInfo).toEqual({
      certificateExpirationDate: new Date('2024-11-10T21:26:25.000Z'),
      friendlyName: 'peervoting@4',
      host: '4t.dusanjp.com',
      isAvailable: true,
      isHttpsEnabled: false,
      networkGenerationHashSeed: '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
      networkIdentifier: 152,
      nodePublicKey: '5CFF56769EABA56315233552C849BA9FF6A72130F6AF802996C2EB0EA05AAD6F',
      port: 7900,
      publicKey: '4540B7010550CAA12F78DD3466A2645212F705F39E25A2333E9CB12DFF1A91A0',
      roles: 5,
      version: 16777990,
    });
  });

  it('NodeInfo取得 Socket通信失敗', async () => {
    // モック
    jest.spyOn(sslScoket as any, 'getSocketData').mockImplementationOnce(() =>
      Promise.reject({
        message: 'unknown error',
      } as any),
    );
    // テスト実行
    const nodeInfo = await sslScoket.getNodeInfo('test.symbolnode..com', 7900);
    // 検証
    expect(nodeInfo).toEqual(undefined);
  });

  it('NodeInfo取得 Socket通信データ異常', async () => {
    // モック
    jest.spyOn(sslScoket as any, 'getSocketData').mockImplementationOnce(() =>
      Promise.resolve({
        data: Uint8Array.from(Buffer.from('000', 'hex')),
      } as any),
    );
    // テスト実行
    const nodeInfo = await sslScoket.getNodeInfo('test.symbolnode..com', 7900);
    // 検証
    expect(nodeInfo).toEqual(undefined);
  });

  it('NodePeers取得', async () => {
    // モック
    jest.spyOn(sslScoket as any, 'getSocketData').mockImplementationOnce(() =>
      Promise.resolve({
        data: Uint8Array.from(
          Buffer.from(
            '640000000603000106862C55992CAC030606E5B623474F0AC359F2ED05DDD506' +
              '7403172A2D341F6549D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1' +
              '221E79494FC665A403000000DC1E980C0732302E34382E39322E313234303638' +
              '363243357D0000000000000003A9EF5A45C8D4D059D3E9C95DC5956091E3E855' +
              'DC812F363DB41D987BF927A649D6E1CE276A85B70EAFE52349AACCA389302E7A' +
              '9754BCF1221E79494FC665A407000000DC1E9813197465737430322E78796D6E' +
              '6F6465732E636F6D74657374206E6F646530322066726F6D2078796D6E6F6465' +
              '738800000006030001154A2B669BDE15924FF6FEE9ECB9CDD79EEADA41316657' +
              '48A12132EAA465E57549D6E1CE276A85B70EAFE52349AACCA389302E7A9754BC' +
              'F1221E79494FC665A407000000DC1E981B1C73796D2D746573742D30332E6F70' +
              '656E696E672D6C696E652E6A7073796D2D746573742D30332E6F70656E696E67' +
              '2D6C696E652E6A702E7700000006030001100037D00EC47399FF1883A59A9F48' +
              '08CA37433D7268926F57E3A1ED981427AA49D6E1CE276A85B70EAFE52349AACC' +
              'A389302E7A9754BCF1221E79494FC665A403000000DC1E981511746573746E65' +
              '742E7368697A75696C61622E636F6D69626F6E653631407368697A75696C6162' +
              '6200000006030001AE3C8C118ECB82333BAAFD5BE858176E3C0A497CDA405ACC' +
              'BA6F737E1C443D2D49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1' +
              '221E79494FC665A402000000DC1E980A0733342E38342E362E36354145334338' +
              '43317D000000060300017BCDB84A784EFC5ACF4E008E7DB4752AD08C22EB73B4' +
              'C39C86B911D47714B92F49D6E1CE276A85B70EAFE52349AACCA389302E7A9754' +
              'BCF1221E79494FC665A407000000DC1E9813197465737430312E78796D6E6F64' +
              '65732E636F6D74657374206E6F646530312066726F6D2078796D6E6F64657366' +
              '00000005030001E31806D8D180DE025529095E90D792F8C492F628E293C628A2' +
              'DD8A231284172149D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF122' +
              '1E79494FC665A401000000DC1E980A0B6F6E656D207374796C656F6E656D206D' +
              '6F62696C655D0000000503000153DDCF16CCDFEE630AEE660D42CE42DD868395' +
              '71148E20A8E6A13E33A505697B49D6E1CE276A85B70EAFE52349AACCA389302E' +
              '7A9754BCF1221E79494FC665A401000000DC1E9808046E69636F2E66756B6E69' +
              '636F660000000603000104C8854EF30A510916C4E1C2DBA7B180FC3783040F7F' +
              'D8F53398104802FD55BB49D6E1CE276A85B70EAFE52349AACCA389302E7A9754' +
              'BCF1221E79494FC665A402000000DC1E980E0733352E3234332E3131332E3137' +
              '37303443383835346B000000060300014540B7010550CAA12F78DD3466A26452' +
              '12F705F39E25A2333E9CB12DFF1A91A049D6E1CE276A85B70EAFE52349AACCA3' +
              '89302E7A9754BCF1221E79494FC665A405000000DC1E980E0C34742E64757361' +
              '6E6A702E636F6D70656572766F74696E67403476000000060300018A66BDB319' +
              'C210B5C37C908C5379DB7F98BAC8FCF4FAF2947EE19ACE30E6934349D6E1CE27' +
              '6A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A407000000DC' +
              '1E980D18322E647573616E6A702E636F6D647573616E6A7032407361695F6661' +
              '6B65766F74696E67356C00000000000000CEAAE51C6D294AEFC1A3C84FEFE9D6' +
              '0B0CE815DBC66567211A41B7DE2DC164B849D6E1CE276A85B70EAFE52349AACC' +
              'A389302E7A9754BCF1221E79494FC665A407000000DC1E98100B6D696B756E2D' +
              '746573746E65742E746B6D696B756E5F74657374317800000000000000C17737' +
              '40461C97FF172E966213716E089A93DC43F10BE55DC27CC49CBA67E69249D6E1' +
              'CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4070000' +
              '00DC1E981B0C3430312D7361692D6475616C2E73796D626F6C746573742E6E65' +
              '743430312D7361692D6475616C720000000603000100A1D8FBA03297507FFC91' +
              'EE4D5CE2AA37AFE6512F9C909F3F86F6E1476E910849D6E1CE276A85B70EAFE5' +
              '2349AACCA389302E7A9754BCF1221E79494FC665A401000000DC1E980F123132' +
              '742E647573616E6A702E636F6D7670732E70656572313240746573746E657475' +
              '0000000603000124A1C604DAAB6D23CE19BD00FF272A87382B019ADDEA99193F' +
              '15E469B564608049D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF122' +
              '1E79494FC665A403000000DC1E981B09766D693833313832382E636F6E746162' +
              '6F7365727665722E6E65744D414D4553484942417800000000000000645E2E56' +
              'B5F8680B69BC0255F4930169DBC052BB25F8121055DE2072D37E2C3049D6E1CE' +
              '276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A403000000' +
              'DC1E981B0C3230312D7361692D6475616C2E73796D626F6C746573742E6E6574' +
              '3230312D7361692D6475616C6A00000000000000CBF103D21DD7E0A6130F1145' +
              'C741D83217B3401FD2D045D5095C0BD0F46A223A49D6E1CE276A85B70EAFE523' +
              '49AACCA389302E7A9754BCF1221E79494FC665A403000000DC1E980D0C362E64' +
              '7573616E6A702E636F6D647573616E6A703640736169660000000603000105C1' +
              'A797E5D01255C4FF470FBD0357152DB96CA6AC7E3D557D857E97C8A345D049D6' +
              'E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A40200' +
              '0000DC1E980E0731382E3138332E3234362E3233313035433141373992000000' +
              '06030001098F095690B7207593B97EB2DF103EEE3F74DA32D2637F9521750644' +
              '7F26DA9D49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E7949' +
              '4FC665A407000000DC1E981B26766D693833353930372E636F6E7461626F7365' +
              '727665722E6E65744E656D726973205375706572204E6F646520666F72205465' +
              '73746E65742D566F74696E672D316A00000006030001D1F9B06B72D66098DEFD' +
              '8DCD85DFB1849EC11A059B60441F83F770813483933149D6E1CE276A85B70EAF' +
              'E52349AACCA389302E7A9754BCF1221E79494FC665A406000000DC1E980E0B35' +
              '742E647573616E6A702E636F6D617069766F74696E6740357800000006030001' +
              '07D38BAE29464C1F54CC1C8202DD83B65AF21C8E5FF1FB01ACEEE2243C55EF2A' +
              '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4' +
              '07000000DC1E981B0C3030312D7361692D6475616C2E73796D626F6C74657374' +
              '2E6E65743030312D7361692D6475616C7900000006030001CC1287250B978C06' +
              '38FD0461EB86952BAEAB4F04266A09FDB3D96D5412BD5B5749D6E1CE276A85B7' +
              '0EAFE52349AACCA389302E7A9754BCF1221E79494FC665A403000000DC1E9814' +
              '1473796D626F6C2D617A7572652E303030392E636F73796D626F6C2D617A7572' +
              '652E303030392E636F8000000006030001F6FA5DFC2C94356769AE663CA17873' +
              'A160001323571C297161C55AAE5F90826E49D6E1CE276A85B70EAFE52349AACC' +
              'A389302E7A9754BCF1221E79494FC665A407000000DC1E981B14706571756F64' +
              '2E636F6C612D706F7461746F63686970732E6E65746D79536572766572467269' +
              '656E646C794E616D65',
            'hex',
          ),
        ),
      } as any),
    );
    // テスト実行
    const nodePeers = await sslScoket.getNodePeers('test.symbolnode..com', 7900);
    // 検証
    expect(nodePeers).toEqual([
      {
        version: 16777990,
        publicKey: '06862C55992CAC030606E5B623474F0AC359F2ED05DDD5067403172A2D341F65',
        networkGenerationHashSeed:
          '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
        roles: 3,
        port: 7900,
        networkIdentifier: 152,
        host: '20.48.92.124',
        friendlyName: '06862C5',
      },
      {
        version: 0,
        publicKey: '03A9EF5A45C8D4D059D3E9C95DC5956091E3E855DC812F363DB41D987BF927A6',
        networkGenerationHashSeed:
          '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
        roles: 7,
        port: 7900,
        networkIdentifier: 152,
        host: 'test02.xymnodes.com',
        friendlyName: 'test node02 from xymnodes',
      },
      {
        version: 16777990,
        publicKey: '154A2B669BDE15924FF6FEE9ECB9CDD79EEADA4131665748A12132EAA465E575',
        networkGenerationHashSeed:
          '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
        roles: 7,
        port: 7900,
        networkIdentifier: 152,
        host: 'sym-test-03.opening-line.jp',
        friendlyName: 'sym-test-03.opening-line.jp.',
      },
      {
        version: 16777990,
        publicKey: '100037D00EC47399FF1883A59A9F4808CA37433D7268926F57E3A1ED981427AA',
        networkGenerationHashSeed:
          '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
        roles: 3,
        port: 7900,
        networkIdentifier: 152,
        host: 'testnet.shizuilab.com',
        friendlyName: 'ibone61@shizuilab',
      },
      {
        version: 16777990,
        publicKey: 'AE3C8C118ECB82333BAAFD5BE858176E3C0A497CDA405ACCBA6F737E1C443D2D',
        networkGenerationHashSeed:
          '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
        roles: 2,
        port: 7900,
        networkIdentifier: 152,
        host: '34.84.6.65',
        friendlyName: 'AE3C8C1',
      },
      {
        version: 16777990,
        publicKey: '7BCDB84A784EFC5ACF4E008E7DB4752AD08C22EB73B4C39C86B911D47714B92F',
        networkGenerationHashSeed:
          '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
        roles: 7,
        port: 7900,
        networkIdentifier: 152,
        host: 'test01.xymnodes.com',
        friendlyName: 'test node01 from xymnodes',
      },
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
        version: 16777989,
        publicKey: '53DDCF16CCDFEE630AEE660D42CE42DD86839571148E20A8E6A13E33A505697B',
        networkGenerationHashSeed:
          '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
        roles: 1,
        port: 7900,
        networkIdentifier: 152,
        host: 'nico.fuk',
        friendlyName: 'nico',
      },
      {
        version: 16777990,
        publicKey: '04C8854EF30A510916C4E1C2DBA7B180FC3783040F7FD8F53398104802FD55BB',
        networkGenerationHashSeed:
          '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
        roles: 2,
        port: 7900,
        networkIdentifier: 152,
        host: '35.243.113.177',
        friendlyName: '04C8854',
      },
      {
        version: 16777990,
        publicKey: '4540B7010550CAA12F78DD3466A2645212F705F39E25A2333E9CB12DFF1A91A0',
        networkGenerationHashSeed:
          '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
        roles: 5,
        port: 7900,
        networkIdentifier: 152,
        host: '4t.dusanjp.com',
        friendlyName: 'peervoting@4',
      },
      {
        version: 16777990,
        publicKey: '8A66BDB319C210B5C37C908C5379DB7F98BAC8FCF4FAF2947EE19ACE30E69343',
        networkGenerationHashSeed:
          '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
        roles: 7,
        port: 7900,
        networkIdentifier: 152,
        host: '2.dusanjp.com',
        friendlyName: 'dusanjp2@sai_fakevoting5',
      },
      {
        version: 0,
        publicKey: 'CEAAE51C6D294AEFC1A3C84FEFE9D60B0CE815DBC66567211A41B7DE2DC164B8',
        networkGenerationHashSeed:
          '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
        roles: 7,
        port: 7900,
        networkIdentifier: 152,
        host: 'mikun-testnet.tk',
        friendlyName: 'mikun_test1',
      },
      {
        version: 0,
        publicKey: 'C1773740461C97FF172E966213716E089A93DC43F10BE55DC27CC49CBA67E692',
        networkGenerationHashSeed:
          '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
        roles: 7,
        port: 7900,
        networkIdentifier: 152,
        host: '401-sai-dual.symboltest.net',
        friendlyName: '401-sai-dual',
      },
      {
        version: 16777990,
        publicKey: '00A1D8FBA03297507FFC91EE4D5CE2AA37AFE6512F9C909F3F86F6E1476E9108',
        networkGenerationHashSeed:
          '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
        roles: 1,
        port: 7900,
        networkIdentifier: 152,
        host: '12t.dusanjp.com',
        friendlyName: 'vps.peer12@testnet',
      },
      {
        version: 16777990,
        publicKey: '24A1C604DAAB6D23CE19BD00FF272A87382B019ADDEA99193F15E469B5646080',
        networkGenerationHashSeed:
          '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
        roles: 3,
        port: 7900,
        networkIdentifier: 152,
        host: 'vmi831828.contaboserver.net',
        friendlyName: 'MAMESHIBA',
      },
      {
        version: 0,
        publicKey: '645E2E56B5F8680B69BC0255F4930169DBC052BB25F8121055DE2072D37E2C30',
        networkGenerationHashSeed:
          '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
        roles: 3,
        port: 7900,
        networkIdentifier: 152,
        host: '201-sai-dual.symboltest.net',
        friendlyName: '201-sai-dual',
      },
      {
        version: 0,
        publicKey: 'CBF103D21DD7E0A6130F1145C741D83217B3401FD2D045D5095C0BD0F46A223A',
        networkGenerationHashSeed:
          '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
        roles: 3,
        port: 7900,
        networkIdentifier: 152,
        host: '6.dusanjp.com',
        friendlyName: 'dusanjp6@sai',
      },
      {
        version: 16777990,
        publicKey: '05C1A797E5D01255C4FF470FBD0357152DB96CA6AC7E3D557D857E97C8A345D0',
        networkGenerationHashSeed:
          '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
        roles: 2,
        port: 7900,
        networkIdentifier: 152,
        host: '18.183.246.231',
        friendlyName: '05C1A79',
      },
      {
        version: 16777990,
        publicKey: '098F095690B7207593B97EB2DF103EEE3F74DA32D2637F95217506447F26DA9D',
        networkGenerationHashSeed:
          '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
        roles: 7,
        port: 7900,
        networkIdentifier: 152,
        host: 'vmi835907.contaboserver.net',
        friendlyName: 'Nemris Super Node for Testnet-Voting-1',
      },
      {
        version: 16777990,
        publicKey: 'D1F9B06B72D66098DEFD8DCD85DFB1849EC11A059B60441F83F7708134839331',
        networkGenerationHashSeed:
          '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
        roles: 6,
        port: 7900,
        networkIdentifier: 152,
        host: '5t.dusanjp.com',
        friendlyName: 'apivoting@5',
      },
      {
        version: 16777990,
        publicKey: '07D38BAE29464C1F54CC1C8202DD83B65AF21C8E5FF1FB01ACEEE2243C55EF2A',
        networkGenerationHashSeed:
          '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
        roles: 7,
        port: 7900,
        networkIdentifier: 152,
        host: '001-sai-dual.symboltest.net',
        friendlyName: '001-sai-dual',
      },
      {
        version: 16777990,
        publicKey: 'CC1287250B978C0638FD0461EB86952BAEAB4F04266A09FDB3D96D5412BD5B57',
        networkGenerationHashSeed:
          '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
        roles: 3,
        port: 7900,
        networkIdentifier: 152,
        host: 'symbol-azure.0009.co',
        friendlyName: 'symbol-azure.0009.co',
      },
      {
        version: 16777990,
        publicKey: 'F6FA5DFC2C94356769AE663CA17873A160001323571C297161C55AAE5F90826E',
        networkGenerationHashSeed:
          '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
        roles: 7,
        port: 7900,
        networkIdentifier: 152,
        host: 'pequod.cola-potatochips.net',
        friendlyName: 'myServerFriendlyName',
      },
    ]);
  });

  it('NodePeers取得 Socket通信失敗', async () => {
    // モック
    jest.spyOn(sslScoket as any, 'getSocketData').mockImplementationOnce(() =>
      Promise.reject({
        message: 'unknown error',
      } as any),
    );
    // テスト実行
    const nodePeers = await sslScoket.getNodePeers('test.symbolnode..com', 7900);
    // 検証
    expect(nodePeers).toEqual(undefined);
  });

  it('NodePeers取得 Socket通信データ異常', async () => {
    // モック
    jest.spyOn(sslScoket as any, 'getSocketData').mockImplementationOnce(() =>
      Promise.resolve({
        data: Uint8Array.from(Buffer.from('5498758B7E178A5', 'hex')),
      } as any),
    );
    // テスト実行
    const nodePeers = await sslScoket.getNodePeers('test.symbolnode..com', 7900);
    // 検証
    expect(nodePeers).toEqual(undefined);
  });

  // NodeUnlockedAccount
  // 24CED6631FD3521862FAEC52874C8F86DA49128B02A3C0DB23EFA51AA930A23C24205C6FD90AA0F67D54248B189C1862DA58EFEC0E887A6A5616785486894284C55F8E7EF98E9D3800D1D575B44BCA4F6431E1839F9F2D0F6D26931BA8FAFE5F

  it('NodeUnlockedAccount取得', async () => {
    // モック
    jest.spyOn(sslScoket as any, 'getSocketData').mockImplementationOnce(() =>
      Promise.resolve({
        data: Uint8Array.from(
          Buffer.from(
            '24CED6631FD3521862FAEC52874C8F86DA49128B02A3C0DB23EFA51AA930A23C' +
              '24205C6FD90AA0F67D54248B189C1862DA58EFEC0E887A6A5616785486894284' +
              'C55F8E7EF98E9D3800D1D575B44BCA4F6431E1839F9F2D0F6D26931BA8FAFE5F',
            'hex',
          ),
        ),
      } as any),
    );
    // テスト実行
    const nodeUnlockedAccount = await sslScoket.getNodeUnlockedAccount(
      'test.symbolnode..com',
      7900,
    );
    // 検証
    expect(nodeUnlockedAccount).toEqual({
      unlockedAccount: [
        '24CED6631FD3521862FAEC52874C8F86DA49128B02A3C0DB23EFA51AA930A23C',
        '24205C6FD90AA0F67D54248B189C1862DA58EFEC0E887A6A5616785486894284',
        'C55F8E7EF98E9D3800D1D575B44BCA4F6431E1839F9F2D0F6D26931BA8FAFE5F',
      ],
    });
  });

  it('NodeUnlockedAccount取得 Socket通信失敗', async () => {
    // モック
    jest.spyOn(sslScoket as any, 'getSocketData').mockImplementationOnce(() =>
      Promise.reject({
        message: 'unknown error',
      } as any),
    );
    // テスト実行
    const nodeUnlockedAccount = await sslScoket.getNodeUnlockedAccount(
      'test.symbolnode..com',
      7900,
    );
    // 検証
    expect(nodeUnlockedAccount).toEqual(undefined);
  });

  it('NodeUnlockedAccount取得 Socket通信データ異常', async () => {
    // モック
    jest.spyOn(sslScoket as any, 'getSocketData').mockImplementationOnce(() =>
      Promise.resolve({
        data: Uint8Array.from(
          Buffer.from(
            '24CED6631FD3521862FAEC52874C8F86DA49128B02A3C0DB23EFA51AA930A23C' +
              '24205C6FD90AA0F67D54248B189C1862DA58EFEC0E887A6A5616785486894284' +
              'C55F8E7EF98E9D3800D1D5',
            'hex',
          ),
        ),
      } as any),
    );
    // テスト実行
    const nodeUnlockedAccount = await sslScoket.getNodeUnlockedAccount(
      'test.symbolnode..com',
      7900,
    );
    // 検証
    // 文字列なので例外にならない
    expect(nodeUnlockedAccount).toEqual({
      unlockedAccount: [
        '24CED6631FD3521862FAEC52874C8F86DA49128B02A3C0DB23EFA51AA930A23C',
        '24205C6FD90AA0F67D54248B189C1862DA58EFEC0E887A6A5616785486894284',
        'C55F8E7EF98E9D3800D1D5',
      ],
    });
  });
});
