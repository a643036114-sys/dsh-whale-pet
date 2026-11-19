const fs=require("fs");
const body=fs.readFileSync(process.argv[2],"utf8");
try{const fn=new Function(body);console.log("✅ 解析通过, 长度",fn.toString().length);}
catch(e){console.log("❌ 解析失败:",e.message);process.exit(1);}
