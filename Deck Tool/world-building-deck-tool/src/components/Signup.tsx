import { useState } from "react";
import { signupUser } from "../services/userServices";

export default function Signup() {
    const [message, setMessage] = useState<string | null>(null);
    function handleSignup(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const username = formData.get('username') as string;
        const password = formData.get('password') as string;
        const firstName = formData.get('first-name') as string;
        const email = formData.get('email') as string;
        const confirmPassword = formData.get('confirm-password') as string;

        if (password !== confirmPassword) {
            setMessage("Passwords do not match");
            return;
        }

        signupUser({ username, email, password, first_name: firstName }).then(async response => {
            if (response.ok) {
                console.log("Signup successful");
            } else {
                console.log("Signup failed");
            }
            const text = await response.text();
            setMessage(`Signup response status: ${response.status}: ${text}`);
        });
    }

    return (
        <section>
            <div>
                <h1>Signup</h1>
                <form onSubmit={handleSignup} className="flex flex-col justify-center items-center gap-3">
                    <input name="username" placeholder="Username" className=""></input>
                    <input name="first-name" placeholder="First Name" className=""></input>
                    <input name="email" type="email" placeholder="Email" className=""></input>
                    <input name="password" type="password" placeholder="Password" className=""></input>
                    <input name="confirm-password" type="password" placeholder="Confirm Password" className=""></input>
                    <button type="submit" className="">Signup</button>
                </form>
                {message && <p>{message}</p>}
            </div>
        </section>
    )
}