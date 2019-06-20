const dateformat = require('dateformat');
module.exports = {

    compare: function (lvalue, operator, rvalue, options) {

        var operators, result;

        if (arguments.length < 3) {
            throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
        }

        if (options === undefined) {
            options = rvalue;
            rvalue = operator;
            operator = "===";
        }

        operators = {
            '==': function (l, r) {
                return l == r;
            },
            '===': function (l, r) {
                return l === r;
            },
            '!=': function (l, r) {
                return l != r;
            },
            '!==': function (l, r) {
                return l !== r;
            },
            '<': function (l, r) {
                return l < r;
            },
            '>': function (l, r) {
                return l > r;
            },
            '<=': function (l, r) {
                return l <= r;
            },
            '>=': function (l, r) {
                return l >= r;
            },
            'typeof': function (l, r) {
                return typeof l == r;
            },
            '%':function(l,r){
                return ((l != 0) && (l%r==0))?true:false;
            }

        };

        if (!operators[operator]) {
            throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);
        }

        result = operators[operator](lvalue, rvalue);

        if (result) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }

    },
    checkRowTen:function(number,  options){
        if((number != 0 )&&(number % 10 == 0)){
            return options.fn(this);
        }
        else{
            return options.inverse(this);
        }
    },

    checkRowEight:function(number,  options){
        if((number != 0 )&&(number % 7 == 0)){
            return options.fn(this);
        }
        else{
            return options.inverse(this);
        }
    },

    checkRowSix:function(number,  options){
        if((number != 0 )&&(number % 6 == 0)){
            return options.fn(this);
        }
        else{
            return options.inverse(this);
        }
    },

    checkPageNumber:function(number){
        number = number+1;
        return Math.ceil(number/7);
    },

    checkPageNumberIssue:function(number){
        number = number+1;
        return Math.ceil(number/6);
    },

    dateToStringTime: function (date) {
        return date.toLocaleTimeString();
    },
    dateToStringDate: function (date) {

        if (!date || typeof date != 'object')
            return null;
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();

        var month_ar;
        switch (month) {
            case 1:
                month_ar = "Jan";
                break;
            case 2:
                month_ar = "Feb";
                break;
            case 3:
                month_ar = "Mar";
                break;
            case 4:
                month_ar = "Apr";
                break;
            case 5:
                month_ar = "May";
                break;
            case 6:
                month_ar = "Jun";
                break;
            case 7:
                month_ar = "Jul";
                break;
            case 8:
                month_ar = "Aug";
                break;
            case 9:
                month_ar = "Sep";
                break;
            case 10:
                month_ar = "Oct";
                break;
            case 11:
                month_ar = "Nov";
                break;
            case 12:
                month_ar = "Dec";
                break;
            default:
                month_ar = "";
                break;

        }
        var date_ar = month_ar + " " + day + ", " + year;
        return date_ar;

    },
    dateNormal: function (date) {
        date = dateformat(date,"dd/mm/yyyy");
        return date;
    },
    dateToChrome: function (date) {
        date = dateformat(date,"yyyy-mm-dd");
        return date;
    },
    dateToDMY: function (date) {
        date = dateformat(date,"dd-mm-yyyy");
        return date;
    },

    currencyFormat: function(amount){
        return (amount.toFixed(2))
    },
    countOne:function(number){
        return(parseInt(number)+1)
    },


    arabicLetter: function(no){
        switch (no) {
            case 0: return('صفر');
            case 1: return('وا حد');
            case 2: return('إثنان');
            case 3: return('ثلاثة');
            case 4: return('أربعة');
            case 5: return('خمسة');
            case 6: return('ستّة');
            case 7: return('سبعة');
            case 8: return('ثامنية');
            case 9: return('تعسة');
            case 10: return('عشرة');
            case 11: return('أحد عشر');
            case 12: return('اثنا عشر');
            case 13: return('ثلاثة عشر');
            case 14: return('أربعة عشر');
            case 15: return('خمسة عشر');
            case 16: return('ستة عشر');
            case 17: return('سبعة عشر');
            case 18: return('ثمانية عشر');
            case 19: return('تسعة عشر');
            case 20: return('عشرون');
            case 21: return('واحد وعشرون');
            case 22: return('اثنان وعشرون');
            default: return(no);

        }
    },
    numberFourDigit: function(no){
        if(no <= 999){
            let s = "000" + no;
            return s.substr(s.length-4);
        }
        else{
            return no;
        }

    },
    userRoleCheck: function(page,userRole,options){
        let storeUser = ['nonStock','unit','supplier','message'];
        let financeUser = ['message'];
        if(userRole == 'StoreUser'){
            if(storeUser.includes(page)){
                return options.fn(this);
            }
            else{
                return options.inverse(this);
            }
        }
        else if(userRole == 'Finance'){
            if(financeUser.includes(page)){
                return options.fn(this);
            }
            else{
                return options.inverse(this);
            }
        }
        else{
            return options.fn(this);
        }
    }


}