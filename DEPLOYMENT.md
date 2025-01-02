# 배포 환경 가이드

## 네트워크 구성

- Private Subnet:
    
    - `trackvstrack-private-db-ec2`: <br>
    MySQL 데이터베이스를 실행하는 EC2 인스턴스.
    
    - `trackvstrack-private-apiserver-ec2`: <br>
    API(nest) 서버와 관련 서비스를 실행하는 EC2 인스턴스



## 배포순서

### 1. `trackvstrack-private-db-ec2`
1. 환경변수 설정 (`root/.env`)
    ```bash
    AWS_ACCESS_KEY_ID=
    AWS_SECRET_ACCESS_KEY=
    AWS_DEFAULT_REGION=
    MYSQL_ROOT_PASSWORD=
    MYSQL_DATABASE=
    ```
2. `backup-fetcher` 실행
    ```bash
    $ docker-compose --env-file .env up backup-fetcher
    ```
    작업 완료 후 컨테이너가 종료되며, S3로부터 최신 backup파일이  `root/backup/dump.sql`에 다운로드

3. `mysql` 컨테이너 실행
    ```bash
    $ docker-compose --env-file .env up mysql -d
    ```
    MySQL이 초기화되며, /backup/dump.sql을 기반으로 데이터베이스가 구성

### 2. `trackvstrack-private-apiserver-ec2`

1. 환경변수 설정
- `root/.env`
    ```bash
    API_SERVER_DOCKER_ENV=development.docker
    ```
- `root/nest-server/.env.production.docker`
    ```bash
    APP_PORT=80
    APP_LOG_LEVEL=info
    APP_ENV=production.docker

    TYPEORM_HOST=your_mysql_host
    TYPEORM_PORT=3306
    TYPEORM_USERNAME=root
    TYPEORM_PASSWORD=your_mysql_root_password
    TYPEORM_DATABASE=trackvstrack
    TYPEORM_LOGGING=false

    AWS_ACCESS_KEY_ID=your_aws_access_key_id
    AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
    AWS_REGION=your_aws_region
    AWS_CLOUD_WATCH_LOG_GROUP_NAME=your_log_group_name
    AWS_CLOUD_WATCH_LOG_STREAM_NAME=your_log_stream_name
    ```

2. 서버 실행

    ```bash
    $ docker-compose --env-file .env up api-server -d
    ```

3. health check 확인
    ```bash
    $ docker-compose ps 
    # db와의 커넥션 체크  정상이면 healthy
    ```
    