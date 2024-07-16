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

  const { fileName, accessToken } = await readBody(event)

  // API key not used

  const response = await fetch(
    `https://graph.microsoft.com/v1.0/me/drive/root:/CryptAndGo/${fileName}:/createUploadSession`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        item: {
          '@microsoft.graph.conflictBehavior': 'rename',
          name: fileName,
        },
      }),
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Failed to upload file: ${response.statusText} - ${errorText}`
    )
  }

  const data = await response.json()
  const uploadUrl = data.uploadUrl

  return { uploadUrl }
})
