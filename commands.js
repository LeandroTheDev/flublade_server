const localHttp = require('axios');
const readline = require('readline');
const bcrypt = require('bcryptjs');
const { accountsDatabase } = require('./start-server');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const commandList = '\x1b[35mAll Command List\x1b[0m\n' +
  "- help\n" +
  "- account";

const accountList = '\x1b[35mAccount Command List\x1b[0m\n' +
  "- create (name password) #create a new account\n" +
  "- list #show a list of all accounts\n" +
  "- remove (name) #remove account, this is irreversible\n" +
  "- update (name password) #change account password"; +
    "- characters (name) #show all characters of specific account"

function terminalCommand() {
  rl.question('', (command) => {
    function account() {
      //Help
      if (command == "account") {
        console.log(accountList)
        terminalCommand();
        return;
      };
      //Incorrect Create Parameters
      if (command == "account create" || command == "account create ") {
        console.log("\x1b[33mIncorrect parameters\x1b[0m");
        console.log("\x1b[33mExample: account create test 123\x1b[0m")
        terminalCommand();
        return;
      }
      //Incorrect Remove Parameters
      if (command == "account remove" || command == "account remove ") {
        console.log("\x1b[33mIncorrect parameters\x1b[0m");
        console.log("\x1b[33mExample: account remove test\x1b[0m")
        terminalCommand();
        return;
      }
      //Incorrect Update Parameters
      if (command == "account update" || command == "account update ") {
        console.log("\x1b[33mIncorrect parameters\x1b[0m");
        console.log("\x1b[33mExample: account update test 123\x1b[0m")
        terminalCommand();
        return;
      }
      //Incorrect Characters Parameters
      if (command == "account characters" || command == "account characters ") {
        console.log("\x1b[33mIncorrect parameters\x1b[0m");
        console.log("\x1b[33mExample: account characters test\x1b[0m")
        terminalCommand();
        return;
      }
      //Create
      if (command.substring(0, 14) === "account create") {
        //Remove identification command
        command = command.substring(15);
        //Split username and password
        const [username, password] = command.split(" ");
        //Create Account
        localHttp.post('http://localhost:8080/createAcc', {
          username: username,
          password: password,
        }).then(response => {
          console.log("Command Success");
        }).catch(error => {
          console.log(`\x1b[31mError creating account: ${error.response.data.message} \x1b[0m`);
        });

        terminalCommand();
        return;
      }
      //Remove
      if (command.substring(0, 14) === "account remove") {
        command = command.substring(15);
        accountsDatabase.destroy({
          where: {
            username: command
          }
        }).then(result => {
          if (result == 1) {
            console.log("Command Success");
          } else {
            console.log("User not found");
          }
        }).catch(result => {
          console.log(`\x1b[31mError removing account: ${error.response.data.message} \x1b[0m`);
        });
        terminalCommand();
        return;
      }
      //List
      if (command.substring(0, 12) === "account list") {
        //Find all usernames in database
        accountsDatabase.findAll({ attributes: ['username'] }).then(users => {
          //Check if exist any accounts in database
          if (users.length == 0) {
            console.log("0 Accounts Created");
          }

          for (let i = 0; i < users.length; i++) {
            console.log(users[i].dataValues.username);
          }
        });
        terminalCommand();
        return
      }
      //Update
      if (command.substring(0, 14) === "account update") {
        command = command.substring(15);
        const [username, password] = command.split(" ");
        //Encrypte password
        bcrypt.hash(password, 8).then(encryptedPassword => {
          //Update in database
          accountsDatabase.update({ password: encryptedPassword }, { where: { username: username } }).then(result => {
            if (result == 1) {
              console.log("Command Success");
            } else {
              console.log("User not found");
            }
          }).catch(result => {
            console.log(`\x1b[31mError removing account: ${error.response.data.message} \x1b[0m`);
          });
        });
        terminalCommand();
        return;
      }
      //Characters
      if (command.substring(0, 18) === "account characters") {
        command = command.substring(19);
        //Find all characters of username
        accountsDatabase.findAll({
          attributes: ['characters'],
          where: {
            username: command
          }
        }).then(characters => {
          //No account Found
          if (characters.length == 0) {
            console.log("No Account found with name " + command);
            return;
          }
          let userCharacters = JSON.parse(characters[0].dataValues.characters);
          let charactersNames = "";
          //Add Characters to the List
          for(let i = 0; i < Object.keys(userCharacters).length; i++) {
            let character = userCharacters['character' + i];
            charactersNames += "Name: " + character.name + ", Level: " + character.level;
            if(i != Object.keys(userCharacters).length - 1) {
              charactersNames += "\n";
            }
          }
          if(charactersNames == "") console.log("0 Characters Created in this Account");
          else console.log(charactersNames);
        });
        terminalCommand();
        return
      }

      console.log("\x1b[33mIncorrect parameters\x1b[0m");
      terminalCommand();
    }
    function clear() {
      if (process.platform === 'win32') {
        // For Windows
        const { exec } = require('child_process');
        exec('cls');
      } else {
        // For Linux/MacOS
        console.clear();
      }
    }
    function DDOSTest() {
      for (let i = 0; i < 100; i++) {
        //Create Account
        localHttp.post('http://localhost:8080/ddostest', {}).then(response => {
        }).catch(error => {
          console.log('\x1b[32mDDOS Success Blocked\x1b[0m');
        });
      }
    }
    //Simple Commands
    switch (command) {
      //Shutdown
      case 'stop': console.log('Server Shutdown.'); process.exit();
      //Help List
      case 'help': console.log(commandList); terminalCommand(); return;
      //Clear Console
      case 'clear': clear(); terminalCommand(); return;
      //DDOS Test
      case 'ddos': DDOSTest(); terminalCommand(); return;
    }
    //Complex Commands
    if (true) {
      //Account command
      if (command.substring(0, 7) === "account") {
        account();
        terminalCommand();
        return;
      }
    }
    console.log(command + " is not a command");
    terminalCommand();
  });
}

console.log('\x1b[32mServer Fully Started!!!\x1b[0m');
console.log("Type help to view the list of commands");
terminalCommand(); // Inicia o processo de solicitar comandos