let _modLog = null
export function setModerationLog (fn) { _modLog = fn }
function log (level, msg) {
  if (_modLog) _modLog(level, msg)
  console.log(`[moderation] ${msg}`)
}

const STATIC_BLOCKS = [
  { re: /\b(referral|referral code|invite code|promo code|sign up bonus|affiliate|discount code|coupon)\b/i, reason: 'This contains promotional/referral codes. We keep those out of the feed.' },
  { re: /\b(giveaway|airdrop|free claim|free mint|claim your|claim now|limited time offer|free crypto|free tokens?)\b/i, reason: 'This looks like a giveaway or airdrop promotion. That\'s not what this community is for.' },
  { re: /\b(send me (eth|btc|sol|crypto)|deposit.{0,20}(and i.ll|get back|double))\b/i, reason: 'This reads like a scam solicitation. No.' },
  { re: /\b(buy now|order now|shop now|click here to (buy|earn|claim)|subscribe now|follow me|like and share)\b/i, reason: 'This is a call-to-action spam pattern. Share ideas, not promotions.' },
  { re: /\b(upvote|downvote|karma|points? for posting|retweet|share for)\b/i, reason: 'This is engagement-farming language. We don\'t do that here.' },
  { re: /\b(must read|you won.t believe|shocking|viral|mind.blowing|incredible discovery)\b/i, reason: 'This uses clickbait language. State your point plainly.' },
]

const STATIC_WARNINGS = [
  { re: /\b(to the moon|wen moon|moon\b|wagmi|gm\b|lfg|ser\b|anon\b|chad\b|degen\b|based\b|ngmi\b|hodl\b)\b/i, reason: 'Crypto-bro slang like that doesn\'t fit the culture here. We talk about theses and structural developments, not moon talk.' },
  { re: /\b(pump|dump|100x|1000x|gem\b|hidden gem|early bird|presale|moonshot)\b/i, reason: 'This reads like price speculation. We focus on what structurally changed, not price predictions.' },
  { re: /\b(price (prediction|target|go (up|down))|going (to (the moon|zero|100k))|when (eth|btc|sol) (hit|reach))\b/i, reason: 'Price predictions aren\'t what we do here. If there\'s a structural reason behind the move, lead with that instead.' },
  { re: /\b(buy (signal|signal)|sell (signal|signal)|technical analysis|support (level|resistance)|resistance level|chart pattern|bull flag|bear flag)\b/i, reason: 'Technical analysis and trading signals aren\'t the culture here. We discuss fundamentals, theses, and structural shifts.' },
  { re: /\b(rip\b|rekt\b|ngmi\b|stay poor|have fun staying poor)\b/i, reason: 'Dismissive or mocking language about financial outcomes isn\'t how we talk to each other here.' },
  { re: /\b(scam\b|rug\b|fraud\b|ponzi)\b/i, reason: 'Accusing a project of being a scam or rug requires evidence. If you have a specific structural concern, frame it as analysis with sources.' },
]

const PROFANITY_HARD = [
  { re: /\b(fuck\s+(you|off|this)|shit\s+(show|hole|stain)|bitch|cunt|faggot|retard|nigger|kike|spic|tranny)\b/i, reason: 'Senseless profanity and slurs aren\'t part of how we communicate here. Make your point without them.' },
]

const PROFANITY_SOFT = [
  { re: /\b(fuck|shit|asshole|damn|crap|piss)\b/i, reason: 'Watch the profanity. We keep conversations respectful here. You can make the same point without it.' },
]

const PROMPT_INJECTION = [
  { re: /\b(ignore (previous|prior|all) (instructions?|prompts?|rules?))\b/i, reason: 'Prompt injection detected.' },
  { re: /\b(you are now|act as|pretend to be|role.?play as|system:|<\|system\|>|\[system\])\b/i, reason: 'Role-play injection detected.' },
  { re: /\b(disregard (the|all|any) (above|previous)|forget (your|all) (instructions?|rules?|guidelines))\b/i, reason: 'Instruction override detected.' },
  { re: /\b(reveal (your|the) (system|hidden|secret) (prompt|instructions?|rules?))\b/i, reason: 'Prompt extraction attempt detected.' },
  { re: /\b(DAN|do anything now|jailbreak|developer mode|unrestricted mode)\b/i, reason: 'Known jailbreak pattern detected.' },
]

const ENCODING_ATTACKS = [
  { re: /^(?:[A-Za-z0-9+\/]{50,}={0,2})$/, reason: 'Base64-encoded payload detected.' },
  { re: /\\x[0-9a-f]{2}/i, reason: 'Hex escape sequence detected.' },
  { re: /\\u[0-9a-f]{4}/i, reason: 'Unicode escape sequence detected.' },
]

const INVISIBLE_CHARS = /[\u200B\u200C\u200D\u200E\u200F\uFEFF\u2060\u2061\u2062\u2063]/
const HOMOGLYPHS = /[\u0400-\u04FF\u0370-\u03FF\u0500-\u052F]/

