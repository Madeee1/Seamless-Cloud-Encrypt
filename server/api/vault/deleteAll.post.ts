import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)

  // check user is authenticated
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const { accessToken, downloadedFiles } = await readBody(event)

  const deletePromises = downloadedFiles.map(async (fileName: any) => {
    console.log('Deleting = ', fileName)
    return fetch(
      `https://graph.microsoft.com/v1.0/me/drive/root:/CryptAndGo/${fileName}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    ).then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to delete ${fileName}: ${response.statusText}`)
      }
    })
  })

  await Promise.all(deletePromises)
  return { ok: true }
})
