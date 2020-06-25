Guide on how to release Time To Leave:

1 - Make sure the master and ci branches are updated
2 - `git checkout ci`
3 - `git merge master --no-ff`
4 - Update all entries in `changelog.txt` and on `package.json` to the next version
5 - `git commit -am "Release vX.Y.Z`
6 - `git tag -a stable/vX.Y.Z`
7 - `git push origin ci stable/v.X.Y.Z`