const HOMOGLYPH_MAP = {
  'а': 'a', 'е': 'e', 'о': 'o', 'р': 'p', 'с': 'c', 'у': 'y', 'х': 'x',
  'А': 'A', 'В': 'B', 'Е': 'E', 'К': 'K', 'М': 'M', 'Н': 'H', 'О': 'O',
  'Р': 'P', 'С': 'C', 'Т': 'T', 'Х': 'X', 'а': 'a',
  'а': 'a', 'ԁ': 'd', 'і': 'i', 'ј': 'j', 'ѕ': 's', 'ԛ': 'q', 'ԝ': 'w',
  'Α': 'A', 'Β': 'B', 'Γ': 'G', 'Δ': 'D', 'Ε': 'E', 'Ζ': 'Z', 'Η': 'H',
  'Θ': 'Th', 'Ι': 'I', 'Κ': 'K', 'Λ': 'L', 'Μ': 'M', 'Ν': 'N', 'Ξ': 'X',
  'Ο': 'O', 'Π': 'P', 'Ρ': 'R', 'Σ': 'S', 'Τ': 'T', 'Υ': 'Y', 'Φ': 'F',
  'α': 'a', 'β': 'b', 'γ': 'g', 'δ': 'd', 'ε': 'e', 'ζ': 'z', 'η': 'h',
  'θ': 'th', 'ι': 'i', 'κ': 'k', 'λ': 'l', 'μ': 'm', 'ν': 'n', 'ξ': 'x',
  'ο': 'o', 'π': 'p', 'ρ': 'r', 'σ': 's', 'τ': 't', 'υ': 'y', 'φ': 'f',
}

function normalizeText (text) {
  let normalized = text
  normalized = normalized.replace(INVISIBLE_CHARS, '')
  normalized = normalized.replace(/[^\x00-\x7F]/g, (char) => HOMOGLYPH_MAP[char] || char)
  normalized = normalized.replace(/\s+/g, ' ').trim()
  normalized = normalized.normalize('NFKC')
  return normalized
}

function normalizeForSimilarity (text) {
  return normalizeText(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function similarity (a, b) {
  const na = normalizeForSimilarity(a)
  const nb = normalizeForSimilarity(b)
  if (na === nb) return 1
  const trigramsA = new Set()
  for (let i = 0; i < na.length - 2; i++) trigramsA.add(na.slice(i, i + 3))
  const trigramsB = new Set()
  for (let i = 0; i < nb.length - 2; i++) trigramsB.add(nb.slice(i, i + 3))
  if (trigramsA.size === 0 || trigramsB.size === 0) return 0
  let intersection = 0
  for (const t of trigramsA) if (trigramsB.has(t)) intersection++
  return intersection / Math.max(trigramsA.size, trigramsB.size)
}

const postTimestamps = new Map()

function checkRateLimit (author, isReply = false) {
  const now = Date.now()
  const window = isReply ? 60000 : 600000
  const max = isReply ? 3 : 5
  const timestamps = postTimestamps.get(author) || []
  const recent = timestamps.filter(ts => now - ts < window)
  if (recent.length >= max) {
    return { blocked: true, reason: isReply
      ? 'You\'re replying too quickly. Take a breath and engage more thoughtfully.'
      : 'You\'re posting too frequently. Quality over quantity — give your posts some space.' }
  }
  recent.push(now)
  postTimestamps.set(author, recent)
  return { blocked: false }
}

export async function moderatePost (text, author, isReply = false, recentPosts = []) {
  const rateLimit = checkRateLimit(author, isReply)
  if (rateLimit.blocked) {
    return { approved: false, reason: rateLimit.reason, layer: 'rate-limit' }
  }

  if (text.match(/^[a-f0-9]{64}:/) || text.match(/^[A-Za-z0-9+/]{100,}={0,2}$/)) {
    return { approved: true, layer: 'encrypted' }
  }

  const normalized = normalizeText(text)

  for (const { re, reason } of PROMPT_INJECTION) {
    if (re.test(normalized)) {
      log('warn', `Prompt injection blocked: ${reason}`)
      return { approved: false, reason: 'Your post contains patterns that look like an attempt to manipulate the system. If this is a genuine post, try rephrasing it.', layer: 'poisoning' }
    }
  }
  for (const { re, reason } of ENCODING_ATTACKS) {
    if (re.test(normalized)) {
      log('warn', `Encoding attack blocked: ${reason}`)
      return { approved: false, reason: 'Your post contains encoded content that looks like an attack payload.', layer: 'poisoning' }
    }
  }
  if (HOMOGLYPHS.test(text)) {
    log('warn', 'Homoglyph characters detected and normalized')
  }

  for (const { re, reason } of STATIC_BLOCKS) {
    if (re.test(normalized)) {
      log('warn', `Static block: ${reason}`)
      return { approved: false, reason, layer: 'static-block' }
    }
  }

  for (const { re, reason } of PROFANITY_HARD) {
    if (re.test(normalized)) {
      log('warn', `Profanity block: ${reason}`)
      return { approved: false, reason, layer: 'static-block' }
    }
  }

  for (const recentText of recentPosts.slice(0, 20)) {
    const sim = similarity(normalized, recentText)
    if (sim > 0.85) {
      log('warn', `Duplicate post detected (similarity: ${sim.toFixed(2)})`)
      return { approved: false, reason: 'This looks very similar to a recent post. If you have something new to add, try a different angle.', layer: 'dedup' }
    }
  }

  const warnings = []
  for (const { re, reason } of STATIC_WARNINGS) {
    if (re.test(normalized)) {
      warnings.push(reason)
    }
  }
  for (const { re, reason } of PROFANITY_SOFT) {
    if (re.test(normalized)) {
      warnings.push(reason)
    }
  }

  if (warnings.length > 0) {
    return { approved: false, reason: warnings[0], layer: 'static-warning', warnings }
  }

  return { approved: true, layer: 'static-only' }
}
