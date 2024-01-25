export class PeerCreateDto {
  host: string;
  publicKey: string;
  port: number;
  friendlyName: string;
  version: number;
  networkGenerationHashSeed: string;
  roles: number;
  networkIdentifier: number;
  isAvailable: boolean;
  isHttpsEnabled: boolean;
  chainHeight?: bigint;
  finalization?: {
    height: bigint;
    epoch: number;
    point: number;
    hash: string;
  };
}
