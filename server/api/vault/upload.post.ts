import { serverSupabaseUser } from '#supabase/server'
//import formidable, { Files, Fields } from 'formidable'
// import { Files, Fields } from 'formidable'
import { IncomingMessage } from 'http'

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
  // const user = await serverSupabaseUser(event)

  // // check user is authenticated
  // if (!user) {
  //   throw createError({
  //     statusCode: 401,
  //     statusMessage: 'Unauthorized',
  //   })
  // }

  const {
    fileNameIndex,
    fileNameiv,
    fileName,
    fileContentiv,
    // fileContent,
    // file,
    accessToken,
    apikey,
    fileContent,
  } = await readBody(event)

  // const fileNameIndex = file.fileNameIndex
  // const fileNameiv = file.fileNameiv
  // const fileName = file.fileName
  // const fileContentiv = file.fileContentiv
  // const fileContent = file.fileContent

  console.log('file name = ')
  console.log(fileName)
  console.log('type = ', typeof fileName)

  const fileNameivBuffer = base64ToArrayBuffer(fileNameiv)
  console.log('file name iv = ')
  console.log(fileNameiv)
  console.log('type = ', typeof fileNameiv)

  console.log('file name index = ')
  console.log(fileNameIndex)
  console.log('type = ', typeof fileNameIndex)

  const fileContentivBuffer = base64ToArrayBuffer(fileContentiv)
  console.log('file iv = ')
  console.log(fileContentiv)
  console.log('type = ', typeof fileContentiv)

  const fileContentBuffer = base64ToArrayBuffer(fileContent)
  console.log('file content = ')
  console.log(fileContentBuffer)
  console.log('type = ', typeof fileContentBuffer)

  console.log('accessToken = ')
  console.log(accessToken)
  console.log('type = ', typeof accessToken)

  console.log('apikey = ')
  console.log(apikey)
  console.log('type = ', typeof apikey)

  const encoder = new TextEncoder()
  // // const decoder = new TextDecoder()

  // const parsedFileContent = JSON.parse(fileContent)
  // console.log('JSON-parsed file content = ')
  // console.log(parsedFileContent)
  // console.log('type = ', typeof parsedFileContent)
  // const fileContentBuffer = encoder.encode(parsedFileContent).buffer
  // const fileContentString = decoder.decode(fileContent)

  // console.log('file buffer = ')
  // console.log(fileContentBuffer)
  // console.log('type of file buffer = ', typeof fileContentBuffer)
  // console.log('file string = ')
  // console.log(fileContentString)
  // console.log('type of file buffer = ', typeof fileContentString)

  // const fileNameivBuffer = Buffer.from(fileNameiv)
  // const fileContentivBuffer = Buffer.from(fileContentiv)
  const JSONfileNameiv = JSON.stringify(fileNameiv)
  const JSONfileContentiv = JSON.stringify(fileContentiv)

  const encodedfileNameiv = encoder.encode(JSONfileNameiv)
  const encodedfileContentiv = encoder.encode(JSONfileContentiv)

  // const fileNameivBuffer = Buffer.from(encodedfileNameiv)
  // const fileContentivBuffer = Buffer.from(encodedfileContentiv)

  const encryptedFile = new File(
    [
      fileNameIndex,
      '\n',
      //Buffer.from(fileNameiv),
      //Buffer.from(fileContentiv),
      // fileNameiv,
      // fileContentiv,
      // encodedfileNameiv,
      // encodedfileContentiv,
      fileNameivBuffer,
      fileContentivBuffer,
      fileContentBuffer,
    ],
    fileName,
    {
      type: 'application/octet-stream',
    }
  )

  const response = await fetch(
    `https://graph.microsoft.com/v1.0/me/drive/root:/CryptAndGo/${fileName}:/content`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': encryptedFile.type,
        apikey: apikey,
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
