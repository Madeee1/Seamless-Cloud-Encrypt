import { serverSupabaseUser } from '#supabase/server'

function base64ToArrayBuffer(base64: any) {
  const binaryString = atob(base64)
  const len = binaryString.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes.buffer
}

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)

  // check user is authenticated
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const {
    fileNameIndex,
    fileNameiv,
    fileName,
    fileContentiv,
    accessToken,
    // apikey,
    fileContent,
  } = await readBody(event)

  const fileNameivBuffer = base64ToArrayBuffer(fileNameiv)
  const fileContentivBuffer = base64ToArrayBuffer(fileContentiv)
  const fileContentBuffer = base64ToArrayBuffer(fileContent)

  const encryptedFile = new File(
    [
      fileNameIndex,
      '\n',
      fileNameivBuffer,
      fileContentivBuffer,
      fileContentBuffer,
    ],
    fileName,
    {
      type: 'application/octet-stream',
    }
  )

  const apikey = process.env.CLIENT_SECRET

  const response = await fetch(
    `https://graph.microsoft.com/v1.0/me/drive/root:/CryptAndGo/${fileName}:/content`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': encryptedFile.type,
        apikey: apikey || '',
      },
      body: encryptedFile,
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Failed to upload file: ${response.statusText} - ${errorText}`
    )
  } else {
    console.log('response ok server side')
  }

  return { ok: true }
})
