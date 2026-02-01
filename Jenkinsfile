pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = 'patternfly-frontend'
        GIT_REPO = 'https://github.com/Udhayaboopathi/Pattenfly_Learning.git'
        CONTAINER_NAME = 'patternfly-app'
        APP_PORT = '80'
        HOST_PORT = '8080'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code from GitHub...'
                git branch: 'main', url: "${GIT_REPO}"
            }
        }
        
        stage('Verify Environment') {
            steps {
                echo 'Verifying Node.js and npm versions...'
                dir('frontend') {
                    bat 'node -v'
                    bat 'npm -v'
                }
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo 'Installing dependencies...'
                dir('frontend') {
                    bat 'npm ci'
                }
            }
        }
        
        stage('Lint & Code Quality') {
            steps {
                echo 'Running code quality checks...'
                dir('frontend') {
                    // Add linting if configured
                    // bat 'npm run lint'
                    echo 'Linting skipped - configure npm run lint in package.json'
                }
            }
        }
        
        stage('Build Application') {
            steps {
                echo 'Building React application...'
                dir('frontend') {
                    bat 'npm run build'
                }
            }
        }
        
        stage('Run Tests') {
            steps {
                echo 'Running tests...'
                dir('frontend') {
                    // bat 'npm test -- --watchAll=false'
                    echo 'Tests skipped - configure npm test in package.json'
                }
            }
        }
        
        stage('Build Docker Image') {
            steps {
                echo 'Building Docker image...'
                dir('frontend') {
                    bat "docker build -t ${DOCKER_IMAGE}:latest ."
                }
            }
        }
        
        stage('Stop Old Container') {
            steps {
                echo 'Stopping and removing old container...'
                script {
                    bat """
                        docker stop ${CONTAINER_NAME} || echo "No container to stop"
                        docker rm ${CONTAINER_NAME} || echo "No container to remove"
                    """
                }
            }
        }
        
        stage('Deploy Container') {
            steps {
                echo 'Deploying new container...'
                bat """
                    docker run -d ^
                    --name ${CONTAINER_NAME} ^
                    -p ${HOST_PORT}:${APP_PORT} ^
                    --restart unless-stopped ^
                    ${DOCKER_IMAGE}:latest
                """
                echo "Application deployed successfully on http://localhost:${HOST_PORT}"
            }
        }
        
        stage('Health Check') {
            steps {
                echo 'Performing health check...'
                script {
                    sleep(time: 10, unit: 'SECONDS')
                    bat "docker ps -f name=${CONTAINER_NAME}"
                    // Uncomment for HTTP health check
                    // bat "curl -f http://localhost:${HOST_PORT} || exit 1"
                }
            }
        }
        
        stage('Cleanup Old Images') {
            steps {
                echo 'Cleaning up old Docker images...'
                script {
                    bat 'docker image prune -f'
                }
            }
        }
    }
    
    post {
        success {
            echo '✓ Pipeline completed successfully!'
            echo "Application is running at http://localhost:${HOST_PORT}"
        }
        failure {
            echo '✗ Pipeline failed! Check logs for details.'
            // Rollback if needed
            script {
                bat "docker stop ${CONTAINER_NAME} || echo 'Rollback not needed'"
            }
        }
        always {
            echo 'Cleaning up workspace...'
            // Uncomment to clean workspace after build
            // cleanWs()
        }
    }
}
