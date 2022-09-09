import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'
import Auth from '../components/Auth'
import Account from '../components/Account'
import { createClient, useQuery } from 'urql'

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const [session, setSession] = useState(null)

  const headers = {
    apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    authorization: `Bearer: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
  }

  const client = createClient({
    url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/graphql/v1`,
    fetchOptions: function createFetchOptions() {
      return { headers }
    },
  })

  const TodosQuery = `
    query {
      todosCollection {
        edges {
          node {
            id
            title
          }
        }
      }
    }
  `

  // Query for the data (React)
  const [result, reexecuteQuery] = useQuery({
    query: TodosQuery,
  })

  // Read the result
  const { data, fetching, error } = result

  console.log(result)

  useEffect(() => {
    let mounted = true

    async function getInitialSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      // only update the react state if the component is still mounted
      if (mounted) {
        if (session) {
          setSession(session)
        }

        setIsLoading(false)
      }
    }

    getInitialSession()

    const { subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
      }
    )

    return () => {
      mounted = false

      subscription?.unsubscribe()
    }
  }, [])

  return (
    <div className="container" style={{ padding: '50px 0 100px 0' }}>
      {!session ? (
        <Auth />
      ) : (
        <Account key={session.user.id} session={session} />
      )}
    </div>
  )
}