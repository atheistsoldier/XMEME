
#!/bin/bash

# install and setup MongoDB + Node.js environment

# import the public key used by the package management system
wget -qO - https://www.mongodb.org/static/pgp/server-4.2.asc | sudo apt-key add -

# add sources
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.2.list

# update local machine
sudo apt update

# install mongodb packages
sudo apt install -y mongodb-org

#start MongoDB
sudo systemctl start mongod

# display MongoDB running status
sudo systemctl status mongod

# make mongodb as a service and restart on reboots
sudo systemctl enable mongod

# set up node with nvm, download nvm by running the installation script 
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash


# activate nvm
. ~/.nvm/nvm.sh

# install node's latest version
nvm install node

# installing v 13.14.0 which was used to develop the XMeme app
nvm install 13.14.0

# use the required version
nvm use 13.14.0