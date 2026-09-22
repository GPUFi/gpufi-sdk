# Security Policy

GPUFi takes the security of its decentralized infrastructure, smart contracts, and developer tooling with the highest seriousness.

## Supported Versions

Only the latest release of `gpufi-sdk` is officially supported for security patches.

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0.0 | :x:                |

## Zero API Key Architecture

`gpufi-sdk` operates entirely non-custodially:
- **No Embedded Credentials**: The SDK never contains or requests central API keys, private keys, or secret tokens.
- **Direct RPC Connections**: All RPC calls connect either to public chain nodes (`https://rpc.mainnet.chain.robinhood.com`) or to developer-provided infrastructure.
- **Client-Side Signing**: Transactions are signed exclusively by caller-supplied ethers `Signer` instances. Private keys never leave the caller's environment.

## Reporting a Vulnerability

If you discover a potential vulnerability in `gpufi-sdk` or the underlying smart contracts, please follow our coordinated disclosure policy:

1. **Do NOT file a public issue** on GitHub.
2. Email full technical details of the vulnerability to:
   **`security@gpu-fi.uk`** (or `dev@gpu-fi.uk`)
3. Include:
   - Detailed description of the vulnerability.
   - Steps or proof-of-concept (PoC) code to reproduce.
   - Potential impact and severity assessment.

## Response SLA

- **Initial Response**: Within 24 hours.
- **Triage & Verification**: Within 48 hours.
- **Patch & Advisory Release**: Coordinated with the reporter following verification.

We appreciate the efforts of security researchers in keeping decentralized infrastructure safe.
