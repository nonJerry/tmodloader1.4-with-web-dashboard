import { test, expect, Page, Locator, BrowserContext } from '@playwright/test'

async function getStatus(page: Page, value: string) {
  await page.route('**/status', (route) => {
    route.fulfill({ status: 200, contentType: 'text/plain', body: value })
  })
}

function initClock(page: Page) {
  return page.clock.install({ time: Date.now() })
}

function nextStatus(page: Page) {
  return page.clock.fastForward(5000)
}

async function makeCookieExpire(context: BrowserContext, cookieName: string) {
  const cookie = (await context.cookies()).find(cookie => cookie.name === cookieName)
  if (cookie) {
    await context.addCookies([
      {
        name: cookie.name,
        value: cookie.value,
        domain: cookie.domain,
        path: cookie.path,
        expires: Math.floor(Date.now() / 1000) - 60,
      },
    ])
  }
}

async function mockPost(page: Page) {
  await page.route('**/api/*', async route => {
    const request = route.request()
    if (request.method() === 'POST') {
      // create a deferred promise to hold this route
      route.fulfill({ status: 200, body: '{}' })
    } else {
      route.continue()
    }
  })
}

async function expectThatAllExceptStartAreEnabled(buttons: Locator) {
  const count = await buttons.count()
  for (let i = 0; i < count; i++) {
    const button = buttons.nth(i)
    const label = (await button.textContent())?.trim()
    await expect(button).toBeEnabled({ enabled: label !== 'start' })
  }
}

function expectLogin(page: Page) {
  return Promise.all([
    expect(page).toHaveURL('/login'),
    expect(page.getByRole('textbox', { name: 'What may go here?' })).toBeVisible(),
    expect(page.getByRole('textbox', { name: 'The second riddle?' })).toBeVisible(),
    expect(page.getByRole('button', { name: 'Mystery Function' })).toBeVisible(),
    expect(page.locator('.button-grid')).toBeHidden()
  ])
}

function expectDashboard(page: Page) {
  return Promise.all([
    expect(page).toHaveURL('/'),
    expect(page.getByRole('button', { name: 'Logout' })).toBeVisible(),
    expect(page.locator('.button-grid')).toBeVisible(),
    expect(page.getByRole('textbox', { name: 'What may go here?' })).toBeHidden(),
    expect(page.getByRole('textbox', { name: 'The second riddle?' })).toBeHidden(),
    expect(page.getByRole('button', { name: 'Mystery Function' })).toBeHidden(),
  ])
}

async function loginAs(page: Page, username: string, password: string) {
  await page.getByRole('textbox', { name: 'What may go here?' }).fill(username)
  await page.getByRole('textbox', { name: 'The second riddle?' }).fill(password)
  await page.getByRole('button', { name: 'Mystery Function' }).click()
}

async function ensureServerIsOnline(page: Page, maxRetries = 2) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const status = (await page.locator('.player-count').textContent())?.trim()

    if (status === '0') {
      return
    }

    if (status !== 'STOPPED') {
      await page.waitForFunction(
        (selector) => {
          const el = document.querySelector(selector)
          const text = el?.textContent?.trim()
          return !!el && (text === '0' || text === 'STOPPED')
        },
        '.player-count',
        { timeout: 40000 }
      )
      if ((await page.locator('.player-count').textContent())?.trim() === '0') {
        return
      }
    }

    const startButton = page.locator('.button-grid').getByRole('button', { name: 'start' }).first()
    await startButton.click()
    await startButton.click() // twice to avoid problems with csrf

    try {
      await page.waitForFunction(
        (selector) => {
          const el = document.querySelector(selector)
          return !!el && el.textContent?.trim() === '0'
        },
        '.player-count',
        { timeout: 20000 }
      )

      return
    } catch {
      if (attempt > maxRetries) throw new Error('Failed to ensure server is running')
      await page.waitForTimeout(500)
    }
  }
}

async function setupLoginState(context: BrowserContext) {
  await context.setStorageState({
    cookies: [],
    origins: [
      {
        origin: 'http://localhost:5173',
        localStorage: [
          {
            name: 'AUTH_STATE',
            value: JSON.stringify({ username: 'alice', isLoggedIn: true })
          },
          {
            name: 'USER_INFO',
            value: JSON.stringify({ username: 'alice' })
          }
        ]
      }
    ]
  }
  )

  await context.addCookies([
    {
      name: 'refreshToken',
      value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFsaWNlIiwiaWF0IjoxNzgxMjI2MDQ5LCJleHAiOjE4MTI3ODM2NDksImF1ZCI6ImNoYWxsZW5nZXJzIiwiaXNzIjoidGVycmFyaWEtY29udHJvbCJ9.mONz0rwxTckGt2RgpDW0jbjXWj6uavSH8eQJ1ls-AWA',
      url: 'http://localhost:5173',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
      expires: 1812762951.984077,
    },
    {
      name: 'accessToken',
      value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFsaWNlIiwic2Vzc2lvbklkIjoicV9UMTd4VmJXdDEwWkp1WFlXS1RqcGI1cVhHbFctdHYiLCJpYXQiOjE3ODEyMjYwNDksImV4cCI6MTc4MTIyNjEwOSwiYXVkIjoiY2hhbGxlbmdlcnMiLCJpc3MiOiJ0ZXJyYXJpYS1jb250cm9sIn0.zG-ggMYMUWSWoaDBhUDtG0B0ucpAmxA9KwslSVdr2-o',
      url: 'http://localhost:5173',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
      expires: undefined,
    },
    {
      name: 'xsrf-token',
      value: 'e6cab63a438f71951fd7a9c3740bb2dd9e3487d455da09eff4a7ea936ad58b22.54bb340541b471ab1d409f0f0ed0d1d2a8218845085e070d673c6322d49406ce',
      url: 'http://localhost:5173',
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
      expires: undefined,
    },
  ])
}

