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
        <UFormGroup label="New Password" name="newPassword" class="h-[80px]">
          <UInput
            v-model="state.newPassword"
            type="password"
            placeholder="Enter your new password"
          ></UInput>
        </UFormGroup>

        <UFormGroup
          label="Confirm New Password"
          name="confirmPassword"
          class="h-[80px]"
        >
          <UInput
            v-model="state.confirmPassword"
            type="password"
            placeholder="Re-enter your new password"
          ></UInput>
        </UFormGroup>

        <div class="flex">
          <UButton type="submit"> Confirm </UButton>
          <span class="text-red-500 ml-2 text-sm my-auto">
            {{ errorMessage }}
          </span>
        </div>
      </UForm>
    </UCard>
  </div>
</template>

<script lang="ts" setup>
import { object, string, ref as yupRef, type InferType } from 'yup'
import type { FormSubmitEvent } from '#ui/types'

const supabase = useSupabaseClient()
const router = useRouter()

const state = ref({
  newPassword: '',
  confirmPassword: '',
})

const errorMessage = ref('')

const schema = object({
  newPassword: string()
    .min(4, 'Must be at least 4 characters')
    .required('Required'),
  confirmPassword: string()
    .oneOf([yupRef('newPassword')], 'Passwords must match')
    .required('Required'),
})

type Schema = InferType<typeof schema>

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: state.value.newPassword,
    })
    if (error) {
      errorMessage.value = error.message
    } else {
      alert('Password successfully updated!')
      navigateTo('/login')
    }
  } catch (error: any) {
    errorMessage.value = error.message
  }
}
</script>