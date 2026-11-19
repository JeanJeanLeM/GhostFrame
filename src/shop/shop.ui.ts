import {
  CREDIT_PACKS,
  IMAGE_LOTS,
  KeyValueStorage,
  PurseFailureResult,
  PurseResult,
  ShopAccount,
  ShopData,
  addCredits,
  buyLot,
  createOrResumeAccount,
  formatCredits,
  formatPhone,
  getActiveAccount,
  isPurseOk,
  loadShop,
  saveShop,
} from '@/shop/purse'

type ShopStep = 'account' | 'credits' | 'lots'

interface Notice {
  tone: 'ok' | 'error'
  text: string
}

interface PendingPurchase {
  kind: 'pack' | 'lot'
  id: string
}

/**
 * Boutique en trois étapes : compte (numéro), crédits, lots.
 * Les achats sont confirmés sur l'appareil.
 */
export class ShopUI {
  private store: ShopData
  private step: ShopStep = 'account'
  private phoneDraft: string
  /** Vrai seulement après validation du numéro dans cette visite. */
  private phoneConfirmed = false
  private pending: PendingPurchase | null = null
  private notice: Notice | null = null

  constructor(
    private container: HTMLElement,
    private onClose: () => void,
    private storage: KeyValueStorage = localStorage
  ) {
    this.store = loadShop(storage)
    const active = getActiveAccount(this.store)
    this.phoneDraft = active ? formatPhone(active.phone) : ''
  }

  render(): void {
    const screen = document.createElement('div')
    screen.className = 'shop-screen flex flex-col min-h-screen w-full bg-gradient-to-br from-beige-100 via-beige-200 to-beige-100'
    screen.innerHTML = `
      <div class="w-full max-w-lg mx-auto flex flex-col flex-1 px-4 py-4">
        <button
          type="button"
          data-shop-action="close"
          class="text-beige-700 hover:text-beige-900 text-sm font-medium mb-3 flex items-center gap-1 self-start"
        >
          ← Accueil
        </button>

        <h1 class="text-xl font-bold text-beige-900 text-center">Boutique d'images</h1>
        <p class="text-beige-700 text-sm text-center mt-1 mb-4">
          Des crédits, puis des lots. Tout reste sur cet appareil.
        </p>

        ${this.renderSteps()}
        ${this.renderNotice()}
        <div class="flex-1">
          ${this.renderStep()}
        </div>
      </div>
    `

    this.container.innerHTML = ''
    this.container.appendChild(screen)
    this.bind(screen)
  }

  private renderSteps(): string {
    const account = getActiveAccount(this.store)
    const steps: Array<{ id: ShopStep; label: string }> = [
      { id: 'account', label: 'Compte' },
      { id: 'credits', label: 'Crédits' },
      { id: 'lots', label: 'Lots' },
    ]

    return `
      <div class="grid grid-cols-3 gap-2 mb-4" role="tablist" aria-label="Étapes de la boutique">
        ${steps.map(step => {
          const locked = step.id !== 'account' && (!account || !this.phoneConfirmed)
          const active = this.step === step.id
          const classes = active
            ? 'bg-primary-600 text-white'
            : 'bg-beige-50 text-beige-800 border border-beige-400'
          return `
            <button
              type="button"
              role="tab"
              data-shop-action="step"
              data-step="${step.id}"
              aria-selected="${active ? 'true' : 'false'}"
              ${locked ? 'disabled' : ''}
              class="py-2 px-2 rounded-xl text-sm font-semibold ${classes} disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ${step.label}
            </button>
          `
        }).join('')}
      </div>
    `
  }

  private renderNotice(): string {
    if (!this.notice) return ''
    const tone = this.notice.tone === 'error'
      ? 'bg-error-50 text-error-800 border-error-500'
      : 'bg-success-50 text-success-800 border-success-500'
    return `
      <p role="status" class="mb-4 rounded-xl border px-3 py-2 text-sm ${tone}">
        ${escapeHtml(this.notice.text)}
      </p>
    `
  }

  private renderStep(): string {
    if (this.step === 'credits') return this.renderCredits()
    if (this.step === 'lots') return this.renderLots()
    return this.renderAccount()
  }

  private renderAccount(): string {
    return `
      <form id="shop-phone-form" class="bg-beige-50/90 rounded-2xl border border-beige-400 p-4">
        <label for="shop-phone" class="block text-sm font-semibold text-beige-800 mb-2">
          Numéro de mobile
        </label>
        <input
          id="shop-phone"
          name="phone"
          type="tel"
          inputmode="tel"
          autocomplete="tel"
          placeholder="06 12 34 56 78"
          value="${escapeHtml(this.phoneDraft)}"
          class="w-full px-4 py-3 bg-beige-100 border-2 border-beige-400 text-beige-900 rounded-xl text-lg tracking-wide focus:outline-none focus:border-primary-500"
        />
        <p class="text-sm text-beige-700 mt-2">
          06 ou 07, puis 8 chiffres. Pas de mot de passe, pas de SMS : le numéro ouvre le compte sur cet appareil.
        </p>
        <button
          type="submit"
          class="w-full mt-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold py-3.5 px-6 rounded-xl"
        >
          Continuer
        </button>
      </form>
    `
  }

