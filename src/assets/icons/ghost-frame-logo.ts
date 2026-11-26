import logoSvg from './ghost-frame-logo.svg?raw'

/** Inline SVG of the drawn Ghost Frame mark (ghost plus the words). */
export function ghostFrameLogoHtml(className: string): string {
  return logoSvg.replace(/<svg\b([^>]*)>/, (_match, attrs: string) => {
    const withBox = /viewBox=/.test(attrs) ? attrs : `${attrs} viewBox="0 0 440 206"`
    return `<svg${withBox} class="gf-logo ${className}" role="img" aria-label="Ghost Frame">`
  })
}
