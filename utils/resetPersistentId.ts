'use client'
import { v4 as uuidv4 } from 'uuid'

/**
 * Resets the persistentId to a new UUID
 * This function should be called before signing out to ensure a new persistentId is generated on next login
 */
export const resetPersistentId = (): void => {
  try {
    localStorage.setItem('state:persistentId', JSON.stringify(uuidv4()))
  } catch (error) {
    console.error('Error resetting persistentId:', error)
  }
}