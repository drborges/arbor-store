FROM node:8.9.3

ENV HOME=/home/app

COPY package.json $HOME/arbor/

WORKDIR $HOME/arbor
RUN npm install --progress=false

COPY . $HOME/arbor

CMD ["npm", "test"]
