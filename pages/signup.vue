<template>
  <div>
    <UCard class="w-[450px] mx-auto mt-8 rounded-2xl">
      <template #header>
        <h1 class="text-2xl font-bold">
          Sign Up
        </h1>
      </template>
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormGroup
          label="Email"
          name="email"
          class="h-[80px]"
        >
          <UInput
            v-model="state.email"
            placeholder="example@example.com"
          />
        </UFormGroup>

        <UFormGroup
          label="Password"
          name="password"
          class="h-[80px]"
        >
          <UInput
            v-model="state.password"
            type="password"
            placeholder="StrongP@ssword101"
          />
        </UFormGroup>

        <div class="flex">
          <UButton type="submit">
            Submit
          </UButton>
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
  password: '',
})
const successMessage = ref('')
const errorMessage = ref('')

const schema = object({
  email: string().email('Invalid email').required('Required'),
  password: string()
    .min(8, 'Must be at least 8 characters')
    .required('Required'),
})

type Schema = InferType<typeof schema>

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: state.value.email,
      password: state.value.password,
      options: {
        emailRedirectTo: window.location.origin + '/confirm',
      },
    })
    navigateTo('/confirm')
  }
  catch (error: any) {
    errorMessage.value = error.message
  }
}
</script>
