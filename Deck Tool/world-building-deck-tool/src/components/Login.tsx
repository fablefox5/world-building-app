import { loginUser } from "../services/userServices";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const { login } = useAuth();
    // const [message, setMessage] = useState<string | null>(null);
    async function handleLogin(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const username = formData.get('username') as string;
        const password = formData.get('password') as string;

        const response = await loginUser({ username, password });
        login(response.token);
    }
  
  
  return (
        <section>
            <div>
                <h1>Login</h1>  
                <form onSubmit={handleLogin} className="flex flex-col justify-center items-center gap-3">
                  <input name="username" placeholder="Username" className=""></input>
                  <input name="password" type="password" placeholder="Password" className=""></input>
                  <button type="submit" className="">Login</button>
                </form>
                {/* {message && <p>{message}</p>} */}
            </div>
        </section>
    )
}