import { useState } from 'react';

export default function SignUp({ onSuccess, onNavigate }) {
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        const fields = Object.fromEntries(new FormData(event.currentTarget))
        setSaving(true);
        setError('');

        try {
            const response = await fetch("/api/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(fields)
            })
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Unknown error.");
            onSuccess();
        } catch (error) {
            setError(error.message);
        } finally {
            setSaving(false);
        }
    }
        return (
            <main>
                <h1>Create an account</h1>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="user_id">User ID</label>
                    <input type="text" name="user_id" id="user_id" required maxLength={255} autoComplete="username" />

                    <label htmlFor="name">Your Name</label>
                    <input id="name" name="name" type="text" required maxLength={255} autoComplete="name" />

                    <label htmlFor="password">Password</label>
                    <input type="password" name="password" id="password" required maxLength={255} autoComplete="new-password" />
                    
                    <button type="submit" disabled={saving}>Create account</button>
                    {error && <p role="alert">{error}</p>}
                    </form>
                    <button className="link" onClick={() => onNavigate("home")}>Back to the Blog</button>

            </main>
    )
}
