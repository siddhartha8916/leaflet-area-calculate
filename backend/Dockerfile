# Step 1: Use Node.js 20 Alpine image as the base image
FROM node:20-alpine

# Step 2: Set the working directory inside the container
WORKDIR /usr/src/app

# Step 3: Copy package.json and package-lock.json to the container
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of the application code to the container
COPY . .

# Step 6: Expose the port the app will run on
EXPOSE 3000

# Step 7: Command to run the app when the container starts
CMD ["npm", "start"]
