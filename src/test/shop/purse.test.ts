import { beforeEach, describe, expect, it } from 'vitest'
import {
  CREDIT_PACKS,
  IMAGE_LOTS,
  SHOP_STORAGE_KEY,
  ShopData,
  addCredits,
  buyLot,
  createOrResumeAccount,
  emptyShop,
  formatPhone,
  getActiveAccount,
  isPurseOk,
  loadShop,
  normalizePhone,
  saveShop,
} from '@/shop/purse'

function memoryStorage() {
  const data = new Map<string, string>()
  return {
    getItem(key: string) {
      return data.has(key) ? data.get(key)! : null
    },
    setItem(key: string, value: string) {
      data.set(key, value)
    },
  }
}

const PHONE_A = '06 12 34 56 78'
const PHONE_A_DIGITS = '0612345678'
const PHONE_B = '07.98.76.54.32'
const PHONE_B_DIGITS = '0798765432'

describe('purse', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('normalise un mobile 06 ou 07 et le groupe pour l’affichage', () => {
    expect(normalizePhone('06 12 34 56 78')).toBe(PHONE_A_DIGITS)
    expect(normalizePhone('07.98.76.54.32')).toBe(PHONE_B_DIGITS)
    expect(normalizePhone('0612345678')).toBe(PHONE_A_DIGITS)
    expect(formatPhone(PHONE_A_DIGITS)).toBe('06 12 34 56 78')
    expect(normalizePhone('0512345678')).toBeNull()
    expect(normalizePhone('061234567')).toBeNull()
    expect(normalizePhone('+33612345678')).toBeNull()
    expect(normalizePhone('06 12 34 56 7a')).toBeNull()
  })

  it('crée un compte à 0 crédit qui ne possède rien', () => {
    const result = createOrResumeAccount(emptyShop(), PHONE_A)
    expect(isPurseOk(result)).toBe(true)
    if (!isPurseOk(result)) return
    expect(result.account.phone).toBe(PHONE_A_DIGITS)
    expect(result.account.credits).toBe(0)
    expect(result.account.ownedLotIds).toEqual([])
    expect(result.store.activePhone).toBe(PHONE_A_DIGITS)
  })

  it('refuse un numéro qui n’est pas un mobile 06 ou 07', () => {
    const store = emptyShop()
    const result = createOrResumeAccount(store, '01 23 45 67 89')
    expect(isPurseOk(result)).toBe(false)
    if (isPurseOk(result)) return
    expect(result.reason).toBe('invalid-phone')
    expect(result.store).toBe(store)
    expect(getActiveAccount(result.store)).toBeNull()
  })

  it('retrouve le même compte sans remettre le solde à zéro', () => {
    let store = createOrResumeAccount(emptyShop(), PHONE_A).store
    store = addCredits(store, 'pochette').store
    const again = createOrResumeAccount(store, '0612345678')
    expect(isPurseOk(again)).toBe(true)
    if (!isPurseOk(again)) return
    expect(again.account.credits).toBe(50)
    expect(again.account.ownedLotIds).toEqual([])
  })

  it('change de numéro : le nouveau part de zéro, l’ancien garde son portefeuille', () => {
    let store = createOrResumeAccount(emptyShop(), PHONE_A).store
    store = addCredits(store, 'pochette').store
    store = buyLot(store, 'tapis-rouge').store

    const switched = createOrResumeAccount(store, PHONE_B)
    expect(isPurseOk(switched)).toBe(true)
    if (!isPurseOk(switched)) return
    expect(switched.account.phone).toBe(PHONE_B_DIGITS)
    expect(switched.account.credits).toBe(0)
    expect(switched.account.ownedLotIds).toEqual([])
    expect(switched.store.accounts[PHONE_A_DIGITS].credits).toBe(10)
    expect(switched.store.accounts[PHONE_A_DIGITS].ownedLotIds).toEqual(['tapis-rouge'])

    const back = createOrResumeAccount(switched.store, PHONE_A)
    expect(isPurseOk(back)).toBe(true)
    if (!isPurseOk(back)) return
    expect(back.account.credits).toBe(10)
    expect(back.account.ownedLotIds).toEqual(['tapis-rouge'])
    expect(back.store.accounts[PHONE_B_DIGITS].credits).toBe(0)
  })

  it('ajoute les crédits d’un pack', () => {
    let store = createOrResumeAccount(emptyShop(), PHONE_A).store
    const first = addCredits(store, 'pochette')
    expect(isPurseOk(first)).toBe(true)
    if (!isPurseOk(first)) return
    expect(first.account.credits).toBe(CREDIT_PACKS[0].credits)

    const second = addCredits(first.store, 'seance')
    expect(isPurseOk(second)).toBe(true)
    if (!isPurseOk(second)) return
    expect(second.account.credits).toBe(200)

    const unknown = addCredits(second.store, 'inexistant')
    expect(isPurseOk(unknown)).toBe(false)
    if (isPurseOk(unknown)) return
    expect(unknown.reason).toBe('unknown-pack')
    expect(getActiveAccount(unknown.store)?.credits).toBe(200)
  })

  it('achète un lot et débite le prix', () => {
    let store = createOrResumeAccount(emptyShop(), PHONE_A).store
    store = addCredits(store, 'pochette').store
    const bought = buyLot(store, 'tapis-rouge')
    expect(isPurseOk(bought)).toBe(true)
    if (!isPurseOk(bought)) return
    expect(bought.account.credits).toBe(10)
    expect(bought.account.ownedLotIds).toEqual(['tapis-rouge'])
  })

  it('achète quand le solde est exactement le prix', () => {
    const store: ShopData = {
      activePhone: PHONE_A_DIGITS,
      accounts: {
        [PHONE_A_DIGITS]: { phone: PHONE_A_DIGITS, credits: 40, ownedLotIds: [] },
      },
    }
    const bought = buyLot(store, 'tapis-rouge')
    expect(isPurseOk(bought)).toBe(true)
    if (!isPurseOk(bought)) return
    expect(bought.account.credits).toBe(0)
    expect(bought.account.ownedLotIds).toEqual(['tapis-rouge'])
  })

  it('refuse l’achat sans assez de crédits et laisse le solde intact', () => {
    let store = createOrResumeAccount(emptyShop(), PHONE_A).store
    store = addCredits(store, 'pochette').store
    const refused = buyLot(store, 'cabinet-secret')
    expect(isPurseOk(refused)).toBe(false)
    if (isPurseOk(refused)) return
    expect(refused.reason).toBe('insufficient-credits')
    expect(refused.balance).toBe(50)
    expect(getActiveAccount(refused.store)?.credits).toBe(50)
    expect(getActiveAccount(refused.store)?.ownedLotIds).toEqual([])
    expect(IMAGE_LOTS.find(lot => lot.id === 'cabinet-secret')?.price).toBe(200)
  })

  it('refuse d’acheter un lot déjà possédé', () => {
    let store = createOrResumeAccount(emptyShop(), PHONE_A).store
    store = addCredits(store, 'seance').store
    store = buyLot(store, 'concert-pop').store
    const again = buyLot(store, 'concert-pop')
    expect(isPurseOk(again)).toBe(false)
    if (isPurseOk(again)) return
    expect(again.reason).toBe('already-owned')
    expect(again.balance).toBe(70)
    expect(getActiveAccount(again.store)?.ownedLotIds).toEqual(['concert-pop'])
    expect(getActiveAccount(again.store)?.credits).toBe(70)
  })

  it('persiste le compte, le solde et les lots dans localStorage', () => {
    const storage = memoryStorage()
    let store = createOrResumeAccount(emptyShop(), PHONE_A).store
    store = addCredits(store, 'archive').store
    store = buyLot(store, 'soiree-masquee').store
    saveShop(store, storage)

    expect(storage.getItem(SHOP_STORAGE_KEY)).toContain(PHONE_A_DIGITS)
    const loaded = loadShop(storage)
    expect(loaded.activePhone).toBe(PHONE_A_DIGITS)
    expect(getActiveAccount(loaded)?.credits).toBe(280)
    expect(getActiveAccount(loaded)?.ownedLotIds).toEqual(['soiree-masquee'])

    saveShop(store)
    const fromBrowser = loadShop()
    expect(localStorage.getItem(SHOP_STORAGE_KEY)).toBeTruthy()
    expect(getActiveAccount(fromBrowser)?.credits).toBe(280)
    expect(getActiveAccount(fromBrowser)?.ownedLotIds).toEqual(['soiree-masquee'])
  })

  it('ignore un localStorage illisible', () => {
    const storage = memoryStorage()
    storage.setItem(SHOP_STORAGE_KEY, '{')
    expect(loadShop(storage)).toEqual(emptyShop())
  })
})
