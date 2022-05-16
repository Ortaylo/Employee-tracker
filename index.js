// requiring package variables
const inquirer = require('inquirer');
const fs = require('fs');
const mysql = require('mysql2');
const cTable = require('console.table');
var departments;
var roles;
var employees;
const db = mysql.createConnection(
    {
    host: '127.0.0.1',
    user: 'root',
    password: 'np2-vJhT@3$%',
    database: 'inventory_db'
}, 
console.log('Successfully connected to Database')
);
// Questions object
var questions = {
    start: {
        type: 'list',
        name: 'start',
        message: 'What would you like to do',
        choices: ['add department',
        'add a role',
        'add an employee',
        'view all departments',
        'view all roles',
        'view all employees',
        'update employee role'
        ]
    },
    sqlInput: {
        type: 'input',
        name: 'query',
        message: 'SQL:'
    },
    addDepartment:{
        type: 'input',
        name: 'department_name',
        message: 'What is the departments name?'
    },addRole:{ 
        name: {
        type: 'input',
        name: 'role_title',
        message: 'What is the roles name?'
        },
        salary: {
        type: 'input',
        name: 'salary',
        message: 'What is the roles salary?'
        },
        department: {
        type: 'list',
        name: 'department_name',
        message: 'Which department does this role belong to?',
        choices: []
        }
    },addEmployee:{
        first_name: {
            type: 'input',
            name: 'first_name',
            message: 'What is the employees first name?'
        },
        last_name: {
            type: 'input',
            name: 'last_name',
            message: 'What is the employees last name?'
        },
        role: {
            type: 'list',
            name: 'role_title',
            message: 'Which role is this employee assigned to?',
            choices: []
        },
        manager: {
            type: 'list',
            name: 'manager_id',
            message: 'Which Manager is this employee assigned to?',
            choices: ['No Manager']
        },
    },
    updateRole: {
        type: 'list',
            name: 'employee',
            message: 'Which employees role will you change?',
            choices: []
    }
}
// Update employee role
const updateRole = () => {
    inquirer.prompt(questions.updateRole).then ( (data) => {
        var first_name = data.employee.split(' ')[0];
        var last_name = data.employee.split(' ')[1];
        inquirer.prompt(questions.addEmployee.role).then((data) => {
            db.query(`UPDATE employees SET role_id = ${roles.find(o => o.role_title == data.role_title).id} WHERE id = ${employees.find(o => o.last_name == last_name).id}` )
            roles.find(o => o.role_title == data.role_title).id
            
            start();
        });
    }
    );
};
// View roles table
const viewRoles = () => {
    var obj = [];
            for(var i = 0; i< roles.length; i++) {
                var department;
                try {
                    department = departments.find(o => o.id === roles[i].department_id).department_name;
                } catch {
                    department = null;
                }
                obj.push(
                {
                   'Role ID': roles[i].id,
                    'Job Title':roles[i].role_title,
                    Salary:roles[i].salary,
                    Department:department

                }
                );
            };
            console.table(obj);
            start();
    
};
//view employees table
const viewEmployees = ()=> {
    var obj = [];
    for(var i = 0; i< employees.length; i++) {
         var manager;
         var salary;
         var role;
         var department;
        try {
           manager = employees.find(o => o.id === employees[i].manager_id);
           manager = manager.first_name + ' ' + manager.last_name;
        } catch {
            manager = null;
        }
        try {
            role = roles.find(o => o.id === employees[i].role_id);
        } catch {
            role = null;
        }
        try {
            department = departments.find(o => o.id === role.department_id).department_name;
        } catch {
            department = null;
        }
        
        obj.push(
        {
           'Employee ID': employees[i].id,
            'First Name': employees[i].first_name,
            'Last Name': employees[i].last_name,
            'Role': role.role_title,
            'Salary': role.salary,
            'Department': department,
            'Manager':manager
        }
        );
    };
    console.table(obj);
    start();
};
// general input values function
const inputValue = (table,column,value) => {
    db.query(`INSERT INTO ${table} (${column}) VALUES (${value});`, null, (err,result) => {
        if (err) {
            console.error(err);
        }
        start();
    });
};
// function to add a row to roles table
 async function addRole(data){
    let obj = {
        role_title: data.role_title
    }
   await inquirer.prompt(questions.addRole.salary)
   .then((data) => { obj.salary = data.salary});
   await inquirer.prompt(questions.addRole.department)
   .then((data) => obj.department = data.department_name );
   obj.department = departments.find(o => o.department_name == obj.department).id
   
   try {
    inputValue('roles','role_title,department_id,salary',`"${obj.role_title}","${obj.department}",${obj.salary}`);
    questions.addEmployee.role.choices.push(obj.role_title);
   } catch (error){
    console.err(error);
   }
};
    // function to add row to employees table
 async function addEmployee(data){
    let obj = {
        first_name: data.first_name
    }
   await inquirer.prompt(questions.addEmployee.last_name)
   .then((data) => obj.last_name = data.last_name );

   await inquirer.prompt(questions.addEmployee.role)
   .then((data) => {
     obj.role_id =  roles.find(o => o.role_title === data.role_title).id
    });

    await inquirer.prompt(questions.addEmployee.manager)
    .then((data) => {
        if (data.manager_id == 'No Manager') {
            obj.manager_id = null;
        } else {
            var first_name = data.manager_id.split(' ')[0];
            var last_name = data.manager_id.split(' ')[1];
            obj.manager_id = employees.find(o => o.last_name === last_name).id;
        }
    });
    questions.addEmployee.manager.choices.push(obj.first_name + ' ' + obj.last_name);
    questions.updateRole.choices.push(obj.first_name + ' ' + obj.last_name);
    choicePush();
  inputValue('employees','first_name,last_name,role_id,manager_id',`"${obj.first_name}","${obj.last_name}",${obj.role_id},${obj.manager_id}`);
};
 // function containing starting prompts
