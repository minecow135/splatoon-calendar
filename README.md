# Splatoon calendar

## How it works

### get info

- Pulls data from splatoonwiki.org
- Uploads to database

### use info

- Pulls from database, and creates a ics file with next splatfest
- Pulls from database, and sends message to discord server when a new splatfest is announced
- Pulls from database, and sends message to discord server when the winner is announced

## How to use

### Requirements

- Node
- Docker
- Docker-compose

### Setup docker

1. Clone the newest release with `git clone -b v1.3.0 https://github.com/minecow135/splatoon-calendar.git`
2. Run npm install
3. run `sudo chown www-data splatoon-calendar/ -R`
4. Import the database in the sql folder
5. Use the Docker compose file to create the needed docker containers. be sure to edit the environment variables
6. Start the containers

### update

to update run the following commands

```bash
git fetch
git checkout v1.3.0
npm install
```

## file contents

### .env

```shell
# Database connection
DB_HOST=HOST
DB_USER=USER
DB_PASSWORD=PASSWORD
DB_NAME=DATABASE

# Discord bot connection
botToken=TOKEN

# When to run splatfest fetch (Hour)
SPLATFEST_RUN_HOUR=06

# message channels
# use as many ping ids as you want. separate with commas to get more
splatfestNew=CHANNEL ID,PING ID,PING ID
# copy with suffix to get more channels
#splatfestNew2=CHANNEL ID,PING ID,PING ID

splatfestWin=CHANNEL ID,PING ID,PING ID
# copy with suffix to get more channels
#splatfestWin2=CHANNEL ID,PING ID,PING ID
```

### docker compose

```yml
version: "2"
services:
  node:
    image: "node:20"
    user: "www-data"
    working_dir: /home/node/app
    environment:
      - NODE_ENV=production
      # Database connection
      - DB_HOST=HOST
      - DB_USER=USER
      - DB_PASSWORD=PASSWORD
      - DB_NAME=DATABASE

      # Discord bot connection
      - botToken=TOKEN

      # message channels
      # use as many ping ids as you want. separate with commas to get more
      - splatfestNew=CHANNEL ID,PING ID,PING ID
      # copy with suffix to get more channels
      #splatfestNew2=CHANNEL ID,PING ID,PING ID

      - splatfestWin=CHANNEL ID,PING ID,PING ID
      # copy with suffix to get more channels
      #splatfestWin2=CHANNEL ID,PING ID,PING ID
    volumes:
      - /var/www/splatoon-calendar:/home/node/app # first location is on the machine running docker. change this if needed. THIS SHOULD ALWAYS BE SAME AS VOLUME IN WEB CONTAINER - /web
    expose:
      - "8001"
    ports:
      - "8204:8001" # first number is port on the server. change this if needed
    command: "npm start"
  web:
    image: php:8.2-apache
    user: "www-data"
    restart: always
    ports:
      - "8104:80" # first number is port on the server. change this if needed
    volumes:
      - /var/www/splatoon-calendar/web:/var/www/html # first location is on the machine running docker. change this if needed. THIS SHOULD ALWAYS BE SAME AS VOLUME IN NODE CONTAINER + /web
```
