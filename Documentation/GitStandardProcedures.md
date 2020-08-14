# Correct usage of git
To avoid messy merge conflicts and double work and work with maximum effectiveness, there are best practice procedures, which when followed lead to increasing the probability of the core application being functional at all times, whilst no one having to do unnecessary extra work.

## Core philosophy
The core philosopy is to always keep a functional version or copy of the code in Github or an alternative location. This means, in case there does happen to be a mess up, it will always be possible to copy the functional GitHub version to start over. Likewise, this increases the odds that the application is always working for everyone using it.

## Core practice
1. When starting work, create a new branch (git branch < new-branch-name >).
2. Upon the completion of work, commit your work in that branch ("git add ." & "git commit -m "explanatory message"). 
3. Checkout to the core (git checkout < core-branch >), master branch and perform a pull request (git pull / git pull origin master) to make sure your master branch is up to date and has the latest updates.
4. Once your master branch is up to date and in sync with the latest version, then do final tests to make sure everything works.
5. Now make sure you're in the core or master branch and now merge the new worked on branch with the master branch by doing (git merge < new-branch >), and then push to Github or wherever your code is stored (git push origin master).

## Other good practices
1. Make clean, single-purpose commits -- one bug at a time.
2. Write meaningful commit messages describing exactly the changes done.
3. Commit early, commit often -- prefer smaller chunks over big ones.

## Good to know
- To see all branches and which branch you're currently on, use 'git branch'
- To delete a local branch, use 'git branch -d < branch-name >.
- To force delete a local branch, use capital -D instead: 'git branch -D < branch-name >
- To delete remote branch (branch in for example Github), use 'git push origin --delete < branch-name >', 'origin' being the < remote > name.