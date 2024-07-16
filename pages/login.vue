<template>
  <div class="flex flex-col min-h-screen bg-main-blue text-gray-200">
    <div>
      <UCard class="w-[450px] mx-auto mt-8 rounded-2xl bg-gray-200">
        <template #header>
          <!-- Use Tab to see whether user Signs up or Login -->
          <UTabs v-model="selectedTab" :items="items" />
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

          <UFormGroup label="Password" name="password" class="h-[80px]">
            <UInput
              v-model="state.password"
              type="password"
              placeholder="StrongP@ssword101"
            />
          </UFormGroup>

          <div class="text-left mt-2">
            <a
              href="/forgot-password"
              class="text-blue-500 hover: underline"
              @click.prevent="toForgotPassword"
            >
              Forgot Password?
            </a>
          </div>

          <div class="flex">
            <UButton
              type="submit"
              class="flex-1 w-full bg-second-blue hover:shadow-[5px_3px_0px_rgb(255,0,0)] hover:bg-white hover:text-second-blue active:shadow-[5px_3px_0px_rgb(0,4,30)]"
            >
              Submit
            </UButton>
          </div>
          <div class="flex">
            <span class="text-red-500 ml-2 text-sm my-auto">
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
  password: '',
})
const errorMessage = ref('')

const schema = object({
  email: string().email('Invalid email').required('Required'),
  password: string()
    .min(4, 'Must be at least 4 characters')
    .required('Required'),
})

type Schema = InferType<typeof schema>

async function onSubmit(event: FormSubmitEvent<Schema>) {
  if (selectedTab.value === 1) {
    return await login()
  } else {
    return await signup()
  }
}

async function login() {
  // TODO: Error is not handled correctly
  const { data, error } = await supabase.auth.signInWithPassword({
    email: state.value.email,
    password: state.value.password,
  })

  if (error) {
    errorMessage.value = error.message
    return
  } else {
    navigateTo('/confirm')
  }
}

async function signup() {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: state.value.email,
      password: state.value.password,
      options: {
        emailRedirectTo: window.location.origin + '/confirm',
      },
    })
    navigateTo('/confirm')
  } catch (error: any) {
    errorMessage.value = error.message
  }
}

function toForgotPassword() {
  navigateTo('/forgot-password')
}

// Login or signup functionality
const items = [{ label: 'Sign up' }, { label: 'Login' }]
const route = useRoute()
const router = useRouter()

const selectedTab = computed({
  get() {
    const index = items.findIndex((item) => item.label === route.query.tab)
    if (index === -1) {
      return 0
    }

    return index
  },
  set(value) {
    router.replace({ query: { tab: items[value].label } })
  },
})
</script>
