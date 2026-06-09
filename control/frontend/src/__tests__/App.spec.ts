import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../App.vue'

async function mountWithPlayers(players: string) {
  vi.stubGlobal(
    'fetch',
    vi.fn(() =>
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve(players),
      }),
    ),
  )
  const wrapper = mount(App)

  await wrapper.vm.$nextTick()
  await new Promise((resolve) => setTimeout(resolve, 0))

  return wrapper
}

describe('App', () => {

  it('renders title', () => {
    const wrapper = mount(App)

    expect(wrapper.text()).toContain('Terraria Server Control')
  })

  it('renders command buttons', () => {
    const wrapper = mount(App)

    const commands = ['start', 'stop', 'save', 'dawn', 'noon', 'dusk', 'midnight']

    commands.forEach((cmd) => {
      expect(wrapper.text()).toContain(cmd)
    })
  })

  it.each(['0', '1', '10', '100'])(
    'shows %s players online',
    async (players) => {
      const wrapper = await mountWithPlayers(players)
      expect(wrapper.text()).toContain(players)
    },
  )

  it('updates when player count changes', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, text: async () => '1' })
      .mockResolvedValueOnce({ ok: true, text: async () => '4' })

    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(App)

    await wrapper.vm.$nextTick()
    await new Promise((r) => setTimeout(r, 0))
    expect(wrapper.text()).toContain('1')

    // need to wait for next value
    await (wrapper.vm as any).fetchStatus()
    await wrapper.vm.$nextTick()
    await new Promise((r) => setTimeout(r, 0))
    expect(wrapper.text()).toContain('4')
  })
})