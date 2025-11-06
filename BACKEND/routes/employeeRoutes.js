// this is the express router file for handling employee authentication and profile.
const express = require('express');
const router = express.Router();
const {
  loginEmployee,
  getEmployeeProfile,
  logoutEmployee
} = require('../controllers/employeeController');
const { authenticate, isEmployee } = require('../middleware/auth');

//public routes to allow employee to login
//POST /api/employee/login
router.post('/login', loginEmployee);

//these routes below are not public so they require authentication to be used
//GET /api/employee/profile
router.get('/profile', authenticate, isEmployee, getEmployeeProfile);


//POST /api/employee/logout
router.post('/logout', authenticate, isEmployee, logoutEmployee);

module.exports = router;