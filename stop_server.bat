@echo off
setlocal

rem 查找占用 3001 端口的进程 ID
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    echo 找到占用 3001 端口的进程 ID: %%a
    rem 终止该进程
    taskkill /PID %%a /F
    echo 进程 %%a 已被终止。
)

endlocal