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

- Docker
- Docker-compose

### Setup docker

1. Copy the docker-compose.yml
2. Copy the .env.sample to .env
3. Update the values in the .env file
   If you use the database in the docker compose, the only thing you need to update are the passwords

### update

To update, remove the old docker-compose.yml, copy the new, and update the .env file if there are any new config variables

## file contents

### .env

```shell
# Database connection
DB_HOST=db
DB_USER=splatcal
DB_PASSWORD=PASSWORD
DB_NAME=splatcal

# Database root password. only used for you to access the database
DB_ROOT_PASSWORD=PASSWORD

WEB_URL=https://example.com/

# Discord bot connection
botToken=TOKEN
BOT_ACTIVITY_TYPE=Playing # Competing, Custom, Listening, Playing, Streaming, Watching
BOT_ACTIVITY=Splatoon 3

# When to run splatfest fetch (Hour)
SPLATFEST_RUN_HOUR=06
# Default 06

# message channels
# use as many ping ids as you want. separate with commas to get more
splatfestNew=CHANNEL ID,PING ID,PING ID
# copy with suffix to get more channels
#splatfestNew2=CHANNEL ID,PING ID,PING ID

splatfestWin=CHANNEL ID,PING ID,PING ID
# copy with suffix to get more channels
#splatfestWin2=CHANNEL ID,PING ID,PING ID

error=CHANNEL ID,PING ID,PING ID      
# copy with suffix to get more channels
#error2=CHANNEL ID,PING ID,PING ID
```

### docker compose

```yml
services:
  splatcal:
    image: git.awdawd.eu/awd/splatcal:v2.0.0-rc2
    depends_on:
      db:
        condition: service_healthy
    env_file:
      - .env

  db:
    image: mariadb:11
    restart: always
    volumes:
      - ./database:/var/lib/mysql
    healthcheck:
      test: ["CMD", "healthcheck.sh", "--connect", "--innodb_initialized"]
      start_period: 10s
      interval: 10s
      timeout: 5s
      retries: 3

    env_file:
      - .env
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MARIADB_USER: ${DB_USER}
      MARIADB_PASSWORD: ${DB_PASSWORD} 
      MARIADB_DATABASE: ${DB_NAME}

```
