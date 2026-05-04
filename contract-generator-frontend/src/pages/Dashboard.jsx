import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './CreateContract.css'; // 🪄 Linking our new beautiful styles!

export default function CreateContract() {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('mapeconToken');
        if (!token) {
            alert("No VIP wristband found. Please log in first!");
            navigate('/');
        }
    }, [navigate]);

    // --- ZONE 1: Basic Details State ---
    const [accountType, setAccountType] = useState('SS');
    const [classification, setClassification] = useState('Residential');
    const [customerName, setCustomerName] = useState('');
    const [differentName, setDifferentName] = useState('');
    const [territory, setTerritory] = useState('WEST');
    const [address, setAddress] = useState('');
    const [billingAddress, setBillingAddress] = useState('');
    const [clientContactNumber, setClientContactNumber] = useState('');
    const [tin, setTin] = useState('');
    const [breakdate, setBreakdate] = useState('');

    // --- ZONE 1.5: Commercial Contact Details ---
    const [contactPerson, setContactPerson] = useState('');
    const [contactPersonNumber, setContactPersonNumber] = useState('');
    const [contactDesignation, setContactDesignation] = useState('');

    // --- ZONE 2: Scope & Personnel ---
    const [areasToBeTreated, setAreasToBeTreated] = useState('');
    const [surveyDetails, setSurveyDetails] = useState('');
    const [primaryAM, setPrimaryAM] = useState('');
    const [secondaryAM, setSecondaryAM] = useState('');
    const [tertiaryAM, setTertiaryAM] = useState('');

    // --- ZONE 3: Master Schedule ---
    const [baseDuration, setBaseDuration] = useState(12);
    const [baseFrequency, setBaseFrequency] = useState('Monthly');

    // --- ZONE 4: Services ---
    const [selectedService, setSelectedService] = useState('MIST');
    const [servicesArray, setServicesArray] = useState([]);

    // 🪄 The Minion Logic: Adding a service copies the Master Schedule
    const addService = (e) => {
        e.preventDefault();
        setServicesArray([...servicesArray, { 
            service_code: selectedService, 
            duration: baseDuration,       // Inherits Master Duration
            frequency: baseFrequency,     // Inherits Master Frequency
            print_description: `Standard treatment for ${selectedService}` 
        }]);
    };

    // 🪄 The Bouncer Logic: Stopping users from exceeding Master Duration
    const handleServiceDurationChange = (index, newDuration) => {
        const value = Number(newDuration);
        if (value > baseDuration) {
            alert(`Oops! The duration for a specific service cannot exceed the Master Schedule (${baseDuration} months).`);
            return;
        }
        
        // Update the specific service in the array
        const updatedServices = [...servicesArray];
        updatedServices[index].duration = value;
        setServicesArray(updatedServices);
    };

    const handleServiceFrequencyChange = (index, newFrequency) => {
        const updatedServices = [...servicesArray];
        updatedServices[index].frequency = newFrequency;
        setServicesArray(updatedServices);
    };

    const handleGenerateContract = async (e) => {
        e.preventDefault();
        if (servicesArray.length === 0) {
            alert("Please add at least one service.");
            return;
        }

        try {
            const token = localStorage.getItem('mapeconToken');
            const formattedName = classification === 'Residential' ? customerName.toUpperCase() : customerName;

            // Combine the Account Managers into a clean array, removing empty ones
            const managersArray = [primaryAM, secondaryAM, tertiaryAM].filter(name => name.trim() !== '');

            const payload = {
                account_type: accountType,
                classification: classification,
                customer_name: formattedName,
                different_name: differentName,
                territory: territory,
                address: address,
                billing_address: billingAddress,
                client_contact_number: clientContactNumber,
                tin: tin,
                breakdate: breakdate,
                
                // Commercial Fields (will be blank strings if not commercial)
                contact_person: contactPerson,
                contact_person_number: contactPersonNumber,
                contact_designation: contactDesignation,

                areas_to_be_treated: areasToBeTreated,
                survey_details: surveyDetails,
                account_managers: managersArray, 
                base_duration: baseDuration,
                base_frequency: baseFrequency,
                services: servicesArray 
            };

            const response = await axios.post('https://mapecon-backend.onrender.com/api/contracts', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('Pak! Contract Created Successfully: ' + response.data.contract_number);
            window.location.reload(); // Quick refresh to clear the form!

        } catch (error) {
            alert('Error: ' + (error.response?.data?.error || "Cannot connect to server."));
        }
    };

    return (
        <div className="page-container">
            <Navbar /> 
            
            <div className="form-card">
                <h2 style={{ color: '#333', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>📄 Create New Contract</h2>
                
                <form onSubmit={handleGenerateContract}>
                    
                    {/* --- ZONE 1: BASIC DETAILS --- */}
                    <div className="section-box">
                        <h3 style={{ marginTop: 0, color: '#d32f2f' }}>1. Basic Details</h3>
                        
                        <div className="input-row">
                            <div className="input-group">
                                <label>Account Type <span className="required-star">*</span></label>
                                <select value={accountType} onChange={(e) => setAccountType(e.target.value)}>
                                    <option value="SS">Structural (SS)</option>
                                    <option value="NS">Non-Structural (NS)</option>
                                    <option value="TPW">TPW</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Classification <span className="required-star">*</span></label>
                                <select value={classification} onChange={(e) => setClassification(e.target.value)}>
                                    <option value="Residential">Residential</option>
                                    <option value="Commercial">Commercial</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Jobsite Territory <span className="required-star">*</span></label>
                                <select value={territory} onChange={(e) => setTerritory(e.target.value)}>
                                    <option value="WEST">WEST</option>
                                    <option value="NORTH">NORTH</option>
                                    <option value="EAST">EAST</option>
                                    <option value="SOUTH">SOUTH</option>
                                </select>
                            </div>
                        </div>

                        <div className="input-row">
                            <div className="input-group">
                                <label>Customer Name <span className="required-star">*</span></label>
                                <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
                            </div>
                            <div className="input-group">
                                <label>Different Name for Print</label>
                                <input type="text" value={differentName} onChange={(e) => setDifferentName(e.target.value)} />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Address <span className="required-star">*</span></label>
                            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required />
                        </div>

                        <div className="input-row">
                            <div className="input-group">
                                <label>Billing Address</label>
                                <input type="text" value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)} />
                            </div>
                            <div className="input-group">
                                <label>Contact Number <span className="required-star">*</span></label>
                                <input type="text" value={clientContactNumber} onChange={(e) => setClientContactNumber(e.target.value)} required />
                            </div>
                        </div>

                        <div className="input-row">
                            <div className="input-group">
                                <label>Breakdate <span className="required-star">*</span></label>
                                <input type="date" value={breakdate} onChange={(e) => setBreakdate(e.target.value)} required />
                            </div>
                            {classification === 'Commercial' && (
                                <div className="input-group">
                                    <label>TIN <span className="required-star">*</span></label>
                                    <input type="text" value={tin} onChange={(e) => setTin(e.target.value)} required />
                                </div>
                            )}
                        </div>

                        {/* 🪄 THE INVISIBILITY CLOAK: Commercial Contacts */}
                        {classification === 'Commercial' && (
                            <div style={{ padding: '15px', backgroundColor: '#fff', border: '1px dashed #d32f2f', borderRadius: '6px' }}>
                                <h4 style={{ margin: '0 0 10px 0', color: '#d32f2f' }}>Commercial Contact Details</h4>
                                <div className="input-row">
                                    <div className="input-group">
                                        <label>Contact Person <span className="required-star">*</span></label>
                                        <input type="text" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} required />
                                    </div>
                                    <div className="input-group">
                                        <label>Contact Number <span className="required-star">*</span></label>
                                        <input type="text" value={contactPersonNumber} onChange={(e) => setContactPersonNumber(e.target.value)} required />
                                    </div>
                                    <div className="input-group">
                                        <label>Designation <span className="required-star">*</span></label>
                                        <input type="text" value={contactDesignation} onChange={(e) => setContactDesignation(e.target.value)} required />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* --- ZONE 2: SCOPE & PERSONNEL --- */}
                    <div className="section-box">
                        <h3 style={{ marginTop: 0, color: '#d32f2f' }}>2. Scope & Personnel</h3>
                        <div className="input-group">
                            <label>Areas to be Treated</label>
                            <textarea value={areasToBeTreated} onChange={(e) => setAreasToBeTreated(e.target.value)} rows="2"></textarea>
                        </div>
                        <div className="input-group">
                            <label>Survey Details</label>
                            <textarea value={surveyDetails} onChange={(e) => setSurveyDetails(e.target.value)} rows="2"></textarea>
                        </div>

                        <h4 style={{ marginBottom: '10px' }}>Account Managers</h4>
                        <div className="input-row">
                            <div className="input-group">
                                <label>Primary AM <span className="required-star">*</span></label>
                                <input type="text" value={primaryAM} onChange={(e) => setPrimaryAM(e.target.value)} required placeholder="e.g. Leo" />
                            </div>
                            <div className="input-group">
                                <label>Secondary AM</label>
                                <input type="text" value={secondaryAM} onChange={(e) => setSecondaryAM(e.target.value)} placeholder="e.g. Phoebe" />
                            </div>
                            <div className="input-group">
                                <label>Tertiary AM</label>
                                <input type="text" value={tertiaryAM} onChange={(e) => setTertiaryAM(e.target.value)} />
                            </div>
                        </div>
                    </div>

                    {/* --- ZONE 3: MASTER SCHEDULE --- */}
                    <div className="section-box">
                        <h3 style={{ marginTop: 0, color: '#d32f2f' }}>3. Master Schedule</h3>
                        <div className="input-row" style={{ maxWidth: '400px' }}>
                            <div className="input-group">
                                <label>Master Duration (Months) <span className="required-star">*</span></label>
                                <input type="number" min="1" max="70" value={baseDuration} onChange={(e) => setBaseDuration(Number(e.target.value))} />
                            </div>
                            <div className="input-group">
                                <label>Master Frequency <span className="required-star">*</span></label>
                                <select value={baseFrequency} onChange={(e) => setBaseFrequency(e.target.value)}>
                                    <option value="Monthly">Monthly</option>
                                    <option value="Quarterly">Quarterly</option>
                                    <option value="Weekly">Weekly</option>
                                    <option value="Spot">Spot</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* --- ZONE 4: SERVICES --- */}
                    <div className="section-box">
                        <h3 style={{ marginTop: 0, color: '#d32f2f' }}>4. Add Services</h3>
                        <div className="input-row" style={{ alignItems: 'flex-end' }}>
                            <div className="input-group" style={{ flex: 2 }}>
                                <label>Select Service</label>
                                <select value={selectedService} onChange={(e) => setSelectedService(e.target.value)}>
                                    <option value="MIST">Misting (MIST)</option>
                                    <option value="GELAPP">Gel Application (GELAPP)</option>
                                    <option value="SP">Soil Poisoning (SP)</option>
                                    <option value="TAMP">Termite Abatement (TAMP)</option>
                                </select>
                            </div>
                            <div className="input-group" style={{ flex: 1 }}>
                                <button onClick={addService} className="btn-add">+ Add Service</button>
                            </div>
                        </div>
                        
                        <div>
                            {servicesArray.map((srv, index) => (
                                <div key={index} className="service-item">
                                    <strong style={{ minWidth: '80px', color: '#d32f2f' }}>{srv.service_code}</strong>
                                    
                                    <label style={{ margin: 0 }}>Duration:</label>
                                    <input 
                                        type="number" 
                                        value={srv.duration} 
                                        onChange={(e) => handleServiceDurationChange(index, e.target.value)} 
                                        style={{ width: '70px', padding: '5px' }}
                                    />

                                    <label style={{ margin: 0, marginLeft: '10px' }}>Freq:</label>
                                    <select 
                                        value={srv.frequency} 
                                        onChange={(e) => handleServiceFrequencyChange(index, e.target.value)}
                                        style={{ width: '120px', padding: '5px' }}
                                    >
                                        <option value="Monthly">Monthly</option>
                                        <option value="Quarterly">Quarterly</option>
                                        <option value="Weekly">Weekly</option>
                                        <option value="Spot">Spot</option>
                                    </select>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="btn-submit">
                        💾 Save Contract to Vault
                    </button>
                    
                </form>
            </div>
        </div>
    );
}