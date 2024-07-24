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

  const { accessToken, files, cloudFolderName } = await readBody(event)
  // const apikey = process.env.CLIENT_SECRET
  const uploadUrls = []

  for (const fileName of files) {
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/drive/root:/${cloudFolderName}/${fileName}:/createUploadSession`,
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

    uploadUrls.push(uploadUrl)
  }

  return { ok: true, uploadUrls: uploadUrls }
})
