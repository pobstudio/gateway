import CID from 'cids';

const CIDv0 = 'QmcLhLEWSdiHNPSq6tRzCaB3dUYN7FJSc6Eox5KbZ3LZCF';

const cid = new CID(CIDv0);

console.log(cid.toV1());
