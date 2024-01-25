export interface NodePeer {
  version: number;
  publicKey: string;
  networkGenerationHashSeed: string;
  roles: number;
  port: number;
  networkIdentifier: number;
  host: string;
  friendlyName: string;
  nodePublicKey?: string;
}
