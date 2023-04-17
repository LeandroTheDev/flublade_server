# Node.js Backend
Server that uses http request

# Creating users
- Guest
> CREATE USER 'flubladeGuest'@'%' IDENTIFIED BY 'yourpassword1';
> GRANT SELECT ON flublade.* TO 'flubladeGuest'@'%';
- Admin
> GRANT ALL PRIVILEGES ON flublade.* TO 'flubladeAdmin'@'%' IDENTIFIED BY 'yourpassword2' WITH GRANT OPTION;


Use different passwords for differents users

# Dependencies
- npm install bcryptjs
- npm install jsonwebtoken
- npm install express
- npm install mariadb
- npm install mysql2
- npm install sequelize