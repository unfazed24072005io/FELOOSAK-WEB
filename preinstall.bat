@echo off 
if exist package-lock.json del package-lock.json 
if exist yarn.lock del yarn.lock 
if not "%%npm_config_user_agent%%"=="pnpm/*" ( 
  echo Use pnpm instead 
  exit 1 
) 
