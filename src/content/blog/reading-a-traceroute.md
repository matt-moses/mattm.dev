---
title: "Reading a Traceroute Like It Owes You Money"
description: "Hop-by-hop latency isn't mysticism. Here's what every column actually means."
date: 2026-09-12
tags: ["networking", "fundamentals"]
readTime: "6 min read"
---

Most people run `traceroute` once, stare at three columns of numbers, and close the terminal none the wiser. That's a shame, because a traceroute is one of the most honest diagnostic tools you have — it just needs a translator.

## What it's actually doing

`traceroute` sends packets with increasing TTL (time-to-live) values, starting at 1. Every router that forwards a packet decrements the TTL by one. When a router receives a packet with TTL 0, it doesn't forward it — it drops it and sends back an ICMP "Time Exceeded" message to the source, identifying itself in the process. So hop 1 replies to a TTL-1 packet, hop 2 replies to a TTL-2 packet, and so on. Three packets go out per hop so you get three latency samples, not because the tool is being generous.

```bash
$ traceroute blog.mattm.dev
 1  gateway.local (192.168.1.1)     0.482 ms  0.401 ms  0.389 ms
 2  10.20.0.1                       3.104 ms  2.998 ms  3.211 ms
 3  border1.isp.example (203.0.113.1)  8.774 ms  8.601 ms  9.033 ms
 4  * * *
 5  edge-ord.example.net (198.51.100.9) 14.220 ms  13.998 ms  14.560 ms
 6  blog.mattm.dev (203.0.113.200)  15.001 ms  14.887 ms  15.204 ms
```

## The parts people skip past

**The asterisks aren't failures.** Hop 4 timing out doesn't mean the path is broken — it means that router is configured to not respond to (or deprioritize) ICMP, which is extremely common on backbone routers doing real work. What matters is whether hop 5 answers, because that confirms the packet made it through hop 4 regardless of whether hop 4 said anything.

**Three numbers per hop, not one.** The three latency samples on a single line can vary by an order of magnitude if a hop is under load or your packets are taking different physical paths (ECMP load balancing is common at any hop past your ISP). A single high outlier next to two consistent numbers is noise, not a diagnosis.

**Latency should increase, not just at the end but monotonically-ish.** A traceroute where hop 5 is *faster* than hop 3 usually means hop 3's router is slow to generate the ICMP reply itself — the packet delivery wasn't actually slower, the router's reply generation was. Don't confuse "this router is slow to tell you about itself" with "this link is slow."

## Where it lies to you

Traceroute measures the round trip to *each router*, not the one-way path to your destination. If the return path from hop 4 to you is congested but the forward path is fine, hop 4 looks slow even though nothing on the forward path is actually a problem. This is the single most common misread: people assume traceroute characterizes the forward path end-to-end, when every measurement includes a return trip whose route you don't control and can't see.

For genuine path analysis under load, MTR (which combines traceroute with continuous ping) gives you loss percentages per hop over time instead of one triplet — worth reaching for if a `*` shows up somewhere you didn't expect it, or one hop's numbers are jumping around while its neighbors are stable.
