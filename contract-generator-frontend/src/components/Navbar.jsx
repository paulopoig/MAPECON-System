import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Rip off the VIP wristband and kick them to the login page
        localStorage.removeItem('mapeconToken');
        navigate('/');
    };

    return (
        <nav style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            backgroundColor: '#0056b3', 
            color: 'white', 
            padding: '15px 30px',
            marginBottom: '20px'
        }}>
            <h2 style={{ margin: 0 }}>MAPECON Systems</h2>
            
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                {/* React Router Links prevent the page from doing a hard refresh */}
                <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>+ Create Contract</Link>
                <Link to="/contracts" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>📄 View Contracts</Link>
                
                <button 
                    onClick={handleLogout} 
                    style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                >
                    Logout
                </button>
            </div>
        </nav>
    );
}