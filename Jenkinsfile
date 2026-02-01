pipeline {
    agent any
    
    tools {
        nodejs 'NodeJS-18' // Configure this in Jenkins Global Tool Configuration
    }
    
    environment {
        DOCKER_IMAGE = 'data-management-frontend'
        DOCKER_TAG = "${env.BUILD_NUMBER}"
        DOCKER_REGISTRY = '' // Add your registry URL if using one (e.g., 'docker.io/username')
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code...'
                checkout scm
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
        
        stage('Build') {
            steps {
                echo 'Building application...'
                dir('frontend') {
                    bat 'npm run build'
                }
            }
        }
        
        stage('Test') {
            steps {
                echo 'Running tests...'
                dir('frontend') {
                    // Add your test command here when available
                    // bat 'npm test'
                    echo 'No tests configured yet'
                }
            }
        }
        
        stage('Build Docker Image') {
            steps {
                echo 'Building Docker image...'
                dir('frontend') {
                    script {
                        if (env.DOCKER_REGISTRY) {
                            bat "docker build -t ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${DOCKER_TAG} ."
                            bat "docker build -t ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:latest ."
                        } else {
                            bat "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."
                            bat "docker build -t ${DOCKER_IMAGE}:latest ."
                        }
                    }
                }
            }
        }
        
        stage('Push Docker Image') {
            when {
                branch 'main' // Only push on main branch
            }
            steps {
                echo 'Pushing Docker image...'
                script {
                    if (env.DOCKER_REGISTRY) {
                        // Login to Docker registry
                        withCredentials([usernamePassword(credentialsId: 'docker-registry-credentials', passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                            bat "docker login -u %DOCKER_USERNAME% -p %DOCKER_PASSWORD% ${DOCKER_REGISTRY}"
                        }
                        bat "docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${DOCKER_TAG}"
                        bat "docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:latest"
                    } else {
                        echo 'Skipping push - no registry configured'
                    }
                }
            }
        }
        
        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                echo 'Deploying application...'
                // Add your deployment commands here
                // Example: bat 'docker-compose up -d'
                echo 'Deployment steps to be configured'
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
        always {
            echo 'Cleaning up workspace...'
            cleanWs()
        }
    }
}
