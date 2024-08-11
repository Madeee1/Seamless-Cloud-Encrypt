const vault = useVaultStore()

export function startIdleTimer(
  idleTimeInMinutes: any,
  timeoutId: NodeJS.Timeout | string,
  handleIdle: () => void
) {
  const idleTime = idleTimeInMinutes * 60000

  if (timeoutId !== '') {
    clearTimeout(timeoutId)
  }

  return setTimeout(() => {
    handleIdle()
  }, idleTime)
}
