function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  const len = bytes.byteLength
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

export default defineEventHandler(async (event) => {
  try {
    const { accessToken, fileId } = await readBody(event)

    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}/content`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`)
    }

    const encryptedFilename = response.url.split('/').pop()
    const encryptedFileBlob = await response.blob()
    console.log('encrypted file blob = \n', encryptedFileBlob)
    const encryptedFileBuffer = await encryptedFileBlob.arrayBuffer()
    console.log('encrypted file buffer = \n', encryptedFileBuffer)
    const encryptedFileBase64 = arrayBufferToBase64(encryptedFileBuffer)

    // const contentType = response.headers.get('content-type')
    // const contentDisposition = response.headers.get('content-disposition')

    // // Set the content type and disposition headers for the client response
    // if (contentType) {
    //   event.res.setHeader('Content-Type', contentType)
    // }
    // if (contentDisposition) {
    //   event.res.setHeader('Content-Disposition', contentDisposition)
    // } else {
    //   // If content-disposition is not provided, set a default filename
    //   event.res.setHeader(
    //     'Content-Disposition',
    //     'attachment; filename="downloaded_file"'
    //   )
    // }

    // // Pipe the OneDrive response directly to the client response
    // if (!response.body) {
    //   throw new Error('Response body is null')
    // }

    // const reader = response.body.getReader()
    // const stream = new ReadableStream({
    //   async start(controller) {
    //     for (;;) {
    //       const { done, value } = await reader.read()
    //       if (done) {
    //         controller.close()
    //         break
    //       }
    //       controller.enqueue(value)
    //     }
    //   },
    // })

    // return new Response(stream)
    console.log('encrypted file base64 = \n', encryptedFileBase64)

    return {
      ok: true,
      encryptedFilename: encryptedFilename,
      encryptedBlob: encryptedFileBase64,
    }
  } catch (error) {
    console.error('Error fetching file from OneDrive:', error)
  }
})
