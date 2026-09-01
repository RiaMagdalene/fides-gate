import { createHash } from "node:crypto";

export type RequestEvent = {
  id: string;
  timestamp: string;
  crawlerId: string;
  crawlerName: string;
  intent: string;
  identity: string;
  tier: string;
  status: number;
  evidenceHash: string;
  trustScore: number;
  action: string;
  location: string;
};

export type LedgerEvent = {
  id: string;
  event: string;
  crawler: string;
  publisher: string;
  intent: string;
  timestamp: string;
  action: string;
  violation: string;
  hash: string;
  previousHash: string;
  status: string;
};

export type Crawler = {
  id: string;
  name: string;
  key: string;
  status: string;
  purpose: string;
  trustScore: number;
  requests: number;
  lastSeen: string;
  accent: string;
};

export type Policy = {
  intent: string;
  label: string;
  action: string;
  description: string;
  enabled: boolean;
  tone: string;
};

export type CanaryStatus = {
  status: string;
  crawler: string;
  session: string;
  confidence: number;
  matchedSignals: string[];
};

export type Evidence = {
  hash: string;
  contentHash: string;
  timestamp: string;
  crawler: string;
  publisher: string;
};

const publisher = "Northstar Review";
const article =
  "A verified consent layer lets publishers define exactly what an AI crawler receives. Fides Gate verifies the caller first, then preserves provenance as content moves downstream.";

const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex").slice(0, 16);

const ago = (minutes: number) =>
  new Date(Date.now() - minutes * 60_000).toISOString();

export const crawlers: Crawler[] = [
  {
    id: "gptbot-prod",
    name: "GPTBot",
    key: "ed25519:7f8a…a91c",
    status: "verified",
    purpose: "Search + RAG",
    trustScore: 98,
    requests: 1248,
    lastSeen: "12 sec ago",
    accent: "cyan",
  },
  {
    id: "claude-research",
    name: "ClaudeBot",
    key: "ed25519:41c2…0dd7",
    status: "verified",
    purpose: "RAG",
    trustScore: 96,
    requests: 831,
    lastSeen: "1 min ago",
    accent: "violet",
  },
  {
    id: "perplexity-index",
    name: "PerplexityBot",
    key: "ed25519:9a02…c112",
    status: "verified",
    purpose: "Search",
    trustScore: 94,
    requests: 623,
    lastSeen: "4 min ago",
    accent: "indigo",
  },
  {
    id: "unknown-spoofed",
    name: "Unknown / Spoofed",
    key: "no registered key",
    status: "quarantined",
    purpose: "Untrusted",
    trustScore: 12,
    requests: 17,
    lastSeen: "8 min ago",
    accent: "rose",
  },
];

export let policies: Policy[] = [
  {
    intent: "SEARCH",
    label: "Search indexing",
    action: "Snippet only",
    description: "Title, metadata, and a short content excerpt",
    enabled: true,
    tone: "mint",
  },
  {
    intent: "RAG",
    label: "Verified RAG",
    action: "Full content + canary",
    description: "Full text with session watermark and semantic canary",
    enabled: true,
    tone: "indigo",
  },
  {
    intent: "TRAINING",
    label: "Model training",
    action: "402 + license.xml",
    description: "Machine-readable terms returned for licensing workflows",
    enabled: true,
    tone: "amber",
  },
  {
    intent: "DATASET",
    label: "Dataset export",
    action: "Strictest tier",
    description: "Bulk extraction is blocked regardless of declared intent",
    enabled: true,
    tone: "red",
  },
];

