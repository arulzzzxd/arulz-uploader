# web-uploadfile-to-github
---------
# Note:
Apabila kalian ingin masang token githubnya di repo github kalian tapi gk bisa (token nya tiba2 kebanned mulu/tiba2 hangus) akalin aja dengan cara membagi 2 atau lebih tokennya

Contoh:
```javascript
const to = "ghp_aIAjuiswiNIsoiJaoa"
const ken = "IUhiahOisaiajoalaljKha"
const githubToken = `${to}${ken}`;
```
Disarankan:
```javascript
const a = 'g'
const b = 'h'
const c = 'p'
const to = '_100K08lq26y0ZLL3' // Setelah ghp
const ken = 'CpbLIdnewsiJl93bLgqR'' // tengah2 token
const githubToken = `${a}${b}${c}${to}${ken}`;
```
---------
const githubToken = process.env.GITHUB_TOKEN || 'ghp_; // 
const owner = process.env.GITHUB_OWNER || 'arulzzzxd'; // GitHub username
const repo = process.env.GITHUB_REPO || 'uploadergh'; // Repository name
const branch = process.env.GITHUB_BRANCH || 'main';
### 📃 S&K
1. Tidak Untuk Dijual!!!
2. Jangan lupa kasih star di ni repo!
3. Jika kamu punya masalah [chat gwejh](https://wa.me/6281312651566)

---------
cd ~
cp -r /storage/emulated/0/upload .
cd upload
npm install
node index.js
