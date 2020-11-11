import create from 'zustand';
import produce from 'immer';

export type CollectionMetadata = {
  name: string;
  description: string;
  seoName?: string;
  isLiveCollection?: boolean;
  initialBackgroundHash?: string;
};

export type CollectionMetadataMap = { [id: string]: CollectionMetadata };

export const COLLECTION_METADATA_MAP: CollectionMetadataMap = {
  'test': {
    name: 'Test Collection',
    description: 'test',
  },
  // live in prod
  'home': {
    name: 'Home',
    description: '',
  },
  'account': {
    name: 'Collection',
    description: 'SIZE artworks',
  },
  'latest-minted': {
    name: 'Latest Artworks Minted',
    description: `Proven to be beautiful`,
    initialBackgroundHash:
      '0xd2610b0c4a3e870eca26b075edc0fbd02f737481fb96203b32ad21e71cd63523',
  },
  'uniswap': {
    name: 'Uniswap portraits',
    description: 'P I N K',
    initialBackgroundHash:
      '0x71034ee8951adb7856def61b7a2ce419c3b6489d41cf086dbabde3789e7c4536',
    isLiveCollection: true,
  },
  'gas-station': {
    name: 'Gas Station Artworks',
    description: 'High gas prices have never looked better',
    initialBackgroundHash:
      '0x7bef593b6a7fb9f4bbb21303050c3005a87a427b763267263e700eb105dfb1de',
    isLiveCollection: true,
  },
  'cryptopunk-aliens': {
    name: 'CryptoPunk Alien Mints',
    description: 'The start of something alien...',
    initialBackgroundHash:
      '0x90cd2007ffc1b65aea3f6083b7cbae318a01fdadc87bbafa5673daff8d698682',
    isLiveCollection: false,
  },
};

const INITIAL_COLLECTION_TX_HASHES_MAP: {
  [id: string]: string[];
} = Object.keys(COLLECTION_METADATA_MAP).reduce(
  (a: any, c: any) => ({ ...a, [c]: undefined }),
  {} as any,
);

