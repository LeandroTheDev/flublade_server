# Flublade Server

Flublade server for the flublade game, this project is a full featured http and websockets server to work together with flublade.

The servers provides a simple DDOS Protection for the http server, simple block the ip and subsequent ips trying to down the server, also
the server have a ddos protection for multiple handshake for websockets connections

Everthing in the server is configurable, you can change this in config-server.txt, if not exist launch the server for the first time.

Is very important to change the configurations for the type of the server you want.

# Configuring own server

- You need to download a database like MySQL, mariaDB
- And you need to download node.js and npm for dependencies
- After that you need to create a user for that database, opens you database terminal and create a user with all privileges,
> GRANT ALL PRIVILEGES ON flublade.* TO 'flubladeAdmin'@'%' IDENTIFIED BY 'yourpassword' WITH GRANT OPTION;
> > Obs: if you want to change for only specific ip address, change the "%" for "your.ip.address", this is the ip of server to be able to connect.
- Change the user and password of database in config-server.txt
- You can download a database template for the server to provide a simple world for the game: [template](https://github.com/LeandroTheDev/flublade_backend/not_implemented) (not implemented yet)

- After that the server needs the dependencies, download the [dependencies](https://github.com/LeandroTheDev/flublade_backend/tree/main#dependencies) with "npm install name"
- And then the server is ready
- Write in terminal "node initialize.js" to start server

![image](https://user-images.githubusercontent.com/106118473/236652006-d19962d9-2f60-46ba-8ae0-5cf136f2664b.png)


- More informations see the [wiki](https://github.com/LeandroTheDev/flublade_backend/wiki)

# Dependencies
- npm install bcryptjs
- npm install jsonwebtoken
- npm install express
- npm install mariadb/mysql2
- npm install sequelize
- npm install ws
- npm install axios
