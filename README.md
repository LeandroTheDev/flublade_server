# Node.js Backend

Server that uses http request.

This is a Backend Server, have password encryption, login system, token for security.

The servers will work together with flublade_project but if exists inconsistencies with client and server the server will return invalid login to the client, causing the client to lost connection to the game and returning to authetication page, and the servers will reset token.

# Configuring own server

- You need to download a database like MySQL, mariaDB
- And you need to download node.js and npm for dependencies
- After that you need to create a user for that database, opens you database terminal and create a user with all privileges,
> GRANT ALL PRIVILEGES ON flublade.* TO 'flubladeAdmin'@'%' IDENTIFIED BY 'yourpassword' WITH GRANT OPTION;
> > Obs: if you want to change for only specific ip address, change the "%" for "your.ip.address", this is the ip of server to be able to connect.
- Download the server files, and then edit /models/db.js and changes the ip address located in line 6, and if you are not using mariadb database change for the respective database


![image](https://user-images.githubusercontent.com/106118473/236651857-845ca8e6-0471-44cb-99bb-8c65a84d4fd6.png)



- After that the server needs the dependencies, download the dependencies with "npm install name"
- And then the server is ready
- Write in terminal "node app.js" to start server

![image](https://user-images.githubusercontent.com/106118473/236652006-d19962d9-2f60-46ba-8ae0-5cf136f2664b.png)


- If you want to edit something in the game see the [wiki](https://github.com/LeandroTheDev/flublade_backend/wiki)

# Dependencies
- npm install bcryptjs
- npm install jsonwebtoken
- npm install express
- npm install mariadb
- npm install mysql2
- npm install sequelize
