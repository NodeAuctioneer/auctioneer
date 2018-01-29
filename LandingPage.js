var inquirer = require('inquirer');
var { connection } = require('./connection');

var current_user_id = 0;

function getItemByName(arr, name){
    for(let i=0; i<arr.length; i++){
        if(arr[i].shortName === name) return arr[i];
    }
    return null;
}

function successCallBack() {
    console.log('Yay You are logged in !!');

    bidOnItem(current_user_id);
}

function failureCallback() {
    console.log('Oops Access Denied !!');
    connection.end();
}

function UserManagement(name, password) {
    this.userName = name;
    this.password = password;
    this.id = null;

    this.signInUser = function(success, fail) {
        connection.connect();
 
        connection.query("SELECT id, password FROM users WHERE userName = ? AND password = ?",
            [ this.userName, this.password ], function(error, result) {
            if(error) {
                fail();
                throw error;
            }
            if (result && result.length) {
                this.id = result[0].id;
                current_user_id = result[0].id;
                console.log(this);                
                success();
            } else {
                fail();
            }
        }.bind(this));
        
        // connection.end();
    };

    this.signUpUser = function(success, fail) {
        connection.connect();
 
        connection.query("INSERT INTO users SET ?", {
            userName: this.userName,
            password: this.password
        }, function(error, result) {
            if(error) {
                fail();
                throw error;
            }
            
            if(result.affectedRows) {
                this.id = result.insertId;
                current_user_id = result.insertId;                
                success();
            } else {
                fail();
            }
        }.bind(this));
        
        //connection.end();
    };
}

function LandingPage() {
    this.userManagement = null;
    this.showLandingPage = function() {
        inquirer.prompt([{
            type: 'list',
            name: 'option',
            message: 'What do you want to do?',
            choices: ['Sign In', 'Sign Up']
        }]).then(function(data){
            if (data.option === 'Sign In') {
                inquirer.prompt([{
                    type: 'input',
                    name: 'userName',
                    message: 'Enter User Name: '
                },
                {
                    type: 'password',
                    name: 'password',
                    message: 'Enter Password: '
                }]).then(function(data){
                    if(data.userName && data.password) {
                        this.userManagement = new UserManagement(data.userName, data.password);
                        this.userManagement.signInUser(successCallBack, failureCallback);
                    } else {
                        console.log('User name or Password cannot be empty');
                    }
                }.bind(this));
            } else if (data.option === 'Sign Up') {
                inquirer.prompt([{
                    type: 'input',
                    name: 'userName',
                    message: 'Enter User Name: '
                },
                {
                    type: 'password',
                    name: 'password',
                    message: 'Enter Password: '
                }]).then(function(data){
                    if(data.userName && data.password) {
                        this.userManagement = new UserManagement(data.userName, data.password);                        
                        this.userManagement.signUpUser(successCallBack, failureCallback);
                    } else {
                        console.log('User name or Password cannot be empty');
                    }
                }.bind(this));
            }
        }.bind(this));
    };
}

//============

function getItemByName(arr, name){
    for(let i=0; i<arr.length; i++){
        if(arr[i].shortName === name) return arr[i];
    }
    return null;
}

function bidOnItem(current_user_id){

    let items = [];
    
    // connection.connect(function(err){        
    //     if(err)throw err;
    //     console.log("Connection: OK, id="+connection.threadId);

        let q_str = "SELECT i.id iid, i.itemName, u.userName, b.bid FROM items i "+
            "LEFT JOIN users u ON i.posterUserId=u.id "+
            "LEFT JOIN bids b ON i.highestBidId=b.id";

        connection.query( q_str, function (error, results, fields) {

            if (error) throw error;
            for(let i=0; i<results.length; i++){
                let item_str = results[i].itemName +
                    " (owner: "+results[i].userName+
                    ", current bid: "+results[i].bid+")";
                items.push({
                    name : item_str,
                    id   : results[i].iid,
                    bid  : results[i].bid,
                    shortName : results[i].itemName
                });
            }

            inquirer.prompt([
                { 
                    type: 'list',
                    name: 'item',
                    choices: items,
                    message: "Choose item:"
                },
                { 
                    type: 'input',
                    name: 'bid',
                    message: 'What is your bid?'
                }
            ]).then( function(data){

                let item_choice = (data.item).split(' (');              
                let item_obj = getItemByName(items, item_choice[0]);

                if(data.bid <= item_obj.bid){
                    console.log("Your bid is to low!");
                    connection.end();
                }
                else{
                    console.log("Thanks!");
                    let new_bid_id = 0;                    
                    connection.beginTransaction(function(err) {
                        if (err) throw err;
                        connection.query("INSERT INTO bids SET ?", {
                            itemId : item_obj.id,
                            biddingUserId : current_user_id,
                            bid : data.bid
                        }, function(error2, results2) {
                            if (error2) {
                                return connection.rollback(function() {
                                    throw error2;
                                });
                            }
                            new_bid_id = results2.insertId;
                            //console.log("new_bid_id="+new_bid_id);
                            
                            connection.query("UPDATE items SET ? WHERE ?", [
                                {
                                    //posterUserId : current_user_id,
                                    highestBidId : new_bid_id
                                },
                                {
                                    id : item_obj.id
                                }
                            ], function(error3, results3) {
                                if (error3) {
                                    return connection.rollback(function() {
                                        throw error3;
                                    });
                                }
                                connection.commit(function(err_commit) {
                                    if(err_commit){
                                        return connection.rollback(function() {
                                            throw err_commit;
                                        });
                                    }
                                    console.log("Success!")
                                    console.log("Rows updated in 'items' table: "+results3.affectedRows);
                                    connection.end();
                                });         
                            });
                        });
                    });
                }
            });//end inquirer
        });
    // });  
}

//=======

new LandingPage().showLandingPage();

module.exports = {
    LandingPage
};

