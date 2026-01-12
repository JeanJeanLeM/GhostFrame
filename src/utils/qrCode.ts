import QRCode from 'qrcode'

/**
 * Génère un QR code pour rejoindre une partie
 */
export async function generateGameQRCode(gameCode: string): Promise<string> {
  try {
    const baseUrl = import.meta.env.VITE_BASE_URL || window.location.origin
    const gameUrl = `${baseUrl}/join/${gameCode}`
    
    const qrCodeDataUrl = await QRCode.toDataURL(gameUrl, {
      errorCorrectionLevel: 'M',
      margin: 1,
      color: {
        dark: '#1f2937', // Couleur sombre
        light: '#ffffff' // Couleur claire
      },
      width: 256
    })
    
    return qrCodeDataUrl
  } catch (error) {
    console.error('Erreur lors de la génération du QR code:', error)
    throw new Error('Impossible de générer le QR code')
  }
}

/**
 * Crée un élément img avec le QR code
 */
export async function createQRCodeElement(gameCode: string, className: string = ''): Promise<HTMLImageElement> {
  const qrCodeDataUrl = await generateGameQRCode(gameCode)
  
  const img = document.createElement('img')
  img.src = qrCodeDataUrl
  img.alt = `QR Code pour rejoindre la partie ${gameCode}`
  img.className = className
  
  return img
}

/**
 * Télécharge le QR code comme image
 */
export async function downloadQRCode(gameCode: string, filename?: string): Promise<void> {
  try {
    const qrCodeDataUrl = await generateGameQRCode(gameCode)
    
    const link = document.createElement('a')
    link.download = filename || `partie-${gameCode}.png`
    link.href = qrCodeDataUrl
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('Erreur lors du téléchargement du QR code:', error)
    throw new Error('Impossible de télécharger le QR code')
  }
}
