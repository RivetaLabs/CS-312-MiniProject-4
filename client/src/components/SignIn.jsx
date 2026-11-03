import { useState } from 'react';

export default function SignIn({ onSuccess, onNavigate }) {
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        const fields = Object.fromEntries(new FormData(event.currentTarget))
        setSaving(true);
        setError('');

        try {
            const response = await fetch("/api/signin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(fields)
            })
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Unknown error.");
            onSuccess(data.user);
        } catch (error) {
            setError(error.message);
        } finally {
            setSaving(false);
        }
    }
        return (
            <main>
                <h1>Sign in</h1>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="user_id">User ID</label>
                    <input type="text" name="user_id" id="user_id" required maxLength={255} autoComplete="username" />

                   
                    

                    <label htmlFor="password">Password</label>
                    <input type="password" name="password" id="password" required maxLength={255} autoComplete="current-password" />
                    
                    <button type="submit" disabled={saving}>Sign in</button>
                    {error && <p role="alert">{error}</p>}
                    </form>
                    <button className="link" onClick={() => onNavigate("signup")}>Create an account</button>

            </main>
    )
}
