# Use current version of node
FROM node:latest

MAINTAINER Chris Ng, chris.ng93@gmail.com

RUN npm install webpack -g

# Create app directory
RUN mkdir -p /usr/src/coffee-around-me
WORKDIR /usr/src/coffee-around-me

# Install dependencies
COPY package.json /usr/src/coffee-around-me
RUN npm install

# Bundle app source
COPY . /usr/src/coffee-around-me/

ENV NODE_ENV=production
ENV API_URL=http://localhost:8080

# Expose port
EXPOSE 80

# Build and run app
RUN npm run build
CMD npm run prod
