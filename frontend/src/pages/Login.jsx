import React from 'react'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import LoginForm from '../components/Forms/LoginForm'

const Login = () => {
    return (
        <>
            <Helmet>
                <title>Login - International Payments Portal</title>
                <meta name="description" content="Login to your international payments account" />
            </Helmet>
            <LoginForm />
        </>
    )
}

export default Login