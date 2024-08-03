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
          <UFormGroup size="xl" label="New Password" name="newPassword">
            <UInput
              v-model="state.newPassword"
              type="password"
              placeholder="Enter your new password"
              color="blue"
            ></UInput>
          </UFormGroup>

          <UFormGroup
            size="xl"
            label="Confirm New Password"
            name="confirmPassword"
          >
            <UInput
              v-model="state.confirmPassword"
              type="password"
              placeholder="Re-enter your new password"
              color="blue"
            ></UInput>
          </UFormGroup>

          <div class="flex justify-end">
            <UButton
              type="submit"
              class="block text-lg font-semibold bg-blue-500 hover:bg-blue-700 text-gray-200 py-1 px-2 rounded"
            >
              Confirm
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
