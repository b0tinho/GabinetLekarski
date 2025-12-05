FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
# Uruchomienie Vite z flagą host, aby był widoczny poza kontenerem
CMD ["npm", "run", "dev", "--", "--host"]