import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function MakePayment() {
    const { token } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        amount: '',
        currency: 'USD',
        provider: 'SWIFT',
        beneficiary_account_number: '',
        beneficiary_name: '',
        swift_code: '',
        bank_name: '',
        bank_address: '',
        bank_country: ''
    });

    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState('');

    const regex = {
        amount: /^\d+(\.\d{1,2})?$/,
        accountNumber: /^[A-Z0-9]{8,34}$/,
        beneficiaryName: /^[a-zA-Z\s\-']{2,100}$/,
        swiftCode: /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const validate = () => {
        const newErrors = {};
        if (!regex.amount.test(form.amount)) newErrors.amount = 'Invalid amount (max 2 decimals)';
        if (!regex.accountNumber.test(form.beneficiary_account_number)) newErrors.beneficiary_account_number = 'Invalid account number';
        if (!regex.beneficiaryName.test(form.beneficiary_name)) newErrors.beneficiary_name = 'Invalid beneficiary name';
        if (!regex.swiftCode.test(form.swift_code)) newErrors.swift_code = 'Invalid SWIFT code';
        if (!form.bank_name) newErrors.bank_name = 'Bank name is required';
        if (!form.bank_country) newErrors.bank_country = 'Bank country is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccess('');
        if (!validate()) return;

        try {
            if (!token) {
                setErrors({ submit: 'No authentication token found. Please login again.' });
                return;
            }

            const response = await fetch('http://localhost:5000/api/customer/payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(form)
            });

            if (response.ok) {
                setSuccess('Payment submitted successfully!');

                // Reset form
                setForm({
                    amount: '',
                    currency: 'USD',
                    provider: 'SWIFT',
                    beneficiary_account_number: '',
                    beneficiary_name: '',
                    swift_code: '',
                    bank_name: '',
                    bank_address: '',
                    bank_country: ''
                });

                // Redirect to CustomerDashboard after 1 second
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1000);
            } else {
                const data = await response.json();
                setErrors({ submit: data.message || 'Payment failed' });
            }
        } catch (err) {
            setErrors({ submit: err.message });
        }
    };

