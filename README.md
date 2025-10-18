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

## Known issues

### Database fails creating tables

Problem: 
- Tables are sometimes getting created in the wrong order on first startup

Error messages sent:
- ```
  ERROR Setup Splatfest
  Create tables: Insert
  Error: Can't create table splatcal.splatfest_win (errno: 150 "Foreign key constraint is incorrectly formed")
  ```
- ```
  ERROR Setup Splatfest
  Create tables: Insert
  Error: Can't create table splatcal.splatfest_discordSent (errno: 150 "Foreign key constraint is incorrectly formed")
  ```

Temporary solution:
- Restart container until error stops
  
### Web directory no permission

Problem:
- When the web directory is mounted to local folder it is not automatically created with correct permissions.

Error messages sent:
- ```
  ERROR Splatfest
  Create ICS: create folder
  Error: EACCES: permission denied, mkdir '/usr/local/splatcal/web/event/splatfest'
  ```
- ```
  ERROR Splatfest
  Create ICS: Save ics
  Error: ENOENT: no such file or directory, open '/usr/local/splatcal/web/event/splatfest/splatfest.ics'
  ```
- ```
  ERROR Splatfest
  Get data: Save image
  Error: EACCES: permission denied, mkdir '/usr/local/splatcal/web/usr/local/splatcal/web/event/splatfest/src/Zombie_vs_Skeleton_vs_Ghost_2025/img'
  ```
- ```
  ERROR Splatfest
  Setup web: copy folder
  Error: EACCES: permission denied, copyfile '/usr/local/splatcal/webTemplate/index.html' -> '/usr/local/splatcal/web/index.html'
  ```
- ```
  ERROR Splatfest
  Get data: create folder
  Error: EACCES: permission denied, mkdir '/usr/local/splatcal/web/event/splatfest/src/Zombie_vs_Skeleton_vs_Ghost_2025/img'
  ```


Temporary solution:
- Create the folder manually
- run `sudo chown 1000:1000 web` to set corect permissions
- start the container
