export class NodesKeyDto {
  host: string;
  publicKey: string;

  constructor(host: string, publicKey: string) {
    this.host = host;
    this.publicKey = publicKey;
  }
}