/*
import React, { useState } from 'react'; 
// For programmatic navigation after payment (React Router, 2025)
import { useNavigate } from 'react-router-dom'; 
// Custom authentication context for accessing user token 
import { useAuth } from '../contexts/AuthContext';  


// Functional component for making payments
export default function MakePayment() {
    const { token } = useAuth();  
    const navigate = useNavigate(); 

    // Form state to store all input values
    const [form, setForm] = useState({
        amount: '',
        currency: 'USD',
        provider: 'SWIFT',
        beneficiary_account_number: '',
        beneficiary_name: '',
        swift_code: '',
        bank_name: '',
        bank_address: '',
        bank_country: ''
    });

    // State for handling validation errors and success messages
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState('');

    // Regular expressions for input validation
    const regex = {
        amount: /^\d+(\.\d{1,2})?$/,  
        accountNumber: /^[A-Z0-9]{8,34}$/, 
        beneficiaryName: /^[a-zA-Z\s\-']{2,100}$/, 
        swiftCode: /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/
    };
/*
    // Handle input changes and update form state
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };
/*
    // Validate form fields and return whether valid
    const validate = () => {
        const newErrors = {};
        if (!regex.amount.test(form.amount)) newErrors.amount = 'Invalid amount (max 2 decimals)';
        if (!regex.accountNumber.test(form.beneficiary_account_number)) newErrors.beneficiary_account_number = 'Invalid account number';
        if (!regex.beneficiaryName.test(form.beneficiary_name)) newErrors.beneficiary_name = 'Invalid beneficiary name';
        if (!regex.swiftCode.test(form.swift_code)) newErrors.swift_code = 'Invalid SWIFT code';
        if (!form.bank_name) newErrors.bank_name = 'Bank name is required';
        if (!form.bank_country) newErrors.bank_country = 'Bank country is required';
        setErrors(newErrors);  // Set errors state
        return Object.keys(newErrors).length === 0;  // Return true if no errors
    };
    */
   /*

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();  // Prevent default form submission behavior
        setSuccess('');  // Reset success message
        if (!validate()) return;  // Stop submission if validation fails

        try {
            if (!token) {
                setErrors({ submit: 'No authentication token found. Please login again.' });
                return;
            }

            // Send POST request to backend API with payment data
            const response = await fetch('http://localhost:5000/api/customer/payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(form)
            });

            if (response.ok) {
                // Payment success
                setSuccess('Payment submitted successfully!');
                setForm({  // Reset form after successful submission
                    amount: '',
                    currency: 'USD',
                    provider: 'SWIFT',
                    beneficiary_account_number: '',
                    beneficiary_name: '',
                    swift_code: '',
                    bank_name: '',
                    bank_address: '',
                    bank_country: ''
                });
                setTimeout(() => navigate('/dashboard'), 1200);
            } else {
                const data = await response.json();
                setErrors({ submit: data.message || 'Payment failed' });
            }
        } catch (err) {
            setErrors({ submit: err.message });  // Handle network or unexpected errors
        }
    };
    */

    return (
        <div className="make-payment-wrapper">
            <div className="make-payment-container">
                <h2>Make a Payment</h2>

                {/* Display success or error messages */}
                {success && <div className="success-message">{success}</div>}
                {errors.submit && <div className="error-message">{errors.submit}</div>}

                <form onSubmit={handleSubmit} className="make-payment-form">
                    {/* Amount and Currency Inputs */}
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Amount *</label>
                            <input
                                type="text"
                                name="amount"
                                value={form.amount}
                                onChange={handleChange}
                                placeholder="100.00"
                                className={errors.amount ? 'error' : ''}
                            />
                            {errors.amount && <span className="error-text">{errors.amount}</span>}
                        </div>

                        <div className="form-group">
                            <label>Currency *</label>
                            <select name="currency" value={form.currency} onChange={handleChange}>
                                {['USD', 'EUR', 'GBP', 'AUD', 'JPY', 'CNY', 'CAD'].map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Payment Provider */}
                    <div className="form-group">
                        <label>Provider *</label>
                        <select name="provider" value={form.provider} onChange={handleChange}>
                            <option value="SWIFT">SWIFT</option>
                        </select>
                    </div>

                    {/* Beneficiary Details */}
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Beneficiary Name *</label>
                            <input
                                type="text"
                                name="beneficiary_name"
                                value={form.beneficiary_name}
                                onChange={handleChange}
                                className={errors.beneficiary_name ? 'error' : ''}
                            />
                            {errors.beneficiary_name && <span className="error-text">{errors.beneficiary_name}</span>}
                        </div>

                        <div className="form-group">
                            <label>Account Number *</label>
                            <input
                                type="text"
                                name="beneficiary_account_number"
                                value={form.beneficiary_account_number}
                                onChange={handleChange}
                                className={errors.beneficiary_account_number ? 'error' : ''}
                            />
                            {errors.beneficiary_account_number && <span className="error-text">{errors.beneficiary_account_number}</span>}
                        </div>
                    </div>

                    {/* SWIFT Code */}
                    <div className="form-group">
                        <label>SWIFT Code *</label>
                        <input
                            type="text"
                            name="swift_code"
                            value={form.swift_code}
                            onChange={handleChange}
                            className={errors.swift_code ? 'error' : ''}
                        />
                        {errors.swift_code && <span className="error-text">{errors.swift_code}</span>}
                    </div>

                    {/* Bank Name and Country */}
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Bank Name *</label>
                            <input
                                type="text"
                                name="bank_name"
                                value={form.bank_name}
                                onChange={handleChange}
                                className={errors.bank_name ? 'error' : ''}
                            />
                            {errors.bank_name && <span className="error-text">{errors.bank_name}</span>}
                        </div>

                        <div className="form-group">
                            <label>Bank Country *</label>
                            <input
                                type="text"
                                name="bank_country"
                                value={form.bank_country}
                                onChange={handleChange}
                                className={errors.bank_country ? 'error' : ''}
                            />
                            {errors.bank_country && <span className="error-text">{errors.bank_country}</span>}
                        </div>
                    </div>

                    {/* Optional Bank Address */}
                    <div className="form-group">
                        <label>Bank Address</label>
                        <input
                            type="text"
                            name="bank_address"
                            value={form.bank_address}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Submit Button */}
                    <button type="submit" className="submit-btn">Pay Now</button>
                </form>
            </div>
        </div>
    );
}

/* 
------------------------------------------------------------
References
------------------------------------------------------------
React. 2025. React documentation. Meta Platforms, Inc, n.d. [Online]. Available at: https://react.dev [Accessed 8 October 2025]
React Router. 2025. React Router DOM documentation, n.d. [Online]. Available at: https://reactrouter.com/en/main [Accessed 7 October 2025]
*/
