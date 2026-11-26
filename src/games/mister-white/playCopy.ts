/** One-paragraph rules shown before the detailed rules screen. */
export const RULES_SUMMARY =
  "Ghost Frame se joue à plusieurs sur un seul téléphone. Chaque joueur reçoit en secret une image : les Experts ont la vraie scène, les Novices une image proche, et le Fantôme aucune. Chacun décrit sa photo sans la montrer, puis le groupe vote pour éliminer un joueur. Les Experts gagnent s'ils démasquent le Fantôme, le Fantôme gagne s'il survit ou devine la scène, et les Novices gagnent si les Experts et le Fantôme sont éliminés."

/**
 * With 3 or 4 players the table can take several speaking turns before voting.
 * Hidden from 5 players upward.
 */
export function smallGroupSpeechNote(playerCount: number): string | null {
  if (playerCount === 3 || playerCount === 4) {
    return 'À 3 ou 4 joueurs, vous pouvez faire plusieurs tours de parole avant de décider qui éliminer.'
  }
  return null
}
