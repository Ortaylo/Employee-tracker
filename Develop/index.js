const inquirer = require('inquirer');
const fs = require('fs');
const mysql = require('mysql2');
const cTable = require('console.table');
const { addAbortSignal } = require('stream');
const some = `SELECT * FROM employee;`
var choices;
const db = mysql.createConnection(
    {
    host: '127.0.0.1',
    user: 'root',
    password: 'np2-vJhT@3$%',
    database: 'inventory_db'
}, 
console.log('Success'),
);
const starterSql =[ 'CREATE TABLE departments('+
'    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,'+
    'department_name VARCHAR(30) NOT NULL);',
    
'CREATE TABLE roles('+
    'id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,'+
    'role_title VARCHAR(30) NOT NULL,'+
    'department_id VARCHAR(30) NOT NULL,'+
    'salary INTEGER);'
,
'CREATE TABLE employees ('+
    'id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,'+
    'first_name VARCHAR(30) NOT NULL,'+
    'last_name VARCHAR(30) NOT NULL,'+
    'job_title VARCHAR(30) NOT NULL,'+
    'department_id VARCHAR(30) NOT NULL,'+
    'salary INTEGER,'+
    'manager VARCHAR(30));'
]
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
        'update an employee role',
        'prompt']
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
        type: 'input',
        name: 'first_name',
        message: 'What is the employees name?'
    }
}
var test;
const Query = (query,param) => {

   db.query(query, null, (err,result) => {
        if (err) {
            return;
        } else if (param == 'return') {
            departments = result;
        } else {
            console.table(result)
            console.info('INFO',result[0].Tables_in_inventory_db)
        }
    });
    return test;

}
// Query('SELECT * FROM departments','return');

const selectTable = (table,selector,param) => {
    
    db.query(`SELECT ${selector} FROM ${table}`, null, (err,result) => {
        if (err) {
            console.error(err);
            start();
        }else if (param == 'return') {
            choices = result;
        } else if (result[0] != undefined) {
            
            console.table(result);
            start();
        } else {
            console.log(`No ${table} have been selected`);
            start();
        }
        
        
    });
};

const inputValue = (table,column,value) => {
    db.query(`INSERT INTO ${table} (${column}) VALUES (${value});`, null, (err,result) => {
        if (err) {
            console.error(err);
        }  else {
            console.table(result);
            console.info('INFO',result);
        }
        start();
    });
};

    

 async function addRole(data){

    
    
    let obj = {
        role_title: data.role_title
    }
    for (var i = 0;i<choices.length;i++) {
        questions.addRole.department.choices.push(choices[i].department_name)
        console.log(questions.addRole.department.choices)
    }


   await inquirer.prompt(questions.addRole.salary)
   .then((data) => obj.salary = data.salary );

   await inquirer.prompt(questions.addRole.department)
   .then((data) => obj.department = data.department_name );

   console.info(obj);
   console.info(obj.role_title);
   console.info(obj.salary);
   console.info(obj.department);
   console.info(choices)
   console.info(choices.find(o => o.department_name === obj.department).id)
   inputValue('roles','role_title,department_id,salary',`"${obj.role_title}","${obj.department}",${obj.salary}`);
 };
    
    
    
    



    
    
 
const start = () => {
    inquirer.prompt(questions.start).then( (data) => {

        if (data.start == 'add department') {
            inquirer.prompt(questions.addDepartment)
            .then((data) => inputValue('departments',Object.keys(data)[0],`"${data.department_name}"`));
    
        } else if (data.start == 'add a role') {
            selectTable('departments','*','return')
            inquirer.prompt(questions.addRole.name)
            .then((data) => addRole(data));
    
    
        } else if (data.start == 'add an employee') {
            inquirer.prompt(questions.addDepartment)
            .then((data) => inputValue('employees',Object.keys(data)[0],`"${data.department_name}"`));
    
        } else if (data.start == 'view all departments'){
            selectTable('departments','*');
        }else if (data.start == 'view all roles'){
            selectTable('roles','*');
        }else if (data.start == 'view all employees'){
            selectTable('employees','*');
        } else if (data.start == 'prompt'){
            prompt();
        } else {
            console.log('error')
            console.table(data)
        }
    });
}

const prompt = () => {
    inquirer.prompt(questions.sqlInput).then( (data) => {
        db.query(data.query, null, (err,result) => {
            if (err) {
                console.error(err);
            } else {
                console.table(result)
                prompt();
            }
            
        });
    
    });
}

Query(starterSql[0]);
Query(starterSql[1]);
Query(starterSql[2]);

 // console.info('TABLES')
// questions.start.choices.push('11111111111111111111');

 
start();  
// prompt();
