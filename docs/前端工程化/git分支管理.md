---
title: git分支管理
date: 2021-01-28
categories:
  - 前端工程化
tags:
  - git
---

# git 常用操作


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
```

## 暂存修改(stash)和切换分支(checkout)

问题

当本地遇到特殊情况，需要切换到其他分支时，当前分支可能会存在以下两种可能：

(1) 对当前分支并未进行任何修改，从而可以直接使用 git checkout 命令切换到其他分支。

```bash
    git checkout test        # 切换到 test 分支
```

(2) 若当前的分支已经做了一定的修改，则直接进行分支切换时，git 会产生如下错误信息。这是由于已经对当前分支进行了修改，但尚未保存而导致的。

error: Your local changes to the following files would be overwritten by checkout : xxxx

Please commit your changes or stash them before you switch branches

下面描述当前分支存在修改时，切换到其他分支的解决方案。具体而言，选择包括简单的丢弃当前分支的修改和保存当前分支信息，待其他分支完成后再进行恢复

### 丢弃本分支的修改

下面的方法直接将当前分支相对上一次提交时的修改丢弃，从而可以从当前分支切换至其他分支，主要适合于对当前分支的改动较少，且不存在丢弃修改产生的问题的情况。用户可以使用不同的命令实现丢弃本地分支的修改。

通过 git checkout -f 命令强制切换分支

当用户对当前分支的修改不是特别重要或觉得没有保留的必要时，可以使用 git checkout 命令强制切换到其他分支。再切换回该分支时，会直接退回到该分支上一次提交时的数据版本。

```bash
git checkout -f test        # 强制切换至 test 分支，丢弃当前分支的修改
```

通过 git reset --hard 回退至某次提交时的数据

如果只需要保持当前分支上一次提交时的数据，而不需要目前添加的任何修改，可以使用 git log 查看当前分支的提交记录。再通过 git reset --hard 命令将当前分支回退到前一次提交时的数据，此时当前分支针对上一次提交的修改均被抹除，注意 git reset --hard 在运行时不会有提示，所以使用前请保证新增的修改是可丢弃的。

通过 git log 查看当前分支的提交记录。

```bash
git log        # 当前分支的提交记录
```

通过 git reset --hard 命令回退到某一次提交的版本，上述命令只需要使用特定提交的哈希值的开始若干位作为参数，即可退回该提交时的数据。

```bash
git reset --hard a13f52f3        # 当前分支数据重置到哈希值开始部分
```

当重置完成后，当前分支的数据即为被 git 记录的未经修改的数据，此时可以直接通过 git checkout 命令切换到其他分支，而不会再产生报错。

通过 git checkout -- 命令忽略文件的修改

当使用 git status 查看当前分支的文件状态时，对于不同的文件状态，git status 会提示该状态下的文件可以使用的对应 git 命令

可以看到，对于处于 Changes to be commited 状态的文件( 该状态的文件在使用 git commit 命令时即被提交 )，可以通过 git reset HEAD 命令将文件从 Changes to be commited 状态退出。

```bash

git reset HEAD test.txt        # 将 test.txt 从 Changes to be committed 状态退出
```

对于 Changes not staged for commit 状态的文件，表示这些文件虽然被修改，但并没有被加入 Changes to be commited 状态，即使用 git commit 命令提交时，这些修改不会被记录。针对这类文件可以有两种选择。可以使用 git add 命令将这些修改放入 Changes to be committd 状态，或者通过 git checkout -- 命令忽略该文件的修改，使其回退到上一次提交时的状态。( git 中不同文件的状态可以参见笔者的另一篇笔记 git 学习记录—— git 中的仓库、文件状态、修改和提交操作等 )

```bash
 #将 test.txt 文件加入 Changes to be committed 状态,在使用 git commit 命令时上述修改即被提交
git add test.txt
 # 丢弃对 test.txt 的修改，其内容回退到上一次提交时的状态
git checkout -- test.txt

