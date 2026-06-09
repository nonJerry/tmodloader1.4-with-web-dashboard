import { test, expect } from '@playwright/test'

test.describe('Terraria Server Control page', () => {
  test('renders title', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toHaveText('Terraria Server Control')
  })

  test('renders all command buttons', async ({ page }) => {
    await page.goto('/')

    const commands = ['start', 'stop', 'save', 'dawn', 'noon', 'dusk', 'midnight']

    for (const cmd of commands) {
      await expect(page.locator('button', { hasText: cmd })).toHaveCount(1)
    }
  })

  const playerCounts = ['0', '1', '10', '100']

  for (const playerCount of playerCounts) {
    test(`displays ${playerCount} players online`, async ({ page }) => {
      await page.route('**/cgi-bin/api/status', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'text/plain',
          body: playerCount,
        })
      })

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
})