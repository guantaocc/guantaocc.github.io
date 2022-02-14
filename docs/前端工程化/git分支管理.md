---
title: git分支管理
date: 2021-01-28
categories:
  - 前端工程化
tags:
  - git
---

# git 常用操作

## 获取和设置远程分支

1. clone仓库到本地

```bash
git clone xxx
```

2. 获取更新内容
```bash
git pull # 拉取信息, 为防止冲突应尽量在每次修改文件前拉取最新文件
git fetch origin # 拉取远程分支
git pull origin master # 拉取指定分支修改
```

3. 设置远程分支,用于本地分支和远程分支关联
```bash
git remote add origin 远程仓库地址
git remote remove origin # 移除对应的远程仓库地址
```

## 添加文件到工作区和将文件移出工作区

```bash
git add . # 添加全部文件
git reset HEAD filename # 将某个文件移出工作区
```

## 暂存文件

适用于文件未提交的同时，想切换其他分支修复bug的情况

```bash
git stash # 暂存本分支的修改，不用 commit
git stash list # 查看暂存栈
stash@{1}: WIP on dev: 04ae2bc fixed data message

git stash apply # 恢复暂存栈(默认恢复最近暂存的内容)
git stash apply stash@{1} # 恢复指定暂存内容

git stash drop stash@{1}        # 删除 stash@{1} 分支对应的缓存数据
git stash pop                   # 将最近一次暂存数据恢复并从栈中删除
```