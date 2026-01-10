## Naming Note: 'sepolia' Refers to Ethereum Sepolia Testnet

In all network JSON files and generated documentation, the id 'sepolia' specifically refers to the Ethereum Sepolia testnet. When you see 'sepolia' as a network reference (e.g., in l2Of or testnetOf relations), it always means Ethereum Sepolia, not a generic testnet for other chains.

## Naming Note: 'mainnet' Refers to Ethereum Mainnet

In all network JSON files and generated documentation, the id 'mainnet' specifically refers to Ethereum Mainnet. When you see 'mainnet' as a network reference (e.g., in l2Of or testnetOf relations), it always means Ethereum Mainnet, not a generic mainnet for other chains.

# Copilot Instructions for The Graph Networks Registry

## Project Overview
- This repository manages a registry of blockchain networks for The Graph ecosystem.
- Networks are defined as JSON files in `registry/`, validated against a schema in `schemas/registry.schema.json`.
- The `src/` directory contains scripts for validation, generation, and maintenance of the registry.
- The `public/` directory contains auto-generated, versioned registry JSONs for consumption by external tools.

## Key Workflows
- **Add/Update a Network:**
  1. Add or update a JSON file in `registry/` (filename must match the `id` field).
  2. Run `bun validate` to check schema and logic.
  3. Run `bun format` to format files.
  4. Bump the patch version in `package.json`.
  5. Open a pull request. CI will validate, generate, and publish on merge.
- **Validation:**
  - `bun validate:schema` — Schema validation of all registry JSONs.
  - `bun validate:networks` — Semantic validation (uniqueness, relations, URLs, etc).
  - `bun validate:registry` — Validates the generated registry in `dist/`.
- **Generation:**
  - `bun generate:registry` — Generates the registry JSONs in `dist/`.
  - `bun generate:public` — Generates versioned registry JSONs in `public/`.
  - `bun generate:types` — Generates TypeScript types from the schema.

## Conventions & Patterns
- Each network JSON must:
  - Be named `<id>.json` and reside in the correct subfolder.
  - Conform to the schema and include required fields (see `docs/adding-a-chain.md`).
  - Use `{CUSTOM_API_KEY}` or similar placeholders for sensitive data in URLs.
- Use `bun` for all scripts (see `package.json` for available commands).
- All changes are validated and published via GitHub Actions (see `.github/workflows/`).
- Versioning:
  - Schema: MAJOR.MINOR (breaking vs. compatible changes)
  - Registry: MAJOR.MINOR.PATCH (schema change vs. data update)
- See `docs/adding-a-chain.md` for field definitions and examples.

## Integration Points
- Consuming apps should use the versioned JSONs in `public/`.
- TypeScript, Go, and Rust libraries are available for registry consumption ([see README](../README.md)).
- External references: Ethereum chains list, CAIP-2 chain IDs, Web3Icons.

## Examples
- Example network JSON: `docs/adding-a-chain.md`
- Example validation: `bun validate`
- Example generation: `bun generate:public`

## Key Files & Directories
- `registry/` — Source of truth for network definitions
- `schemas/registry.schema.json` — JSON schema for validation
- `src/` — Validation, generation, and utility scripts
- `public/` — Published registry JSONs
- `docs/` — Documentation and usage guides


## Registry Categories and Schema Details

### `registry/` Category Folders
Each subfolder in `registry/` groups networks by protocol or chain family. Example categories:

- **eip155/**: EVM-compatible chains (e.g., Ethereum, Arbitrum, Polygon). Example: `mainnet.json` for Ethereum Mainnet.
- **cosmos/**: Cosmos SDK-based chains. Example: `injective-mainnet.json` for Injective.
- **antelope/**: Antelope protocol chains. Example: `eos.json` for Vaulta Mainnet.
- **arweave/**: Arweave storage chain. Example: `arweave-mainnet.json`.
- **beacon/**: Ethereum consensus layer (beacon chain). Example: `mainnet-cl.json`.
- **bip122/**: Bitcoin and UTXO-based chains. Example: `btc.json` for Bitcoin Mainnet.
- **near/**: Near protocol chains. Example: `near-mainnet.json`.
- **solana/**: Solana protocol chains. Example: `solana-mainnet-beta.json`.
- **starknet/**: Starknet ZK-rollup chains. Example: `starknet-mainnet.json`.
- **stellar/**: Stellar protocol chains. Example: `stellar.json`.
- **tron/**: Tron protocol chains. Example: `tron.json`.

Each file defines a single network, with fields matching the schema (see below).

### `schemas/registry.schema.json`
Defines the structure and validation rules for all network JSONs. Key fields:
- `id`, `shortName`, `fullName`, `caip2Id`, `networkType`, `services`, `issuanceRewards` (required)
- Optional: `aliases`, `relations`, `firehose`, `tokenApi`, `nativeToken`, `graphNode`, `explorerUrls`, `rpcUrls`, `apiUrls`, `docsUrl`, `indexerDocsUrls`, `icon`
- Relations allow linking networks (e.g., L2s to mainnet)
- `services` lists supported Graph ecosystem endpoints (subgraphs, firehose, substreams, etc)
- See schema for all field types and constraints

### How `/public/TheGraphNetworksRegistry.json` is Generated
- Combines all valid JSONs from `registry/` into a single array under `networks[]`, validated by the schema
- Each entry retains its category context via `caip2Id` and protocol-specific fields
- Used by external tools and libraries for network discovery and configuration

#### Example Mapping
- `registry/eip155/mainnet.json` → `networks[]` entry with `id: "mainnet"`, `caip2Id: "eip155:1"`
- `registry/cosmos/injective-mainnet.json` → `networks[]` entry with `id: "injective-mainnet"`, `caip2Id: "cosmos:injective-1"`
- `registry/antelope/eos.json` → `networks[]` entry with `id: "eos"`, `caip2Id: "antelope:aca376f..."`

For more, see the [README.md](../README.md) and [docs/adding-a-chain.md](../docs/adding-a-chain.md).