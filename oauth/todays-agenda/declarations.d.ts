declare module 'http-signature' {
  /** Declaration file generated by dts-gen */

  export function createSigner(options: any): any;

  export function isSigner(obj: any): any;

  export function parse(request: any, options: any): any;

  export function parseRequest(request: any, options: any): any;

  export function pemToRsaSSHKey(pem: any, comment: any): any;

  export function sign(request: any, options: any): any;

  export function signRequest(request: any, options: any): any;

  export function sshKeyFingerprint(key: any): any;

  export function sshKeyToPEM(key: any): any;

  export function verify(parsedSignature: any, pubkey: any): any;

  export function verifyHMAC(parsedSignature: any, secret: any): any;

  export function verifySignature(parsedSignature: any, pubkey: any): any;
}