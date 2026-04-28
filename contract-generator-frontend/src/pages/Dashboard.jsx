import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Dashboard() {
    const navigate = useNavigate();

    // 1. Protection: Kick out anyone without a VIP Wristband
    useEffect(() => {
        const token = localStorage.getItem('mapeconToken');
        if (!token) {
            alert("No VIP wristband found. Please log in first!");
            navigate('/');
        }
    }, [navigate]);

    // 2. Form State (Where we hold the user's typing)
    const [accountType, setAccountType] = useState('SS');
    const [classification, setClassification] = useState('Residential');
    const [customerName, setCustomerName] = useState('');
    const [breakdate, setBreakdate] = useState('');
    const [baseDuration, setBaseDuration] = useState(12);
    const [baseFrequency, setBaseFrequency] = useState('Monthly');

    const [differentName, setDifferentName] = useState('');
    const [tin, setTin] = useState('');
    const [areasToBeTreated, setAreasToBeTreated] = useState('');
    const [surveyDetails, setSurveyDetails] = useState('');
    const [accountManagers, setAccountManagers] = useState('');


    // 3. Services State (Since one contract can have multiple services)
    const [selectedService, setSelectedService] = useState('MIST');
    const [servicesArray, setServicesArray] = useState([]);

    // 4. Handle Adding a Service to the Cart
    const addService = (e) => {
        e.preventDefault();
        setServicesArray([...servicesArray, { 
            service_code: selectedService, 
            print_description: `Standard treatment for ${selectedService}` 
        }]);
    };

    // 5. The Main Event: Sending the Data to Node.js
   const handleGenerateContract = async (e) => {
        e.preventDefault();
        
        if (servicesArray.length === 0) {
            alert("Uy, bawal empty! Please add at least one service.");
            return;
        }

        try {
            // Get the wristband from the browser's memory
            const token = localStorage.getItem('mapeconToken');

            // Format Residential names to UPPERCASE
            const formattedName = classification === 'Residential' 
                ? customerName.toUpperCase() 
                : customerName;

            // 🪄 NEW MAGIC: Convert "Leo, Phoebe" into a real Array ["Leo", "Phoebe"]
            // .split(',') chops it at the comma, and .map(.trim()) removes extra spaces!
            const managersArray = accountManagers 
                ? accountManagers.split(',').map(name => name.trim()) 
                : [];

            // Send the Axios POST request with ALL the new fields!
            const response = await axios.post('https://mapecon-backend.onrender.com/api/contracts', {
                account_type: accountType,
                classification: classification,
                customer_name: formattedName,
                
                // --- NEW FIELDS ADDED HERE ---
                different_name: differentName,
                tin: tin,
                areas_to_be_treated: areasToBeTreated,
                survey_details: surveyDetails,
                account_managers: managersArray, 
                // -----------------------------

                breakdate: breakdate,
                base_duration: baseDuration,
                base_frequency: baseFrequency,
                services: servicesArray 
            }, {
                headers: { Authorization: `Bearer ${token}` } // 🚨 VIP PASS 🚨
            });

            alert('Pak! Contract Created Successfully: ' + response.data.contract_number);
            
            // Clear the form completely after a successful save
            setCustomerName('');
            setDifferentName('');
            setTin('');
            setAreasToBeTreated('');
            setSurveyDetails('');
            setAccountManagers('');
            setServicesArray([]);

        } catch (error) {
            alert('Error: ' + (error.response?.data?.error || "Cannot connect to server."));
        }
    };

    return (
        <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f4f4f9', minHeight: '100vh', paddingBottom: '50px' }}>
            
            {/* 🧭 OUR NEW MENU BAR! It sits at the very top */}
            <Navbar /> 
            
            {/* The Inner Form Container (White box, centered, with a subtle shadow) */}
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '30px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                <h2>📊 Create New Contract</h2>
                
                <form onSubmit={handleGenerateContract} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* --- 1. BASIC DETAILS --- */}
                    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fafafa' }}>
                        <h3 style={{ marginTop: 0 }}>1. Basic Details</h3>
                        
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                            <select value={accountType} onChange={(e) => setAccountType(e.target.value)} style={{ padding: '8px', flex: 1 }}>
                                <option value="SS">Structural (SS)</option>
                                <option value="NS">Non-Structural (NS)</option>
                                <option value="TPW">TPW</option>
                            </select>
                            
                            <select value={classification} onChange={(e) => setClassification(e.target.value)} style={{ padding: '8px', flex: 1 }}>
                                <option value="Residential">Residential</option>
                                <option value="Commercial">Commercial</option>
                            </select>
                        </div>

                        <input 
                            type="text" 
                            placeholder="Customer Name (Required)" 
                            value={customerName} 
                            onChange={(e) => setCustomerName(e.target.value)} 
                            required 
                            style={{ width: '100%', padding: '8px', marginBottom: '10px', boxSizing: 'border-box' }}
                        />

                        <input 
                            type="text" 
                            placeholder="Different Name for Print (Optional)" 
                            value={differentName} 
                            onChange={(e) => setDifferentName(e.target.value)} 
                            style={{ width: '100%', padding: '8px', marginBottom: '10px', boxSizing: 'border-box' }}
                        />

                        {/* TIN is only visible/required if they choose Commercial! */}
                        {classification === 'Commercial' && (
                            <input 
                                type="text" 
                                placeholder="TIN Number (Required for Commercial)" 
                                value={tin} 
                                onChange={(e) => setTin(e.target.value)} 
                                required
                                style={{ width: '100%', padding: '8px', marginBottom: '10px', boxSizing: 'border-box', border: '1px solid red' }}
                            />
                        )}
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                            <label style={{ fontWeight: 'bold' }}>Breakdate:</label>
                            <input 
                                type="date" 
                                value={breakdate} 
                                onChange={(e) => setBreakdate(e.target.value)} 
                                required 
                                style={{ padding: '8px' }}
                            />
                        </div>
                    </div>

                    {/* --- 2. EXTRA DETAILS --- */}
                    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fafafa' }}>
                        <h3 style={{ marginTop: 0 }}>2. Scope & Personnel</h3>
                        
                        <textarea 
                            placeholder="Areas to be Treated..." 
                            value={areasToBeTreated} 
                            onChange={(e) => setAreasToBeTreated(e.target.value)} 
                            style={{ width: '100%', padding: '8px', marginBottom: '10px', height: '60px', boxSizing: 'border-box' }}
                        />
                        
                        <textarea 
                            placeholder="Survey Details..." 
                            value={surveyDetails} 
                            onChange={(e) => setSurveyDetails(e.target.value)} 
                            style={{ width: '100%', padding: '8px', marginBottom: '10px', height: '60px', boxSizing: 'border-box' }}
                        />

                        <input 
                            type="text" 
                            placeholder="Account Managers (e.g. Leo, Phoebe, Michelle)" 
                            value={accountManagers} 
                            onChange={(e) => setAccountManagers(e.target.value)} 
                            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                        />
                    </div>

                    {/* --- 3. SCHEDULE --- */}
                    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fafafa' }}>
                        <h3 style={{ marginTop: 0 }}>3. Master Schedule</h3>
                        <label>Duration (Months): </label>
                        <input type="number" min="1" max="70" value={baseDuration} onChange={(e) => setBaseDuration(Number(e.target.value))} style={{ width: '60px', marginRight: '20px', padding: '5px' }} />
                        
                        <label>Frequency: </label>
                        <select value={baseFrequency} onChange={(e) => setBaseFrequency(e.target.value)} style={{ padding: '5px' }}>
                            <option value="Monthly">Monthly</option>
                            <option value="Quarterly">Quarterly</option>
                            <option value="Weekly">Weekly</option>
                            <option value="Spot">Spot</option>
                        </select>
                    </div>

                    {/* --- 4. SERVICES --- */}
                    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fafafa' }}>
                        <h3 style={{ marginTop: 0 }}>4. Add Services</h3>
                        <select value={selectedService} onChange={(e) => setSelectedService(e.target.value)} style={{ padding: '8px' }}>
                            <option value="MIST">Misting (MIST)</option>
                            <option value="GELAPP">Gel Application (GELAPP)</option>
                            <option value="SP">Soil Poisoning (SP)</option>
                            <option value="TAMP">Termite Abatement (TAMP)</option>
                        </select>
                        <button onClick={addService} style={{ marginLeft: '10px', padding: '8px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            + Add Service
                        </button>
                        
                        <ul style={{ marginTop: '15px', paddingLeft: '20px' }}>
                            {servicesArray.map((srv, index) => (
                                <li key={index} style={{ marginBottom: '5px' }}>
                                    <strong>{srv.service_code}</strong> Added
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* --- 5. SUBMIT --- */}
                    <button type="submit" style={{ padding: '15px', backgroundColor: '#28a745', color: 'white', fontSize: '18px', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '10px' }}>
                        💾 Save Contract to Vault
                    </button>
                    
                </form>
            </div>
        </div>
    );
}