import { describe, it, expect } from 'vitest'
import { generateGameCode, validateGameCode, formatGameCode } from '@utils/gameCode'

describe('gameCode utilities', () => {
  describe('generateGameCode', () => {
    it('should generate a 6-character code', () => {
      const code = generateGameCode()
      expect(code).toHaveLength(6)
    })

    it('should generate codes with only uppercase letters', () => {
      const code = generateGameCode()
      expect(code).toMatch(/^[A-Z]{6}$/)
    })

    it('should generate different codes on multiple calls', () => {
      const codes = new Set()
      for (let i = 0; i < 100; i++) {
        codes.add(generateGameCode())
      }
      // Il devrait y avoir plusieurs codes différents (probabilité très élevée)
      expect(codes.size).toBeGreaterThan(50)
    })
  })

  describe('validateGameCode', () => {
    it('should validate correct codes', () => {
      expect(validateGameCode('ABCDEF')).toBe(true)
      expect(validateGameCode('ZYXWVU')).toBe(true)
    })

    it('should reject invalid codes', () => {
      expect(validateGameCode('')).toBe(false)
      expect(validateGameCode('ABC')).toBe(false) // Trop court
      expect(validateGameCode('ABCDEFG')).toBe(false) // Trop long
      expect(validateGameCode('ABC123')).toBe(false) // Contient des chiffres
      expect(validateGameCode('abc def')).toBe(false) // Minuscules et espace
      expect(validateGameCode('ABCD@F')).toBe(false) // Caractère spécial
    })

    it('should handle null and undefined', () => {
      expect(validateGameCode(null as any)).toBe(false)
      expect(validateGameCode(undefined as any)).toBe(false)
    })

    it('should handle whitespace', () => {
      expect(validateGameCode('  ABCDEF  ')).toBe(true) // Espaces autour
      expect(validateGameCode('ABC DEF')).toBe(false) // Espace au milieu
    })
  })

  describe('formatGameCode', () => {
    it('should format 6-character codes with space', () => {
      expect(formatGameCode('ABCDEF')).toBe('ABC DEF')
      expect(formatGameCode('ZYXWVU')).toBe('ZYX WVU')
    })

    it('should handle lowercase input', () => {
      expect(formatGameCode('abcdef')).toBe('ABC DEF')
    })

    it('should handle codes with whitespace', () => {
      expect(formatGameCode('  ABCDEF  ')).toBe('ABC DEF')
    })

    it('should return original for invalid lengths', () => {
      expect(formatGameCode('ABC')).toBe('ABC')
      expect(formatGameCode('ABCDEFG')).toBe('ABCDEFG')
    })

    it('should handle empty input', () => {
      expect(formatGameCode('')).toBe('')
      expect(formatGameCode(null as any)).toBe('')
      expect(formatGameCode(undefined as any)).toBe('')
    })
  })
})