```

无法直接切换其他分支的原因即是存在未被保存的修改。此时若想要丢弃当前分支的修改，直接使用 git checkout -- 命令将文件修改丢弃即可。该方法主要适用于产生的改动比较少且相对不重要的情况。

```bash
git checkout -- test.txt        # 丢掉 test.txt 文件新增的修改
```

保留当前分支的修改

另外一种进行切换的选择是先将当前分支的修改保存，再切换到其他分支，这样在其他分支的任务完成后，重新切换至当前分支时，可以继续当前分支的工作。

### 直接提交当前分支

最简单粗暴的方法即通过 git commit 命令将当前分支的修改进行提交。首先通过 git status 命令查看当前分支各个文件的状态，git status 命令还会显示不同文件状态下 git 可执行的命令，用户可以直接参考。

```bash
    git status              # 当前分支各文件的状态
```

通过 git add 命令将修改后的文件转化为 staged 状态，即文件的修改将处于 Changes to be committed 状态，再通过 git commit 命令将本分支的修改提交。

```bash
    git add test.txt        # 将此时的 test.txt 文件添加至 Changes to be committed 状态

```

在所需的修改均加入 Changes to be committed 状态后，可以通过 git commit 命令将本分支的修改提交。不需要的修改通过上文提到的 git checkout -- 命令重置即可。

```bash
    git commit -m "description for this commit"    # 提交本次修改
```

将当前分支修改暂存

在任务推进过程中，可能遇到需要切换到其他分支进行处理的情况。但是对应的，对于当前分支的修改可能并不足以达到需要进行一次提交的程度，此时更合适的方案是将本分支修改暂存，然后切换到其他分支进行工作，待其他分支的任务完成后，再切换回本分支，并将暂存的方案恢复，进而继续本分支的修改。

git 中提供 git stash 命令来完成上述功能，也就是上文提到的错误提示中 "Please commit your changes or stash them before you switch branches" 中所提到的 stash 修改的方案。

### 暂存修改

通过 git stash 命令将当前分支的修改暂存。经过 git stash 命令暂存修改的数据后，再使用 git status 命令可以看到文件的状态均处于未修改的状态( 而不再是修改未提交状态 )。

```bash
    git stash              # 暂存本分支的修改
```

显示对应的 "Saved working directory and index state WIP on master :xxxxxxx" 信息。
用户可以多次使用 git stash 命令，暂存的状态会以栈的形式存放。

### 查看暂存信息

可以通过命令 git stash list 查看已经暂存的数据。 可以看到暂存的数据通过 stash@{n} 的形式索引已经存储的修改数据。

```bash

git stash list        # 显示所有 stash 的数据
stash@{0}: WIP on devForm: 820c300 update devForm
stash@{1}: WIP on dev: 04ae2bc fixed data message
```

恢复修改

当在其他分支的任务完成切换回当前分支后，可以使用 git stash apply 命令恢复之前被暂存的数据。

```bash
git stash apply                # 恢复最近一次暂存的修改
git stash apply stash@{1}      # 恢复索引 stash@{2} 对应的暂存的修改，索引可以通过 git stash list 进行查看
```

这里需要注意的是，通过 git stash apply 命令只会将暂存的数据恢复至 "Changes not staged for committed" 状态，即使之前修改状态中已经有文件处于 staged 状态( Changes to be committed ).为了 git 能够将文件尽可能恢复至暂存之前的状态，可以加入 --index 参数。

```bash
git stash apply --index        # 在恢复暂存数据时尽量恢复至原状态( 已经 staged 状态的文件仍恢复为 staged 状态 )

```

可以通过 git stash pop 或者 drop 删除暂存修改

```bash

git stash drop stash@{1}        # 删除 stash@{1} 分支对应的缓存数据
git stash pop                   # 将最近一次暂存数据恢复并从栈中删除
```

git stash 将用户做过的修改存放在本次 git stash 产生的暂存数据中，并将已经修改的文件恢复至未修改状态。当用户恢复暂存数据时，则将上述修改应用到当前分支上。

在本文的情景中，即将当前分支的修改通过 git stash 保存，此时当前分支恢复至未被修改之前的状态，而修改被 git stash 以栈的方式保存，可通过索引的方式访问。用户此时可以没有错误的切换至其他分支( 文件均处于未修改状态 )，待其他分支的任务完成后，再切换回本分支。此时通过 git stash apply 将被暂存的修改应用到当前分支，则当前分支的数据即被恢复至离开当前分支前的状态。

从原理也可以看出，git stash apply 实际是可以应用到任意分支的，此时执行的操作是将 git stash 保存的修改合并到 git stash apply 时用户所在的分支和文件，当合并存在问题时，git 会产生报错。
