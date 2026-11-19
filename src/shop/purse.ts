/**
 * Portefeuille de la boutique : numéro de mobile, crédits, lots possédés.
 * Tout reste sur l'appareil (localStorage). Aucun paiement, aucun compte distant.
 */

export const SHOP_STORAGE_KEY = 'ghostframe-shop'

export interface CreditPack {
  id: string
  name: string
  credits: number
}

export interface ImageLot {
  id: string
  name: string
  price: number
}

export const CREDIT_PACKS: readonly CreditPack[] = [
  { id: 'pochette', name: 'Pochette', credits: 50 },
  { id: 'seance', name: 'Séance', credits: 150 },
  { id: 'archive', name: 'Archive', credits: 400 },
]

export const IMAGE_LOTS: readonly ImageLot[] = [
  { id: 'tapis-rouge', name: 'Tapis rouge', price: 40 },
  { id: 'match-de-foot', name: 'Match de foot', price: 60 },
  { id: 'concert-pop', name: 'Concert pop', price: 80 },
  { id: 'soiree-masquee', name: 'Soirée masquée', price: 120 },
  { id: 'cabinet-secret', name: 'Cabinet secret', price: 200 },
]

export interface ShopAccount {
  phone: string
  credits: number
  ownedLotIds: string[]
}

export interface ShopData {
  activePhone: string | null
  accounts: Record<string, ShopAccount>
}

export type PurseFailure =
  | 'invalid-phone'
  | 'no-account'
  | 'unknown-pack'
  | 'unknown-lot'
  | 'insufficient-credits'
  | 'already-owned'

export interface PurseSuccess {
  ok: true
  store: ShopData
  account: ShopAccount
}

export interface PurseFailureResult {
  ok: false
  reason: PurseFailure
  store: ShopData
  account: ShopAccount | null
  balance: number | null
}

export type PurseResult = PurseSuccess | PurseFailureResult

/** Le discriminant booléen ne se réduit pas tant que strictNullChecks est désactivé. */
export function isPurseOk(result: PurseResult): result is PurseSuccess {
  return result.ok === true
}

export interface KeyValueStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

const KNOWN_LOT_IDS = new Set(IMAGE_LOTS.map(lot => lot.id))

/** Mobile français : 06 ou 07, puis 8 chiffres. Les séparateurs courants sont ignorés. */
export function normalizePhone(input: string): string | null {
  if (typeof input !== 'string') return null
  const trimmed = input.trim()
  if (!trimmed || !/^[\d\s.\-()/]+$/.test(trimmed)) return null
  const digits = trimmed.replace(/\D/g, '')
  if (!/^0[67]\d{8}$/.test(digits)) return null
  return digits
}

/** Affichage groupé : 06 12 34 56 78. */
export function formatPhone(phone: string): string {
  const digits = normalizePhone(phone) ?? phone.replace(/\D/g, '')
  return digits.replace(/(\d{2})(?=\d)/g, '$1 ')
}

export function formatCredits(amount: number): string {
  const credits = Math.max(0, Math.floor(amount))
  return `${credits} crédit${credits === 1 ? '' : 's'}`
}

export function emptyShop(): ShopData {
  return { activePhone: null, accounts: {} }
}

export function getActiveAccount(store: ShopData): ShopAccount | null {
  if (!store.activePhone) return null
  const account = store.accounts[store.activePhone]
  if (!account) return null
  return copyAccount(account)
}

export function createOrResumeAccount(store: ShopData, rawPhone: string): PurseResult {
  const phone = normalizePhone(rawPhone)
  if (!phone) return fail(store, 'invalid-phone')

  const existing = store.accounts[phone]
  const account: ShopAccount = existing
    ? copyAccount(existing)
    : { phone, credits: 0, ownedLotIds: [] }

  return { ok: true, store: withAccount(store, account), account }
}

export function addCredits(store: ShopData, packId: string): PurseResult {
  const current = currentAccount(store)
  if (!current) return fail(store, 'no-account')

  const pack = CREDIT_PACKS.find(item => item.id === packId)
  if (!pack) return fail(store, 'unknown-pack', current)

  const account: ShopAccount = {
    phone: current.phone,
    credits: current.credits + pack.credits,
    ownedLotIds: [...current.ownedLotIds],
  }
  return { ok: true, store: withAccount(store, account), account }
}

export function buyLot(store: ShopData, lotId: string): PurseResult {
  const current = currentAccount(store)
  if (!current) return fail(store, 'no-account')

  const lot = IMAGE_LOTS.find(item => item.id === lotId)
  if (!lot) return fail(store, 'unknown-lot', current)

  if (current.ownedLotIds.includes(lot.id)) {
    return fail(store, 'already-owned', current)
  }
  if (current.credits < lot.price) {
    return fail(store, 'insufficient-credits', current)
  }

  const account: ShopAccount = {
    phone: current.phone,
    credits: current.credits - lot.price,
    ownedLotIds: [...current.ownedLotIds, lot.id],
  }
  return { ok: true, store: withAccount(store, account), account }
}

export function loadShop(storage: KeyValueStorage = localStorage): ShopData {
  try {
    const raw = storage.getItem(SHOP_STORAGE_KEY)
    if (!raw) return emptyShop()
    return sanitizeShop(JSON.parse(raw))
  } catch {
    return emptyShop()
  }
}

export function saveShop(store: ShopData, storage: KeyValueStorage = localStorage): void {
  try {
    storage.setItem(SHOP_STORAGE_KEY, JSON.stringify(store))
  } catch {
    // localStorage indisponible (mode privé, etc.)
  }
}

function currentAccount(store: ShopData): ShopAccount | null {
  if (!store.activePhone) return null
  return store.accounts[store.activePhone] ?? null
}

function copyAccount(account: ShopAccount): ShopAccount {
  return {
    phone: account.phone,
    credits: account.credits,
    ownedLotIds: [...account.ownedLotIds],
  }
}

function withAccount(store: ShopData, account: ShopAccount): ShopData {
  return {
    activePhone: account.phone,
    accounts: {
      ...store.accounts,
      [account.phone]: copyAccount(account),
    },
  }
}

function fail(
  store: ShopData,
  reason: PurseFailure,
  account: ShopAccount | null = getActiveAccount(store)
): PurseFailureResult {
  return {
    ok: false,
    reason,
    store,
    account,
    balance: account ? account.credits : null,
  }
}

function sanitizeShop(value: unknown): ShopData {
  if (!isRecord(value) || !isRecord(value.accounts)) return emptyShop()

  const accounts: Record<string, ShopAccount> = {}
  for (const [key, raw] of Object.entries(value.accounts)) {
    const account = sanitizeAccount(key, raw)
    if (account) accounts[account.phone] = account
  }

  const activePhone = typeof value.activePhone === 'string' && accounts[value.activePhone]
    ? value.activePhone
    : null

  return { activePhone, accounts }
}

function sanitizeAccount(key: string, value: unknown): ShopAccount | null {
  const phone = normalizePhone(key)
  if (!phone || phone !== key || !isRecord(value)) return null

  const creditsRaw = value.credits
  const credits = typeof creditsRaw === 'number' && Number.isFinite(creditsRaw)
    ? Math.max(0, Math.floor(creditsRaw))
    : 0

  const ownedLotIds: string[] = []
  if (Array.isArray(value.ownedLotIds)) {
    for (const id of value.ownedLotIds) {
      if (typeof id === 'string' && KNOWN_LOT_IDS.has(id) && !ownedLotIds.includes(id)) {
        ownedLotIds.push(id)
      }
    }
  }

  return { phone, credits, ownedLotIds }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
