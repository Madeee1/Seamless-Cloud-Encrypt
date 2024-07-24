import { it, expect, describe, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { FileUploader } from '#components'
import { createPinia, setActivePinia } from 'pinia'

describe('FileUploader', () => {
  beforeEach(() => {
    const pinia = createPinia()
    setActivePinia(pinia)
  })

  it('Can mount the component', async () => {
    const component = await mountSuspended(FileUploader)
    expect(component.text()).toMatchInlineSnapshot(
      `"Upload files you want to encrypt upload here"`
    )
  })

  it('Can upload a file', async () => {
    const component = await mountSuspended(FileUploader)
    const input = component.find('input[type="file"]')

    const file = new File(['file'], 'file.txt', { type: 'text/plain' })

    const dataTransfer = new DataTransfer()
    dataTransfer.items.add(file)

    input.element.files = dataTransfer.files
    await input.trigger('change')

    expect(input.element.files).toHaveLength(1)
    expect(input.element.files[0].name).toBe('file.txt')
  })
})