const seedRequests = (): RequestEvent[] => [
  {
    id: "req-8f24",
    timestamp: ago(1),
    crawlerId: "gptbot-prod",
    crawlerName: "GPTBot",
    intent: "SEARCH",
    identity: "VERIFIED",
    tier: "SNIPPET",
    status: 200,
    evidenceHash: "7b2d…c91f",
    trustScore: 98,
    action: "ALLOWED",
    location: "Ashburn, US",
  },
  {
    id: "req-71aa",
    timestamp: ago(3),
    crawlerId: "claude-research",
    crawlerName: "ClaudeBot",
    intent: "RAG",
    identity: "VERIFIED",
    tier: "FULL + CANARY",
    status: 200,
    evidenceHash: "0ac4…f18b",
    trustScore: 96,
    action: "ALLOWED",
    location: "Dublin, IE",
  },
  {
    id: "req-650d",
    timestamp: ago(6),
    crawlerId: "unknown-spoofed",
    crawlerName: "UnknownBot",
    intent: "RAG",
    identity: "INVALID",
    tier: "STRICTEST",
    status: 403,
    evidenceHash: "a401…11de",
    trustScore: 12,
    action: "DOWNGRADED",
    location: "Singapore, SG",
  },
  {
    id: "req-44e8",
    timestamp: ago(9),
    crawlerId: "perplexity-index",
    crawlerName: "PerplexityBot",
    intent: "SEARCH",
    identity: "VERIFIED",
    tier: "SNIPPET",
    status: 200,
    evidenceHash: "3f7c…9ab2",
    trustScore: 94,
    action: "ALLOWED",
    location: "San Francisco, US",
  },
  {
    id: "req-2c18",
    timestamp: ago(13),
    crawlerId: "gptbot-prod",
    crawlerName: "GPTBot",
    intent: "TRAINING",
    identity: "VERIFIED",
    tier: "LICENSE",
    status: 402,
    evidenceHash: "8dd1…bf03",
    trustScore: 98,
    action: "LICENSE REQUIRED",
    location: "Ashburn, US",
  },
];

const seedLedger = (): LedgerEvent[] => [
  {
    id: "evt-99a1",
    event: "VERIFIED_SEARCH",
    crawler: "GPTBot",
    publisher,
    intent: "SEARCH",
    timestamp: ago(1),
    action: "SNIPPET DELIVERED",
    violation: "none",
    hash: "7b2d…c91f",
    previousHash: "0000…0000",
    status: "confirmed",
  },
  {
    id: "evt-872d",
    event: "VERIFIED_RAG",
    crawler: "ClaudeBot",
    publisher,
    intent: "RAG",
    timestamp: ago(3),
    action: "CANARY EMBEDDED",
    violation: "none",
    hash: "0ac4…f18b",
    previousHash: "7b2d…c91f",
    status: "confirmed",
  },
  {
    id: "evt-6c02",
    event: "SPOOF_ATTEMPT",
    crawler: "UnknownBot",
    publisher,
    intent: "RAG",
    timestamp: ago(6),
    action: "STRICTEST POLICY",
    violation: "invalid signature",
    hash: "a401…11de",
    previousHash: "0ac4…f18b",
    status: "confirmed",
  },
  {
    id: "evt-03f9",
    event: "TRAINING_REQUEST",
    crawler: "GPTBot",
    publisher,
    intent: "TRAINING",
    timestamp: ago(13),
    action: "402 + LICENSE TERMS",
    violation: "publisher policy",
    hash: "8dd1…bf03",
    previousHash: "a401…11de",
    status: "confirmed",
  },
];

export let requests = seedRequests();
export let ledger = seedLedger();
export let canary: CanaryStatus = {
  status: "WATCHING",
  crawler: "ClaudeBot",
  session: "rag_01H8…d92a",
  confidence: 0,
  matchedSignals: [],
};

export const makeEvidence = (crawler: string, intent: string): Evidence => {
  const timestamp = new Date().toISOString();
  const contentHash = hash(article);
  return {
    hash: hash(`${crawler}:${intent}:${timestamp}:${contentHash}`),
    contentHash,
    timestamp,
    crawler,
    publisher,
  };
};

export const summary = () => {
  const verified = requests.filter((request) => request.identity === "VERIFIED").length;
  const fallback = requests.filter((request) => request.identity !== "VERIFIED").length;
  return {
    totalRequests: requests.length + 2719,
    verified: verified + 2701,
    fallback: fallback + 18,
    canaryDetections: 3,
    activeCrawlers: crawlers.filter((crawler) => crawler.status === "verified").length,
    trustScore: Math.round(crawlers.reduce((total, crawler) => total + crawler.trustScore, 0) / crawlers.length),
    blocked: requests.filter((request) => request.status !== 200).length + 11,
  };
};

