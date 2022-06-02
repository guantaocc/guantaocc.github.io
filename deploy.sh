#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 将当前master分支提交
git add .
git commit -m 'update blog master'
git branch -M master
git push -f git@github.com:guantaocc/guantaocc.github.io.git master
git push origin master


# gh-pages部署
# 生成静态文件
npm run build

# 进入生成的文件夹
cd docs/.vuepress/dist

# 如果是发布到自定义域名
# echo 'www.example.com' > CNAME

git init
git add -A
git commit -m 'deploy-blog'

git branch -M gh-pages
# 如果发布到 https://<USERNAME>.github.io
git push -f git@github.com:guantaocc/guantaocc.github.io.git gh-pages