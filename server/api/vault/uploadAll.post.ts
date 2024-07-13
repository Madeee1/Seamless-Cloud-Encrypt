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

  const { accessToken, files } = await readBody(event)
  const apikey = process.env.CLIENT_SECRET

  // const fileNameivBuffer = base64ToArrayBuffer(fileNameiv)
  console.log('files received, length = ', files.length)
  console.log('access token = ', accessToken)

  for (const file of files) {
    // console.log('File name = ', file.fileName)
    // console.log('File iv = ', file.fileContentiv)
    // console.log('File content = ', file.fileContent)

    const fileContentivBuffer = base64ToArrayBuffer(file.fileContentiv)
    const fileContentBuffer = base64ToArrayBuffer(file.fileContent)

    const encryptedFile = new File(
      [
        file.fileNameIndex,
        '\n',
        // fileNameivBuffer,
        fileContentivBuffer,
        fileContentBuffer,
      ],
      file.fileName,
      {
        type: 'application/octet-stream',
      }
    )

    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/drive/root:/CryptAndGo/${encryptedFile.name}:/content`,
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
    }

    console.log('done uploading file: ', file.fileName)
  }

  return { ok: true }
})