test.describe('Terraria Server Control page', () => {

  test.beforeEach(async ({ page, context }) => {

    await setupLoginState(context)

    await page.goto('/')

    await ensureServerIsOnline(page)

  });

  test('renders title', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Terraria Server Control')
  })

  test('renders all command buttons', async ({ page }) => {
    const commands = ['start', 'stop', 'save', 'dawn', 'noon', 'dusk', 'midnight']

    for (const cmd of commands) {
      await expect(page.locator('button', { hasText: cmd })).toHaveCount(1)
    }
  })

  const playerCounts = ['0', '1', '10', '100']
  for (const playerCount of playerCounts) {
    test(`displays ${playerCount} players online`, async ({ page }) => {
      await getStatus(page, playerCount)
      await page.goto('/')

      await expect(page.locator('.player-count')).toHaveText(playerCount)
    })
  }

  test('updates when player count changes', async ({ page }) => {
    /* Install before page goto so that interval uses fake clock */
    await initClock(page)
    await page.goto('/')

    await getStatus(page, '1')
    await nextStatus(page)
    const playerCount = page.locator('.player-count')
    await expect(playerCount).toHaveText('1')

    await getStatus(page, '4')
    await nextStatus(page)
    await expect(playerCount).toHaveText('4')
  })

  test('buttons are disabled except start when server is stopped', async ({ page }) => {
    // Simulate stopped state
    await getStatus(page, 'STOPPED')
    await page.goto('/')

    const buttons = page.locator('.button-grid').getByRole('button')
    const count = await buttons.count()

    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i)
      const label = (await button.textContent())?.trim()

      await expect(button).toBeEnabled({ enabled: label === 'start' })
    }
  })

  test('buttons are disabled immediately on click until next status update', async ({ page }) => {
    await initClock(page)
    await page.goto('/')

    await mockPost(page)
    const buttons = page.locator('.button-grid').getByRole('button')
    const count = await buttons.count()

    await expectThatAllExceptStartAreEnabled(buttons)

    const firstEnabledButton = page.locator('.button-grid').locator('button:enabled').first()
    await firstEnabledButton.click()

    for (let i = 0; i < count; i++) {
      await expect(buttons.nth(i)).toBeDisabled()
    }

    await getStatus(page, '1')
    await nextStatus(page)

    await expectThatAllExceptStartAreEnabled(buttons)
  })
})

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('is shown instead of main page when user is not logged in', async ({ page }) => {
    await page.goto('/')
    await expectLogin(page)
  })


  test('requires username and password', async ({ page }) => {

    await page.getByRole('button', { name: 'Mystery Function' }).click({ force: true })
    await expectLogin(page)

    await page.getByRole('textbox', { name: 'What may go here?' }).fill('alice')
    await page.getByRole('button', { name: 'Mystery Function' }).click({ force: true })
    await expectLogin(page)


    await loginAs(page, 'alice', 'alicePassword')
    await expectDashboard(page)
  })

  test('is required after refreshToken and accessToken expired', async ({ page, context }) => {
    await initClock(page)
    await page.goto('/')
    await loginAs(page, 'alice', 'alicePassword')
    await expectDashboard(page)

    await makeCookieExpire(context, 'accessToken')
    await makeCookieExpire(context, 'refreshToken')

    await nextStatus(page)
    await expectLogin(page)
  })

  test('is not necessary if accessToken is expired but refreshToken is valid', async ({ page, context }) => {
    await initClock(page)
    await page.goto('/')
    await loginAs(page, 'alice', 'alicePassword')
    await expectDashboard(page)

    await makeCookieExpire(context, 'accessToken')

    await page.goto('/')
    await expectDashboard(page)
  })

})

test.describe('Server', () => {

  test.beforeEach(async ({ page, context }) => {

    await setupLoginState(context)
    await page.goto('/')
    await ensureServerIsOnline(page)

  });

  test.afterEach(async ({ page }) => {
    await ensureServerIsOnline(page)
  })

  test('is stopped if nobody is logged in for 10 minutes by default', {
    tag: '@destructive',
  }, async ({ page }) => {
    await initClock(page)
    await page.goto('/')
    await expectDashboard(page)

    await page.request.post('http://localhost:8000/test/advance-time', {
      data: { amount: 10 * 60 * 1000 }
    });
    
    await page.waitForTimeout(10000); // ensure backend has polled at least once and server had time to shutdown
    await nextStatus(page)
    const playerCount = page.locator('.player-count')
    await expect(playerCount).toHaveText(/STOPPING|STOPPED/)
  })
  
})