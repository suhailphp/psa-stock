const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const {departmentModel} = require('../models/departmentModel');
const {staffModel} = require('../models/staffModel');
const curPage = 'syncHrDb';
let DBHR = require('../config/dbConnectionHR')


router.get('/', async (req, res) => {
    //add department data to our data base
    let countDep = await departmentModel.findAndCountAll();
    if(countDep && countDep.count > 0){
        console.log('Department DB Not null');
    }
    else{

        try{
            let newDep = await addDepartment();
            console.log(newDep)
        }
        catch (err) {
            console.log(err.message())
        }

    }

    //check the staff db
    let countStaff = await staffModel.findAndCountAll();
    if(countStaff && countStaff.count > 0){
        console.log('Staff DB not null');
    }
    else {
        try{
            let newStaff = await addStaff();
            console.log(newStaff);
        }
        catch (err) {
            console.log(err.message())
        }
    }

    res.send('Sync success');



});


//add department data
function addDepartment() {
    return new Promise(async (resolve, reject)=> {
        depAr = [];
        let department = await getDepDataFromHR();

        department.forEach((dep)=>{
            depAr.push({
                departmentID : dep.Sec_ID,
                name : dep.Sec_Name
            });
        });

        departmentModel.bulkCreate(depAr).then(result => {
            resolve(result)
        }).catch(err=>{
            reject(err)
        });

    })
}
//add staff data


function addStaff() {
    return new Promise(async (resolve, reject)=> {
        staffAr = [];
        let staff = await getEmpDataFromHR();

        staff.forEach((st)=>{
            staffAr.push({
                militaryNo : st.MilitaryNo,
                name : st.Emp_Name,
                rank : st.Grade_Ar,
                departmentID : st.Section
            });
        });

        staffModel.bulkCreate(staffAr).then(result => {
            resolve(result)
        }).catch(err=>{
            reject(err)
        });

    })
}

//getting department data
function getDepDataFromHR() {
    return new Promise((resolve, reject)=> {

        DBHR.query(`
        
        SELECT [Sec_ID]
          ,[Sec_Name]
          ,[Department_ID]
          ,[Notes]
          ,[Data_Del_Flag]
          ,[User_Add]
          ,[Add_Date]
          ,[User_Update]
          ,[Update_Date]
      FROM [PSAHR].[dbo].[Tbl_Section]
        

  
        `).then(function (response) {
            //console.log(response)
            if (response[0].length != 0)
                return resolve(response[0])

            reject(new Error('404'));
        }).error(function (err) {
            reject(err)
        });
    })
}
//getting staff data
function getEmpDataFromHR() {
    return new Promise((resolve, reject)=> {

        DBHR.query(`
        
SELECT        dbo.EMP.Employee_ID, dbo.EMP.Emp_Id, dbo.EMP.MilitaryNo, dbo.EMP.Role_ID, dbo.EMP.Branch_ID, dbo.EMP.Department_ID, dbo.EMP.Section, dbo.EMP.Unit_ID, dbo.EMP.Emp_Name, dbo.EMP.Gender_Id, dbo.EMP.Emp_EName, 
                         dbo.EMP.Grade_ID, dbo.Tbl_M_Grade.Grade_Ar, dbo.Tbl_M_Job.Job_Ar, dbo.EMP.Job_ID, dbo.EMP.Nationality_ID, dbo.EMP.Emp_Mobile, dbo.EMP.Emp_Email, dbo.EMP.BirthDate, dbo.EMP.BirthPlace, dbo.EMP.Direct_Tel_Number, dbo.EMP.Ext_Number, 
                         dbo.EMP.Mobile_Number1, dbo.EMP.Fax_Number, dbo.EMP.Blood_Type, dbo.EMP.Religion_ID, dbo.EMP.Height, dbo.EMP.SplMarks, dbo.EMP.NationalID, dbo.EMP.FamilyNo, dbo.EMP.PassportPrintSer, dbo.EMP.PassportNo, 
                         dbo.EMP.ResidenceNo, dbo.EMP.ResidenceEndDate, dbo.EMP.Emp_Hire_Date, dbo.EMP.RegisterPlace, dbo.EMP.SubstitueWorkYear, dbo.EMP.DailyOrder, dbo.EMP.Mgr_ID, dbo.EMP.IsManager, dbo.EMP.Notes, 
                         dbo.EMP.Emp_Workend_Date, dbo.EMP.Emp_Status, dbo.EMP.Data_Del_Flag, dbo.EMP.User_Add, dbo.EMP.Add_Date, dbo.EMP.User_Update, dbo.EMP.Update_Date, dbo.EMP.workplace_id, dbo.EMP.MStatus_ID, 
                         dbo.EMP.UnifiedCode, dbo.Tbl_Branch.Branch_Name, dbo.Tbl_M_Department.Department_Ar, dbo.Tbl_Section.Sec_Name, dbo.Tbl_Unit.Unit_Name
FROM            dbo.Tbl_M_Department RIGHT OUTER JOIN
                         dbo.Tbl_Section RIGHT OUTER JOIN
                         dbo.EMP ON dbo.Tbl_Section.Sec_ID = dbo.EMP.Section LEFT OUTER JOIN
                         dbo.Tbl_Unit ON dbo.EMP.Unit_ID = dbo.Tbl_Unit.Unit_ID ON dbo.Tbl_M_Department.Department_ID = dbo.EMP.Department_ID LEFT OUTER JOIN
                         dbo.Tbl_Branch ON dbo.EMP.Branch_ID = dbo.Tbl_Branch.Branch_ID LEFT OUTER JOIN
						 dbo.Tbl_M_Grade ON  dbo.Tbl_M_Grade.Grade_ID = dbo.EMP.Grade_ID LEFT OUTER JOIN
						 dbo.Tbl_M_Job ON dbo.Tbl_M_Job.Job_ID = dbo.EMP.Job_ID
WHERE        (dbo.EMP.Emp_Status = 1 and dbo.EMP.Data_Del_Flag = 1) 
  
        `).then(function (response) {
            //console.log(response)
            if (response[0].length != 0)
                return resolve(response[0])

            reject(new Error('404'));
        }).error(function (err) {
            reject(err)
        });
    })
}


module.exports = router;