export const dashboard = () => ({
  summary: summary(),
  requests,
  ledger,
  policies,
  crawlers,
  canary,
});

const createRequest = (
  crawlerId: string,
  crawlerName: string,
  intent: string,
  identity: "VERIFIED" | "INVALID",
  tier: string,
  status: number,
  action: string,
  location: string,
) => {
  const evidence = makeEvidence(crawlerName, intent);
  const request: RequestEvent = {
    id: `req-${Math.random().toString(16).slice(2, 6)}`,
    timestamp: evidence.timestamp,
    crawlerId,
    crawlerName,
    intent,
    identity,
    tier,
    status,
    evidenceHash: `${evidence.hash.slice(0, 4)}…${evidence.hash.slice(-4)}`,
    trustScore: identity === "VERIFIED" ? 97 : 12,
    action,
    location,
  };
  requests = [request, ...requests].slice(0, 30);
  const previousHash = ledger[0]?.hash ?? "0000…0000";
  const event: LedgerEvent = {
    id: `evt-${Math.random().toString(16).slice(2, 6)}`,
    event:
      intent === "TRAINING"
        ? "TRAINING_REQUEST"
        : identity === "INVALID"
          ? "SPOOF_ATTEMPT"
          : `VERIFIED_${intent}`,
    crawler: crawlerName,
    publisher,
    intent,
    timestamp: evidence.timestamp,
    action,
    violation: identity === "INVALID" ? "invalid signature" : status === 402 ? "publisher policy" : "none",
    hash: request.evidenceHash,
    previousHash,
    status: "confirmed",
  };
  ledger = [event, ...ledger].slice(0, 30);
  return { request, evidence };
};

export const simulate = (kind: "search" | "rag" | "spoof" | "training") => {
  if (kind === "search") {
    const result = createRequest("gptbot-prod", "GPTBot", "SEARCH", "VERIFIED", "SNIPPET", 200, "SNIPPET DELIVERED", "Ashburn, US");
    canary = { status: "WATCHING", crawler: "GPTBot", session: "search_01H8…ab09", confidence: 0, matchedSignals: [] };
    return {
      ...result,
      message: "Identity verified. Search payload delivered.",
      payload: "Short snippet delivered with title, metadata, and meta description.",
      canary,
      steps: [
        { label: "IDENTITY", detail: "Ed25519 signature valid", status: "PASS" },
        { label: "INTENT", detail: "SEARCH is trusted", status: "PASS" },
        { label: "POLICY", detail: "Snippet tier applied", status: "PASS" },
        { label: "RESPONSE", detail: "200 OK · 312 bytes", status: "PASS" },
      ],
    };
  }
  if (kind === "rag") {
    const result = createRequest("claude-research", "ClaudeBot", "RAG", "VERIFIED", "FULL + CANARY", 200, "CANARY EMBEDDED", "Dublin, IE");
    canary = {
      status: "CANARY EMBEDDED",
      crawler: "ClaudeBot",
      session: "rag_01H8…d92a",
      confidence: 0,
      matchedSignals: ["extended → expanded", "consent layer → access layer"],
    };
    return {
      ...result,
      message: "Verified RAG payload delivered with provenance signals.",
      payload: `${article} Canary variant: ${article.replace("lets", "allows")}`,
      canary,
      steps: [
        { label: "IDENTITY", detail: "Ed25519 signature valid", status: "PASS" },
        { label: "INTENT", detail: "RAG is trusted", status: "PASS" },
        { label: "POLICY", detail: "Full content + canary", status: "PASS" },
        { label: "RESPONSE", detail: "200 OK · canary embedded", status: "PASS" },
      ],
    };
  }
  if (kind === "training") {
    const result = createRequest("gptbot-prod", "TrainingBot", "TRAINING", "VERIFIED", "LICENSE", 402, "LICENSE REQUIRED", "Ashburn, US");
    canary = { status: "WATCHING", crawler: "TrainingBot", session: "train_01H8…1e44", confidence: 0, matchedSignals: [] };
    return {
      ...result,
      message: "This content requires a license. Machine-readable terms attached.",
      payload: "HTTP 402 Payment Required · /license.xml · RSL-2026-NORTHSTAR",
      canary,
      steps: [
        { label: "IDENTITY", detail: "Ed25519 signature valid", status: "PASS" },
        { label: "INTENT", detail: "TRAINING is trusted", status: "PASS" },
        { label: "POLICY", detail: "Publisher license required", status: "WARN" },
        { label: "RESPONSE", detail: "402 Payment Required", status: "BLOCK" },
      ],
    };
  }
  const result = createRequest("unknown-spoofed", "UnknownBot", "RAG", "INVALID", "STRICTEST", 403, "CONTENT DENIED", "Singapore, SG");
  canary = { status: "QUARANTINED", crawler: "UnknownBot", session: "spoof_01H8…771a", confidence: 1, matchedSignals: ["signature mismatch", "unregistered crawler ID"] };
  return {
    ...result,
    message: "Identity verification failed. Declared intent is not trusted.",
    payload: "Strictest tier enforced · content denied · no body returned.",
    canary,
    steps: [
      { label: "IDENTITY", detail: "Signature mismatch", status: "BLOCK" },
      { label: "INTENT", detail: "RAG claim is untrusted", status: "BLOCK" },
      { label: "POLICY", detail: "Strictest tier enforced", status: "BLOCK" },
      { label: "LEDGER", detail: "Event appended to public chain", status: "PASS" },
    ],
  };
};

