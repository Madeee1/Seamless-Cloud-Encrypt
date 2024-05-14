<template>
  <div>
    <UCard class="w-[450px] mx-auto mt-8 rounded-2xl">
      <template #header>
        <h1 class="text-2xl font-bold">Sign Up</h1>
      </template> 
      <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormGroup label="Email" name="email" class="h-[80px]">
          <UInput v-model="state.email" placeholder="example@example.com"/>
        </UFormGroup>

        <UFormGroup label="Password" name="password" class="h-[80px]">
          <UInput v-model="state.password" type="password" placeholder="StrongP@ssword101"/>
        </UFormGroup>

        <UButton type="submit">
          Submit
        </UButton>
  </UForm>
    </UCard>
  </div>
</template>

<script lang="ts" setup>
import { object, string, type InferType } from 'yup'
import type { FormSubmitEvent } from '#ui/types'

const schema = object({
  email: string().email('Invalid email').required('Required'),
  password: string()
    .min(8, 'Must be at least 8 characters')
    .required('Required')
})

type Schema = InferType<typeof schema>

const state = reactive({
  email: undefined,
  password: undefined
})

async function onSubmit (event: FormSubmitEvent<Schema>) {
  // Do something with event.data
  console.log(event.data)
}
</script>
