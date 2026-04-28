import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

export default function ContractsList() {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContracts = async () => {
            try {
                const token = localStorage.getItem('mapeconToken');
                const response = await axios.get('http://localhost:5000/api/contracts', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setContracts(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching contracts:", error);
                setLoading(false);
            }
        };

        fetchContracts();
    }, []);

    return (
        <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f9', minHeight: '100vh' }}>
            <Navbar />
            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
                <h2>📄 Contract Database</h2>
                
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', backgroundColor: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#0056b3', color: 'white', textAlign: 'left' }}>
                            <th style={{ padding: '12px' }}>Contract #</th>
                            <th style={{ padding: '12px' }}>Customer Name</th>
                            <th style={{ padding: '12px' }}>Account Type</th>
                            <th style={{ padding: '12px' }}>Date Created</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center' }}>Loading...</td></tr>
                        ) : contracts.length === 0 ? (
                            <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center' }}>No contracts found.</td></tr>
                        ) : (
                            contracts.map((c) => (
                                <tr key={c.id} style={{ borderBottom: '1px solid #ddd' }}>
                                    <td style={{ padding: '12px' }}>
                                    <Link to={`/contract/${c.id}`} style={{ color: '#0056b3', fontWeight: 'bold' }}>
                                        {c.contract_number}
                                    </Link>
                                </td>
                                    <td style={{ padding: '12px' }}>{c.customer_name}</td>
                                    <td style={{ padding: '12px' }}>{c.account_type}</td>
                                    <td style={{ padding: '12px' }}>{new Date(c.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}