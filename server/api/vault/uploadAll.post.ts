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
  const uploadUrls = []

  for (const fileName of files) {
    // const fileContentivBuffer = base64ToArrayBuffer(file.fileContentiv)
    // const fileContentBuffer = base64ToArrayBuffer(file.fileContent)
    // const encryptedFile = new File(
    //   [
    //     file.fileNameIndex,
    //     '\n',
    //     // fileNameivBuffer,
    //     fileContentivBuffer,
    //     fileContentBuffer,
    //   ],
    //   file.fileName,
    //   {
    //     type: 'application/octet-stream',
    //   }
    // )
    // const response = await fetch(
    //   `https://graph.microsoft.com/v1.0/me/drive/root:/CryptAndGo/${encryptedFile.name}:/content`,
    //   {
    //     method: 'PUT',
    //     headers: {
    //       Authorization: `Bearer ${accessToken}`,
    //       'Content-Type': encryptedFile.type,
    //       apikey: apikey || '',
    //     },
    //     body: encryptedFile,
    //   }
    // )
    // if (!response.ok) {
    //   const errorText = await response.text()
    //   throw new Error(
    //     `Failed to upload file: ${response.statusText} - ${errorText}`
    //   )
    // }
    console.log('url for: ', fileName)
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
    console.log('Upload url created: ')
    console.log(uploadUrl)

    uploadUrls.push(uploadUrl)
  }

  return { uploadUrls }
})
