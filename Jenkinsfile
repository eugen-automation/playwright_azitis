pipeline {
    agent any
    
    options {
        ansiColor('xterm')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
    }

    parameters {
        string(name: 'GIT_BRANCH', defaultValue: 'main', description: 'Git branch to checkout')
    }

    environment {
        DOCKER_IMAGE = 'mcr.microsoft.com/playwright:v1.58.0'
        DOCKER_ARGS = '-v $WORKSPACE:/app -w /app -v $HOME/.ssh:/root/.ssh:ro -e SSH_AUTH_SOCK=/tmp/ssh-agent.sock'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '${GIT_BRANCH}']],
                    userRemoteConfigs: [[
                        url: 'git@github.com:genuineq/azitis-automation.git'
                    ]]
                ])
            }
        }
        
        stage('Validate') {
            agent {
                docker {
                    image "${DOCKER_IMAGE}"
                    args "${DOCKER_ARGS}"
                }
            }
            steps {
                sh 'eval $(ssh-agent -s) && ssh-add /root/.ssh/id_rsa 2>/dev/null || true'
                sh 'npm install'
                sh 'npm run type-check'
                sh 'npm run lint -- --quiet'
            }
        }

        stage('Run Tests') {
            agent {
                docker {
                    image "${DOCKER_IMAGE}"
                    args "${DOCKER_ARGS}"
                }
            }
            environment {
                CI = 'true'
            }
            steps {
                sh 'eval $(ssh-agent -s) && ssh-add /root/.ssh/id_rsa 2>/dev/null || true'
                sh '''
                    echo "======= Environment Info ======="
                    node --version
                    npm --version
                    npx playwright --version
                    echo "================================"
                '''
                sh 'npm run client:mobile'
            }
            post {
                always {
                    // Note: CSP setting must be configured globally by Jenkins administrator
                    // Remove System.setProperty() call due to Jenkins Script Security Sandbox restrictions
                    
                    // Archive and publish Playwright HTML report
                    archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
                    publishHTML(target: [
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'playwright-report',
                        reportFiles: 'index.html',
                        reportName: 'Playwright HTML Report'
                    ])
                    
                    // Archive Allure results and generate report
                    // archiveArtifacts artifacts: 'allure-results/**', allowEmptyArchive: true
                    // script {
                    //     sh '''
                    //         if command -v java >/dev/null 2>&1; then
                    //             npx allure generate allure-results -o allure-report --clean || true
                    //         else
                    //             echo "Java not available in container; skipping allure generate (artifacts already archived)."
                    //         fi
                    //     '''
                    // }
                    // archiveArtifacts artifacts: 'allure-report/**', allowEmptyArchive: true
                    
                    // // Publish Allure HTML report
                    // publishHTML(target: [
                    //     allowMissing: false,
                    //     alwaysLinkToLastBuild: true,
                    //     keepAll: true,
                    //     reportDir: 'allure-report',
                    //     reportFiles: 'index.html',
                    //     reportName: 'Allure Test Report'
                    // ])
                }
            }
        }
    }

    post {
        always {
            echo 'Build finished - reports are archived.'
        }
        failure {
            echo 'Pipeline failed! Check test reports above.'
        }
        success {
            echo 'All tests passed! Reports available in build artifacts.'
        }
    }
}
