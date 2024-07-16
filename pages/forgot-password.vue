<template>
  <div>
    <UCard class="w-[450px] mx-auto mt-8 rounded-2xl">
      <template #header>
        <h2>Reset Password</h2>
      </template>
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormGroup label="Email" name="email" class="h-[80px]">
          <UInput v-model="state.email" placeholder="example@example.com" />
        </UFormGroup>

        <div class="flex">
          <UButton type="submit"> Submit </UButton>
          <span class="text-red-500 ml-2 text-sm my-auto">
            {{ errorMessage }}
          </span>
        </div>
      </UForm>
    </UCard>
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

