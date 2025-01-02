#!/bin/bash

BUCKET_NAME="trackvstrack.net"
PREFIX="backups/"
LOCAL_FILE="./backup/dump.sql"

# 이미 backup.sql 파일이 있는지 확인
if [ -f "$LOCAL_FILE" ]; then
  echo "백업 파일이 이미 존재합니다: $LOCAL_FILE"
  echo "S3에 접근하지 않고 스크립트를 종료합니다."
  exit 0
fi

# AWS CLI 설치
if ! command -v aws &> /dev/null; then
  echo "AWS CLI가 설치되어 있지 않습니다. 설치를 진행합니다..."
  yum update -y && yum install -y aws-cli
  if [ $? -eq 0 ]; then
    echo "AWS CLI 설치 완료."
  else
    echo "AWS CLI 설치 실패."
    exit 1
  fi
fi

# 최신 파일 가져오기
LATEST_FILE=$(aws s3 ls s3://$BUCKET_NAME/$PREFIX --recursive | sort | tail -n 1 | awk '{print $4}')

if [ -n "$LATEST_FILE" ]; then
  echo "최신 백업 파일: $LATEST_FILE"
  echo "S3에서 다운로드 중..."
  
  # 다운로드 경로를 명확히 지정
  aws s3 cp "s3://$BUCKET_NAME/$LATEST_FILE" "$LOCAL_FILE"
  if [ $? -eq 0 ]; then
    echo "S3에서 최신 백업 파일 다운로드 성공: $LOCAL_FILE"
    echo "컨테이너를 종료합니다."
    exit 0
  else
    echo "S3에서 백업 파일 다운로드 실패"
    exit 1
  fi
else
  echo "S3에서 백업 파일을 찾을 수 없습니다."
  exit 1
fi
