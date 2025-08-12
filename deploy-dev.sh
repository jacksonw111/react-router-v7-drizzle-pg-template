#!/bin/bash

# 应用部署脚本
# 支持数据库迁移、Docker 镜像部署和服务管理
# 使用方法: ./deploy.sh [command] [options]

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
GITHUB_USER="${GITHUB_USER:-name}"
REPO_NAME="${REPO_NAME:-template}"
REGISTRY="ghcr.io"
COMPOSE_FILE="docker-compose.yml"

# 镜像名称
IMAGE="${REGISTRY}/${GITHUB_USER}/${REPO_NAME}:latest"

# 日志函数
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 检查依赖
check_dependencies() {
    log_info "检查依赖..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi
    
    if ! command -v docker compose &> /dev/null; then
        log_error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi
    
    log_success "依赖检查完成"
}


# 数据库迁移
migrate_database() {
    log_info "开始数据库迁移..."
    
    # 确保数据库服务运行
    docker compose -f docker/dev/docker-compose.yml up -d db
    
    # 等待数据库启动
    log_info "等待数据库启动..."
    sleep 10
    
    # 运行迁移
    if command -v npm &> /dev/null; then
        log_info "使用本地 npm 运行迁移..."
        npm run db:migrate:dev
    else
        log_info "使用 Docker 运行迁移..."
        docker compose -f docker/dev/docker-compose.yml run --rm backend npm run db:migrate:dev
    fi
    
    log_success "数据库迁移完成"
}

# 拉取最新镜像
pull_images() {
    log_info "拉取最新 Docker 镜像..."
    
    docker pull "${IMAGE}" || log_warning "前端镜像拉取失败"
    
    log_success "镜像拉取完成"
}

# 部署服务
deploy_services() {
    log_info "部署服务..."
    
    # 停止现有服务
    docker compose -f docker/dev/docker-compose.yml down
    
    # 启动所有服务
    docker compose -f docker/dev/docker-compose.yml up -d
    
    # 等待服务启动
    log_info "等待服务启动..."
    sleep 15
    
    # 检查服务状态
    check_health
    
    log_success "服务部署完成"
}

# 健康检查
check_health() {
    log_info "检查服务健康状态..."
    
    # 检查数据库
    if docker compose -f docker/dev/docker-compose.yml exec -T db pg_isready -U postgres > /dev/null 2>&1; then
        log_success "数据库服务正常"
    else
        log_error "数据库服务异常"
    fi
    
    # 检查后端服务
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        log_success "后端服务正常"
    else
        log_warning "后端服务可能还在启动中..."
    fi
    
    # 检查前端服务
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        log_success "前端服务正常"
    else
        log_warning "前端服务可能还在启动中..."
    fi
}

# 查看日志
view_logs() {
    local service="${1:-}"
    
    if [[ -n "$service" ]]; then
        log_info "查看 $service 服务日志..."
        docker compose -f docker/dev/docker-compose.yml logs -f "$service"
    else
        log_info "查看所有服务日志..."
        docker compose -f docker/dev/docker-compose.yml logs -f
    fi
}

# 停止服务
stop_services() {
    log_info "停止所有服务..."
    docker compose -f docker/dev/docker-compose.yml down
    log_success "服务已停止"
}

# 重启服务
restart_services() {
    log_info "重启服务..."
    docker compose -f docker/dev/docker-compose.yml restart
    log_success "服务已重启"
}

# 清理资源
cleanup() {
    log_info "清理 Docker 资源..."
    
    # 停止并删除容器
    docker compose -f docker/dev/docker-compose.yml down -v
    
    # 清理未使用的镜像
    docker image prune -f
    
    # 清理未使用的卷
    docker volume prune -f
    
    log_success "清理完成"
}

# 备份数据库
backup_database() {
    local backup_file="backup_$(date +%Y%m%d_%H%M%S).sql"
    
    log_info "备份数据库到 $backup_file..."
    
    docker compose -f docker/dev/docker-compose.yml exec -T db pg_dump -U postgres newspaper > "$backup_file"
    
    log_success "数据库备份完成: $backup_file"
}

# 显示状态
show_status() {
    log_info "服务状态："
    docker compose -f docker/dev/docker-compose.yml ps
    
    echo ""
    log_info "镜像信息："
    echo "  前端: ${FRONTEND_IMAGE}"
    echo "  后端: ${BACKEND_IMAGE}"
    
    echo ""
    log_info "访问地址："
    echo "  前端应用: http://localhost:3000"
    echo "  后端 API: http://localhost:3001"
    echo "  数据库: localhost:5432"
}

# 完整部署流程
full_deploy() {
    log_info "开始完整部署流程..."
    
    check_dependencies
    # check_env_file
    pull_images
    migrate_database
    deploy_services
    
    log_success "🎉 部署完成！"
    show_status
}

# 显示帮助信息
show_help() {
    echo "Newspaper 应用部署脚本"
    echo ""
    echo "使用方法: $0 [command] [options]"
    echo ""
    echo "命令："
    echo "  deploy, full    - 完整部署流程（默认）"
    echo "  migrate        - 仅运行数据库迁移"
    echo "  pull           - 拉取最新镜像"
    echo "  start          - 启动服务"
    echo "  stop           - 停止服务"
    echo "  restart        - 重启服务"
    echo "  status         - 查看服务状态"
    echo "  logs [service] - 查看日志"
    echo "  health         - 健康检查"
    echo "  backup         - 备份数据库"
    echo "  cleanup        - 清理 Docker 资源"
    echo "  help           - 显示帮助信息"
    echo ""
    echo "示例："
    echo "  $0 deploy      - 完整部署"
    echo "  $0 logs backend - 查看后端日志"
    echo "  $0 status      - 查看服务状态"
}

# 主逻辑
case "${1:-deploy}" in
    "deploy"|"full")
        full_deploy
        ;;
    "migrate")
        migrate_database
        ;;
    "pull")
        pull_images
        ;;
    "start")
        deploy_services
        ;;
    "stop")
        stop_services
        ;;
    "restart")
        restart_services
        ;;
    "status")
        show_status
        ;;
    "logs")
        view_logs "$2"
        ;;
    "health")
        check_health
        ;;
    "backup")
        backup_database
        ;;
    "cleanup")
        cleanup
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        log_error "未知命令: $1"
        echo ""
        show_help
        exit 1
        ;;
esac