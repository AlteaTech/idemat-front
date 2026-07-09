# Stage 1: Serve with Nginx
FROM nginx:alpine

# Copy the build output from the previous stage (assuming artifacts are passed from CI)
# Note: In the CI pipeline, we build in a separate job and pass artifacts.
# Since the Dockerfile is now at the root, and the build output is in idemat-front/dist
COPY idemat-front/dist/idemat-front/browser /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
