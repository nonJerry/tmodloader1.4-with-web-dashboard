/* eslint-disable @typescript-eslint/no-explicit-any */

// before imports to avoid post is undefined error in auth
type StatusResponse = { data: string }
type csrfResponse = { data: { csrfToken: string } }
vi.mock('@/api/useAPI', () => ({
  useApi: vi.fn<() => { get: () => Promise<StatusResponse>; post: () => Promise<object> }>(() => ({
    get: vi.fn<() => Promise<StatusResponse>>().mockResolvedValue({ data: '' }),
    post: vi.fn<() => Promise<object>>().mockResolvedValue({ status: 200 }),
  })),
  getCsrfToken: vi.fn<() => Promise<csrfResponse>>(() => Promise.resolve({ data: { csrfToken: 'mock-csrf-token' } })),
}))

import { describe, expect, it, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { getCsrfToken } from '@/api/useAPI'
import { createPinia, setActivePinia } from 'pinia'
import router from '@/router'
import type { AxiosResponse } from 'axios'

import Login from '@/views/auth/LoginView.vue'
import { useAuthStore } from '@/stores/auth'

const mockedCsrfToken = vi.mocked(getCsrfToken)
mockedCsrfToken.mockResolvedValue({
  data: {
    csrfToken: 'mock-csrf-token',
  },
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {} as any,
} as AxiosResponse)

function mountWithRouter() {
  return mount(Login, {
    global: {
      plugins: [router]
    }
  })
}

describe('Login', () => {

  beforeEach(async () => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  it('has correct tab title', async () => {
    mountWithRouter()

    expect(document.title).toBe('Terraria Server Control - Login')
  })

  it('renders login form', async () => {
    const wrapper = mountWithRouter()

    expect(wrapper.find('form').exists()).toBe(true)
  })

  it('renders username input field', async () => {
    const wrapper = mountWithRouter()

    expect(wrapper.find('input#username[type="text"]').exists()).toBe(true)
  })

  it('renders password input field', async () => {
    const wrapper = mountWithRouter()

    expect(wrapper.find('input#password[type="password"]').exists()).toBe(true)
  })

  it('renders submit button', async () => {
    const wrapper = mountWithRouter()

    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('uses autofill-friendly ids on login fields', async () => {
    const wrapper = mountWithRouter()

    expect(wrapper.find('input#username').attributes('autocomplete')).toBe('username')
    expect(wrapper.find('input#password').attributes('autocomplete')).toBe('current-password')
  })

  it('submits form with username and password', async () => {
    const wrapper = mountWithRouter()

    const auth = useAuthStore()
    const loginSpy = vi.spyOn(auth, 'login')
    await wrapper.find('input[type="text"]').setValue('testuser')
    await wrapper.find('input[type="password"]').setValue('testpass')
    await wrapper.find('form').trigger('submit')

    expect(loginSpy).toHaveBeenCalledWith({ username: 'testuser', password: 'testpass' })
    expect(mockedCsrfToken).toHaveBeenCalled()
  })

  it('request a CSRF token', async () => {
    const wrapper = mountWithRouter()

    await wrapper.find('input[type="text"]').setValue('testuser')
    await wrapper.find('input[type="password"]').setValue('testpass')
    await wrapper.find('form').trigger('submit')

    expect(mockedCsrfToken).toHaveBeenCalled()
  })
})