  private renderCredits(): string {
    const account = getActiveAccount(this.store)
    if (!account) return this.renderAccount()

    return `
      ${this.renderPurse(account)}
      <h2 class="text-sm font-bold text-beige-900 uppercase tracking-wide mb-2">Recharger</h2>
      <div class="space-y-2">
        ${CREDIT_PACKS.map(pack => `
          <button
            type="button"
            data-shop-action="select-pack"
            data-pack-id="${pack.id}"
            class="w-full text-left bg-beige-50 border ${this.pending?.kind === 'pack' && this.pending.id === pack.id ? 'border-primary-500' : 'border-beige-400'} rounded-xl px-4 py-3 flex items-center justify-between"
          >
            <span>
              <span class="block font-semibold text-beige-900">${escapeHtml(pack.name)}</span>
              <span class="block text-sm text-beige-700">${formatCredits(pack.credits)}</span>
            </span>
            <span class="text-sm font-semibold text-primary-700">Choisir</span>
          </button>
        `).join('')}
      </div>
      ${this.renderConfirm()}
      <button
        type="button"
        data-shop-action="step"
        data-step="lots"
        class="w-full mt-4 border-2 border-primary-500 text-primary-700 font-semibold py-3 px-6 rounded-xl"
      >
        Voir les lots
      </button>
    `
  }

  private renderLots(): string {
    const account = getActiveAccount(this.store)
    if (!account) return this.renderAccount()

    return `
      ${this.renderPurse(account)}
      <h2 class="text-sm font-bold text-beige-900 uppercase tracking-wide mb-2">Lots d'images</h2>
      <div class="space-y-2">
        ${IMAGE_LOTS.map(lot => {
          const owned = account.ownedLotIds.includes(lot.id)
          return `
            <div class="bg-beige-50 border border-beige-400 rounded-xl px-4 py-3 flex items-center justify-between gap-3 ${owned ? 'opacity-80' : ''}">
              <div>
                <p class="font-semibold text-beige-900">${escapeHtml(lot.name)}</p>
                <p class="text-sm text-beige-700">${formatCredits(lot.price)}</p>
              </div>
              ${owned
                ? `<button type="button" disabled class="shrink-0 px-3 py-2 rounded-lg bg-beige-200 text-beige-600 text-sm font-semibold cursor-not-allowed">Déjà à vous</button>`
                : `<button type="button" data-shop-action="select-lot" data-lot-id="${lot.id}" class="shrink-0 px-3 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold">Acheter</button>`
              }
            </div>
          `
        }).join('')}
      </div>
      ${this.renderConfirm()}
    `
  }

  private renderPurse(account: ShopAccount): string {
    return `
      <div class="bg-beige-50 rounded-xl border border-beige-400 px-4 py-3 mb-4 flex items-center justify-between gap-3">
        <div>
          <p class="text-xs uppercase tracking-wide text-beige-600">Compte</p>
          <p class="font-semibold text-beige-900">${escapeHtml(formatPhone(account.phone))}</p>
          <button type="button" data-shop-action="step" data-step="account" class="text-sm text-primary-700 font-medium mt-1">
            Changer de numéro
          </button>
        </div>
        <div class="text-right">
          <p class="text-xs uppercase tracking-wide text-beige-600">Solde</p>
          <p class="font-bold text-beige-900">${formatCredits(account.credits)}</p>
        </div>
      </div>
    `
  }

  private renderConfirm(): string {
    if (!this.pending) return ''
    const account = getActiveAccount(this.store)
    if (!account) return ''

    if (this.pending.kind === 'pack') {
      const pack = CREDIT_PACKS.find(item => item.id === this.pending?.id)
      if (!pack) return ''
      return this.confirmCard(
        `Ajouter ${formatCredits(pack.credits)} ?`,
        `${pack.name}. Confirmé sur cet appareil, aucun paiement en ligne.`
      )
    }

    const lot = IMAGE_LOTS.find(item => item.id === this.pending?.id)
    if (!lot) return ''
    return this.confirmCard(
      `Acheter « ${lot.name} » ?`,
      `${formatCredits(lot.price)} seront débités. Solde actuel : ${formatCredits(account.credits)}.`
    )
  }

  private confirmCard(title: string, detail: string): string {
    return `
      <div class="mt-4 rounded-xl border-2 border-primary-500 bg-beige-50 p-4" role="group" aria-label="Confirmer l'achat">
        <p class="font-semibold text-beige-900">${escapeHtml(title)}</p>
        <p class="text-sm text-beige-700 mt-1">${escapeHtml(detail)}</p>
        <div class="grid grid-cols-2 gap-2 mt-3">
          <button type="button" data-shop-action="cancel" class="py-3 rounded-xl bg-beige-200 text-beige-900 font-semibold">
            Annuler
          </button>
          <button type="button" data-shop-action="confirm" class="py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold">
            Confirmer
          </button>
        </div>
      </div>
    `
  }

