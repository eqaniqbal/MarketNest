pipeline {
    agent any

    environment {
        COMPOSE_FILE = 'docker-compose.jenkins.yml'
    }

    stages {

        stage('Clone Repository') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/eqaniqbal/marketnest.git'
            }
        }

        stage('Build') {
            steps {
                sh 'docker compose -f ${COMPOSE_FILE} down || true'
                sh 'docker compose -f ${COMPOSE_FILE} up -d'
            }
        }

        stage('Test') {
            steps {
                sh 'docker build -t marketnest-tests ./tests'
                sh 'docker run --rm --network host marketnest-tests'
            }
        }

        stage('Verify') {
            steps {
                sh 'docker compose -f ${COMPOSE_FILE} ps'
            }
        }
    }

    post {
        failure {
            sh 'docker compose -f ${COMPOSE_FILE} down || true'
        }
    }
}
