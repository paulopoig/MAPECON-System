import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    // 1. State: This is where React temporarily holds what the user types
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // 2. The Navigator: We use this to redirect them to the Dashboard later
    const navigate = useNavigate();

    // 3. The Action: What happens when they click "Log In"
    const handleLogin = async (e) => {
        e.preventDefault(); // Stops the page from refreshing automatically
        
        try {
            // We use Axios (our messenger) to send the email and password to our Node server
            const response = await axios.post('http://localhost:5000/api/login', {
                email: email,
                password: password
            });

            // If successful, the server gives us the JWT Token (The VIP Wristband). 
            // We save it to the browser's Local Storage so it doesn't forget who we are.
            localStorage.setItem('mapeconToken', response.data.token);
            
            alert('Pak! Login Successful! Welcome, ' + response.data.user.name);
            
            // Transport them straight to the Dashboard!
            navigate('/dashboard');

        } catch (error) {
            // If they type the wrong password, the backend sends an error. We catch it here.
            alert('Oops: ' + error.response?.data?.error || "Cannot connect to server.");
        }
    };

    return (
        <div style={{ padding: '50px', fontFamily: 'sans-serif' }}>
            <h2>🔑 MAPECON Secure Login</h2>
            
            {/* The Form */}
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', width: '300px', gap: '15px' }}>
                <input 
                    type="email" 
                    placeholder="Enter your MAPECON Email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    style={{ padding: '10px' }}
                />
                
                <input 
                    type="password" 
                    placeholder="Enter Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    style={{ padding: '10px' }}
                />
                
                <button type="submit" style={{ padding: '10px', backgroundColor: '#0056b3', color: 'white', border: 'none', cursor: 'pointer' }}>
                    Access System
                </button>
            </form>
        </div>
    );
}