  private bind(screen: HTMLElement): void {
    const form = screen.querySelector('#shop-phone-form')
    form?.addEventListener('submit', (event) => {
      event.preventDefault()
      const input = screen.querySelector('#shop-phone') as HTMLInputElement | null
      this.phoneDraft = input?.value ?? this.phoneDraft
      this.submitPhone()
    })

    const input = screen.querySelector('#shop-phone') as HTMLInputElement | null
    input?.addEventListener('input', () => {
      this.phoneDraft = input.value
    })

    screen.addEventListener('click', (event) => {
      const target = event.target as HTMLElement
      const control = target.closest('[data-shop-action]') as HTMLElement | null
      if (!control || control.tagName === 'FORM') return
      const action = control.dataset.shopAction
      if (action === 'close') {
        this.onClose()
        return
      }
      if (action === 'step') {
        this.goToStep((control.dataset.step || 'account') as ShopStep)
        return
      }
      if (action === 'select-pack') {
        this.selectPack(control.dataset.packId || '')
        return
      }
      if (action === 'select-lot') {
        this.selectLot(control.dataset.lotId || '')
        return
      }
      if (action === 'cancel') {
        this.pending = null
        this.render()
        return
      }
      if (action === 'confirm') {
        this.confirmPurchase()
      }
    })
  }

  private submitPhone(): void {
    const result = createOrResumeAccount(this.store, this.phoneDraft)
    if (!isPurseOk(result)) {
      this.notice = {
        tone: 'error',
        text: 'Numéro invalide. Indiquez un mobile 06 ou 07, puis 8 chiffres.',
      }
      this.render()
      return
    }

    const resumed = result.account.credits > 0 || result.account.ownedLotIds.length > 0
    this.persist(result)
    this.phoneDraft = formatPhone(result.account.phone)
    this.phoneConfirmed = true
    this.step = 'credits'
    this.pending = null
    this.notice = {
      tone: 'ok',
      text: resumed ? 'Compte retrouvé.' : 'Compte créé. Solde : 0 crédits.',
    }
    this.render()
  }

  private goToStep(step: ShopStep): void {
    if (step === 'account') {
      this.phoneConfirmed = false
      this.step = 'account'
      this.pending = null
      this.notice = null
      this.render()
      return
    }
    if (!this.phoneConfirmed || !getActiveAccount(this.store)) {
      this.phoneConfirmed = false
      this.step = 'account'
      this.notice = { tone: 'error', text: 'Indiquez votre numéro pour continuer.' }
      this.render()
      return
    }
    this.step = step
    this.pending = null
    this.notice = null
    this.render()
  }

  private selectPack(packId: string): void {
    const pack = CREDIT_PACKS.find(item => item.id === packId)
    if (!pack) return
    this.pending = { kind: 'pack', id: pack.id }
    this.notice = null
    this.render()
  }

  private selectLot(lotId: string): void {
    const lot = IMAGE_LOTS.find(item => item.id === lotId)
    const account = getActiveAccount(this.store)
    if (!lot || !account) return

    if (account.ownedLotIds.includes(lot.id)) {
      this.pending = null
      this.notice = { tone: 'error', text: 'Ce lot est déjà à vous.' }
      this.render()
      return
    }

    if (account.credits < lot.price) {
      this.pending = null
      this.notice = {
        tone: 'error',
        text: `Pas assez de crédits. Solde : ${formatCredits(account.credits)}.`,
      }
      this.render()
      return
    }

    this.pending = { kind: 'lot', id: lot.id }
    this.notice = null
    this.render()
  }

  private confirmPurchase(): void {
    if (!this.pending) return
    const pending = this.pending
    const result = pending.kind === 'pack'
      ? addCredits(this.store, pending.id)
      : buyLot(this.store, pending.id)

    if (!isPurseOk(result)) {
      this.pending = null
      this.notice = { tone: 'error', text: failureMessage(result) }
      this.render()
      return
    }

    this.persist(result)
    this.pending = null
    this.notice = { tone: 'ok', text: successMessage(pending, result.account) }
    this.render()
  }

  private persist(result: Extract<PurseResult, { ok: true }>): void {
    this.store = result.store
    saveShop(this.store, this.storage)
  }
}

function successMessage(pending: PendingPurchase, account: ShopAccount): string {
  if (pending.kind === 'pack') {
    const pack = CREDIT_PACKS.find(item => item.id === pending.id)
    const added = pack ? formatCredits(pack.credits) : 'Crédits'
    return `${added} ajoutés. Solde : ${formatCredits(account.credits)}.`
  }
  const lot = IMAGE_LOTS.find(item => item.id === pending.id)
  const name = lot ? lot.name : 'Ce lot'
  return `« ${name} » est à vous. Solde : ${formatCredits(account.credits)}.`
}

function failureMessage(result: PurseFailureResult): string {
  if (result.reason === 'insufficient-credits') {
    return `Pas assez de crédits. Solde : ${formatCredits(result.balance ?? 0)}.`
  }
  if (result.reason === 'already-owned') return 'Ce lot est déjà à vous.'
  if (result.reason === 'invalid-phone') {
    return 'Numéro invalide. Indiquez un mobile 06 ou 07, puis 8 chiffres.'
  }
  return 'Achat impossible.'
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
