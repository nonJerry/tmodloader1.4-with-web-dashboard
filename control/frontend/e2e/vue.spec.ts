import { test, expect, Page } from '@playwright/test'


async function getStatus(page: Page, value: string) {
  await page.route('**/status', (route) => {
    route.fulfill({ status: 200, contentType: 'text/plain', body: value })
  })
}

test.describe('Terraria Server Control page', () => {
  test('renders title', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toHaveText('Terraria Server Control')
  })

  test('renders all command buttons', async ({ page }) => {
    const commands = ['start', 'stop', 'save', 'dawn', 'noon', 'dusk', 'midnight']
    await page.goto('/')

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
    let call = 0
    await page.route('**/cgi-bin/api/status', (route) => {
      call++
      const value = call === 1 ? '1' : '4'
      route.fulfill({ status: 200, contentType: 'text/plain', body: value })
    })
    await page.goto('/')

    const playerCount = page.locator('.player-count')
    await expect(playerCount).toHaveText('1')

    await page.waitForResponse('**/cgi-bin/api/status')
    await expect(playerCount).toHaveText('4')
  })

  test('buttons are disabled except start when server is stopped', async ({ page }) => {
    // Simulate stopped state
    await getStatus(page, 'STOPPED')
    await page.goto('/')

    const buttons = page.getByRole('button')
    const count = await buttons.count()

    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i)
      const label = (await button.textContent())?.trim()

      if (label === 'start') {
        await expect(button).toBeEnabled()
      } else {
        await expect(button).toBeDisabled()
      }
    }
  })

  test('buttons are disabled immediately on click until next status update', async ({ page }) => {
    await page.goto('/')

    const buttons = page.getByRole('button')
    const count = await buttons.count()

    for (let i = 0; i < count; i++) {
      await expect(buttons.nth(i)).toBeEnabled()
    }

    const firstButton = buttons.first()
    await firstButton.click()

    for (let i = 0; i < count; i++) {
      await expect(buttons.nth(i)).toBeDisabled()
    }

    // Re-enabled on status update
    await getStatus(page, '1')

    for (let i = 0; i < count; i++) {
      await expect(buttons.nth(i)).toBeEnabled()
    }
  })
})
