
#!/bin/bash



#!/bin/bash

# activate nvm
. ~/.nvm/nvm.sh

sudo fuser -k 8080/tcp
sudo fuser -k 8081/tcp
# install dependencies
npm install 

# start the application
npm start

# Setup DB or any other environment variables you want to setup.



