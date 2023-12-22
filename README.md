# Flublade Server

Flublade is a MMORPG Sandbox, this project is a full featured http and websockets server to work together with flublade.

Basic features:
- Password encryption.
- Login system.
- Token Validation.
- Real time players moviment.
- Real time enemy moviment.
- Battles

The servers will work together with flublade but if exists inconsistencies with the client and server the client will lost connection, causing the client returning to authetication page, and then servers will reset their token.

DDOS Protection, the server have a simple http ddos protection, simple block the ip and subsequent ips trying to down the server.

Anti cheat, in most cases the server process all datas to prevent user data manipulation, the server have some verification to prevent user to manipulate important mechanics in the game, like colission, not too complex to destroy server performance.

# Configuring own server

- You need to download a database like MySQL, mariaDB
- And you need to download node.js and npm for dependencies
- After that you need to create a user for that database, opens you database terminal and create a user with all privileges,
> GRANT ALL PRIVILEGES ON flublade.* TO 'flubladeAdmin'@'%' IDENTIFIED BY 'yourpassword' WITH GRANT OPTION;
> > Obs: if you want to change for only specific ip address, change the "%" for "your.ip.address", this is the ip of server to be able to connect.
- Download the server files, and then edit db.js and changes the ip address located in line 6, and if you are not using mariadb database change for the respective database


![image](https://user-images.githubusercontent.com/106118473/236651857-845ca8e6-0471-44cb-99bb-8c65a84d4fd6.png)


- Also change the gameplay/config.js to configure the server the way you prefer
- After that the server needs the dependencies, download the [dependencies](https://github.com/LeandroTheDev/flublade_backend/tree/main#dependencies) with "npm install name"
- And then the server is ready
- Write in terminal "node initialize.js" to start server

![image](https://user-images.githubusercontent.com/106118473/236652006-d19962d9-2f60-46ba-8ae0-5cf136f2664b.png)


- If you want to edit something in the game see the [wiki](https://github.com/LeandroTheDev/flublade_backend/wiki)

# Dependencies
- npm install bcryptjs
- npm install jsonwebtoken
- npm install express
- npm install mariadb/mysql2
- npm install sequelize
- npm install ws
- npm install axios
