---
title: "Your Router's Default DNS Is Probably Not Who You Think"
description: "Most home routers quietly hand out their own IP as a DNS server, and forward from there. Here's how to actually check."
date: 2026-07-30
tags: ["dns", "networking"]
readTime: "5 min read"
---

Open a terminal on almost any home network and check what DNS server your machine is actually configured to use:

```bash
$ cat /etc/resolv.conf
nameserver 192.168.1.1
```

That's not a public DNS resolver. That's the router. Which is fine, mechanically — but it means every DNS query you make takes a detour through consumer router firmware before it goes anywhere near the resolver you might think you configured.

## The forwarding chain nobody looks at

Most consumer routers ship as DNS forwarders, not resolvers. They accept the query from your laptop on the LAN side, then re-issue it to whatever DNS servers were handed out by the ISP over DHCP on the WAN side — regardless of what you typed into your OS network settings, unless you specifically changed the *router's* upstream DNS, not just your laptop's.

```bash
$ dig +short blog.mattm.dev @192.168.1.1
203.0.113.200

$ dig +short blog.mattm.dev @1.1.1.1
203.0.113.200
```

Same answer here, which is the boring, common case. But the interesting failure mode isn't wrong answers — it's *when* the forwarder answers. Router firmware from the DNS forwarder implementation the router runs frequently caches more aggressively than the TTL in the record allows, ignores DNS negative caching rules, or silently drops EDNS0 (extension mechanisms for DNS) packets that are slightly larger than expected, causing intermittent resolution failures that look like flaky internet and are actually a firmware bug three layers deep in a $60 router's forwarder.

## How to actually verify what's happening

Pointing your OS at `1.1.1.1` or `8.8.8.8` in network settings doesn't remove the router from the path unless the router itself is bridged or you've explicitly disabled its DHCP-provided DNS option. The only way to know for certain: compare answers and timing directly against the router versus a resolver you trust, for a record you control so you know the correct answer in advance.

```bash
$ dig blog.mattm.dev @192.168.1.1 +stats | grep "Query time"
;; Query time: 1 msec

$ dig blog.mattm.dev @1.1.1.1 +stats | grep "Query time"
;; Query time: 11 msec
```

A 1ms answer from the router almost always means it's serving from cache, not actually forwarding — which is fine until that cache is stale and you have no visibility into why a DNS change you just made isn't showing up. If you need a change to propagate predictably, bypass the router's DNS entirely for testing, or drop its cache directly if the firmware exposes that option (most consumer firmware doesn't, which is itself the actual finding: the box has become a black box).
