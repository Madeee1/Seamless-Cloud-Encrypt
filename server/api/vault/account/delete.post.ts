import { serverSupabaseUser } from '#supabase/server'
import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const supabase = serverSupabaseServiceRole(event)

  // check user is authenticated
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
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
