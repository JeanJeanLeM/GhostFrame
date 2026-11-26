import logoSvg from './ghost-frame-logo.svg?raw'

/** Inline SVG of the Ghost Frame wordmark, traced from the previous logo image. */
export function ghostFrameLogoHtml(className: string): string {
  return logoSvg.replace(/<svg\b([^>]*)>/, (_match, attrs: string) => {
    const withBox = /viewBox=/.test(attrs) ? attrs : `${attrs} viewBox="0 0 768 506"`
    return `<svg${withBox} class="${className}" role="img" aria-label="Ghost Frame">`
  })
}
