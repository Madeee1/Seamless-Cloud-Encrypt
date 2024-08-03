<template>
  <div class="flex flex-col min-h-screen bg-main-blue">
    <div>
      <UCard class="w-[450px] mx-auto mt-8 rounded-xl bg-gray-200">
        <template #header>
          <h2
            class="text-2xl font-semibold text-main-blue first-letter:text-third-blue"
          >
            Reset <span class="text-third-blue">P</span>assword
          </h2>
        </template>
        <UForm
          :schema="schema"
          :state="state"
          class="space-y-4"
          @submit="onSubmit"
        >
          <UFormGroup size="xl" label="Email" name="email">
            <UInput
              v-model="state.email"
              placeholder="example@example.com"
              color="blue"
            />
          </UFormGroup>

          <div class="flex justify-end">
            <UButton
              type="submit"
              class="block text-lg font-semibold bg-blue-500 hover:bg-blue-700 text-gray-200 py-1 px-2 rounded"
            >
              Submit
            </UButton>
            <span class="text-red-500 ml-2 text-md">
              {{ errorMessage }}
            </span>
          </div>
        </UForm>
      </UCard>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { object, string, type InferType } from 'yup'
import type { FormSubmitEvent } from '#ui/types'

const supabase = useSupabaseClient()

const state = ref({
  email: '',
})
const errorMessage = ref('')

const schema = object({
  email: string().email('Invalid email').required('Required'),
})

type Schema = InferType<typeof schema>

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    // Call supabase API 2 send pw reset email 2 email stored in state.value.email
    const { data, error } = await supabase.auth.resetPasswordForEmail(
      state.value.email,
      {
        redirectTo: window.location.origin + '/reset-password', // change accordingly later!!
      }
    )
    if (error) {
      errorMessage.value = error.message
    } else {
      alert('Password reset link sent to email!')
      navigateTo('/login')
    }
  } catch (error: any) {
    errorMessage.value = error.message
  }
}
</script>
