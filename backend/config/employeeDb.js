import mongoose from 'mongoose';

// Connect to a DIFFERENT database specifically for employees
const employeeConnection = mongoose.createConnection(
    process.env.EMPLOYEE_MONGO_URI || 'mongodb://localhost:27017/employeedb'
);

employeeConnection.on('connected', () => {
    console.log(`Employee MongoDB Connected: employeedb`);
});

employeeConnection.on('error', (error) => {
    console.error(`Employee DB Error: ${error.message}`);
});

export default employeeConnection;
