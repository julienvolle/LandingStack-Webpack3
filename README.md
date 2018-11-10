# Landing Stack 

A simply base to easy develop landing page with [Webpack](https://webpack.js.org/).


----

### Install

> Install [NodeJS](https://nodejs.org/) to use NPM.  
Copy files in your project folder or clone this project with [Git](https://git-scm.com/).  
Open console:

	cd /go/in/your/project/folder/
    npm install

----

### Setup

> To GLOBAL config, look `./webpack.config.js`:  
- `entry: { app: [] }` to set assets CSS/JS file (line 57)  
- `new copy()` to set static files (line 201)  
- `new ftp()` to set FTP access (line 262)  

> To PHP config, look `./src/config/db.conf.php`:  
- `___DB_SERVER___` to set HOST  
- `___DB_NAME___` to set DATABASE  
- `___DB_LOGIN___` to set USERNAME  
- `___DB_PASSWORD___` to set PASSWORD  

----

### Develop

    npm run dev
    npm run dev-watch
    npm run dev-server-webpack
    npm run dev-server-php

----

### Production

    npm run prod
    npm run prod-server-php
    npm run upload