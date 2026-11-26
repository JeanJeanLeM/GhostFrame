import logoSvg from './ghost-frame-logo.svg?raw'

/** Inline SVG of the original Ghost Frame mark: SD card, ghost, and wordmark. */
export function ghostFrameLogoHtml(className: string): string {
  return logoSvg.replace(/<svg\b([^>]*)>/, (_match, attrs: string) => {
    const withBox = /viewBox=/.test(attrs) ? attrs : `${attrs} viewBox="0 0 660 430"`
    return `<svg${withBox} class="gf-logo ${className}" role="img" aria-label="Ghost Frame">`
  })
}
