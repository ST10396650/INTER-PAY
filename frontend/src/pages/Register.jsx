import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import React from 'react'
import { Helmet } from 'react-helmet-async'
import RegistrationForm from '../components/Forms/RegistrationForm'

const Register = () => {
    return (
        <>
            <Helmet>
                <title>Register - International Payments Portal</title>
                <meta name="description" content="Create a new customer account for international payments" />
            </Helmet>
            <RegistrationForm />
        </>
    )
}

export default Register