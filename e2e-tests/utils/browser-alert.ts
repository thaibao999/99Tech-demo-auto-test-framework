import { Dialog, Page } from '@playwright/test'

/**
 * Native browser dialogs only (`window.alert`, `confirm`, `prompt`) via Playwright's
 * `page` `dialog` event. Not for Bootstrap modals, SweetAlert, or `getByRole('dialog')` overlays.
 */
export async function captureBrowserAlert(
  page: Page,
  trigger: () => Promise<void>,
  timeoutMs = 10000,
): Promise<string> {
  let timeoutId: NodeJS.Timeout | undefined
  let cleanup: () => void = () => {}

  // Resolves with the dialog text once the dialog has been accepted.
  const messagePromise = new Promise<string>((resolve) => {
    const handleDialog = async (dialog: Dialog): Promise<void> => {
      const text = dialog.message()
      await dialog.accept()
      resolve(text)
    }
    page.once('dialog', handleDialog)
    cleanup = () => page.off('dialog', handleDialog)
  })

  try {
    await trigger()

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(
        () => reject(new Error(`No browser alert appeared within ${timeoutMs}ms`)),
        timeoutMs,
      )
    })

    return await Promise.race([messagePromise, timeoutPromise])
  } finally {
    clearTimeout(timeoutId)
    cleanup()
  }
}
