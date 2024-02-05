import { RestGateway } from '@/util/symboler/RestGateway';
import { ChainInfo } from '@/util/symboler/model/ChainInfo';
import { NetworkProperties } from '@/util/symboler/model/NetworkProperties';
import { NodeInfo } from '@/util/symboler/model/NodeInfo';
import { NodePeer } from '@/util/symboler/model/NodePeer';
import { NodeUnlockedAccount } from '@/util/symboler/model/NodeUnlockedAccount';

describe('RestGateway', () => {
  let restGateway: RestGateway;

  beforeEach(async () => {
    restGateway = new RestGateway(5000);
  });

  it('RestGateway定義の確認', () => {
    expect(restGateway).toBeDefined();
  });

  it('ChainInfo取得(トライHTTPs)', async () => {
    // モック
    jest.spyOn(restGateway as any, 'requestRestGateway').mockImplementationOnce(() =>
      Promise.resolve({
        height: 1154452n,
        scoreHigh: 0n,
        scoreLow: 11936968191051193471n,
        latestFinalizedBlock: {
          finalizationEpoch: 1605,
          finalizationPoint: 20,
          height: 1154436n,
          hash: '7ECA3E53637E82A2BE58F1E8A52D07E238EEC30F7B84B7738426230B36B5BBC6',
        },
      } as ChainInfo),
    );
    // テスト実行
    const chainInfo = await restGateway.tryHttpsChainInfo('test.symbolnode..com');
    // 検証
    expect(chainInfo).toEqual({
      height: 1154452n,
      scoreHigh: 0n,
      scoreLow: 11936968191051193471n,
      latestFinalizedBlock: {
        finalizationEpoch: 1605,
        finalizationPoint: 20,
        height: 1154436n,
        hash: '7ECA3E53637E82A2BE58F1E8A52D07E238EEC30F7B84B7738426230B36B5BBC6',
      },
    });
  });

  it('ChainInfo取得(トライHTTPs) HTTPs失敗', async () => {
    // モック
    jest
      .spyOn(restGateway as any, 'requestRestGateway')
      .mockImplementationOnce(() => Promise.reject())
      .mockImplementationOnce(() =>
        Promise.resolve({
          height: 1154452n,
          scoreHigh: 0n,
          scoreLow: 11936968191051193471n,
          latestFinalizedBlock: {
            finalizationEpoch: 1605,
            finalizationPoint: 20,
            height: 1154436n,
            hash: '7ECA3E53637E82A2BE58F1E8A52D07E238EEC30F7B84B7738426230B36B5BBC6',
          },
        } as ChainInfo),
      );
    // テスト実行
    const chainInfo = await restGateway.tryHttpsChainInfo('test.symbolnode..com');
    // 検証
    expect(chainInfo).toEqual({
      height: 1154452n,
      scoreHigh: 0n,
      scoreLow: 11936968191051193471n,
      latestFinalizedBlock: {
        finalizationEpoch: 1605,
        finalizationPoint: 20,
        height: 1154436n,
        hash: '7ECA3E53637E82A2BE58F1E8A52D07E238EEC30F7B84B7738426230B36B5BBC6',
      },
    });
  });

  it('ChainInfo取得(トライHTTPs) HTTP失敗', async () => {
    // モック
    jest
      .spyOn(restGateway as any, 'requestRestGateway')
      .mockImplementationOnce(() => Promise.reject())
      .mockImplementationOnce(() => Promise.reject());
    // テスト実行
    const chainInfo = await restGateway.tryHttpsChainInfo('test.symbolnode..com');
    // 検証
    expect(chainInfo).toEqual(undefined);
  });

  it('NodeInfo取得(トライHTTPs)', async () => {
    // モック
    jest.spyOn(restGateway as any, 'requestRestGateway').mockImplementationOnce(() =>
      Promise.resolve({
        version: 16777990,
        publicKey: '7587ECE8D3FA11A075E533E83F2F1CC8E09F7D2E1D1BD547A44AC5D4D4C78242',
        networkGenerationHashSeed:
          '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
        roles: 1,
        port: 7900,
        networkIdentifier: 152,
        host: 'test.symbolnode..com',
        friendlyName: '_Symbol_TestNet_HarvestasyaNode02/.',
        nodePublicKey: '5CFF56769EABA56315233552C849BA9FF6A72130F6AF802996C2EB0EA05AAD6F',
      } as NodeInfo),
    );
    // テスト実行
    const nodeInfo = await restGateway.tryHttpsNodeInfo('test.symbolnode..com');
    // 検証
    expect(nodeInfo).toEqual({
      version: 16777990,
      publicKey: '7587ECE8D3FA11A075E533E83F2F1CC8E09F7D2E1D1BD547A44AC5D4D4C78242',
      networkGenerationHashSeed: '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
      roles: 1,
      port: 7900,
      networkIdentifier: 152,
      host: 'test.symbolnode..com',
      friendlyName: '_Symbol_TestNet_HarvestasyaNode02/.',
      nodePublicKey: '5CFF56769EABA56315233552C849BA9FF6A72130F6AF802996C2EB0EA05AAD6F',
      isHttpsEnabled: true,
    });
  });

  it('NodeInfo取得(トライHTTPs) HTTPs失敗', async () => {
    // モック
    jest
      .spyOn(restGateway as any, 'requestRestGateway')
      .mockImplementationOnce(() => Promise.reject())
      .mockImplementationOnce(() =>
        Promise.resolve({
          version: 16777990,
          publicKey: '7587ECE8D3FA11A075E533E83F2F1CC8E09F7D2E1D1BD547A44AC5D4D4C78242',
          networkGenerationHashSeed:
            '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
          roles: 1,
          port: 7900,
          networkIdentifier: 152,
          host: 'test.symbolnode..com',
          friendlyName: '_Symbol_TestNet_HarvestasyaNode02/.',
          nodePublicKey: '5CFF56769EABA56315233552C849BA9FF6A72130F6AF802996C2EB0EA05AAD6F',
        } as NodeInfo),
      );
    // テスト実行
    const nodeInfo = await restGateway.tryHttpsNodeInfo('test.symbolnode..com');
    // 検証
    expect(nodeInfo).toEqual({
      version: 16777990,
      publicKey: '7587ECE8D3FA11A075E533E83F2F1CC8E09F7D2E1D1BD547A44AC5D4D4C78242',
      networkGenerationHashSeed: '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
      roles: 1,
      port: 7900,
      networkIdentifier: 152,
      host: 'test.symbolnode..com',
      friendlyName: '_Symbol_TestNet_HarvestasyaNode02/.',
      nodePublicKey: '5CFF56769EABA56315233552C849BA9FF6A72130F6AF802996C2EB0EA05AAD6F',
      isHttpsEnabled: false,
    });
  });

  it('NodeInfo取得(トライHTTPs) HTTP失敗', async () => {
    // モック
    jest
      .spyOn(restGateway as any, 'requestRestGateway')
      .mockImplementationOnce(() => Promise.reject())
      .mockImplementationOnce(() => Promise.reject());
    // テスト実行
    const nodeInfo = await restGateway.tryHttpsNodeInfo('test.symbolnode..com');
    // 検証
    expect(nodeInfo).toEqual(undefined);
  });

  it('NodePeers取得(トライHTTPs)', async () => {
    // モック
    jest.spyOn(restGateway as any, 'requestRestGateway').mockImplementationOnce(() =>
      Promise.resolve([
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
          publicKey: '100037D00EC47399FF1883A59A9F4808CA37433D7268926F57E3A1ED981427AA',
          networkGenerationHashSeed:
            '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
          roles: 3,
          port: 7900,
          networkIdentifier: 152,
          host: 'testnet.shizuilab.com',
          friendlyName: 'ibone61@shizuilab',
        },
      ] as NodePeer[]),
    );
    // テスト実行
    const nodePeers = await restGateway.tryHttpsNodePeers('test.symbolnode..com');
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
        publicKey: '100037D00EC47399FF1883A59A9F4808CA37433D7268926F57E3A1ED981427AA',
        networkGenerationHashSeed:
          '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
        roles: 3,
        port: 7900,
        networkIdentifier: 152,
        host: 'testnet.shizuilab.com',
        friendlyName: 'ibone61@shizuilab',
      },
    ] as NodePeer[]);
  });

  it('NodePeers取得(トライHTTPs) HTTPs失敗', async () => {
    // モック
    jest
      .spyOn(restGateway as any, 'requestRestGateway')
      .mockImplementationOnce(() => Promise.reject())
      .mockImplementationOnce(() =>
        Promise.resolve([
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
            publicKey: '100037D00EC47399FF1883A59A9F4808CA37433D7268926F57E3A1ED981427AA',
            networkGenerationHashSeed:
              '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
            roles: 3,
            port: 7900,
            networkIdentifier: 152,
            host: 'testnet.shizuilab.com',
            friendlyName: 'ibone61@shizuilab',
          },
        ] as NodePeer[]),
      );
    // テスト実行
    const nodePeers = await restGateway.tryHttpsNodePeers('test.symbolnode..com');
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
        publicKey: '100037D00EC47399FF1883A59A9F4808CA37433D7268926F57E3A1ED981427AA',
        networkGenerationHashSeed:
          '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
        roles: 3,
        port: 7900,
        networkIdentifier: 152,
        host: 'testnet.shizuilab.com',
        friendlyName: 'ibone61@shizuilab',
      },
    ] as NodePeer[]);
  });

  it('NodePeers取得(トライHTTPs) HTTP失敗', async () => {
    // モック
    jest
      .spyOn(restGateway as any, 'requestRestGateway')
      .mockImplementationOnce(() => Promise.reject())
      .mockImplementationOnce(() => Promise.reject());
    // テスト実行
    const nodePeers = await restGateway.tryHttpsNodePeers('test.symbolnode..com');
    // 検証
    expect(nodePeers).toEqual(undefined);
  });

  it('NodeUnlockedAccount取得(トライHTTPs)', async () => {
    // モック
    jest.spyOn(restGateway as any, 'requestRestGateway').mockImplementationOnce(() =>
      Promise.resolve({
        unlockedAccount: [
          '24CED6631FD3521862FAEC52874C8F86DA49128B02A3C0DB23EFA51AA930A23C',
          '24205C6FD90AA0F67D54248B189C1862DA58EFEC0E887A6A5616785486894284',
          'C55F8E7EF98E9D3800D1D575B44BCA4F6431E1839F9F2D0F6D26931BA8FAFE5F',
        ],
      } as NodeUnlockedAccount),
    );
    // テスト実行
    const nodeUnlockedAccount =
      await restGateway.tryHttpsNodeUnlockedAccount('test.symbolnode..com');
    // 検証
    expect(nodeUnlockedAccount).toEqual({
      unlockedAccount: [
        '24CED6631FD3521862FAEC52874C8F86DA49128B02A3C0DB23EFA51AA930A23C',
        '24205C6FD90AA0F67D54248B189C1862DA58EFEC0E887A6A5616785486894284',
        'C55F8E7EF98E9D3800D1D575B44BCA4F6431E1839F9F2D0F6D26931BA8FAFE5F',
      ],
    });
  });

  it('NodeUnlockedAccount取得(トライHTTPs) HTTPs失敗', async () => {
    // モック
    jest
      .spyOn(restGateway as any, 'requestRestGateway')
      .mockImplementationOnce(() => Promise.reject())
      .mockImplementationOnce(() =>
        Promise.resolve({
          unlockedAccount: [
            '24CED6631FD3521862FAEC52874C8F86DA49128B02A3C0DB23EFA51AA930A23C',
            '24205C6FD90AA0F67D54248B189C1862DA58EFEC0E887A6A5616785486894284',
            'C55F8E7EF98E9D3800D1D575B44BCA4F6431E1839F9F2D0F6D26931BA8FAFE5F',
          ],
        } as NodeUnlockedAccount),
      );
    // テスト実行
    const nodeUnlockedAccount =
      await restGateway.tryHttpsNodeUnlockedAccount('test.symbolnode..com');
    // 検証
    expect(nodeUnlockedAccount).toEqual({
      unlockedAccount: [
        '24CED6631FD3521862FAEC52874C8F86DA49128B02A3C0DB23EFA51AA930A23C',
        '24205C6FD90AA0F67D54248B189C1862DA58EFEC0E887A6A5616785486894284',
        'C55F8E7EF98E9D3800D1D575B44BCA4F6431E1839F9F2D0F6D26931BA8FAFE5F',
      ],
    });
  });

  it('NodeUnlockedAccount取得(トライHTTPs) HTTP失敗', async () => {
    // モック
    jest
      .spyOn(restGateway as any, 'requestRestGateway')
      .mockImplementationOnce(() => Promise.reject())
      .mockImplementationOnce(() => Promise.reject());
    // テスト実行
    const nodeUnlockedAccount =
      await restGateway.tryHttpsNodeUnlockedAccount('test.symbolnode..com');
    // 検証
    expect(nodeUnlockedAccount).toEqual(undefined);
  });

  it('NetworkProperties取得(トライHTTPs)', async () => {
    // モック
    jest.spyOn(restGateway as any, 'requestRestGateway').mockImplementationOnce(() =>
      Promise.resolve({
        network: {
          identifier: 'testnet',
          nemesisSignerPublicKey:
            '76E94661562762111FF7E592B00398554973396D8A4B922F3E3D139892F7C35C',
          nodeEqualityStrategy: 'host',
          generationHashSeed: '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
          epochAdjustment: '1667250467s',
        },
        chain: {
          enableVerifiableState: true,
          enableVerifiableReceipts: true,
          currencyMosaicId: "0x72C0'212E'67A0'8BCE",
          harvestingMosaicId: "0x72C0'212E'67A0'8BCE",
          blockGenerationTargetTime: '30s',
          blockTimeSmoothingFactor: '3000',
          importanceGrouping: '180',
          importanceActivityPercentage: '5',
          maxRollbackBlocks: '0',
          maxDifficultyBlocks: '60',
          defaultDynamicFeeMultiplier: '100',
          maxTransactionLifetime: '6h',
          maxBlockFutureTime: '300ms',
          initialCurrencyAtomicUnits: "7'842'928'625'000'000",
          maxMosaicAtomicUnits: "8'999'999'999'000'000",
          totalChainImportance: "7'842'928'625'000'000",
          minHarvesterBalance: "10'000'000'000",
          maxHarvesterBalance: "50'000'000'000'000",
          minVoterBalance: "3'000'000'000'000",
          votingSetGrouping: '720',
          maxVotingKeysPerAccount: '3',
          minVotingKeyLifetime: '28',
          maxVotingKeyLifetime: '720',
          harvestBeneficiaryPercentage: '25',
          harvestNetworkPercentage: '5',
          harvestNetworkFeeSinkAddressV1: 'TBC3AX4TMSYWTCWR6LDHPKWQQL7KPCOMHECN2II',
          harvestNetworkFeeSinkAddress: 'TBC3AX4TMSYWTCWR6LDHPKWQQL7KPCOMHECN2II',
          maxTransactionsPerBlock: "6'000",
        },
        plugins: {
          accountlink: {
            dummy: 'to trigger plugin load',
          },
          aggregate: {
            maxTransactionsPerAggregate: '100',
            maxCosignaturesPerAggregate: '25',
            enableStrictCosignatureCheck: false,
            enableBondedAggregateSupport: true,
            maxBondedTransactionLifetime: '48h',
          },
          lockhash: {
            lockedFundsPerAggregate: "10'000'000",
            maxHashLockDuration: '2d',
          },
          locksecret: {
            maxSecretLockDuration: '365d',
            minProofSize: '0',
            maxProofSize: '1024',
          },
          metadata: {
            maxValueSize: '1024',
          },
          mosaic: {
            maxMosaicsPerAccount: "1'000",
            maxMosaicDuration: '3650d',
            maxMosaicDivisibility: '6',
            mosaicRentalFeeSinkAddressV1: 'TA53AVLYMT5HCP5TJ23CGKGTUXQHNPBTJ4Z2LIQ',
            mosaicRentalFeeSinkAddress: 'TA53AVLYMT5HCP5TJ23CGKGTUXQHNPBTJ4Z2LIQ',
            mosaicRentalFee: '500000',
          },
          multisig: {
            maxMultisigDepth: '3',
            maxCosignatoriesPerAccount: '25',
            maxCosignedAccountsPerAccount: '25',
          },
          namespace: {
            maxNameSize: '64',
            maxChildNamespaces: '100',
            maxNamespaceDepth: '3',
            minNamespaceDuration: '30d',
            maxNamespaceDuration: '1825d',
            namespaceGracePeriodDuration: '1d',
            reservedRootNamespaceNames:
              'symbol, symbl, xym, xem, nem, user, account, org, com, biz, net, edu, mil, gov, info',
            namespaceRentalFeeSinkAddressV1: 'TDVFW6NZN3YI6O4ZRYZHGY73KADCW4HX6IDIKZI',
            namespaceRentalFeeSinkAddress: 'TDVFW6NZN3YI6O4ZRYZHGY73KADCW4HX6IDIKZI',
            rootNamespaceRentalFeePerBlock: '2',
            childNamespaceRentalFee: '100000',
          },
          restrictionaccount: {
            maxAccountRestrictionValues: '100',
          },
          restrictionmosaic: {
            maxMosaicRestrictionValues: '20',
          },
          transfer: {
            maxMessageSize: '1024',
          },
        },
        forkHeights: {
          totalVotingBalanceCalculationFix: '0',
          treasuryReissuance: '0',
          strictAggregateTransactionHash: '0',
        },
      } as NetworkProperties),
    );
    // テスト実行
    const networkProperties = await restGateway.tryHttpsNetworkProperties('test.symbolnode..com');
    // 検証
    expect(networkProperties).toEqual({
      network: {
        identifier: 'testnet',
        nemesisSignerPublicKey: '76E94661562762111FF7E592B00398554973396D8A4B922F3E3D139892F7C35C',
        nodeEqualityStrategy: 'host',
        generationHashSeed: '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
        epochAdjustment: '1667250467s',
      },
      chain: {
        enableVerifiableState: true,
        enableVerifiableReceipts: true,
        currencyMosaicId: "0x72C0'212E'67A0'8BCE",
        harvestingMosaicId: "0x72C0'212E'67A0'8BCE",
        blockGenerationTargetTime: '30s',
        blockTimeSmoothingFactor: '3000',
        importanceGrouping: '180',
        importanceActivityPercentage: '5',
        maxRollbackBlocks: '0',
        maxDifficultyBlocks: '60',
        defaultDynamicFeeMultiplier: '100',
        maxTransactionLifetime: '6h',
        maxBlockFutureTime: '300ms',
        initialCurrencyAtomicUnits: "7'842'928'625'000'000",
        maxMosaicAtomicUnits: "8'999'999'999'000'000",
        totalChainImportance: "7'842'928'625'000'000",
        minHarvesterBalance: "10'000'000'000",
        maxHarvesterBalance: "50'000'000'000'000",
        minVoterBalance: "3'000'000'000'000",
        votingSetGrouping: '720',
        maxVotingKeysPerAccount: '3',
        minVotingKeyLifetime: '28',
        maxVotingKeyLifetime: '720',
        harvestBeneficiaryPercentage: '25',
        harvestNetworkPercentage: '5',
        harvestNetworkFeeSinkAddressV1: 'TBC3AX4TMSYWTCWR6LDHPKWQQL7KPCOMHECN2II',
        harvestNetworkFeeSinkAddress: 'TBC3AX4TMSYWTCWR6LDHPKWQQL7KPCOMHECN2II',
        maxTransactionsPerBlock: "6'000",
      },
      plugins: {
        accountlink: {
          dummy: 'to trigger plugin load',
        },
        aggregate: {
          maxTransactionsPerAggregate: '100',
          maxCosignaturesPerAggregate: '25',
          enableStrictCosignatureCheck: false,
          enableBondedAggregateSupport: true,
          maxBondedTransactionLifetime: '48h',
        },
        lockhash: {
          lockedFundsPerAggregate: "10'000'000",
          maxHashLockDuration: '2d',
        },
        locksecret: {
          maxSecretLockDuration: '365d',
          minProofSize: '0',
          maxProofSize: '1024',
        },
        metadata: {
          maxValueSize: '1024',
        },
        mosaic: {
          maxMosaicsPerAccount: "1'000",
          maxMosaicDuration: '3650d',
          maxMosaicDivisibility: '6',
          mosaicRentalFeeSinkAddressV1: 'TA53AVLYMT5HCP5TJ23CGKGTUXQHNPBTJ4Z2LIQ',
          mosaicRentalFeeSinkAddress: 'TA53AVLYMT5HCP5TJ23CGKGTUXQHNPBTJ4Z2LIQ',
          mosaicRentalFee: '500000',
        },
        multisig: {
          maxMultisigDepth: '3',
          maxCosignatoriesPerAccount: '25',
          maxCosignedAccountsPerAccount: '25',
        },
        namespace: {
          maxNameSize: '64',
          maxChildNamespaces: '100',
          maxNamespaceDepth: '3',
          minNamespaceDuration: '30d',
          maxNamespaceDuration: '1825d',
          namespaceGracePeriodDuration: '1d',
          reservedRootNamespaceNames:
            'symbol, symbl, xym, xem, nem, user, account, org, com, biz, net, edu, mil, gov, info',
          namespaceRentalFeeSinkAddressV1: 'TDVFW6NZN3YI6O4ZRYZHGY73KADCW4HX6IDIKZI',
          namespaceRentalFeeSinkAddress: 'TDVFW6NZN3YI6O4ZRYZHGY73KADCW4HX6IDIKZI',
          rootNamespaceRentalFeePerBlock: '2',
          childNamespaceRentalFee: '100000',
        },
        restrictionaccount: {
          maxAccountRestrictionValues: '100',
        },
        restrictionmosaic: {
          maxMosaicRestrictionValues: '20',
        },
        transfer: {
          maxMessageSize: '1024',
        },
      },
      forkHeights: {
        totalVotingBalanceCalculationFix: '0',
        treasuryReissuance: '0',
        strictAggregateTransactionHash: '0',
      },
    });
  });

  it('NetworkProperties取得(トライHTTPs) HTTPs失敗', async () => {
    // モック
    jest
      .spyOn(restGateway as any, 'requestRestGateway')
      .mockImplementationOnce(() => Promise.reject())
      .mockImplementationOnce(() =>
        Promise.resolve({
          network: {
            identifier: 'testnet',
            nemesisSignerPublicKey:
              '76E94661562762111FF7E592B00398554973396D8A4B922F3E3D139892F7C35C',
            nodeEqualityStrategy: 'host',
            generationHashSeed: '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
            epochAdjustment: '1667250467s',
          },
          chain: {
            enableVerifiableState: true,
            enableVerifiableReceipts: true,
            currencyMosaicId: "0x72C0'212E'67A0'8BCE",
            harvestingMosaicId: "0x72C0'212E'67A0'8BCE",
            blockGenerationTargetTime: '30s',
            blockTimeSmoothingFactor: '3000',
            importanceGrouping: '180',
            importanceActivityPercentage: '5',
            maxRollbackBlocks: '0',
            maxDifficultyBlocks: '60',
            defaultDynamicFeeMultiplier: '100',
            maxTransactionLifetime: '6h',
            maxBlockFutureTime: '300ms',
            initialCurrencyAtomicUnits: "7'842'928'625'000'000",
            maxMosaicAtomicUnits: "8'999'999'999'000'000",
            totalChainImportance: "7'842'928'625'000'000",
            minHarvesterBalance: "10'000'000'000",
            maxHarvesterBalance: "50'000'000'000'000",
            minVoterBalance: "3'000'000'000'000",
            votingSetGrouping: '720',
            maxVotingKeysPerAccount: '3',
            minVotingKeyLifetime: '28',
            maxVotingKeyLifetime: '720',
            harvestBeneficiaryPercentage: '25',
            harvestNetworkPercentage: '5',
            harvestNetworkFeeSinkAddressV1: 'TBC3AX4TMSYWTCWR6LDHPKWQQL7KPCOMHECN2II',
            harvestNetworkFeeSinkAddress: 'TBC3AX4TMSYWTCWR6LDHPKWQQL7KPCOMHECN2II',
            maxTransactionsPerBlock: "6'000",
          },
          plugins: {
            accountlink: {
              dummy: 'to trigger plugin load',
            },
            aggregate: {
              maxTransactionsPerAggregate: '100',
              maxCosignaturesPerAggregate: '25',
              enableStrictCosignatureCheck: false,
              enableBondedAggregateSupport: true,
              maxBondedTransactionLifetime: '48h',
            },
            lockhash: {
              lockedFundsPerAggregate: "10'000'000",
              maxHashLockDuration: '2d',
            },
            locksecret: {
              maxSecretLockDuration: '365d',
              minProofSize: '0',
              maxProofSize: '1024',
            },
            metadata: {
              maxValueSize: '1024',
            },
            mosaic: {
              maxMosaicsPerAccount: "1'000",
              maxMosaicDuration: '3650d',
              maxMosaicDivisibility: '6',
              mosaicRentalFeeSinkAddressV1: 'TA53AVLYMT5HCP5TJ23CGKGTUXQHNPBTJ4Z2LIQ',
              mosaicRentalFeeSinkAddress: 'TA53AVLYMT5HCP5TJ23CGKGTUXQHNPBTJ4Z2LIQ',
              mosaicRentalFee: '500000',
            },
            multisig: {
              maxMultisigDepth: '3',
              maxCosignatoriesPerAccount: '25',
              maxCosignedAccountsPerAccount: '25',
            },
            namespace: {
              maxNameSize: '64',
              maxChildNamespaces: '100',
              maxNamespaceDepth: '3',
              minNamespaceDuration: '30d',
              maxNamespaceDuration: '1825d',
              namespaceGracePeriodDuration: '1d',
              reservedRootNamespaceNames:
                'symbol, symbl, xym, xem, nem, user, account, org, com, biz, net, edu, mil, gov, info',
              namespaceRentalFeeSinkAddressV1: 'TDVFW6NZN3YI6O4ZRYZHGY73KADCW4HX6IDIKZI',
              namespaceRentalFeeSinkAddress: 'TDVFW6NZN3YI6O4ZRYZHGY73KADCW4HX6IDIKZI',
              rootNamespaceRentalFeePerBlock: '2',
              childNamespaceRentalFee: '100000',
            },
            restrictionaccount: {
              maxAccountRestrictionValues: '100',
            },
            restrictionmosaic: {
              maxMosaicRestrictionValues: '20',
            },
            transfer: {
              maxMessageSize: '1024',
            },
          },
          forkHeights: {
            totalVotingBalanceCalculationFix: '0',
            treasuryReissuance: '0',
            strictAggregateTransactionHash: '0',
          },
        } as NetworkProperties),
      );
    // テスト実行
    const networkProperties = await restGateway.tryHttpsNetworkProperties('test.symbolnode..com');
    // 検証
    expect(networkProperties).toEqual({
      network: {
        identifier: 'testnet',
        nemesisSignerPublicKey: '76E94661562762111FF7E592B00398554973396D8A4B922F3E3D139892F7C35C',
        nodeEqualityStrategy: 'host',
        generationHashSeed: '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
        epochAdjustment: '1667250467s',
      },
      chain: {
        enableVerifiableState: true,
        enableVerifiableReceipts: true,
        currencyMosaicId: "0x72C0'212E'67A0'8BCE",
        harvestingMosaicId: "0x72C0'212E'67A0'8BCE",
        blockGenerationTargetTime: '30s',
        blockTimeSmoothingFactor: '3000',
        importanceGrouping: '180',
        importanceActivityPercentage: '5',
        maxRollbackBlocks: '0',
        maxDifficultyBlocks: '60',
        defaultDynamicFeeMultiplier: '100',
        maxTransactionLifetime: '6h',
        maxBlockFutureTime: '300ms',
        initialCurrencyAtomicUnits: "7'842'928'625'000'000",
        maxMosaicAtomicUnits: "8'999'999'999'000'000",
        totalChainImportance: "7'842'928'625'000'000",
        minHarvesterBalance: "10'000'000'000",
        maxHarvesterBalance: "50'000'000'000'000",
        minVoterBalance: "3'000'000'000'000",
        votingSetGrouping: '720',
        maxVotingKeysPerAccount: '3',
        minVotingKeyLifetime: '28',
        maxVotingKeyLifetime: '720',
        harvestBeneficiaryPercentage: '25',
        harvestNetworkPercentage: '5',
        harvestNetworkFeeSinkAddressV1: 'TBC3AX4TMSYWTCWR6LDHPKWQQL7KPCOMHECN2II',
        harvestNetworkFeeSinkAddress: 'TBC3AX4TMSYWTCWR6LDHPKWQQL7KPCOMHECN2II',
        maxTransactionsPerBlock: "6'000",
      },
      plugins: {
        accountlink: {
          dummy: 'to trigger plugin load',
        },
        aggregate: {
          maxTransactionsPerAggregate: '100',
          maxCosignaturesPerAggregate: '25',
          enableStrictCosignatureCheck: false,
          enableBondedAggregateSupport: true,
          maxBondedTransactionLifetime: '48h',
        },
        lockhash: {
          lockedFundsPerAggregate: "10'000'000",
          maxHashLockDuration: '2d',
        },
        locksecret: {
          maxSecretLockDuration: '365d',
          minProofSize: '0',
          maxProofSize: '1024',
        },
        metadata: {
          maxValueSize: '1024',
        },
        mosaic: {
          maxMosaicsPerAccount: "1'000",
          maxMosaicDuration: '3650d',
          maxMosaicDivisibility: '6',
          mosaicRentalFeeSinkAddressV1: 'TA53AVLYMT5HCP5TJ23CGKGTUXQHNPBTJ4Z2LIQ',
          mosaicRentalFeeSinkAddress: 'TA53AVLYMT5HCP5TJ23CGKGTUXQHNPBTJ4Z2LIQ',
          mosaicRentalFee: '500000',
        },
        multisig: {
          maxMultisigDepth: '3',
          maxCosignatoriesPerAccount: '25',
          maxCosignedAccountsPerAccount: '25',
        },
        namespace: {
          maxNameSize: '64',
          maxChildNamespaces: '100',
          maxNamespaceDepth: '3',
          minNamespaceDuration: '30d',
          maxNamespaceDuration: '1825d',
          namespaceGracePeriodDuration: '1d',
          reservedRootNamespaceNames:
            'symbol, symbl, xym, xem, nem, user, account, org, com, biz, net, edu, mil, gov, info',
          namespaceRentalFeeSinkAddressV1: 'TDVFW6NZN3YI6O4ZRYZHGY73KADCW4HX6IDIKZI',
          namespaceRentalFeeSinkAddress: 'TDVFW6NZN3YI6O4ZRYZHGY73KADCW4HX6IDIKZI',
          rootNamespaceRentalFeePerBlock: '2',
          childNamespaceRentalFee: '100000',
        },
        restrictionaccount: {
          maxAccountRestrictionValues: '100',
        },
        restrictionmosaic: {
          maxMosaicRestrictionValues: '20',
        },
        transfer: {
          maxMessageSize: '1024',
        },
      },
      forkHeights: {
        totalVotingBalanceCalculationFix: '0',
        treasuryReissuance: '0',
        strictAggregateTransactionHash: '0',
      },
    });
  });

  it('NetworkProperties取得(トライHTTPs) HTTP失敗', async () => {
    // モック
    jest
      .spyOn(restGateway as any, 'requestRestGateway')
      .mockImplementationOnce(() => Promise.reject())
      .mockImplementationOnce(() => Promise.reject());
    // テスト実行
    const networkProperties = await restGateway.tryHttpsNetworkProperties('test.symbolnode..com');
    // 検証
    expect(networkProperties).toEqual(undefined);
  });

  it('NetworkProperties死活 HTTPs', async () => {
    // モック
    jest.spyOn(restGateway as any, 'requestRestGateway').mockImplementationOnce(() =>
      Promise.resolve({
        network: {
          identifier: 'testnet',
          nemesisSignerPublicKey:
            '76E94661562762111FF7E592B00398554973396D8A4B922F3E3D139892F7C35C',
          nodeEqualityStrategy: 'host',
          generationHashSeed: '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
          epochAdjustment: '1667250467s',
        },
      }),
    );
    // テスト実行
    const networkProperties =
      await restGateway.isAvailableNetworkProperties('test.symbolnode..com');
    // 検証
    expect(networkProperties).toEqual(true);
  });

  it('NetworkProperties死活 HTTPs失敗', async () => {
    // モック
    jest
      .spyOn(restGateway as any, 'requestRestGateway')
      .mockImplementationOnce(() => Promise.reject())
      .mockImplementationOnce(() =>
        Promise.resolve({
          network: {
            identifier: 'testnet',
            nemesisSignerPublicKey:
              '76E94661562762111FF7E592B00398554973396D8A4B922F3E3D139892F7C35C',
            nodeEqualityStrategy: 'host',
            generationHashSeed: '49D6E1CE276A85B70EAFE52349AACCA389302E7A9754BCF1221E79494FC665A4',
            epochAdjustment: '1667250467s',
          },
        }),
      );
    // テスト実行
    const networkProperties =
      await restGateway.isAvailableNetworkProperties('test.symbolnode..com');
    // 検証
    expect(networkProperties).toEqual(true);
  });

  it('NetworkProperties死活 HTTP失敗', async () => {
    // モック
    jest
      .spyOn(restGateway as any, 'requestRestGateway')
      .mockImplementationOnce(() => Promise.reject())
      .mockImplementationOnce(() => Promise.reject());
    // テスト実行
    const networkProperties =
      await restGateway.isAvailableNetworkProperties('test.symbolnode..com');
    // 検証
    expect(networkProperties).toEqual(false);
  });
});
