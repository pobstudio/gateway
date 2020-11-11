import CID from 'cids';

const CIDv0 = 'QmSE1Z8RRU2P1RYFRSJ87Y1ZP9PMgR1RVjEaAbKBbErW32';

const cid = new CID(CIDv0);

console.log(cid.toV1());
