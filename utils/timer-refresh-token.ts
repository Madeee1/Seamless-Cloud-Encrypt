export async function checkTokenRefresh(
  tokenExpiresIn: number,
  vaultId: string,
  reAuthenticate: () => Promise<void>,
  connectToOneDrive: () => void
) {
  const timeLeft = tokenExpiresIn - Date.now()
  if (timeLeft < 5 * 60 * 1000) {
    // < 5 min refresh
    try {
      await reAuthenticate()
    } catch (err) {
      console.error(err)
      sessionStorage.setItem('vaultID', vaultId)
      connectToOneDrive()
    }
  }
}
