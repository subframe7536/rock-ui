import type { ClassValue } from 'cls-variant'

/**
 * Generic slot classes map for component APIs.
 */
export type SlotClasses<TSlot extends string> = Partial<Record<TSlot, ClassValue>>
