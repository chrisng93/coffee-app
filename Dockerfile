# Use current version of node
FROM node:latest

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
ENV API_URL=api.coffeearoundme.com

# Expose port
EXPOSE 80

# Build and run app
RUN npm run build
CMD npm run prod
