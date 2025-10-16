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
