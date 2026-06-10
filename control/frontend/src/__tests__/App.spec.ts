import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import App from '../App.vue'

async function mountWithPlayers(players: string) {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => {
      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve(players),
      })
    },
    ),
  )
  const wrapper = mount(App)

  await flushPromises()
  return wrapper
}

describe('App', () => {

  it('renders title', async () => {
    const wrapper = await mountWithPlayers('1')

    expect(wrapper.text()).toContain('Terraria Server Control')
  })

  it.each(['0', '1', '10', '100'])(
    'shows %s players online',
    async (players) => {
      const wrapper = await mountWithPlayers(players)
      expect(wrapper.text()).toContain(players)
    },
  )

  it('updates when player count changes', async () => {
    const fetchMock = vi.fn<() => Promise<{ ok: boolean; text: () => Promise<string> }>>()
      .mockResolvedValueOnce({ ok: true, text: async () => '1' })
      .mockResolvedValueOnce({ ok: true, text: async () => '4' })
    vi.stubGlobal('fetch', fetchMock)
    const wrapper = mount(App)

    await flushPromises()
    expect(wrapper.text()).toContain('1')

    await (wrapper.vm as any).fetchStatus()
    await flushPromises()
    expect(wrapper.text()).toContain('4')
  })
})

describe('Buttons', () => {

  it('are all displayed', async () => {
    const wrapper = await mountWithPlayers('1')
    const commands = ['start', 'stop', 'save', 'dawn', 'noon', 'dusk', 'midnight']

    commands.forEach((cmd) => {
      expect(wrapper.text()).toContain(cmd)
    })
  })


  it('are disabled except start when server is stopped', async () => {
    const wrapper = await mountWithPlayers('STOPPED')
    const buttons = wrapper.findAll('button')

    buttons.forEach((btn) => {
      const label = btn.text()
      if (label === 'start') {
        expect(btn.element.disabled).toBe(false)
      } else {
        expect(btn.element.disabled).toBe(true)
      }
    })
  })

  it('are disabled immediately on click until next status update', async () => {
    const wrapper = await mountWithPlayers('1')

    const anyBtn = wrapper.find('button')
    let buttons = wrapper.findAll('button')
    buttons.forEach(btn => expect(btn.element.disabled).toBe(false))

    await anyBtn.trigger('click')
    wrapper.findAll('button').forEach(btn => expect(btn.element.disabled).toBe(true))

    await (wrapper.vm as any).fetchStatus()
    wrapper.findAll('button').forEach(btn => expect(btn.element.disabled).toBe(false))
  })
})