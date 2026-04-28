import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

export default function ContractDetail() {
    const { id } = useParams(); // This grabs the "2" from "/contract/2"
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const token = localStorage.getItem('mapeconToken');
                const response = await axios.get(`https://mapecon-backend.onrender.com/api/contracts/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setContract(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching details:", error);
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>🔍 Pulling records from vault...</div>;
    if (!contract) return <div style={{ padding: '50px', textAlign: 'center' }}>❌ Contract not found.</div>;

    return (
        <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f9', minHeight: '100vh', paddingBottom: '50px' }}>
            <Navbar />
            
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                
                {/* Header Section */}
                <div style={{ borderBottom: '3px solid #0056b3', paddingBottom: '10px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{ color: '#0056b3', margin: 0 }}>{contract.contract_number}</h1>
                    <span style={{ backgroundColor: '#e9ecef', padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold' }}>{contract.account_type}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                    {/* Left Column: Client Info */}
                    <div>
                        <h3 style={{ color: '#555' }}>👤 Client Information</h3>
                        <p><strong>Customer:</strong> {contract.customer_name}</p>
                        {contract.different_name && <p><strong>Print Name:</strong> {contract.different_name}</p>}
                        <p><strong>Classification:</strong> {contract.classification}</p>
                        {contract.tin && <p><strong>TIN:</strong> {contract.tin}</p>}
                    </div>

                    {/* Right Column: Schedule Info */}
                    <div>
                        <h3 style={{ color: '#555' }}>🗓️ Service Schedule</h3>
                        <p><strong>Start Date (Breakdate):</strong> {new Date(contract.breakdate).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        <p><strong>Duration:</strong> {contract.base_duration} Months</p>
                        <p><strong>Frequency:</strong> {contract.base_frequency}</p>
                        <p><strong>Total Services:</strong> {contract.total_service}</p>
                    </div>
                </div>

                <hr style={{ margin: '30px 0', border: '0', borderTop: '1px solid #eee' }} />

                {/* Scope Section */}
                <h3 style={{ color: '#555' }}>🏠 Scope & Survey</h3>
                <p><strong>Areas to be Treated:</strong> {contract.areas_to_be_treated || "N/A"}</p>
                <p><strong>Survey Details:</strong> {contract.survey_details || "N/A"}</p>

                {/* Services Table */}
                <h3 style={{ color: '#555', marginTop: '30px' }}>🛠️ Services Applied</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8f9fa', textAlign: 'left' }}>
                            <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Service Code</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Duration</th>
                            <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Frequency</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contract.services.map((s, index) => (
                            <tr key={index}>
                                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}><strong>{s.service_code}</strong></td>
                                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{s.specific_duration} Mos</td>
                                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{s.specific_frequency}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Print Button */}
                <button 
                    onClick={() => window.print()}
                    style={{ marginTop: '40px', padding: '12px 25px', backgroundColor: '#0056b3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}
                >
                    🖨️ Prepare for PDF Printing
                </button>
            </div>
        </div>
    );
}