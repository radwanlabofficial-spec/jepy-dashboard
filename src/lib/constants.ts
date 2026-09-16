import type { ErrorCode, Reason } from './types';

/**
 * The closed error enum, exactly nineteen codes (13 §10).
 * A name that is not in `ERROR_MESSAGES` must never appear in this codebase.
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  E_VALIDATION: 'ইনপুট ঠিক নেই (detail দেখুন)',
  E_UNAUTHENTICATED: 'সেশন শেষ — আবার login করুন',
  E_FORBIDDEN: 'এই কাজের অনুমতি নেই',
  E_NOT_FOUND: 'পাওয়া যায়নি — হয়তো মুছে ফেলা হয়েছে',
  E_CONFLICT: 'একই সময়ে অন্য কেউ বদলেছে, বা একই request key ভিন্ন data নিয়ে এসেছে',
  E_RATE_LIMIT: 'একটু ধীরে — অনুরোধের সীমা ছোঁয়া হয়েছে',
  E_QUOTA_EXHAUSTED: 'এই account-এর quota শেষ — পরের reset পর্যন্ত অপেক্ষা',
  E_BUDGET_GUARD: 'budget guard সক্রিয় — dispatcher থেমেছে',
  E_AI_CAP: 'আজকের AI স্কোরিং সীমা (২০০) শেষ',
  E_YELP_GATE: 'Yelp verification-এর জন্য rule score ≥ 55 লাগে',
  E_TIER_GATE: 'এই কাজ শুধু HOT/WARM lead-এ',
  E_COMPLIANCE_BLOCK: 'compliance কারণে বন্ধ (নিচে reason দেখুন)',
  E_LICENSE_BLOCK: 'license শর্তে এই field export করা যাবে না',
  E_PROVIDER_POLICY: "provider-এর নীতিতে এই ব্যবহার নিষিদ্ধ",
  E_NO_CANDIDATE: 'কোনো provider পাওয়া যায়নি — capability matrix দেখুন',
  E_CREDENTIAL_INVALID: 'credential কাজ করছে না — Vault-এ test করুন',
  E_PROVIDER_ERROR: 'provider-এর দিক থেকে সমস্যা — নিজে থেকে আবার চেষ্টা হবে',
  E_TIMEOUT: 'সময় শেষ হয়ে গেছে — আবার চেষ্টা হবে',
  E_INTERNAL: 'অপ্রত্যাশিত সমস্যা — error log দেখুন',
};

/** Second-level messages, shown under the code message (13 §10.1). */
export const REASON_MESSAGES: Partial<Record<Reason, string>> = {
  class_x: 'এই source স্থায়ীভাবে বন্ধ — override সম্ভব নয়',
  manual_only: 'এই source শুধু হাতে খোলা যায় — Sources → Manual দেখুন',
  robots: 'robots.txt এই path-এ নিষেধ করেছে',
  login_wall: 'login/captcha wall — এখানে থামা হয়েছে',
  geo: 'এই দেশে outreach অনুমোদিত নয়',
  cold_email: 'Resend শুধু transactional মেইলে ব্যবহারযোগ্য',
  yelp_discovery: 'Yelp শুধু verification-এ — discovery বন্ধ',
  admin_only: 'এই route-এ admin অনুমতি লাগে',
  device_scope: 'device token এই endpoint-এ চলে না',
  mode_b_disabled: 'Manual capture এখনো চালু হয়নি (ADR-035)',
  adr_required: 'এই field বদলাতে ADR লাগবে (04-decisions.md)',
  counter_readonly: 'Quota হাতে বদলানো যায় না',
  setting_locked: 'এই setting সিস্টেম নিয়ন্ত্রণ করে',
  pack_immutable: 'Selector pack edit করা যায় না — নতুন version তৈরি করুন',
  idempotency_replay: 'একই request key ভিন্ন data নিয়ে পাঠানো হয়েছে',
  weight_range: 'Weight 0.5–1.5 এর মধ্যে হতে হবে',
  pack_mismatch: 'pack version মেলেনি — ফল বাতিল হয়েছে',
  label_format: 'label অবশ্যই <provider>-<number> — যেমন apify-21',
  label_reused: 'এই label আগে ব্যবহৃত হয়েছে — পরের number নিন',
  unknown_provider: 'এই provider তালিকায় নেই',
  quota_zero: 'quota ০ দেওয়া যায় না — ০ মানে unlimited নয়',
  unit_mismatch: 'এই provider-এর unit আলাদা — capability দেখুন',
  yelp_single_account: 'Yelp-এ একটাই account, চিরকাল',
  unknown_account: 'এই account নেই — আগে "+ New account" দিয়ে তৈরি করুন',
  circuit_open: 'এই provider সাময়িক বন্ধ — back-off শেষে নিজে থেকে চেষ্টা হবে',
};

/** Retry is offered for these four codes only (13a §5.9). */
export const RETRYABLE_CODES: ErrorCode[] = [
  'E_RATE_LIMIT',
  'E_PROVIDER_ERROR',
  'E_TIMEOUT',
  'E_INTERNAL',
];

/** Codes whose nuance lives in `detail.reason` (13 §10.1). */
export const REASON_CODES: ErrorCode[] = [
  'E_VALIDATION',
  'E_FORBIDDEN',
  'E_NOT_FOUND',
  'E_CONFLICT',
  'E_COMPLIANCE_BLOCK',
  'E_PROVIDER_POLICY',
];

/* ------------------------------------------------------------------ limits -- */

export const TIER_BOUNDS = { HOT: 70, WARM_MIN: 40, WARM_MAX: 69 } as const;

export const YELP_RULE_SCORE_FLOOR = 55;

export const POLLING = { jobs: 10_000, overview: 30_000 } as const;

export const STALE_TIME = { table: 30_000, queue: 5_000 } as const;

export const BD_DAILY_GUARD = 1800;
export const BD_MONTHLY_PCT_LINE = 70;
export const MONTHLY_BUDGET_MICRO = 70_000_000;
export const CASH_GUARD_MICRO = 60_000_000;
export const ZB_MONTHLY_POOL = 2000;
export const COMPLAINT_RATE_LINE = 0.1;
export const BOUNCE_RATE_LINE = 2;
export const WEIGHT_MIN = 0.5;
export const WEIGHT_MAX = 1.5;
export const HEAL_MIN_RECORDS = 5;
export const HEAL_MIN_FILL_PCT = 80;
export const STALE_DEVICE_SEC = 48 * 3600;

/** Footer attribution is a licence condition and is never hidden (13 §4.3). */
export const ATTRIBUTION = [
  { label: 'Overture Maps Foundation', licence: 'CDLA-Permissive 2.0', href: 'https://overturemaps.org' },
  { label: 'Foursquare OS Places', licence: 'Apache-2.0', href: 'https://location.foursquare.com/products/free-open-source-data/' },
];
