export class NodesFindDto {
  host?: string;
  publicKey?: string;
}

export type NodesFindCondition = {
  'peer.isAvailable'?: boolean;
  'api.isHttpsEnabled'?: boolean;
  'api.txSearchCountPerPage'?: { $gte: number };
  'api.isAvailable'?: boolean;
  'voting.isAvailable'?: boolean;
};
