
(async function(){
  const $ = (s, el=document)=>el.querySelector(s);
  const $$ = (s, el=document)=>Array.from(el.querySelectorAll(s));
  const mount = $('#mount');
  const status = $('#status');

  const data = {
    s1: await fetch('data_s1.json').then(r=>r.json()).catch(()=>[]),
    s2: await fetch('data_s2.json').then(r=>r.json()).catch(()=>[]),
    s3: await fetch('data_s3.json').then(r=>r.json()).catch(()=>[]),
    s4: await fetch('data_s4.json').then(r=>r.json()).catch(()=>[]),
  };

  // -------- utilities --------
  const cc = (s)=>[...s].length;
  const lsget=(k,def="")=>{ try{ const v=localStorage.getItem(k); return v==null?def:v; }catch{ return def; } };
  const lsset=(k,v)=>{ try{ localStorage.setItem(k,v); }catch{} };

  function setTab(tab){
    $$('.tab').forEach(b=>{
      const on=b.dataset.tab===tab;
      b.classList.toggle('active', on);
    });
    status.textContent = tab.toUpperCase();
    render[tab]();
    history.replaceState(null,"","#"+tab);
  }

  // -------- S1 --------
  
  // -------- S1 --------
  function renderS1(){
    const items = data.s1 || [];
    if (!items.length){
      mount.innerHTML = `<section class="card"><div class="kicker">S1</div><div class="hint">S1データが読み込めませんでした。</div></section>`;
      return;
    }
    let idx = parseInt(lsget("S1_idx","0"),10); if (isNaN(idx)) idx=0; idx = ((idx%items.length)+items.length)%items.length;
    let modelVisible = lsget("S1_model","0")==="1";

    mount.innerHTML = `
      <section class="card">
        <div class="card-h">
          <div><div class="kicker">問題</div></div>
          <div class="right">
            <div class="pill" id="s1meta">S1-${idx+1}/${items.length}</div>
            <button class="iconbtn" id="s1prev" type="button">◀︎</button>
            <select id="s1sel"></select>
            <button class="iconbtn" id="s1next" type="button">▶︎</button>
          </div>
        </div>
        <div id="s1theme" class="linebox"></div>
      </section>

      <section class="card">
        <div class="card-h">
          <div><div class="kicker">あなたの回答（2行想定）</div></div>
          <div class="right"><div class="counter" id="s1count">0 文字（目標 80）</div></div>
        </div>
        <textarea id="s1ta" placeholder="【現状】＋【出来事】により、&#10;【葛藤A】と【葛藤B】の間で揺れ、今後どのようにすればよいか悩んでいる。&#10;&#10;①万能：～したいとの思い、〜すべきとの思い&#10;②価値対立：〜を優先すべきとの思い&#10;③安定側：〜を維持したい思い、～を続けたい思い&#10;④挑戦側：〜に踏み出すべきとの思い&#10;⑤改善系：〜を見直すべきとの思い"></textarea>
        <div class="hint small">※問題ごとに自動保存</div>
        <div class="tools" style="margin-top:10px">
          <button class="btn" id="s1clear">この回答を消す</button>
          <button class="btn" id="s1copy">回答をコピー</button>
          <button class="btn" id="s1toggleModel">模範を表示</button>
        </div>
      </section>

      <section class="card">
        <div class="card-h"><div class="kicker">模範</div></div>
        <div id="s1model" class="model"></div>
      </section>
    `;

    const meta = $('#s1meta');
    const sel = $('#s1sel');
    const box = $('#s1theme');
    const ta = $('#s1ta');
    const model = $('#s1model');
    const count = $('#s1count');

    // build options
    items.forEach((it,i)=>{
      const opt=document.createElement('option');
      opt.value=String(i);
      const head = (it.theme || it.q || it.title || `S1-${i+1}`);
      opt.textContent = `S1-${i+1}｜${head.replaceAll("\n"," ")}`;
      sel.appendChild(opt);
    });
    sel.value = String(idx);

    function renderProblem(){
      const cur = items[idx];
      meta.textContent = `S1-${idx+1}/${items.length}`;
      const head = (cur.theme || cur.q || cur.title || "");
      const body = (cur.prompt || cur.question || "");
      box.innerHTML =
        `<div style="font-weight:900; margin-bottom:8px">${head}</div>` +
        `<div style="white-space:pre-wrap; line-height:1.8; color: rgba(232,238,252,.85)">${body}</div>`;
      model.textContent = cur.answer || cur.model || cur.a || cur.sample || "";
      model.style.display = modelVisible ? "block" : "none";
      $('#s1toggleModel').textContent = modelVisible ? "模範をクリア" : "模範を表示";

      const keyAns = `S1_ans_${idx}`;
      ta.value = lsget(keyAns, "");
      const n = cc(ta.value);
      count.textContent = `${n} 文字（目標 80）`;
    }

    function saveAndCount(){
      const keyAns = `S1_ans_${idx}`;
      lsset(keyAns, ta.value);
      const n=cc(ta.value);
      count.textContent = `${n} 文字（目標 80）`;
    }

    $('#s1prev').addEventListener('click', ()=>{
      idx = (idx - 1 + items.length) % items.length;
      lsset("S1_idx", String(idx));
      sel.value = String(idx);
      renderProblem();
    });
    $('#s1next').addEventListener('click', ()=>{
      idx = (idx + 1) % items.length;
      lsset("S1_idx", String(idx));
      sel.value = String(idx);
      renderProblem();
    });
    sel.addEventListener('change', ()=>{
      idx = parseInt(sel.value,10);
      lsset("S1_idx", String(idx));
      renderProblem();
    });

    ta.addEventListener('input', saveAndCount);
    $('#s1clear').addEventListener('click', ()=>{ ta.value=""; saveAndCount(); });
    $('#s1copy').addEventListener('click', async ()=>{ try{ await navigator.clipboard.writeText(ta.value);}catch{} });
    $('#s1toggleModel').addEventListener('click', ()=>{
      modelVisible = !modelVisible;
      lsset("S1_model", modelVisible?"1":"0");
      renderProblem();
    });

    renderProblem();
  }



  // -------- S2 (normal + speed10) --------
  function renderS2(){
    const items = data.s2 || [];
    if (!items.length){
      mount.innerHTML = `<section class="card"><div class="kicker">S2</div><div class="hint">S2データが読み込めませんでした。</div></section>`;
      return;
    }
    let mode = lsget("S2_mode","practice"); // practice | speed
    mount.innerHTML = `
      <section class="card">
        <div class="card-h">
          <div><div class="kicker">モード</div></div>
          <div class="right">
            <button class="btn" id="s2m1">通常練習</button>
            <button class="btn" id="s2m2">スピード10連続</button>
          </div>
        </div>
        <div class="hint">設問2：①形式 ②主たる意図 ③結び（今後の支援方針の見立てを行うため）</div>
      </section>
      <div id="s2mount"></div>
    `;
    const sub = $('#s2mount');

    function renderPractice(){
      let idx = parseInt(lsget("S2_idx","0"),10); if(isNaN(idx)) idx=0; idx=((idx%items.length)+items.length)%items.length;
      let modelVisible = lsget("S2_model","0")==="1";
      sub.innerHTML = `
        <section class="card">
          <div class="card-h">
            <div><div class="kicker">問題</div></div>
            <div class="right">
              <div class="pill" id="s2meta">S2-${idx+1}/${items.length}</div>
              <button class="iconbtn" id="s2prev">◀︎</button>
              <select id="s2sel"></select>
              <button class="iconbtn" id="s2next">▶︎</button>
            </div>
          </div>
          <div class="linebox" id="s2q"></div>
        </section>

        <section class="card">
          <div class="card-h">
            <div><div class="kicker">あなたの回答</div></div>
            <div class="right"><div class="counter" id="s2count">0 文字</div></div>
          </div>
          <textarea id="s2ta" placeholder="①形式：&#10;②主たる意図：&#10;③〜を確認し、今後の支援方針の見立てを行うため。"></textarea>
          <div class="tools" style="margin-top:10px">
            <button class="btn" id="s2clear">この回答を消す</button>
            <button class="btn" id="s2copy">回答をコピー</button>
            <button class="btn" id="s2toggle">模範を表示</button>
          </div>
        </section>

        <section class="card">
          <div class="card-h"><div class="kicker">模範</div></div>
          <div id="s2model" class="model"></div>
          <div class="tools" style="margin-top:10px">
            <button class="btn" id="s2copyModel">模範をコピー</button>
          </div>
        </section>
      `;
      const sel=$('#s2sel');
      items.forEach((it,i)=>{
        const opt=document.createElement('option');
        opt.value=String(i);
        opt.textContent=(it.id?`S2-${it.id}`:`S2-${i+1}`)+"｜"+(it.theme||it.q||it.question||it.title||"");
        sel.appendChild(opt);
      });
      sel.value=String(idx);

      const qEl=$('#s2q'), ta=$('#s2ta'), meta=$('#s2meta'), model=$('#s2model'), count=$('#s2count');

      function refresh(){
        const it=items[idx];
        meta.textContent=`S2-${idx+1}/${items.length}`;
        qEl.textContent=it.q || it.question || it.theme || it.title || "";
        model.textContent=it.answer || it.model || it.a || "";
        model.style.display = modelVisible ? "block":"none";
        $('#s2toggle').textContent = modelVisible ? "模範をクリア":"模範を表示";
        const key=`S2_ans_${idx}`;
        ta.value=lsget(key,"");
        count.textContent = `${cc(ta.value)} 文字`;
      }
      $('#s2prev').addEventListener('click',()=>{ idx=(idx-1+items.length)%items.length; sel.value=String(idx); lsset("S2_idx",String(idx)); refresh(); });
      $('#s2next').addEventListener('click',()=>{ idx=(idx+1)%items.length; sel.value=String(idx); lsset("S2_idx",String(idx)); refresh(); });
      sel.addEventListener('change',()=>{ idx=parseInt(sel.value,10); lsset("S2_idx",String(idx)); refresh(); });

      ta.addEventListener('input',()=>{ const key=`S2_ans_${idx}`; lsset(key,ta.value); count.textContent=`${cc(ta.value)} 文字`; });
      $('#s2clear').addEventListener('click',()=>{ ta.value=""; ta.dispatchEvent(new Event('input')); });
      $('#s2copy').addEventListener('click',async()=>{ try{ await navigator.clipboard.writeText(ta.value);}catch{} });
      $('#s2toggle').addEventListener('click',()=>{ modelVisible=!modelVisible; lsset("S2_model",modelVisible?"1":"0"); refresh(); });
      $('#s2copyModel').addEventListener('click',async()=>{ try{ await navigator.clipboard.writeText(model.textContent);}catch{} });

      refresh();
    }

    function renderSpeed(){
      // create a shuffled queue of 10 indices
      const n = Math.min(10, items.length);
      let seq = [];
      for(let i=0;i<items.length;i++) seq.push(i);
      // shuffle
      for(let i=seq.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [seq[i],seq[j]]=[seq[j],seq[i]]; }
      seq = seq.slice(0,n);
      let pos=0;
      let modelVisible=false;

      sub.innerHTML = `
        <section class="card">
          <div class="card-h">
            <div><div class="kicker">スピード10連続</div></div>
            <div class="right">
              <div class="pill" id="s2p">1/${n}</div>
              <button class="btn" id="s2restart">リスタート</button>
              <button class="btn" id="s2nextq">次へ</button>
            </div>
          </div>
          <div class="linebox" id="s2q"></div>
        </section>

        <section class="card">
          <div class="card-h">
            <div><div class="kicker">あなたの回答</div></div>
            <div class="right"><div class="counter" id="s2count">0 文字</div></div>
          </div>
          <textarea id="s2ta" placeholder="①形式：&#10;②主たる意図：&#10;③〜を確認し、今後の支援方針の見立てを行うため。"></textarea>
          <div class="tools" style="margin-top:10px">
            <button class="btn" id="s2clear">この回答を消す</button>
            <button class="btn" id="s2copy">回答をコピー</button>
            <button class="btn" id="s2toggle">模範を表示</button>
          </div>
        </section>

        <section class="card">
          <div class="card-h"><div class="kicker">模範</div></div>
          <div id="s2model" class="model"></div>
        </section>
      `;

      const qEl=$('#s2q'), ta=$('#s2ta'), model=$('#s2model'), count=$('#s2count'), pEl=$('#s2p');

      function refresh(){
        const idx=seq[pos];
        const it=items[idx];
        pEl.textContent = `${pos+1}/${n}`;
        qEl.textContent = it.q || it.question || it.theme || it.title || "";
        model.textContent = it.answer || it.model || it.a || "";
        model.style.display = modelVisible ? "block":"none";
        $('#s2toggle').textContent = modelVisible ? "模範をクリア":"模範を表示";
        const key=`S2_speed_${pos}`;
        ta.value = lsget(key,"");
        count.textContent = `${cc(ta.value)} 文字`;
      }

      ta.addEventListener('input',()=>{ const key=`S2_speed_${pos}`; lsset(key,ta.value); count.textContent=`${cc(ta.value)} 文字`; });
      $('#s2clear').addEventListener('click',()=>{ ta.value=""; ta.dispatchEvent(new Event('input')); });
      $('#s2copy').addEventListener('click',async()=>{ try{ await navigator.clipboard.writeText(ta.value);}catch{} });
      $('#s2toggle').addEventListener('click',()=>{ modelVisible=!modelVisible; refresh(); });
      $('#s2nextq').addEventListener('click',()=>{ pos = (pos+1)%n; modelVisible=false; refresh(); });
      $('#s2restart').addEventListener('click',()=>{ renderSpeed(); });

      refresh();
    }

    function setMode(m){
      mode=m;
      lsset("S2_mode", m);
      if (m==="practice") renderPractice(); else renderSpeed();
    }

    $('#s2m1').addEventListener('click',()=>setMode("practice"));
    $('#s2m2').addEventListener('click',()=>setMode("speed"));

    setMode(mode);
  }

  // -------- S3 (practice 1-3) --------
  function renderS3(){
    const items = data.s3 || [];
    if (!items.length){
      mount.innerHTML = `<section class="card"><div class="kicker">S3</div><div class="hint">S3データが読み込めませんでした。</div></section>`;
      return;
    }
    let idx = parseInt(lsget("S3_idx","0"),10); if(isNaN(idx)) idx=0; idx=((idx%items.length)+items.length)%items.length;
    let modelVisible = lsget("S3_model","0")==="1";

    mount.innerHTML = `
      <section class="card">
        <div class="card-h">
          <div><div class="kicker">事例</div></div>
          <div class="right">
            <div class="pill" id="s3meta">S3-${idx+1}/${items.length}</div>
            <button class="iconbtn" id="s3prev">◀︎</button>
            <select id="s3sel"></select>
            <button class="iconbtn" id="s3next">▶︎</button>
          </div>
        </div>
        <div class="linebox" id="s3case"></div>
      </section>

      <section class="card">
        <div class="card-h"><div><div class="kicker">設問3①（問題）</div></div><div class="right"><div class="counter" id="s3c1">0 文字</div></div></div>
        <textarea id="s3a1" placeholder="（2行想定）問題を端的に。"></textarea>
        <div class="tools" style="margin-top:10px">
          <button class="btn" id="s3clear1">この回答を消す</button>
          <button class="btn" id="s3copy1">回答をコピー</button>
        </div>
      </section>

      <section class="card">
        <div class="card-h"><div><div class="kicker">設問3②（根拠）</div></div><div class="right"><div class="counter" id="s3c2">0 文字</div></div></div>
        <textarea id="s3a2" placeholder="「〜という発言から、〇〇と捉えていることがうかがえる。」を基本に、設問3①と直結させる。"></textarea>
        <div class="tools" style="margin-top:10px">
          <button class="btn" id="s3clear2">この回答を消す</button>
          <button class="btn" id="s3copy2">回答をコピー</button>
          <button class="btn" id="s3toggle">模範を表示</button>
        </div>
      </section>

      <section class="card">
        <div class="card-h"><div class="kicker">模範</div></div>
        <div id="s3model" class="model"></div>
      </section>
    `;

    const sel=$('#s3sel');
    items.forEach((it,i)=>{
      const opt=document.createElement('option');
      opt.value=String(i);
      opt.textContent=(it.id?`S3-${it.id}`:`S3-${i+1}`)+"｜"+(it.theme||it.title||"練習問題");
      sel.appendChild(opt);
    });
    sel.value=String(idx);

    const meta=$('#s3meta'), caseEl=$('#s3case'), a1=$('#s3a1'), a2=$('#s3a2'), c1=$('#s3c1'), c2=$('#s3c2'), model=$('#s3model');

    function refresh(){
      const it=items[idx];
      meta.textContent=`S3-${idx+1}/${items.length}`;
      caseEl.textContent = it.case || it.record || it.text || it.prompt || it.situation || "";
      model.textContent = (it.model || it.answer || it.sample || "") + (it.model2?("\n\n"+it.model2):"");
      model.style.display = modelVisible ? "block":"none";
      $('#s3toggle').textContent = modelVisible ? "模範をクリア":"模範を表示";
      const k1=`S3_1_${idx}`, k2=`S3_2_${idx}`;
      a1.value=lsget(k1,""); a2.value=lsget(k2,"");
      c1.textContent=`${cc(a1.value)} 文字`; c2.textContent=`${cc(a2.value)} 文字`;
    }

    $('#s3prev').addEventListener('click',()=>{ idx=(idx-1+items.length)%items.length; sel.value=String(idx); lsset("S3_idx",String(idx)); refresh(); });
    $('#s3next').addEventListener('click',()=>{ idx=(idx+1)%items.length; sel.value=String(idx); lsset("S3_idx",String(idx)); refresh(); });
    sel.addEventListener('change',()=>{ idx=parseInt(sel.value,10); lsset("S3_idx",String(idx)); refresh(); });

    a1.addEventListener('input',()=>{ lsset(`S3_1_${idx}`, a1.value); c1.textContent=`${cc(a1.value)} 文字`; });
    a2.addEventListener('input',()=>{ lsset(`S3_2_${idx}`, a2.value); c2.textContent=`${cc(a2.value)} 文字`; });
    $('#s3clear1').addEventListener('click',()=>{ a1.value=""; a1.dispatchEvent(new Event('input')); });
    $('#s3clear2').addEventListener('click',()=>{ a2.value=""; a2.dispatchEvent(new Event('input')); });
    $('#s3copy1').addEventListener('click',async()=>{ try{ await navigator.clipboard.writeText(a1.value);}catch{} });
    $('#s3copy2').addEventListener('click',async()=>{ try{ await navigator.clipboard.writeText(a2.value);}catch{} });
    $('#s3toggle').addEventListener('click',()=>{ modelVisible=!modelVisible; lsset("S3_model",modelVisible?"1":"0"); refresh(); });

    refresh();
  }

  // -------- S4 (6-step) --------
  function renderS4(){
    const items = data.s4 || [];
    if (!items.length){
      mount.innerHTML = `<section class="card"><div class="kicker">S4</div><div class="hint">S4データが読み込めませんでした。</div></section>`;
      return;
    }
    let idx = parseInt(lsget("S4_idx","0"),10); if(isNaN(idx)) idx=0; idx=((idx%items.length)+items.length)%items.length;
    let modelVisible = lsget("S4_model","0")==="1";
    const LINE_LABELS = [
      "① 受容",
      "② 自己理解 ～ 自分を整理する",
      "③ 仕事理解 ～ 仕事を整理する",
      "④ 自分軸で仕事を評価 ～ 自分と仕事のマッチング検討",
      "⑤ 比較検討 ～ 選択肢を具体的に比べる",
      "⑥ 主体的意思決定 ～ 自分で決める"
    ];
    const LINE_PLACEHOLDERS = [
      "〇〇について受容的・共感的に受け止め信頼関係を維持する。",
      "その上で〇〇を整理し自己理解を促す。",
      "〇〇を確認し仕事理解を促す。",
      "〇〇（自己理解）と、〇〇（仕事理解）を、照らし合わせて、〇〇が可能か具体的に比較検討を促す／照合する／すり合わせる／適合性を検討する",
      "Ａ案と、Ｂ案を比較し、判断軸の明確化を促す。",
      "最終的に相談者自身が納得できる目標を設定し主体的に取り組めるよう支援する。"
    ];

    mount.innerHTML = `
      <section class="card">
        <div class="card-h">
          <div><div class="kicker">ケース</div></div>
          <div class="right">
            <div class="pill" id="s4meta">S4-${idx+1}/${items.length}</div>
            <button class="iconbtn" id="s4prev">◀︎</button>
            <select id="s4sel"></select>
            <button class="iconbtn" id="s4next">▶︎</button>
          </div>
        </div>
        <div class="linebox" id="s4case"></div>
      </section>

      <section class="card">
        <div class="card-h">
          <div><div class="kicker">あなたの回答（6行）</div></div>
          <div class="right"><div class="counter" id="s4total">合計 0 文字</div></div>
        </div>
        <div id="s4lines" class="grid2"></div>
        <div class="tools" style="margin-top:10px">
          <button class="btn" id="s4clear">この回答を消す</button>
          <button class="btn" id="s4copy">回答をコピー</button>
          <button class="btn" id="s4toggle">模範を表示</button>
        </div>
      </section>

      <section class="card">
        <div class="card-h"><div class="kicker">模範</div></div>
        <div id="s4model" class="model"></div>
      </section>
    `;

    const sel=$('#s4sel');
    items.forEach((it,i)=>{
      const opt=document.createElement('option');
      opt.value=String(i);
      opt.textContent=(it.id?`S4-${it.id}`:`S4-${i+1}`)+"｜"+(it.theme||it.title||"");
      sel.appendChild(opt);
    });
    sel.value=String(idx);

    const meta=$('#s4meta'), caseEl=$('#s4case'), lines=$('#s4lines'), total=$('#s4total'), model=$('#s4model');

    function buildLines(){
      lines.innerHTML="";
      for(let i=0;i<6;i++){
        const div=document.createElement('div');
        div.className="linebox";
        div.innerHTML = `
          <div class="linehead">
            <div style="display:flex;gap:10px;align-items:center">
              <div class="lno">${i+1}行目</div>
              <div class="lbl">${LINE_LABELS[i]}</div>
            </div>
            <div class="small"><span data-c>0</span> 文字</div>
          </div>
          <textarea data-i="${i}" placeholder="${LINE_PLACEHOLDERS[i]}"></textarea>
        `;
        lines.appendChild(div);
      }
    }

    function refresh(){
      const it=items[idx];
      meta.textContent=`S4-${idx+1}/${items.length}`;
      caseEl.textContent = it.case || it.record || it.text || it.prompt || it.situation || "";
      model.textContent = it.answer || it.model || it.sample || "";
      model.style.display = modelVisible ? "block":"none";
      $('#s4toggle').textContent = modelVisible ? "模範をクリア":"模範を表示";

      buildLines();
      let sum=0;
      $$('textarea', lines).forEach(ta=>{
        const i=parseInt(ta.dataset.i,10);
        const k=`S4_${idx}_${i}`;
        ta.value = lsget(k,"");
        const n=cc(ta.value); sum+=n;
        ta.parentElement.querySelector('[data-c]').textContent=String(n);
        ta.addEventListener('input', ()=>{
          lsset(k, ta.value);
          const n2=cc(ta.value);
          ta.parentElement.querySelector('[data-c]').textContent=String(n2);
          updateTotal();
        });
      });
      total.textContent = `合計 ${sum} 文字`;
    }

    function updateTotal(){
      let sum=0;
      $$('textarea', lines).forEach(ta=>sum+=cc(ta.value));
      total.textContent = `合計 ${sum} 文字`;
    }

    $('#s4prev').addEventListener('click',()=>{ idx=(idx-1+items.length)%items.length; sel.value=String(idx); lsset("S4_idx",String(idx)); refresh(); });
    $('#s4next').addEventListener('click',()=>{ idx=(idx+1)%items.length; sel.value=String(idx); lsset("S4_idx",String(idx)); refresh(); });
    sel.addEventListener('change',()=>{ idx=parseInt(sel.value,10); lsset("S4_idx",String(idx)); refresh(); });

    $('#s4clear').addEventListener('click',()=>{
      $$('textarea', lines).forEach(ta=>{ ta.value=""; ta.dispatchEvent(new Event('input')); });
      updateTotal();
    });
    $('#s4copy').addEventListener('click', async()=>{
      const parts=[];
      $$('textarea', lines).forEach(ta=>parts.push(ta.value.trim()));
      try{ await navigator.clipboard.writeText(parts.join("\n")); }catch{}
    });
    $('#s4toggle').addEventListener('click',()=>{ modelVisible=!modelVisible; lsset("S4_model",modelVisible?"1":"0"); refresh(); });

    refresh();
  }

  const render = { s1: renderS1, s2: renderS2, s3: renderS3, s4: renderS4 };

  $$('.tab').forEach(b=>b.addEventListener('click', ()=>setTab(b.dataset.tab)));

  const hash=(location.hash||"").replace("#","");
  if (hash && render[hash]) setTab(hash); else setTab("s1");

})();
