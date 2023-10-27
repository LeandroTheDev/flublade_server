const localHttp = require('axios');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const commandList = "!!All Command List!!\n" +
  "- help\n" +
  "- account";

const accountList = "!!Account Command List!!\n" +
  "- create (name password)\n" +
  "- remove\n" +
  "- update";

function terminalCommand() {
  rl.question('', (command) => {
    function account() {
      if (command == "account") {
        console.log(accountList)
        terminalCommand();
        return;
      };

      if (command.substring(0, 14) === "account create") {
        //Remove identification command
        command = command.substring(15);
        //Split username and password
        const [ username, password ] = command.split(" ");
        //Create Account
        localHttp.post('http://localhost:8080/createAcc', {
          username: username,
          password: password,
        }).then(response => {
          console.log("Account " + username + " Successfully Created");
        }).catch(error => {
          console.log(`\x1b[31mError: ${error.response.data.message} \x1b[0m`);
        });

        terminalCommand();
        return;
      }

      console.log(command + " invalid parameter");
      terminalCommand();
    }
    function help() { }
    //Simple Commands
    switch (command) {
      //Shutdown Command
      case 'stop': console.log('Server Shutdown.'); process.exit();
      //Help List Command
      case 'help': console.log(commandList); terminalCommand(); return;
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

console.log("Server Fully Started!!!\nType help to view the list of commands");
terminalCommand(); // Inicia o processo de solicitar comandos