export const reset = () => {
  requests = seedRequests();
  ledger = seedLedger();
  canary = { status: "WATCHING", crawler: "ClaudeBot", session: "rag_01H8…d92a", confidence: 0, matchedSignals: [] };
  return dashboard();
};

export const scanText = (text: string) => {
  const signals: string[] = [];
  if (text.toLowerCase().includes("allows")) signals.push("allows → lets");
  if (text.toLowerCase().includes("access layer")) signals.push("access layer → consent layer");
  if (text.toLowerCase().includes("extended")) signals.push("extended → expanded");
  const detected = signals.length > 0;
  const evidence = makeEvidence("ClaudeBot", "RAG");
  canary = {
    status: detected ? "CANARY DETECTED" : "NO MATCH",
    crawler: detected ? "ClaudeBot" : "Unknown",
    session: detected ? "rag_01H8…d92a" : "—",
    confidence: detected ? Math.min(0.99, (76 + signals.length * 8) / 100) : 0,
    matchedSignals: signals,
  };
  return { detected, ...canary, evidence };
};

export const analytics = () => ({
  volume: [
    { label: "00:00", value: 168, verified: 156, invalid: 12 },
    { label: "04:00", value: 92, verified: 88, invalid: 4 },
    { label: "08:00", value: 244, verified: 232, invalid: 12 },
    { label: "12:00", value: 318, verified: 302, invalid: 16 },
    { label: "16:00", value: 286, verified: 271, invalid: 15 },
    { label: "20:00", value: 196, verified: 188, invalid: 8 },
  ],
  intent: [
    { label: "Search", value: 58 },
    { label: "RAG", value: 27 },
    { label: "Training", value: 11 },
    { label: "Dataset", value: 4 },
  ],
  hourly: [
    { label: "Mon", value: 12 },
    { label: "Tue", value: 7 },
    { label: "Wed", value: 16 },
    { label: "Thu", value: 5 },
    { label: "Fri", value: 11 },
    { label: "Sat", value: 4 },
    { label: "Sun", value: 8 },
  ],
  trustLeaderboard: crawlers.map((crawler) => ({
    name: crawler.name,
    score: crawler.trustScore,
    requests: crawler.requests,
    violations: crawler.status === "Quarantined" ? 9 : 0,
    status: crawler.status,
  })),
  violations: [
    { label: "Invalid signature", value: 11 },
    { label: "Policy blocked", value: 7 },
    { label: "Canary reuse", value: 3 },
  ],
});

export const articlePreview = article;