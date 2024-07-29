<template>
  <div class="flex flex-col h-full px-4">
    <div class="w-full px-8 py-2 space-y-2">
      <h1
        class="text-3xl font-semibold text-gray-200 first-letter:text-third-blue"
      >
        Update <span class="text-third-blue">V</span>ault's
        <span class="text-third-blue">D</span>etails
      </h1>
      <form>
        <div class="mb-3 first-letter:text-third-blue">
          <label class="text-xl font-semibold text-gray-200">Vault Name</label>
          <input
            v-model="updatedVaultName"
            type="text"
            required
            class="rounded w-full py-2 px-3 text-gray-700 leading-tight"
          />
        </div>
        <div class="mb-3 first-letter:text-third-blue">
          <label class="text-xl font-semibold text-gray-200"
            >Vault Description</label
          >
          <textarea
            v-model="updatedVaultDescription"
            required
            class="rounded w-full py-2 px-3 text-gray-700 leading-tight"
            rows="2"
          ></textarea>
        </div>
        <div class="pt-3 flex justify-end">
          <UButton
            class="block w-1/6 text-lg font-semibold bg-blue-500 hover:bg-blue-700 text-gray-200 py-1 px-2 rounded"
            @click="updateVault()"
            >Update Details</UButton
          >
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
const supabase = useSupabaseClient()
const vault = useVaultStore()
const updatedVaultName = ref(vault.name)
const updatedVaultDescription = ref(vault.description)
const user = useSupabaseUser()

async function updateVault() {
  const { data, error } = await supabase
    .from('vault')
    .update({
      name: updatedVaultName.value,
      description: updatedVaultDescription.value,
    })
    .eq('id', vault.id)
    .eq('user_id', user.value.id)
    .select()

  if (error) {
    console.error(error)
  } else {
    console.log(data)
    vault.$patch({
      name: data[0].name,
    })
    navigateTo('/dashboard/vault')
  }
}
</script>
