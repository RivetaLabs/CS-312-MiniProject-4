import { useState } from 'react'

export default function PostList({ posts, user, onEdit, onDeleted }) {
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)

  async function handleDelete(id) {
    setDeleting(true)
    setError('')
    try {
      const response = await fetch(`/api/posts/${id}/delete`, { method: 'POST' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      onDeleted()
    } catch (error) {
      setError(error.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      {error && <p role="alert">{error}</p>}
      {posts.map(post => (
        <article key={post.blog_id}>
          <h2>{post.title}</h2>
          <p>{post.body}</p>
          <p>By: {post.creator_name}</p>
          <p>Category: {post.category}</p>
          <p>Created: {new Date(post.date_created).toLocaleString()}</p>
          {user?.user_id === post.creator_user_id && (
            <>
              <button className="link" onClick={() => onEdit(post)}>Edit</button>
              <button disabled={deleting} onClick={() => handleDelete(post.blog_id)}>Delete</button>
            </>
          )}
        </article>
      ))}
    </>
  )
}
