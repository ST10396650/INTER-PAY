const Employee = require('../models/Employee');
const { comparePassword } = require('../utils/encryption'); //checks if the entered password matches.
const { generateToken } = require('../utils/jwt'); // creates token for authentication
const { handleLoginAttempt } = require('../middleware/auth'); //keeps track of failed login attempts



//POST /api/employee/login
// function to login the employee
const loginEmployee = async (req, res) => {
  try {
    const { username, password } = req.body; //gets the username and password

    //makes sure there arent any empty fields inputs
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password'
      });
    }

    // finding the employee by id or username
    const employee = await Employee.findOne({
      $or: [
        { username: username.toLowerCase() },
        { employee_id: username.toUpperCase() }
      ]
    })
      .select('+password_hash')
      .populate('role_id', 'role_name permissions');

    if (!employee) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // checks if the employee account active
    if (!employee.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.'
      });
    }

    // checks if account is locked and displays a message if it is
    if (employee.is_locked && employee.locked_until) {
      const now = new Date();
      if (now < employee.locked_until) {
        const remainingTime = Math.ceil((employee.locked_until - now) / 60000);
        return res.status(403).json({
          success: false,
          message: `Account is locked. Try again in ${remainingTime} minutes.`
        });
      }
    }

    // verifying and comparing the password
    const isPasswordValid = await comparePassword(password, employee.password_hash);
    
    if (!isPasswordValid) {
      
      await handleLoginAttempt(employee, false);
      
      const remainingAttempts = 5 - employee.failed_login_attempts;
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        remaining_attempts: remainingAttempts > 0 ? remainingAttempts : 0
      });
    }

    // if login was successful we reset failed attempts to 0
    await handleLoginAttempt(employee, true);

    // Step 7: Generate JWT token
    const token = generateToken({
      id: employee._id,
      username: employee.username,
      employee_id: employee.employee_id,
      role: employee.role_id.role_name,
      userType: 'employee',
      department: employee.department,
      permissions: employee.role_id.permissions
    });

    // after that we get the JWT token
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      data: {
        employee_id: employee._id,
        employee_name: employee.employee_name,
        username: employee.username,
        emp_id: employee.employee_id,
        role: employee.role_id.role_name,
        department: employee.department,
        permissions: employee.role_id.permissions,
        last_login: employee.last_login
      }
    });

  } catch (error) {
    console.error('Employee login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error logging in',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};



//GET /api/employee/profile
//show the employee their personal infor, without reveal sensitive info
const getEmployeeProfile = async (req, res) => {
  try {
    const employee = await Employee.findById(req.user.id) //finds the employee by using req.user.id in the auth.js).
      .populate('role_id', 'role_name permissions');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    //returns the employee information
    res.status(200).json({
      success: true,
      data: {
        employee_id: employee._id,
        employee_name: employee.employee_name,
        username: employee.username,
        emp_id: employee.employee_id,
        role: employee.role_id.role_name,
        permissions: employee.role_id.permissions,
        is_active: employee.is_active,
        last_login: employee.last_login,
        created_at: employee.createdAt
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
};



//POST /api/employee/logout
//logout is handled in the frontend by deleting the token so this function only return suceess/failure messages
const logoutEmployee = async (req, res) => {
  try {
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error logging out'
    });
  }
};

module.exports = {
  loginEmployee,
  getEmployeeProfile,
  logoutEmployee
}; //making the functions available