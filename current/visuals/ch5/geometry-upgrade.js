/* Chapter 5 geometry-first interactive layer. */
(() => {
  const M = () => window.Ch5Math;
  const inline = (s) => (window.texInline ? window.texInline(s) : s);
  const $ = (r, s) => r.querySelector(s);
  const $$ = (r, s) => [...r.querySelectorAll(s)];
  const fmt = (v, d = 3) => M().formatNum(v, d);
  const TAU = Math.PI * 2;

  function eigen(A) {
    const a = A[0][0], b = A[0][1], c = A[1][1];
    const angle = 0.5 * Math.atan2(2 * b, a - c);
    return { values: M().eigenvalues2(A), vectors: [[Math.cos(angle), Math.sin(angle)], [-Math.sin(angle), Math.cos(angle)]] };
  }

  function arrow(ctx, a, b, color, width = 2) {
    const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
    const ux = dx / len, uy = dy / len, s = 8;
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = width;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(b.x, b.y);
    ctx.lineTo(b.x - ux * s - uy * s * 0.55, b.y - uy * s + ux * s * 0.55);
    ctx.lineTo(b.x - ux * s + uy * s * 0.55, b.y - uy * s - ux * s * 0.55);
    ctx.closePath(); ctx.fill();
  }

  function surface(canvas, A, title, point) {
    const { ctx, width, height } = M().setupCanvas(canvas); if (!ctx) return;
    const p = M().getPalette(), half = 1.7, res = width < 520 ? 22 : 30;
    const origin = { x: width * 0.5, y: height * 0.59 }, scale = Math.min(width * 0.255, height * 0.29), zScale = scale * 0.55;
    const project = (x, y, z) => ({ x: origin.x + (x - y) * scale * 0.92, y: origin.y + (x + y) * scale * 0.34 - Math.max(-3.6, Math.min(3.6, z)) * zScale, depth: x + y + z * 0.1 });
    const bg = ctx.createLinearGradient(0, 0, width, height); bg.addColorStop(0, p.soft); bg.addColorStop(1, p.surface);
    ctx.fillStyle = bg; ctx.fillRect(0, 0, width, height);
    ctx.save(); ctx.globalAlpha = 0.34; ctx.strokeStyle = p.line; ctx.lineWidth = 1;
    for (let k = -1.5; k <= 1.5; k += 0.5) {
      const a = project(-half, k, 0), b = project(half, k, 0), c = project(k, -half, 0), d = project(k, half, 0);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.moveTo(c.x, c.y); ctx.lineTo(d.x, d.y); ctx.stroke();
    }
    ctx.restore();
    const quads = [];
    for (let i = 0; i < res; i += 1) for (let j = 0; j < res; j += 1) {
      const x0 = -half + 2 * half * i / res, x1 = -half + 2 * half * (i + 1) / res;
      const y0 = -half + 2 * half * j / res, y1 = -half + 2 * half * (j + 1) / res;
      const pts = [[x0,y0],[x1,y0],[x1,y1],[x0,y1]].map(([x,y]) => { const z = M().qForm(A,[x,y]); return { ...project(x,y,z), z }; });
      quads.push({ pts, z: pts.reduce((s,v)=>s+v.z,0)/4, depth: pts.reduce((s,v)=>s+v.depth,0)/4 });
    }
    quads.sort((a,b)=>a.depth-b.depth).forEach((q) => {
      ctx.beginPath(); q.pts.forEach((v,i)=>i ? ctx.lineTo(v.x,v.y) : ctx.moveTo(v.x,v.y)); ctx.closePath();
      ctx.fillStyle = q.z >= 0 ? p.pos : p.neg; ctx.globalAlpha = 0.24; ctx.fill();
      ctx.strokeStyle = q.z >= 0 ? p.pos : p.neg; ctx.globalAlpha = 0.24; ctx.lineWidth = 0.7; ctx.stroke();
    });
    ctx.globalAlpha = 1;
    eigen(A).vectors.forEach((v, i) => {
      ctx.strokeStyle = i ? p.coral : p.accentStrong; ctx.lineWidth = 2.7; ctx.beginPath();
      for (let k = -36; k <= 36; k += 1) { const t = half * k / 36, x=v[0]*t, y=v[1]*t, s=project(x,y,M().qForm(A,[x,y])); k===-36?ctx.moveTo(s.x,s.y):ctx.lineTo(s.x,s.y); }
      ctx.stroke();
    });
    const o = project(0,0,0); arrow(ctx,o,project(1.65,0,0),p.text,1.3); arrow(ctx,o,project(0,1.65,0),p.text,1.3); arrow(ctx,o,project(0,0,2.1),p.text,1.3);
    ctx.fillStyle=p.muted; ctx.font="600 12px ui-sans-serif,system-ui"; ctx.fillText("x₁",project(1.65,0,0).x+4,project(1.65,0,0).y); ctx.fillText("x₂",project(0,1.65,0).x-17,project(0,1.65,0).y); ctx.fillText("q",project(0,0,2.1).x+5,project(0,0,2.1).y);
    if (point) { const z=M().qForm(A,point), a=project(point[0],point[1],0), b=project(point[0],point[1],z); ctx.strokeStyle=p.coral; ctx.setLineDash([4,4]); ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle=p.coral; ctx.beginPath(); ctx.arc(b.x,b.y,5,0,TAU); ctx.fill(); }
    ctx.fillStyle=p.surface; ctx.globalAlpha=.9; ctx.fillRect(14,14,Math.min(290,width-28),34); ctx.globalAlpha=1; ctx.fillStyle=p.text; ctx.font="800 14px ui-sans-serif,system-ui"; ctx.fillText(title,26,36);
  }

  function contour(canvas, A, caption) { M().drawContours(canvas, A, { caption, levels: [-2,-1,-.5,.5,1,2] }); }

  function wheel(canvas, A) {
    const { ctx, width, height } = M().setupCanvas(canvas); if (!ctx) return;
    const p=M().getPalette(), cx=width/2, cy=height/2, r=Math.min(width,height)*.31, values=[];
    ctx.fillStyle=p.soft; ctx.fillRect(0,0,width,height);
    for(let i=0;i<240;i+=1){const th=TAU*i/240,q=M().qForm(A,[Math.cos(th),Math.sin(th)]);values.push(q);ctx.strokeStyle=q>1e-4?p.pos:q<-1e-4?p.neg:p.coral;ctx.lineWidth=7;ctx.beginPath();ctx.arc(cx,cy,r,th,th+TAU/240+.015);ctx.stroke();}
    const min=Math.min(...values), max=Math.max(...values); ctx.fillStyle=p.text;ctx.font="800 22px ui-sans-serif,system-ui";ctx.textAlign="center";ctx.fillText(min>0?"全部 > 0":min===0?"接触 0":"出现 < 0",cx,cy-2);ctx.fillStyle=p.muted;ctx.font="12px ui-sans-serif,system-ui";ctx.fillText(`min ${fmt(min)} · max ${fmt(max)}`,cx,cy+22);ctx.textAlign="left";
  }

  function counts(inn){return `<div class="qv-counts"><span>正<strong>${inn.p}</strong></span><span>负<strong>${inn.q}</strong></span><span>零<strong>${inn.zero}</strong></span></div>`;}

  function mountS1(root){
    root.innerHTML=`<h2>交互实验</h2><div class="qv-lab"><header class="qv-head"><span>CONGRUENCE</span><h3>矩阵变了，曲面上的同一个高度没有变</h3><p>选择变量替换，再选择测试向量。左边先把 y 送到 x=Cy，右边用 B=CᵀAC 直接计算；两条路必须到达同一个高度。</p></header><div class="ch5-toolbar" role="group">${[["identity","不变"],["swap","交换变量"],["shear","剪切"],["scale","缩放"],["singular","奇异压缩"]].map(([k,l],i)=>`<button type="button" ${i?'':'class="is-active"'} data-s1-preset="${k}">${l}</button>`).join('')}</div><div class="qv-same"><figure><canvas data-s1-a-canvas></canvas><figcaption>先算 x=Cy，再看 xᵀAx</figcaption></figure><div class="qv-equals"><strong>=</strong><span>同一个数</span></div><figure><canvas data-s1-b-canvas></canvas><figcaption>在 y 坐标中直接看 yᵀBy</figcaption></figure></div><div class="ch5-toolbar" role="group">${[["e1","y=(1,0)"],["e2","y=(0,1)"],["sum","y=(1,1)"]].map(([k,l],i)=>`<button type="button" ${i?'':'class="is-active"'} data-s1-y="${k}">${l}</button>`).join('')}</div><div class="qv-data"><div><span>C</span><div class="ch5-matrix-wrap" data-s1-c></div></div><div><span>B=CᵀAC</span><div class="ch5-matrix-wrap" data-s1-b></div></div><div class="qv-values"><span>det C<strong data-s1-det></strong></span><span>x=Cy<strong data-s1-x></strong></span><span>xᵀAx<strong data-s1-left></strong></span><span>yᵀBy<strong data-s1-right></strong></span></div></div><div class="qv-result" data-s1-result><span class="ch5-status" data-s1-status></span><div><h4 data-s1-title></h4><p data-s1-copy></p></div></div></div>`;
    const A=[[2,.8],[.8,1.4]], presets={identity:[[1,0],[0,1]],swap:[[0,1],[1,0]],shear:[[1,.8],[0,1]],scale:[[1.5,0],[0,.65]],singular:[[1,1],[1,1]]},vectors={e1:[1,0],e2:[0,1],sum:[1,1]}; const state={p:'identity',v:'e1'}; const ctl=new AbortController();
    function paint(){const C=presets[state.p],B=M().symmetrize(M().congruence(A,C)),y=vectors[state.v],x=M().matVec(C,y),l=M().qForm(A,x),r=M().qForm(B,y),det=M().det2(C),ok=Math.abs(det)>1e-8;surface($(root,'[data-s1-a-canvas]'),A,'A · 原坐标',x);surface($(root,'[data-s1-b-canvas]'),B,'B · 新坐标',y);$(root,'[data-s1-c]').innerHTML=M().matrixHtml(C);$(root,'[data-s1-b]').innerHTML=M().matrixHtml(B);$(root,'[data-s1-det]').textContent=fmt(det,4);$(root,'[data-s1-x]').textContent=`(${x.map(v=>fmt(v)).join(', ')})`;$(root,'[data-s1-left]').textContent=fmt(l,4);$(root,'[data-s1-right]').textContent=fmt(r,4);const s=$(root,'[data-s1-status]');s.className=`ch5-status ${ok?'is-ok':'is-warn'}`;s.textContent=ok?'合同成立':'不是合同';$(root,'[data-s1-title]').textContent=ok?'坐标换了，二次型没有换':'一个方向被压掉，无法反解';$(root,'[data-s1-copy]').textContent=ok?'det C≠0，新旧变量可互相恢复；两个红点的高度完全相同。':'代数恒等式仍成立，但 det C=0，所以这不是非退化变量替换，也不能称为合同。';}
    $$(root,'[data-s1-preset]').forEach(b=>b.addEventListener('click',()=>{state.p=b.dataset.s1Preset;$$(root,'[data-s1-preset]').forEach(x=>x.classList.toggle('is-active',x===b));paint();},{signal:ctl.signal}));$$(root,'[data-s1-y]').forEach(b=>b.addEventListener('click',()=>{state.v=b.dataset.s1Y;$$(root,'[data-s1-y]').forEach(x=>x.classList.toggle('is-active',x===b));paint();},{signal:ctl.signal}));window.addEventListener('resize',paint,{signal:ctl.signal,passive:true});paint();return()=>ctl.abort();
  }

  function mountS2(root){
    root.innerHTML=`<h2>交互实验</h2><div class="qv-lab"><header class="qv-head"><span>COMPLETE THE SQUARE</span><h3>配方沿着代数步骤寻找一组可逆的解耦变量</h3><p>每前进一步，公式、矩阵和曲面同步更新。终点用三项核验：换元可逆、交叉项消失、秩保持。一般配方不要求正交。</p></header><div class="ch5-toolbar">${[["regular","含交叉项"],["cross","只有交叉项"],["rank1","退化为一个平方"],["indef","一正一负"]].map(([k,l],i)=>`<button type="button" ${i?'':'class="is-active"'} data-s2-preset="${k}">${l}</button>`).join('')}</div><div class="qv-stepbar"><span data-s2-step-count></span><button data-s2-nav="prev">上一步</button><button data-s2-nav="next">下一步</button><button data-s2-nav="reset">重置</button></div><div class="qv-progress" data-s2-progress></div><div class="qv-two"><section><div class="qv-step"><span data-s2-kicker></span><h4 data-s2-title></h4><div data-s2-poly></div><p data-s2-note></p></div><canvas class="qv-main-canvas" data-s2-canvas></canvas><p data-s2-look></p></section><aside><div><h4>当前替换 C</h4><div class="ch5-matrix-wrap" data-s2-c></div><p data-s2-substitution></p></div><div><h4>当前矩阵</h4><div class="ch5-matrix-wrap" data-s2-d></div></div><div class="qv-values"><span>det C<strong data-s2-det></strong></span><span>交叉项系数<strong data-s2-cross></strong></span><span>原秩<strong data-s2-rank-a></strong></span><span>当前秩<strong data-s2-rank-d></strong></span></div><div class="qv-result" data-s2-result><span class="ch5-status" data-s2-status></span><div><h4 data-s2-result-title></h4><p data-s2-result-copy></p></div></div></aside></div></div>`;
    const presets={regular:M().mat2FromAbc(1,2,5),cross:M().mat2FromAbc(0,1,0),rank1:M().mat2FromAbc(1,1,1),indef:M().mat2FromAbc(1,.5,-1)},state={p:'regular',step:0},ctl=new AbortController();
    function pack(){return M().completeSquareSteps2(presets[state.p]);}
    function paint(){const A=presets[state.p],pk=pack(),steps=pk.steps||[];state.step=M().clamp(state.step,0,Math.max(0,steps.length-1));const st=steps[state.step]||{title:'起点',poly:M().polyPlain2(A),note:'',kind:'start',matrix:A},C=st.C||M().identity(2),D=st.matrix||A,final=state.step===steps.length-1,det=M().det2(C),cross=2*D[0][1],ra=M().matrixRank(A),rd=M().matrixRank(D);$(root,'[data-s2-step-count]').textContent=`第 ${state.step+1} 步 / ${steps.length}`;$(root,'[data-s2-progress]').style.setProperty('--p',`${100*(state.step+1)/steps.length}%`);$(root,'[data-s2-kicker]').textContent=st.kind==='done'?'标准形':'当前步骤';$(root,'[data-s2-title]').textContent=st.title;$(root,'[data-s2-poly]').innerHTML=inline(st.poly.replace(/²/g,'^2').replace(/x₁/g,'x_1').replace(/x₂/g,'x_2').replace(/y₁/g,'y_1').replace(/y₂/g,'y_2'));$(root,'[data-s2-note]').textContent=st.note;$(root,'[data-s2-look]').textContent=final?'标准形已得到：代数上交叉项为 0。请用 det C≠0 与秩保持完成证明。':'曲面帮助观察表达变化；配方是否完成，要以换元可逆、交叉项消失和秩保持为准。';$(root,'[data-s2-c]').innerHTML=M().matrixHtml(C);$(root,'[data-s2-d]').innerHTML=M().matrixHtml(D);$(root,'[data-s2-substitution]').textContent=st.C?(pk.method==='sumdiff'?'和差替换：x₁=(y₁+y₂)/2，x₂=(y₁−y₂)/2。':'已经写出 x=Cy，新旧变量可互相恢复。'):'尚未定义新变量，C 为单位矩阵。';$(root,'[data-s2-det]').textContent=fmt(det,4);$(root,'[data-s2-cross]').textContent=fmt(cross,6);$(root,'[data-s2-rank-a]').textContent=ra;$(root,'[data-s2-rank-d]').textContent=rd;surface($(root,'[data-s2-canvas]'),D,final?'标准形 · 变量已解耦':'当前二次型');const s=$(root,'[data-s2-status]');if(final){const ok=Math.abs(det)>1e-8&&Math.abs(cross)<1e-7&&ra===rd;s.className=`ch5-status ${ok?'is-ok':'is-warn'}`;s.textContent=ok?'标准形完成':'还需检查';$(root,'[data-s2-result-title]').textContent=ok?'可逆、无交叉项、秩保持':'尚未闭环';$(root,'[data-s2-result-copy]').textContent=ok?'三项同时成立，说明这一步确实是合同化标准形。':'检查变量替换和最终矩阵。';}else{s.className='ch5-status';s.textContent='处理中';$(root,'[data-s2-result-title]').textContent='还没有到终点';$(root,'[data-s2-result-copy]').textContent='结合公式与曲面，继续核对当前是否仍有交叉项。';}}
    $$(root,'[data-s2-preset]').forEach(b=>b.addEventListener('click',()=>{state.p=b.dataset.s2Preset;state.step=0;$$(root,'[data-s2-preset]').forEach(x=>x.classList.toggle('is-active',x===b));paint();},{signal:ctl.signal}));$$(root,'[data-s2-nav]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.s2Nav==='next')state.step+=1;if(b.dataset.s2Nav==='prev')state.step-=1;if(b.dataset.s2Nav==='reset')state.step=0;paint();},{signal:ctl.signal}));window.addEventListener('resize',paint,{signal:ctl.signal,passive:true});paint();return()=>ctl.abort();
  }

  function mountS3(root){
    root.innerHTML=`<h2>交互实验</h2><div class="qv-lab"><header class="qv-head"><span>INERTIA LOCK</span><h3>可逆变换可以扭曲曲面，却改不了向上、向下和平坦方向的数量</h3><p>拖动剪切参数 h。左右曲面的倾斜程度明显变化，但下方三个计数必须锁定。</p></header><div class="ch5-toolbar">${[["positive","两个正方向"],["indefinite","一正一负"],["rank1","一正一零"]].map(([k,l],i)=>`<button type="button" ${i===1?'class="is-active"':''} data-s3-preset="${k}">${l}</button>`).join('')}</div><label class="ch5-range"><span>剪切参数 h</span><input type="range" min="-1.5" max="1.5" step=".05" value="0" data-s3-h><output data-s3-h-value>0</output></label><div class="qv-same"><figure><canvas data-s3-a-canvas></canvas><figcaption>原曲面 A<div data-s3-a-counts></div></figcaption></figure><div class="qv-equals"><strong>CᵀAC</strong><span>可逆时只换坐标</span></div><figure><canvas data-s3-b-canvas></canvas><figcaption>变换后 B<div data-s3-b-counts></div></figcaption></figure></div><div class="qv-data"><div><span>C</span><div class="ch5-matrix-wrap" data-s3-c></div></div><div><span>A</span><div class="ch5-matrix-wrap" data-s3-a></div></div><div><span>B</span><div class="ch5-matrix-wrap" data-s3-b></div></div><div class="qv-values"><span>det C<strong data-s3-det></strong></span><span>A 的多项式<strong data-s3-poly-a></strong></span><span>B 的多项式<strong data-s3-poly-b></strong></span></div></div><div class="qv-actions"><button data-s3-singular>让替换奇异</button><button data-s3-reset>恢复可逆</button></div><div class="qv-result" data-s3-result><span class="ch5-status" data-s3-status></span><div><h4 data-s3-title></h4><p data-s3-copy></p></div></div></div>`;
    const presets={positive:[[2,.35],[.35,1]],indefinite:[[1,.3],[.3,-1]],rank1:[[1,1],[1,1]]},state={p:'indefinite',h:0,singular:false},ctl=new AbortController();
    function C(){return state.singular?[[1,1],[1,1]]:[[1,state.h],[0,1]];}
    function paint(){const A=presets[state.p],c=C(),B=M().symmetrize(M().congruence(A,c)),det=M().det2(c),ok=Math.abs(det)>1e-8,ia=M().inertiaSymmetric(A),ib=M().inertiaSymmetric(B),same=ia.p===ib.p&&ia.q===ib.q&&ia.zero===ib.zero;$(root,'[data-s3-h]').value=state.h;$(root,'[data-s3-h]').disabled=state.singular;$(root,'[data-s3-h-value]').textContent=state.singular?'—':fmt(state.h,2);$(root,'[data-s3-a]').innerHTML=M().matrixHtml(A);$(root,'[data-s3-b]').innerHTML=M().matrixHtml(B);$(root,'[data-s3-c]').innerHTML=M().matrixHtml(c);$(root,'[data-s3-det]').textContent=fmt(det,4);$(root,'[data-s3-a-counts]').innerHTML=counts(ia);$(root,'[data-s3-b-counts]').innerHTML=counts(ib);$(root,'[data-s3-poly-a]').textContent=M().polyPlain2(A);$(root,'[data-s3-poly-b]').textContent=M().polyPlain2(B);surface($(root,'[data-s3-a-canvas]'),A,'A · 原曲面');surface($(root,'[data-s3-b-canvas]'),B,'B · 变换后');const s=$(root,'[data-s3-status]');s.className=`ch5-status ${ok&&same?'is-ok':'is-warn'}`;s.textContent=ok?(same?'惯性锁定':'数值异常'):'合同停止';$(root,'[data-s3-title]').textContent=ok?'形状被拉斜，符号骨架没有变':'一个方向被真正丢失';$(root,'[data-s3-copy]').textContent=ok?'det C≠0，正、负、零方向数量与 A 完全一致。':'det C=0，平面被压到一条线，合同的可逆前提已经失效；惯性定理仍然成立。';}
    $$(root,'[data-s3-preset]').forEach(b=>b.addEventListener('click',()=>{state.p=b.dataset.s3Preset;state.h=0;state.singular=false;$$(root,'[data-s3-preset]').forEach(x=>x.classList.toggle('is-active',x===b));paint();},{signal:ctl.signal}));$(root,'[data-s3-h]').addEventListener('input',e=>{state.h=Number(e.target.value);state.singular=false;paint();},{signal:ctl.signal});$(root,'[data-s3-singular]').addEventListener('click',()=>{state.singular=true;paint();},{signal:ctl.signal});$(root,'[data-s3-reset]').addEventListener('click',()=>{state.singular=false;state.h=0;paint();},{signal:ctl.signal});window.addEventListener('resize',paint,{signal:ctl.signal,passive:true});paint();return()=>ctl.abort();
  }

  function mountS4(root){
    root.innerHTML=`<h2>交互实验</h2><div class="qv-lab"><header class="qv-head"><span>BOWL → VALLEY → SADDLE</span><h3>正定性就是曲面是否在每个方向都向上</h3><p>改变交叉项 t，让 ${inline('A(t)=\\begin{bmatrix}1&t\\\\t&1\\end{bmatrix}')} 连续跨过正定边界。</p></header><div class="ch5-toolbar">${[[0,'圆碗'],[.8,'狭长碗'],[1,'平底山谷'],[1.2,'马鞍']].map(([t,l],i)=>`<button type="button" ${i?'':'class="is-active"'} data-s4-preset="${t}">t=${t} · ${l}</button>`).join('')}</div><label class="ch5-range"><span>连续调节 t</span><input type="range" min="-1.5" max="1.5" step=".01" value="0" data-s4-t><output data-s4-t-value>0</output></label><div class="qv-hero"><canvas data-s4-surface></canvas><div><span class="ch5-status" data-s4-status></span><h4 data-s4-title></h4><p data-s4-scan-copy></p></div></div><div class="qv-three"><figure><canvas data-s4-scan></canvas><figcaption>单位圆全部方向</figcaption></figure><figure><canvas data-s4-contour></canvas><figcaption data-s4-contour-copy></figcaption></figure><aside><div class="ch5-matrix-wrap" data-s4-matrix></div><div class="qv-values"><span>λ₊=1+t<strong data-s4-lp></strong></span><span>λ₋=1−t<strong data-s4-lm></strong></span><span>Δ₁<strong data-s4-d1></strong></span><span>Δ₂=1−t²<strong data-s4-d2></strong></span><span>最小方向值<strong data-s4-min></strong></span><span>二次型<strong data-s4-poly></strong></span></div></aside></div><div class="qv-result" data-s4-result><span class="ch5-status" data-s4-status-copy></span><div><h4 data-s4-result-title></h4><p data-s4-copy></p></div></div></div>`;
    const state={t:0},ctl=new AbortController();
    function paint(){const A=[[1,state.t],[state.t,1]],cls=M().classify2(A),d2=1-state.t*state.t,min=1-Math.abs(state.t),inside=Math.abs(state.t)<1-1e-8,edge=Math.abs(Math.abs(state.t)-1)<=1e-8;$(root,'[data-s4-t]').value=state.t;$(root,'[data-s4-t-value]').textContent=fmt(state.t,2);$(root,'[data-s4-matrix]').innerHTML=M().matrixHtml(A);$(root,'[data-s4-poly]').textContent=M().polyPlain2(A);$(root,'[data-s4-lp]').textContent=fmt(1+state.t);$(root,'[data-s4-lm]').textContent=fmt(1-state.t);$(root,'[data-s4-d1]').textContent='1 > 0';$(root,'[data-s4-d2]').textContent=`${fmt(d2,4)} ${d2>1e-8?'> 0':Math.abs(d2)<=1e-8?'= 0':'< 0'}`;$(root,'[data-s4-min]').textContent=fmt(min,4);surface($(root,'[data-s4-surface]'),A,`q_t · ${cls.label}`);wheel($(root,'[data-s4-scan]'),A);contour($(root,'[data-s4-contour]'),A,'俯视：椭圆 → 平行线 → 双曲线');[$(root,'[data-s4-status]'),$(root,'[data-s4-status-copy]')].forEach(s=>{s.textContent=cls.label;s.className=`ch5-status ${inside?'is-ok':'is-warn'}`;});if(inside){$(root,'[data-s4-title]').textContent='每个方向都向上：碗面';$(root,'[data-s4-scan-copy]').textContent='方向轮全部在 0 上方，没有任何向下方向。';$(root,'[data-s4-contour-copy]').textContent='等高线是椭圆；越接近边界越狭长。';$(root,'[data-s4-result-title]').textContent='几何与 Sylvester 判据一致';$(root,'[data-s4-copy]').textContent='两个特征值都大于 0，同时 Δ₁>0、Δ₂>0，所以正定。';}else if(edge){$(root,'[data-s4-title]').textContent='一个方向变平：山谷';$(root,'[data-s4-scan-copy]').textContent='方向轮恰好接触 0，但没有进入 0 下方。';$(root,'[data-s4-contour-copy]').textContent='椭圆退化成平行线，沿零方向高度不变。';$(root,'[data-s4-result-title]').textContent='正定边界：秩降为 1';$(root,'[data-s4-copy]').textContent='最小特征值与 Δ₂ 同时等于 0，因此半正定。';}else{$(root,'[data-s4-title]').textContent='一个方向向下：马鞍';$(root,'[data-s4-scan-copy]').textContent='方向轮已经出现 0 下方的负方向；曲面同时向上和向下。';$(root,'[data-s4-contour-copy]').textContent='等高线变为双曲线，分界方向满足 q(x)=0。';$(root,'[data-s4-result-title]').textContent='正、负方向同时出现';$(root,'[data-s4-copy]').textContent='两个特征值一正一负，Δ₂<0，所以不定。';}}
    $$(root,'[data-s4-preset]').forEach(b=>b.addEventListener('click',()=>{state.t=Number(b.dataset.s4Preset);$$(root,'[data-s4-preset]').forEach(x=>x.classList.toggle('is-active',x===b));paint();},{signal:ctl.signal}));$(root,'[data-s4-t]').addEventListener('input',e=>{state.t=Number(e.target.value);$$(root,'[data-s4-preset]').forEach(x=>x.classList.toggle('is-active',Number(x.dataset.s4Preset)===state.t));paint();},{signal:ctl.signal});window.addEventListener('resize',paint,{signal:ctl.signal,passive:true});paint();return()=>ctl.abort();
  }

  const mounts={"quadratic-matrix":mountS1,"quadratic-standard-form":mountS2,"quadratic-uniqueness":mountS3,"positive-definite":mountS4};
  window.defineChapter5LessonEnhancer?.((section, root) => { const fn=mounts[section?.id]; if(!fn)return; const target=root.querySelector(`#${CSS.escape(section.id)}-interactive`); return fn(target); });
})();
