import { describe, it, expect, vi } from 'vitest'
import { startIdleTimer } from '../timer-auto-lock'

describe('timer-auto-lock', () => {
  it('should start idle timer', async () => {
    const timeoutId = ''
    const handleIdle = () => {
      console.log('Idle')
    }
    const idleTimeInMinutes = 1
    const timeout = startIdleTimer(idleTimeInMinutes, timeoutId, handleIdle)
    expect(timeout).not.toBe(null)
  })

  it('should clear timeout', () => {
    vi.useFakeTimers()
    const timeoutId = ''
    const handleIdle = vi.fn()
    const idleTimeInMinutes = 1
    const timeout = startIdleTimer(idleTimeInMinutes, timeoutId, handleIdle)

    clearTimeout(timeout)

    // Fast-forward time to ensure the timeout would have executed
    vi.advanceTimersByTime(idleTimeInMinutes * 60000)

    // Check if the handleIdle was not called
    expect(handleIdle).not.toHaveBeenCalled()

    // Restore the original timers
    vi.useRealTimers()
  })

  it('should handle idle', async () => {
    vi.useFakeTimers()
    const timeoutId = ''
    const handleIdle = vi.fn()
    const idleTimeInMinutes = 1
    const timeout = startIdleTimer(idleTimeInMinutes, timeoutId, handleIdle)

    // Fast-forward time to ensure the timeout would have executed
    vi.advanceTimersByTime(idleTimeInMinutes * 60000)

    // Check if the handleIdle was called
    expect(handleIdle).toHaveBeenCalled()

    // Restore the original timers
    vi.useRealTimers()
  })
})
