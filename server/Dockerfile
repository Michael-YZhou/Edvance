# Build stage
# Use AWS Lambda Node.js 20 base image
FROM public.ecr.aws/lambda/nodejs:22 AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies
RUN npm prune --production

# Production stage
# Use a second stage to prepare the production image
FROM public.ecr.aws/lambda/nodejs:22

# Set working directory
WORKDIR ${LAMBDA_TASK_ROOT}

# Copy built javascript files and node modules from build stage
COPY --from=build /app/dist ${LAMBDA_TASK_ROOT}
COPY --from=build /app/node_modules ${LAMBDA_TASK_ROOT}/node_modules

# Copy package.json
COPY --from=build /app/package.json ${LAMBDA_TASK_ROOT}

# Set environment variable
ENV NODE_ENV=production

# Set command to start the lambda function
CMD ["index.handler"]