export const COLLECTION_TX_HASHES_MAP = {
  ...INITIAL_COLLECTION_TX_HASHES_MAP,
  'uniswap': [
    '0x71034ee8951adb7856def61b7a2ce419c3b6489d41cf086dbabde3789e7c4536',
    '0xf1ca0ae3665e7b3b25b735ee63179f8b8264826b40e5ec8865e6b946fc5bea50',
    '0x479cb8c266eeff40200ce93957196300ad052c0ae91445759e458a2f5c2a0cac',
    '0x744c29ef8b3a51797ed61f81237d1e4299aee8101ebe373fc7af8c3f3f1f7717',
  ],
  'cryptopunk-aliens': [
    '0x90cd2007ffc1b65aea3f6083b7cbae318a01fdadc87bbafa5673daff8d698682',
    '0x442d4a85c85ddc1017c9bf0c72c24784fccc69dfac3785e2126961e2f2fd81f9',
    '0xf8d783602dac6c024fa807cd05ff38b8fd96e57804e8fa4cb93ac27c4dfeeb4e',
    '0xa8120de61270bde34e8743298bf26fa88af0847b7c9834ac55bda3af9a9b82ad',
    '0x1b94fd4b2d4fdd4f9d3bbec01bd16437dc60c64a1d9fc452f752cd0e6919f663',
    '0xbdbeffd70460570a3fe7fcc441e2ccace1aa8d61d13a26ed455faf307d83a66f',
    '0x0ddcd60d8955f0d66b3c89f14761f2769bd185d07949ae7838d5d4f10833e5d3',
    '0x156965404ccc76b2d436091cf5730cf34f759c0732cfb57542b645a6237e851c',
    '0x9d4755a3f45bc72e0173e1c668232bd516acc5d9e5fe80e1aca53ba1486e83a7',
  ],
  'test': [
    '0xd2610b0c4a3e870eca26b075edc0fbd02f737481fb96203b32ad21e71cd63523',
    '0x304ddac2188596a085bd71b50494ea83a0f8727161774e63a1e4b46d30744165',
    '0xe4daa77a0de5be96234872cc38fa04682c3d1cc4597e759ca272d12670a991fa',
    '0x8b5f2ad5c596776512c11099d432cd916d036e789918e4fa7d05302125661179',
    '0xba1b526908064ffc014da24d767dbd2aba273e50ce9bc5822ceedb3d9e14cf07',
  ],
  'latest-minted': [
    // All v1 $HASH
    '0x23e3d719fbc025b0a89f20e092214963481802e053b20c54b60b706d3f999268', // 55
    '0x948d5014f89a2215eacfd3e896b73efe134db78c39cadbc131126637716d210f', // 54
    '0xca8f8c315c8b6c48cee0675677b786d1babe726773829a588efa500b71cbdb65', // 53
    '0x2be159ec8b6ef17cb7262e2379efc2d2ad7253cbba0c864189fa6e050418cf94', // 52
    '0xbdab447ba2fd0a493d93635da202ebcfaa309bcc6a22a95d808c93ce8f1c6c2d', // 51
    '0xac139a551bef87eb5a2a43cce659f36830dba7f7f0755e4b6359a9fed2e27482', // 50
    '0x362fd07eb3ee4001cdc92a50027baa2ee424ae93a0978acddf5b6692456538b2', // 49
    '0x559c6389f173736acb90ff6bce72636698cdf7627d62f6b17506f78d00dc3f5b', // 48
    '0xcec1285775fb91ea0d5f32fc4d27fc2f11bc8c8a508cf10b0b0fb34b820b463b', // 47
    '0x84335404c17162119b47fddf56f08e9b1a10a593aa35ad53664a733f935898eb', // 46
    '0x4677a93807b73a0875d3a292eacb450d0af0d6f0eec6f283f8ad927ec539a17b', // 45
    '0x14958e3c5607ef5e97604f79664b2f7c49edbc3753692f52bc926702ccde6c4e', // 44
    '0x14958e3c5607ef5e97604f79664b2f7c49edbc3753692f52bc926702ccde6c4e', // 43
    '0x49dbdf0355bec55f16e211a0b8cfbadc7723b535a025c6c30bda8b62fc1b0996', // 42
    '0xdcc2d338ae2a0154ac0c50b8836fe96e7e8f17a2ccc291dd418467d7022e3aa4', // 41
    '0x9fef127966d59d440c70f28c8e6f1eac3af0d91f94384e207deb3c98ff9c3088', // 40
    '0xfe61b679aeda7a4df824921f54ac9345bdf532f857fc921d84874619b169f588', // 39
    '0xec39476d2cf54b44c43e17070257250dcb369c33941de978b4cbeebe7aa0907c', // 38
    '0x2e34e826d632133dad489233d8c1629511cd29cdbb76279d24e87a91234b4469', // 37
    '0xf7dbf98bcebd7b803917e00e7e3292843a4b7bf66016638811cea4705a32d73e', // 36
    '0x552b743cae11fd5bf9396ce694c198057b1b9887555164583fe4d3b0bae11bf7', // 35
    '0xe17d4d0c4596ea7d5166ad5da600a6fdc49e26e0680135a2f7300eedfd0d8314', // 34
    '0xc6e7b8ebcda23de8fa8a7839845e03b3e5fca1304ca4ea47cfdbbaab17256db2', // 33
    '0x8078261dec1e387d1c43903ab6ac764c83240334a8cc31b3467a4789c74e842a', // 32
    '0xfb610f016e3ddb3c2683a54ffc2bdaf52e3c1b8a9c92673ee4e83d9c3e2a9c44', // 31
    '0x5c9b0f9c6c32d2690771169ec62dd648fef7bce3d45fe8a6505d99fdcbade27a', // 30
    '0xced11523d71c444ce6d4296aaf4be2198d13358dd33925218ba5e49ccee5de43', // 29
    '0xd9b668f2251fd16d5791542653970d4655cf8adb2cb25c7a6c25d39093bfa9d9', // 28
    '0xc215b9356db58ce05412439f49a842f8a3abe6c1792ff8f2c3ee425c3501023c', // 27
    '0x5c504ed432cb51138bcf09aa5e8a410dd4a1e204ef84bfed1be16dfba1b22060', // 26
    '0x0885b9e5184f497595e1ae2652d63dbdb2785de2e498af837d672f5765f28430', // 25
    '0xda4f6670ce8798f8ec58d92dd836302361a57ed666fa3b5e36ed97ef13a8b43b', // 24
    '0xa5c1d4d3503c1783df0eaaa71d9e0734bd262de1ee59f9ea5c99950c3718a5c0', // 23
    '0x495402df7d45fe36329b0bd94487f49baee62026d50f654600f6771bd2a596ab', // 22
    '0xe9ebfecc2fa10100db51a4408d18193b3ac504584b51a4e55bdef1318f0a30f9', // 21
    '0xca8891ce2a6397cdf3479f4306c93556188ae859b9c201b89a38f52660bbd18f', // 20
    '0xe75fb554e433e03763a1560646ee22dcb74e5274b34c5ad644e7c0f619a7e1d0', // 19
    '0x9c81f44c29ff0226f835cd0a8a2f2a7eca6db52a711f8211b566fd15d3e0e8d4', // 18
    '0x0357352473d64df14fb987f33bbc9c3cd317fafe7c9498139c6a0529b551a017', // 17
    '0x9462d061cc6c1b8757dc215946a2f373c24ad63a809d6ce82d50286b1cec1a67', // 16
    '0x4d3be4b45d248a2f456d41452dba99c600ad1a1501dcd494c3fdea7919e910c3', // 15
    '0x45fadd869d45916f80af8ffc9fba29b51b756482f41c47dcbda79fa0ee8a11b9', // 14
    '0x713f63c0cf0bfe9319ef0f4862788670d8c86e2818670dbeac14b74c4372a065', // 13
    '0x649f4a5dd6402a3d6d6f74d6b8aba3e79328237b9004252a8531579964e27320', // 12
    '0xdefd19006fb9e14150ed69272e4e7eeccbb798b6e0052d540e7b14687695f364', // 11
    '0x6d052eb1271cfb3e08f8052c0b136326c925e4cc20cd4141df93a65ad065b162', // 10
    '0x0d007405379f64495eb69c50803a2b4b94dd983d9772e66e7f97c60ee038fcfd', // 9
    '0x0be3761b74b84531b34bf03e20eeaadd4207cf54bcee77ca2809666e646d4507', // 8
    '0x1b6d3cc31110ec6dc949319d3db8dfecd6328d1a16ea9a14eee093d813b9837c', // 7
    '0xfda1581d16fefb467eab15f17a2218e980bde5e28a8f02c0be5cd308dc1044fb', // 6
    '0x3c351cea655b8a50348e6ffa1bfff5b4ce68f99366cfad3d8a02ffb01f63138a', // 5
    '0xd07cbde817318492092cc7a27b3064a69bd893c01cb593d6029683ffd290ab3a', // 4
    '0xb8d81a9e95e0d9f7d705f505b812c8c35d2fbdbce8ed58224781bf0420b555e9', // 3
    '0x2b5d31fd32799027f9826a57be1c1166378864d5b1d337f422f9db5a15a35ff5', // 2
    '0x4b8b3410e43d2bd626c518395fcc6fe017fd35d883f72cb8f772239fead9b1f2', // 1
  ],
};

type State = {
  collectionMetadataMap: CollectionMetadataMap;
  collectionHashOrIdMap: { [id: string]: string[] };
  updateCollectionHashOrIdMap: (updateFn: (update: any) => void) => void;
  updateCollectionMetadataMap: (updateFn: (update: any) => void) => void;
};

export const useCollectionsStore = create<State>((set, get) => ({
  collectionMetadataMap: COLLECTION_METADATA_MAP,
  collectionHashOrIdMap: COLLECTION_TX_HASHES_MAP,
  updateCollectionHashOrIdMap: (updateFn: (update: any) => void) => {
    set(
      produce((update) => {
        updateFn(update.collectionHashOrIdMap);
      }),
    );
  },
  updateCollectionMetadataMap: (updateFn: (update: any) => void) => {
    set(
      produce((update) => {
        updateFn(update.collectionMetadataMap);
      }),
    );
  },
}));
