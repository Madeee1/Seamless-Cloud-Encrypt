<template>
  <div>
    <h1>Delete Vault</h1>
    <UButton color="red" @click="deleteVault()"
      >Click here if you are sure</UButton
    >
  </div>
</template>
<script setup>
const supabase = useSupabaseClient()
const user = useSupabaseUser()

const vault = useVaultStore()

async function deleteVault() {
  const { error } = await supabase
    .from('vault')
    .delete()
    .eq('id', vault.id)
    .eq('user_id', user.value.id)

  if (error) {
    console.error(error)
  } else {
    vault.$reset()
    navigateTo('/dashboard')
  }
}
</script>