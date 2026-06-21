@echo off
echo ========================================
echo   订单管理系统 - Demo 本地预览
echo ========================================
echo.
echo 正在启动本地 HTTP 服务...
echo 浏览器打开 http://localhost:8080 即可预览
echo 按 Ctrl+C 停止服务
echo.
python -m http.server 8080
pause
