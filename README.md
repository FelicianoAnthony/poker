## how to use 

- cd fe ; npm install

- cd api ; npm install 

- add config data to config/secrets.js

- cd api ; node app.js 

    - runs on http://localhost:3000/{command}/{params} that hits http://pokeribarelyknowher.com/api/{command}{password}{params}{json}'

- ng serve --open - runs on http://localhost:4200

- look in conosole for http data 



1. comment out everything in file below & ONLY add 

    /etc/nginx/sites-available/default 


server {
   listen         80 default_server;
   listen         [::]:80 default_server;
   #server_name    localhost;
   #server_name _ ;
   root           /usr/share/nginx/html;
location / {
       proxy_pass http://127.0.0.1:8008;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
   }
}

2. start pm2 

pm2 start "ng serve --port 8008 --disable-host-check" --name poker
pm2 start app.js 
