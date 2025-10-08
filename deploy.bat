@echo off
echo 🚀 Deploy 67 Beauty Hub para Vercel
echo =====================================

echo.
echo 📦 Fazendo deploy...
vercel --prod --yes

echo.
echo ✅ Deploy concluído!
echo.
echo 🌐 Seu site estará disponível em:
echo    https://67-beauty-hub-[ID].vercel.app
echo.
echo 🔗 Callback URL para AliExpress:
echo    https://67-beauty-hub-[ID].vercel.app/api/aliexpress-callback.php
echo.
echo 🧪 URL de teste:
echo    https://67-beauty-hub-[ID].vercel.app/api/aliexpress-callback.php?test=1
echo.
pause



