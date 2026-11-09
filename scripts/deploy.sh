#!/bin/bash
set -e

echo "📦 Building production static site..."
npm run build

echo "🚀 Preparing gh-pages branch..."
git checkout --orphan gh-pages
git reset
git --work-tree dist add .
git --work-tree dist commit -m "Deploy static site to gh-pages"

echo "🌐 Pushing to GitHub gh-pages branch..."
git push origin gh-pages --force

echo "🧹 Returning to main branch..."
git checkout -f main
git branch -D gh-pages

echo "✅ Successfully pushed to gh-pages branch!"
