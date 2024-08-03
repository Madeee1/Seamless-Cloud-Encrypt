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
      `"Upload the files you want to encrypt here"`
    )
  })
})