const start = () => {
    choicePush();
    inquirer.prompt(questions.start).then( (data) => {
        if (data.start == 'add department') {
            inquirer.prompt(questions.addDepartment)
            .then((data) => {
                questions.addRole.department.choices.push(data.department_name);
                inputValue('departments',Object.keys(data)[0],`"${data.department_name}"`);
            })
        } else if (data.start == 'add a role') {
            inquirer.prompt(questions.addRole.name)
            .then((data) => addRole(data));
        } else if (data.start == 'add an employee') {
            inquirer.prompt(questions.addEmployee.first_name)
            .then((data) => {
                addEmployee(data);
            })
        } else if (data.start == 'view all departments'){
            console.table(departments);
            start();
        }else if (data.start == 'view all roles'){
            viewRoles();
        }else if (data.start == 'view all employees'){
            viewEmployees();
        } else if (data.start == 'update employee role') {
            updateRole();
        } else {
            console.err('error')
            console.table(data)
        }
    });
};
// function to push table information to questions object choices/ update general variables
const choicePush = (param) => {
    db.query('SELECT * FROM departments',null, (err,results) => {
        if (err) {
            console.error(err);
        } else {
            departments = results
            if (param == 'return') {
            for (var i = 0;i<departments.length;i++) {
                questions.addRole.department.choices.push(departments[i].department_name)
            };
        };
        };
    })
    db.query('SELECT * FROM roles',null, (err,results) => {
        if (err) {
            console.error(err);
        } else {
            roles = results;
            if (param == 'return') {
                for (var i = 0;i<roles.length;i++) {
                    questions.addEmployee.role.choices.push(roles[i].role_title)
                }
            }
        }
    })
    db.query('SELECT * FROM employees',null, (err,results) => {
        if (err) {
            console.error(err);
        } else {
            employees =results;    
            if (param == 'return') {
                for (var i = 0;i<employees.length;i++) {
                    questions.addEmployee.manager.choices.push(employees[i].first_name + ' ' + employees[i].last_name);
                    questions.updateRole.choices.push(employees[i].first_name + ' ' + employees[i].last_name);
                };
            };
        };
    });
};


choicePush('return');
start();  