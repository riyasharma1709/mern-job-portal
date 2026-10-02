import mongoose from 'mongoose';

// Connect to a DIFFERENT database specifically for employees
const employeeConnection = mongoose.createConnection(
    process.env.EMPLOYEE_MONGO_URI || 'mongodb://localhost:27017/employeedb'
);

// employeeConnection.on('connected', () => {
//     console.log(`Employee MongoDB Connected: employeedb`);
// }); first
// employeeConnection.on('connected', () => {
//     console.log(`Employee MongoDB Connected: ${employeeConnection.name}`);
// });second
employeeConnection.on('connected', () => {
    console.log("Employee MongoDB Connected");
    console.log("Employee DB name:", employeeConnection.name);
    console.log("Employee DB host:", employeeConnection.host);
});
employeeConnection.on('error', (error) => {
    console.error(`Employee DB Error: ${error.message}`);
});

export default employeeConnection;
