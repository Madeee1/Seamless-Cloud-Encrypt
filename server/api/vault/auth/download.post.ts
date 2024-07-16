import { serverSupabaseUser } from '#supabase/server'
import { serverSupabaseClient } from '#supabase/server'
import bcrypt from 'bcrypt'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const supabase = await serverSupabaseClient(event)

  // check user is authenticated
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  /*
  1. Receives vault id and password
  2. Get that vault id's hash from the database
  3. Compare the hash with the password using bcrypt
  4. If the password is correct, get the rest of the vault data
  5. Return the data
  */

  const { vaultId, password } = await readBody(event)
  const { data, error } = await supabase
    .from('vault')
    .select('hashed_password')
    .eq('user_id', user.id)
    .eq('id', vaultId)
    .single()

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    })
  }

  const match = await bcrypt.compare(password, data.hashed_password)

  if (!match) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  return { ok: true }
})
