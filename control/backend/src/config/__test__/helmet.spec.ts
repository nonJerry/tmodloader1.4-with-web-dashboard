import { describe, it, expect, vi, beforeEach } from 'vitest'

async function captureHelmet(captured: { options?: Record<string, unknown> }) {
  const actual = await vi.importActual<typeof import('helmet')>('helmet')
  vi.doMock('helmet', () => ({
    default: (options: Record<string, unknown>) => {
      captured.options = options
      //@ts-ignore
      return actual.default(options)
    },
  }))
}

describe('Helmet config', () => {

  beforeEach(() => {
    vi.resetModules()
  })

  it('only allows itself as source', async () => {
    const captured: { options?: Record<string, unknown> } = {}
    await captureHelmet(captured)

    const helmetConfig = (await import('../helmet.js')).default
    expect(typeof helmetConfig).toBe('function')
    expect(captured.options).toEqual({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'",],
          styleSrc: ["'self'"],
        },
      },
    })
  })
})
