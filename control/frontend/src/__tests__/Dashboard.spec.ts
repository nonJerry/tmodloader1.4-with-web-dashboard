/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi, type Mock } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import Dashboard from '@/views/DashboardView.vue'
import { useApi } from '@/api/useAPI'


vi.mock('@/api/useAPI', () => ({
  useApi: vi.fn<() => { get: () => Promise<StatusResponse>; post: () => Promise<object> }>(),
  getCsrfToken: vi.fn<() => Promise<csrfResponse>>()
}))

type StatusResponse = { data: string }
type csrfResponse = { data: { csrfToken: string } }
const mockedUseApi = vi.mocked(useApi)



async function mountWithPlayers(players: string, apiMocks: { post?: Mock<() => Promise<object>> } = {}) {
  const mockGet = vi.fn<() => Promise<StatusResponse>>().mockResolvedValue({
    data: players,
  })

  const mockPost = apiMocks.post
    ?? vi.fn<() => Promise<object>>().mockResolvedValue({ status: 200 })

  mockedUseApi.mockReturnValue({ get: mockGet, post: mockPost } as any)

  const wrapper = mount(Dashboard)
  await flushPromises()
  return wrapper
}

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void
  let reject!: (reason?: any) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

describe('Dashboard', () => {

  it('renders title', async () => {
    const wrapper = await mountWithPlayers('1')

    expect(wrapper.find('h1').text()).toContain('Terraria Server Control')
  })

  it('shows that server is stopped', async () => {
    const wrapper = await mountWithPlayers('STOPPED')

    expect(wrapper.find('.player-count').text()).toContain('STOPPED')
    expect(wrapper.find('.status-card').text()).toContain('STOPPED')

  })

  it.each(['0', '1', '10', '100'])(
    'shows %s players online',
    async (players) => {
      const wrapper = await mountWithPlayers(players)
      expect(wrapper.find('.player-count').text()).toContain(players)
    },
  )

  it('updates when player count changes', async () => {
    /* oxlint-disable-next-line @vitest/require-mock-type-parameters */
    const mockGet = vi.fn()
      .mockResolvedValueOnce({ data: '1' })
      .mockResolvedValueOnce({ data: '4' })
    mockedUseApi.mockReturnValue({ get: mockGet } as any)


    const wrapper = mount(Dashboard)

    await flushPromises()
    expect(wrapper.find('.player-count').text()).toContain('1')

    await (wrapper.vm as any).getStatus()
    await flushPromises()
    expect(wrapper.find('.player-count').text()).toContain('4')
  })
})

describe('Buttons', () => {

  it('are all displayed', async () => {
    const wrapper = await mountWithPlayers('1')
    const commands = ['start', 'stop', 'save', 'dawn', 'noon', 'dusk', 'midnight']

    commands.forEach((cmd) => {
      expect(wrapper.find('.button-grid').text()).toContain(cmd)
    })
  })


  it('are disabled except start when server is stopped', async () => {
    const wrapper = await mountWithPlayers('STOPPED')
    const buttons = wrapper.findAll('button')

    buttons.forEach((btn) => {
      const label = btn.text()
      expect(btn.element.disabled).toBe(label !== 'start')
    })
  })

  it('are enabled except start when server is running', async () => {
    const wrapper = await mountWithPlayers('1')
    const buttons = wrapper.findAll('button')

    buttons.forEach((btn) => {
      const label = btn.text()
      expect(btn.element.disabled).toBe(label === 'start')
    })
  })

  it.each(['STOPPING', 'STARTING', 'randomValue', 'ボタンが無効になったはず'])(
    'are disabled when status is %s',
    async (status) => {
      const wrapper = await mountWithPlayers(status)
      const buttons = wrapper.findAll('button')

      buttons.forEach((btn) => {
        expect(btn.element.disabled).toBe(true)
      })
    })

  it('are disabled immediately on click until next status update', async () => {
    const request = deferred<object>()
    const mockGet = vi.fn<() => Promise<StatusResponse>>().mockResolvedValue({ data: '1' })
    const mockPost = vi.fn<() => Promise<object>>().mockReturnValue(request.promise)
    mockedUseApi.mockReturnValue({ get: mockGet, post: mockPost } as any)

    const wrapper = mount(Dashboard)
    await flushPromises()

    const buttons = wrapper.findAll('.button-grid button')
    buttons.forEach(btn => expect((btn.element as HTMLButtonElement).disabled).toBe(btn.text() === 'start'))

    const anyBtn = buttons.find(btn => !(btn.element as HTMLButtonElement).disabled)!
    await anyBtn.trigger('click')
    wrapper.findAll('.button-grid button').forEach(btn => expect((btn.element as HTMLButtonElement).disabled).toBe(true))

    request.resolve({})
    await flushPromises()

    await (wrapper.vm as any).getStatus()
    await flushPromises()
    wrapper.findAll('.button-grid button').forEach(btn => expect((btn.element as HTMLButtonElement).disabled).toBe(btn.text() === 'start'))
  })

  it.each(['stop', 'dawn', 'noon', 'dusk', 'midnight', 'save',])(
    '%s button sends POST request',
    async (command) => {
      const mockPost = vi.fn<() => Promise<object>>().mockResolvedValue({ status: 200 })
      mockedUseApi.mockReturnValue({ post: mockPost } as any)

      const wrapper = await mountWithPlayers('1', { post: mockPost })
      await flushPromises()

      const button = wrapper.findAll('.button-grid button').find(btn => btn.text() === command)!

      await button.trigger('click')
      expect(mockPost).toHaveBeenCalled()
    },
  )

  it('start button sends POST request', async () => {
    const mockPost = vi.fn<() => Promise<object>>().mockResolvedValue({ status: 200 })
    const wrapper = await mountWithPlayers('STOPPED', { post: mockPost })

    const button = wrapper.findAll('.button-grid button').find(btn => btn.text() === 'start')!

    await button.trigger('click')
    expect(mockPost).toHaveBeenCalled()
  })
})