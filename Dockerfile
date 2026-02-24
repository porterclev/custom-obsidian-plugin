FROM node:24

WORKDIR /src

COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "dev"]