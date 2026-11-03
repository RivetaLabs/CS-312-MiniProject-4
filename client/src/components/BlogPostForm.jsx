import { useState } from 'react'

export default function BlogPostForm({ user, post = null, onSaved, onCancel }) {
  const [title, setTitle] = useState(post?.title ?? '')
  const [body, setBody] = useState(post?.body ?? '')
  const [category, setCategory] = useState(post?.category ?? 'tech')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const url = post ? `/api/posts/${post.blog_id}/edit` : '/api/posts'
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post ? { title, body } : { title, body, category }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setTitle('')
      setBody('')
      setCategory('tech')
      onSaved()
    } catch (error) {
      setError(error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {post && <h1>Edit post</h1>}
      {error && <p role="alert">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label htmlFor="author">Your name please</label>
        <input id="author" value={post?.creator_name ?? user.name} readOnly />
        <label htmlFor="title">Post Title</label>
        <input id="title" value={title} onChange={event => setTitle(event.target.value)} maxLength={255} required />
        <label htmlFor="body">Your post</label>
        <textarea id="body" value={body} onChange={event => setBody(event.target.value)} rows={7} required />
        {!post && (
          <>
            <label htmlFor="category">Category</label>
            <select id="category" value={category} onChange={event => setCategory(event.target.value)}>
              <option value="tech">Tech</option>
              <option value="sports">Sports</option>
              <option value="money-moves">Money Moves</option>
            </select>
          </>
        )}
        <button disabled={saving}>{post ? 'Save changes' : 'Make an SEO OPTIMIZED post'}</button>
        {post && <button type="button" className="link" onClick={onCancel} disabled={saving}>Cancel</button>}
      </form>
    </>
  )
}
