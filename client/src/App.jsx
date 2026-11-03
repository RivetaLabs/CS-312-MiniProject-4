import { useEffect, useState } from 'react'
import SignUp from './components/SignUp'
import SignIn from './components/SignIn'
import BlogPostForm from './components/BlogPostForm'
import PostList from './components/PostList'

export default function App() {
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [page, setPage] = useState('home')
  const [selectedPost, setSelectedPost] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  function refreshPosts() {
    fetch('/api/posts')
      .then(async response => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.error)
        return data
      })
      .then(data => {
        setPosts(data.posts)
        setUser(data.user)
        setError('')
      })
      .catch(error => setError(error.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    refreshPosts()
  }, [])

  function handleSaved() {
    setSelectedPost(null)
    setPage('home')
    refreshPosts()
  }

  if (page === 'signup') {
    return <SignUp onSuccess={() => setPage('signin')} onNavigate={setPage} />
  }
  if (page === 'signin') {
    return <SignIn onSuccess={user => { setUser(user); setPage('home') }} onNavigate={setPage} />
  }
  if (page === 'edit') {
    return (
      <main>
        <BlogPostForm key={selectedPost.blog_id} user={user} post={selectedPost}
          onSaved={handleSaved} onCancel={() => setPage('home')} />
      </main>
    )
  }

  return (
    <main>
      <h1>Jacob's Jubilous Journal</h1>
      <p>My name is Jacob! Here's my Jubilous journal with all my journeys.</p>
      <p>
        <button className="link" onClick={() => setPage('signup')}>Sign up</button>
        {' | '}
        <button className="link" onClick={() => setPage('signin')}>Sign in</button>
      </p>
      {user ? <BlogPostForm key="new" user={user} onSaved={handleSaved} /> : <p>Sign in to create a post.</p>}
      {loading && <p>Loading posts...</p>}
      {error && <p role="alert">Could not load posts: {error}</p>}
      {!loading && !error && (
        <>
          <p>Total posts: {posts.length}</p>
          <PostList posts={posts} user={user} onDeleted={refreshPosts}
            onEdit={post => { setSelectedPost(post); setPage('edit') }} />
        </>
      )}
    </main>
  )
}
