import { Routes, Route, Link } from 'react-router-dom';
import DeckViewer from './DeckViewer';
import DeckCreator from './DeckCreator';    
import Login from './Login';
import Signup from './Signup';
import { useAuth } from '../context/AuthContext';

export default function MainMenu() {
    const auth = useAuth();
    return (
        <section>
            <div>
                <h1>World Helper</h1>
                <h2>A collection of small tools to help with world building</h2>
                {auth.user && <h3>Welcome, {auth.user.first_name}</h3>}
            </div>
            <nav className='flex flex-row justify-center items-center bg-stone-200 mb-5'>
                <Link to="/deck-tool" className='hover:bg-white px-5 text-center w-50'>Deck Tool</Link>
                <Link to="/deck-creator" className='hover:bg-white px-5 text-center w-50'>Deck Creator</Link>
                {auth.user ? <button onClick={auth.logout} className='hover:bg-white px-5 text-center w-50'>Logout</button> : 
                <div>
                    <Link to="/login" className='hover:bg-white px-5 text-center w-50'>Login</Link>
                    <Link to="/signup" className='hover:bg-white px-5 text-center w-50'>Signup</Link>
                </div>
                 }
            </nav>

            <Routes>
                <Route path="/deck-tool" element={<DeckViewer />} />
                <Route path="/deck-creator" element={<DeckCreator />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

            </Routes>
        </section>
    )
}