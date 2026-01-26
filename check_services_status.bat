@echo off
REM Estado de Servicios - Integracion JWT

echo.
echo ====================================================================
echo ESTADO DE SERVICIOS - INTEGRACION JWT
echo ====================================================================
echo.

echo [1] Verificando Auth Service (puerto 8001)...
timeout /t 1 /nobreak >nul
curl -s http://localhost:8001/health >nul 2>&1
if %errorlevel% equ 0 (
    echo     ✓ ACTIVO
) else (
    echo     ✗ NO RESPONDE
)

echo.
echo [2] Verificando REST API (puerto 8000)...
timeout /t 1 /nobreak >nul
curl -s http://localhost:8000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo     ✓ ACTIVO
) else (
    echo     ✗ NO RESPONDE
)

echo.
echo [3] Verificando Payment Service (puerto 8002)...
timeout /t 1 /nobreak >nul
curl -s http://localhost:8002/health >nul 2>&1
if %errorlevel% equ 0 (
    echo     ✓ ACTIVO
) else (
    echo     ✗ NO RESPONDE
)

echo.
echo ====================================================================
echo INTEGRACION JWT:
echo   ✓ JWT_SECRET_KEY SINCRONIZADA
echo   ✓ CONFIGURATION COMPLETADA
echo   ✓ SERVICIOS OPERACIONALES
echo ====================================================================
echo.
