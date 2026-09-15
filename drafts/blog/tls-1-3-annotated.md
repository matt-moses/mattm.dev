---
title: "TLS 1.3, Annotated Byte by Byte"
description: "One round trip, no cipher negotiation drama. Here's what's actually on the wire."
date: 2026-08-22
tags: ["security", "tls"]
readTime: "8 min read"
---

TLS 1.3 (RFC 8446) cut the handshake down to one round trip by making an assumption TLS 1.2 never dared to: the client just guesses which key exchange group the server will accept, and sends its key share up front. If it guesses wrong, there's a retry — but in practice, guessing right is the overwhelming default because the set of groups anyone actually supports is small.

## The client goes first, aggressively

```
ClientHello
  + supported_versions: TLS 1.3
  + key_share: x25519, <32-byte public key>
  + signature_algorithms: ecdsa_secp256r1_sha256, ed25519, ...
  + supported_groups: x25519, secp256r1, secp384r1
```

That `key_share` extension is the load-bearing part. In TLS 1.2, the client and server spent a full round trip just agreeing on a cipher suite before any key material moved. TLS 1.3 assumes x25519 (or whatever the client lists first) will be accepted, and hands over a Diffie-Hellman public value immediately. No wasted round trip if the guess is right, which is the common case since curve support has converged industry-wide.

## The server replies with almost everything it needs to finish

```
ServerHello
  + key_share: x25519, <32-byte public key>
{EncryptedExtensions}
{CertificateRequest*}
{Certificate}
{CertificateVerify}
{Finished}
```

The curly braces aren't decorative — they mark the point at which the connection switches to encrypted records. Once the server sends back its own `key_share`, both sides can independently derive the same shared secret via ECDHE, and everything after `ServerHello` — the certificate, the signature over the handshake transcript, the `Finished` message — is already encrypted with a key derived from that handshake, before either side has verified the other's identity. This is a real architectural shift from 1.2: certificates used to travel in the clear.

## Why CertificateVerify matters more than people think

`CertificateVerify` is the server signing a hash of the entire handshake transcript so far, using the private key matching the certificate it just sent. This is what actually proves possession of the private key — the certificate alone only proves someone once got a CA to vouch for a public key, not that the entity on the other end of this specific connection holds the matching private key. Skip this step conceptually and you've built a system where anyone who intercepted a certificate once could replay it forever.

## What 0-RTT trades away

Session resumption via `pre_shared_key` lets a returning client send application data in its very first flight — zero round trips before useful bytes move. The catch, and it's not a small one: 0-RTT data has no replay protection. An attacker who captures that first flight can resend it, and the server has no built-in way to distinguish the replay from the original. This is why 0-RTT is generally scoped to idempotent requests (or disabled outright) rather than treated as a drop-in speedup for everything — the RFC says as much, but plenty of deployments have learned it the harder way.
