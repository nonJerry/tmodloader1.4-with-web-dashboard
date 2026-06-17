import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { startStatusPolling } from '../status.service.js'

describe('Status service', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(globalThis, 'setInterval')
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('starts polling every 5 seconds', () => {
    startStatusPolling()
    expect(globalThis.setInterval).toHaveBeenCalledWith(expect.any(Function), 5000)
  })
})
