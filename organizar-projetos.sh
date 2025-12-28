#!/bin/bash
# Script para organizar e enviar projetos para o GitHub

echo "📁 Organizando projetos para o GitHub..."

# Criar estrutura de pastas
mkdir -p Ri-Happy
cd Ri-Happy

# Mover/copiar seus projetos (ajuste os caminhos)
# Exemplo:
# cp -r ../DetonaRalph/ .
# cp -r ../pokedex/ .
# cp -r ../simulador-piano/ .
# cp -r ../portfolio-frontend/ .
# cp -r ../LandingPage-mundo-invertido/ .
# cp -r ../JogoDetona/ .
# cp -r ../emoji/ .

echo "✅ Projetos organizados!"
echo "📋 Listando conteúdo:"
ls -la

# Inicializar Git
echo "🚀 Configurando Git..."
git init
git add .
git commit -m "Primeiro commit: Adiciona todos meus projetos web"

# Conectar ao GitHub
echo "🔗 Conectando ao GitHub..."
git remote add origin https://github.com/ralfendeck25/Ri-Happy.git
git branch -M main
git push -u origin main

echo "🎉 Todos os projetos foram enviados para o GitHub!"
echo "👉 Acesse: https://github.com/ralfendeck25/Ri-Happy"