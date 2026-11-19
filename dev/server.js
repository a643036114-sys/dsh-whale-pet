const http = require("http");
const fs = require("fs");
const { join } = require("path");
const dir = __dirname;
const HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>一键装鲸鱼</title>
<style>body{font-family:"Microsoft YaHei",system-ui;background:#eef8ff;color:#24506e;
display:flex;align-items:center;justify-content:center;height:100vh;margin:0}
.box{background:#fff;padding:28px 34px;border-radius:16px;box-shadow:0 10px 30px rgba(70,150,215,.18);max-width:620px}
h2{margin:0 0 6px}.ok{color:#1a9e5c;font-weight:700}.warn{color:#c0392b}
code{background:#f2f7fb;padding:2px 6px;border-radius:5px}
pre{background:#f7fbff;border:1px solid #dceaf5;padding:14px;border-radius:10px;overflow:auto;font-size:13px;line-height:1.7}
</style></head><body><div class="box">
<h2>🐋 一键装鲸鱼</h2>
<p>你正在看的这个 DSH 页面，鲸鱼将被装进它的界面里。</p>
<pre id="out">正在检测…</pre>
</div>
<script>
window.__whaleOff && window.__whaleOff();
var f = document.createElement('iframe');
f.style.cssText = 'position:fixed;left:-9999px;width:1200px;height:800px;';
f.src = 'http://127.0.0.1:3080/';
document.body.appendChild(f);
var out = document.getElementById('out');
setTimeout(function(){
  var ok = false;
  try {
    var d = f.contentDocument;
    if (d && d.body) {
      var s = d.createElement('script');
      s.textContent = window.__whaleSrc || '';
      d.body.appendChild(s);
      ok = !!f.contentWindow.__whaleOff;
    }
  } catch (e) {
    out.innerHTML = '<span class="warn">跨域被拦住了</span>：' + e.message +
      '\\n\\n请改用下面这条命令（在 DSH 页面的控制台里执行）：\\n<code>fetch(\'http://127.0.0.1:8799/whale.js\').then(r=>r.text()).then(eval)</code>';
    return;
  }
  out.innerHTML = ok ? '<span class="ok">✅ 已注入！</span> 去看 DSH 页面右下角。'
                     : '<span class="warn">注入失败</span>：请用 <code>fetch(...)</code> 方式。';
}, 2500);
</script></body></html>`;
http.createServer(function(req,res){
  // 允许 DSH 页面（127.0.0.1:3080）跨端口取脚本
  var cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "*"
  };
  if (req.method === "OPTIONS") {
    res.writeHead(204, cors);
    res.end();
    return;
  }
  if (req.url.indexOf("/whale.js") === 0) {
    var h = { "Content-Type": "application/javascript; charset=utf-8" };
    for (var k in cors) h[k] = cors[k];
    res.writeHead(200, h);
    res.end(fs.readFileSync(join(dir, "whale-gui-v2.js")));
    return;
  }
  var h2 = { "Content-Type": "text/html; charset=utf-8" };
  for (var k2 in cors) h2[k2] = cors[k2];
  res.writeHead(200, h2);
  res.end(HTML);
}).listen(8799, "127.0.0.1", function(){
  console.log("whale server: http://127.0.0.1:8799/");
});
