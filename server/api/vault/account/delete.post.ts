import { serverSupabaseUser } from '#supabase/server'
import { serverSupabaseServiceRole } from '#supabase/server'
import { serverSupabaseClient } from '#supabase/server'
import bcrypt from 'bcrypt'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const supabase = serverSupabaseServiceRole(event)
  const supabaseClient = await serverSupabaseClient(event)

  // check user is authenticated
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  // Get hashed password from database
  const { data: userPassword, error: errorPassword } = await supabaseClient
    .from('user')
    .select('hashed_password')
    .eq('id', user.id)
    .single()

  if (errorPassword) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error when getting hashed password',
    })
  }

  const { password } = await readBody(event)

  console.log('type of password', typeof password)
  console.log('type of userPassword', typeof userPassword.hashed_password)
  // Use bcrypt to compare the password
  const match = await bcrypt.compare(password, userPassword.hashed_password)
  console.log('match ', match)
  console.log(userPassword.hashed_password)

  if (!match) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Wrong password',
    })
  }
  const { data, error } = await supabase.auth.admin.deleteUser(user.id, true)

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error when deleting',
    })
  }
  return data
})
