#!/bin/bash

echo "测试 BPM 后端 API..."

echo ""
echo "1. 测试注册用户..."
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "fullName": "测试用户"
  }'

echo ""
echo ""
echo "2. 测试登录..."
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'

echo ""
echo ""
echo "3. 测试获取流程定义列表（需要 token）..."
echo "请先登录获取 token，然后使用以下命令测试："
echo 'curl -X GET http://localhost:3000/api/v1/process-definitions -H "Authorization: Bearer YOUR_TOKEN"'

echo ""
echo "测试完成！"
