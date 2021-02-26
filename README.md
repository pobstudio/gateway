<img src="./images/banner.png" >

---

The open-source IPFS gateway of the POB project. Designed to minimally rely on external services. View your artworks forever.

## Philosophy

POB artworks are not stored in a decentralized network, however, the means to create a POB artwork is. The generative algorithmn is stored on-chain and open-sourced and all the metadata to create a POB artwork is stored on the blockchain in the transaction metadata.

In a roundabout way, your artworks are decentralized.

## Useful links

Current IPFS hash and gateway:

CIDv0:
`QmcLhLEWSdiHNPSq6tRzCaB3dUYN7FJSc6Eox5KbZ3LZCF`

CIDV1:
`bafybeigqa2kstuhkvfzonokpxwh65f2bmhkyxux2lqhzbagdv3um7dmbuq`

Due to the routing architecture of next.js, the base path needs to be the root.

Gateway:

[https://bafybeigqa2kstuhkvfzonokpxwh65f2bmhkyxux2lqhzbagdv3um7dmbuq.ipfs.dweb.link/](https://bafybeigqa2kstuhkvfzonokpxwh65f2bmhkyxux2lqhzbagdv3um7dmbuq.ipfs.dweb.link/)

Generative algorithmn stored in this hash:

`0x47285cae75d706408f13e9c4491c3a8cc6e684d4790514c72a4209095522df51`

The main POB experience:

[pob.studio](https://pob.studio)

## Packages

The POB gateway repo is structured as a monorepo containing many packages that reach all aspects of the POB ecosystem.

| Package                 | Description                                                                                                          |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------- |
| [`app`](/app)           | Core next.js webapp of the IPFS gateway, deploy on a server or on IPFS as a statically build.                        |
| [`protocol`](/protocol) | Core protocol of POB, contains the ERC1155 token, minter contracts, and other future things.                         |
| [`sketches`](/sketches) | Core generative algorithmns and means to generate them from a transaction hash. Current contains the $HASH algorithm |

## Running the IPFS gateway locally

In the root of the directory:

```
$ yarn install
```

Change directory to `app`.

```
$ cd /app
```

Run

```
$ yarn dev
```

Walla! visit `localhost:3000` to see your build running locally!

## Contributing + Usage

Node version 10.x is required.

In the root of the directory:

```
$ yarn install
```

Each respective package have their own `.env` requirements

`app`

```
NEXT_PUBLIC_CHAIN_ID="OPTIONAL"
NEXT_PUBLIC_FORTMATIC_KEY="OPTIONAL"
NEXT_PUBLIC_RPC_URL="OPTIONAL"
NEXT_PUBLIC_POB_PROD_LINK="OPTIONAL"
```

`sketches`

```
NETWORK_RPC_URL="OPTIONAL"
PRIVATE_KEY="OPTIONAL"
```

The private key and rpc is used if you want to deploy the algorithmn to the Ethereum blockchain.

`protocol`

```
RINKEBY_NETWORK_RPC_URL="OPTIONAL"
RINKEBY_MNEMONIC="OPTIONAL"
MAINNET_NETWORK_RPC_URL="OPTIONAL"
MAINNET_PRIVATE_KEY="OPTIONAL"
```

Provide either networks corresponding url and key.
