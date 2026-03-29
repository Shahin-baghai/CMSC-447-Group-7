# CMSC-447-Group-7
Vending Machine Project

## GENERAL GIT WORKFLOW
1. `git pull origin main` - fetches all commits from remote repo (keeps you updated)
2. `git checkout -b <my_branch>` - creates a new branch and moves onto it (prevents you from directly editing main branch) **OR**
   `git switch <my_branch>` - moves onto a branch that already exists in your local repo (also prevents you from directly editing main branch)
4. Work on your code here
5. `git add .` - stages changes (tracks your most recent changes)
6. `git commit -m "<my_changes>"` - commits changes to local repo (DOES NOT upload it to remote repo yet)
7. `git push origin <my-branch>` - uploads branch to remote repo (DOES NOT merge it with main branch yet)
8. Pull Requests - we'll have to figure this out, but basically somebody has to submit a Pull Request for their branch to be merged, and then somebody else has to approve the Pull Request and merge the branch to main
