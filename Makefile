# 项目 Makefile

.PHONY: help dev build deploy clean logs status health backup
DOCKER_IMAGE_TAG = template

# 默认目标
help: ## 显示帮助信息
	@echo "项目管理命令："
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

# 开发环境
dev: ## 启动开发环境
	@echo "🚀 启动开发环境..."
	docker-compose -f docker/dev/docker-compose.yml up -d
	@echo "✅ 开发环境已启动"
	@echo "   数据库: localhost:5432"
	@echo "   Redis: localhost:6379"

dev-down: ## 停止开发环境
	@echo "🛑 停止开发环境..."
	docker-compose -f docker-compose.dev.yml down

dev-logs: ## 查看开发环境日志
	docker-compose -f docker-compose.dev.yml logs -f

# 构建
build: ## 构建 Docker 镜像
	@echo "🔨 构建 Docker 镜像..."
	docker build -t $(DOCKER_IMAGE_TAG) -f Dockerfile .
	@echo "✅ 镜像构建完成"

# 部署
deploy: ## 完整部署到生产环境
	@echo "🚀 开始部署..."
	./deploy.sh deploy

deploy-dev: ## 完整部署到开发环境
	@echo "🚀 开始开发环境部署..."
	./deploy-dev.sh deploy

deploy-pull: ## 拉取最新镜像并部署
	@echo "📦 拉取最新镜像..."
	./deploy.sh pull
	./deploy.sh start

deploy-dev-pull: ## 拉取最新镜像并部署到开发环境
	@echo "📦 拉取最新镜像到开发环境..."
	./deploy-dev.sh pull
	./deploy-dev.sh start

# 数据库
migrate: ## 运行生产环境数据库迁移
	@echo "🗃️ 运行生产环境数据库迁移..."
	./deploy.sh migrate

migrate-dev: ## 运行开发环境数据库迁移
	@echo "🗃️ 运行开发环境数据库迁移..."
	./deploy-dev.sh migrate

migrate-local: ## 运行本地数据库迁移
	@echo "🗃️ 运行本地数据库迁移..."
	npm run db:migrate

backup: ## 备份生产数据库
	@echo "💾 备份生产数据库..."
	./deploy.sh backup

backup-dev: ## 备份开发环境数据库
	@echo "💾 备份开发环境数据库..."
	./deploy-dev.sh backup

# 服务管理
start: ## 启动生产服务
	@echo "▶️ 启动生产服务..."
	./deploy.sh start

start-dev: ## 启动开发环境服务
	@echo "▶️ 启动开发环境服务..."
	./deploy-dev.sh start

stop: ## 停止生产服务
	@echo "⏹️ 停止生产服务..."
	./deploy.sh stop

stop-dev: ## 停止开发环境服务
	@echo "⏹️ 停止开发环境服务..."
	./deploy-dev.sh stop

restart: ## 重启生产服务
	@echo "🔄 重启生产服务..."
	./deploy.sh restart

restart-dev: ## 重启开发环境服务
	@echo "🔄 重启开发环境服务..."
	./deploy-dev.sh restart

# 监控和日志
status: ## 查看生产环境服务状态
	@echo "📊 生产环境服务状态："
	./deploy.sh status

status-dev: ## 查看开发环境服务状态
	@echo "📊 开发环境服务状态："
	./deploy-dev.sh status

logs: ## 查看生产环境所有服务日志
	./deploy.sh logs

logs-dev: ## 查看开发环境所有服务日志
	./deploy-dev.sh logs

logs-frontend: ## 查看生产环境前端日志
	./deploy.sh logs frontend

logs-frontend-dev: ## 查看开发环境前端日志
	./deploy-dev.sh logs frontend

logs-backend: ## 查看生产环境后端日志
	./deploy.sh logs backend

logs-backend-dev: ## 查看开发环境后端日志
	./deploy-dev.sh logs backend

logs-db: ## 查看生产环境数据库日志
	./deploy.sh logs db

logs-db-dev: ## 查看开发环境数据库日志
	./deploy-dev.sh logs db

health: ## 生产环境健康检查
	@echo "🏥 生产环境健康检查..."
	./deploy.sh health

health-dev: ## 开发环境健康检查
	@echo "🏥 开发环境健康检查..."
	./deploy-dev.sh health

# 清理
clean: ## 清理生产环境 Docker 资源
	@echo "🧹 清理生产环境资源..."
	./deploy.sh cleanup

clean-dev: ## 清理开发环境 Docker 资源
	@echo "🧹 清理开发环境资源..."
	./deploy-dev.sh cleanup

# 测试
test: ## 运行测试
	@echo "🧪 运行测试..."
	npm run typecheck

test-workflow: ## 测试工作流
	@echo "🔄 测试工作流..."
	npm run workflow:test

# 安装和设置
install: ## 安装依赖
	@echo "📦 安装依赖..."
	npm ci

setup: ## 初始化项目设置
	@echo "⚙️ 初始化项目..."
	@if [ ! -f .env.dev ]; then cp .env.example .env.dev; echo "已创建 .env.dev"; fi
	@if [ ! -f .env.prod ]; then cp .env.example .env.prod; echo "已创建 .env.prod"; fi
	@echo "✅ 项目设置完成，请编辑环境变量文件"

# 快速开始
quick-start: setup install dev migrate-local ## 快速启动本地开发环境
	@echo "🎉 本地开发环境已就绪！"
	@echo "   前端开发: npm run dev"
	@echo "   后端开发: npm run server:dev"

quick-start-dev: setup deploy-dev ## 快速启动 Docker 开发环境
	@echo "🎉 Docker 开发环境已就绪！"
	@echo "   访问地址: http://localhost:3000"