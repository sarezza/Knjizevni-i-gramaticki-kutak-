(() => {
  'use strict';
  const D = window.KUTAK_DATA;
  const $ = sel => document.querySelector(sel);
  const root = $('#screen');
  const viewNames = {home:'Početna',works:'Književnost',characters:'Likovi',grammar:'Gramatika',terms:'Pojmovnik',quiz:'Vežbaj i proveri',progress:'Moj napredak'};
  const KEY = 'knjizevni_kutak_v1';
  function load(){try{return JSON.parse(localStorage.getItem(KEY)) || {}}catch{return {}}}
  const saved=load();
  const state={view:'home',search:'',filter:'Svi',selectedWork:null,bookmarks:Array.isArray(saved.bookmarks)?saved.bookmarks:[],history:Array.isArray(saved.history)?saved.history:[],theme:saved.theme==='dark'?'dark':'light',quiz:null,setup:{category:'Sve oblasti',count:10}};
  function persist(){try{localStorage.setItem(KEY,JSON.stringify({bookmarks:state.bookmarks,history:state.history,theme:state.theme}))}catch{}}
  const e = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fold = v => String(v??'').toLowerCase().replace(/[абвгдђежзијклљмнопрстћуфхцчџш]/g,c=>({'а':'a','б':'b','в':'v','г':'g','д':'d','ђ':'dj','е':'e','ж':'z','з':'z','и':'i','ј':'j','к':'k','л':'l','љ':'lj','м':'m','н':'n','њ':'nj','о':'o','п':'p','р':'r','с':'s','т':'t','ћ':'c','у':'u','ф':'f','х':'h','ц':'c','ч':'c','џ':'dz','ш':'s'}[c]||c)).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'dj');
  const shuffle = arr => {const a=[...arr];for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
  const count = category => D.questions.filter(q=>category==='Sve oblasti'||q.category===category).length;
  const pageHeader = (eyebrow,title,desc) => `<div class="section-eyebrow">${e(eyebrow)}</div><h1 class="page-title">${e(title)}</h1><p class="page-desc">${e(desc)}</p>`;
  const tag = name => `<span class="tag">${e(name)}</span>`;
  let toastTimer;
  function toast(message){const t=$('#toast');t.textContent=message;t.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('visible'),2500)}
  function go(view){if(!viewNames[view])return;state.view=view;state.search='';state.filter='Svi';state.selectedWork=null;state.quiz=null;$('#sidebar').classList.remove('open');$('#menuBtn').setAttribute('aria-expanded','false');render();window.scrollTo({top:0,behavior:'smooth'})}
  function render(){
    document.documentElement.dataset.theme=state.theme;
    $('#themeBtn').textContent=state.theme==='dark'?'☀':'☾';
    $('#pageCrumb').textContent=viewNames[state.view];
    document.querySelectorAll('.nav-link').forEach(el=>el.classList.toggle('active',el.dataset.view===state.view));
    root.innerHTML=({home:renderHome,works:renderWorks,characters:renderCharacters,grammar:renderGrammar,terms:renderTerms,quiz:renderQuiz,progress:renderProgress}[state.view])();
  }
  function renderHome(){
    const last=state.history[0];
    const dateNum=Math.floor(Date.now()/86400000);
    const term=D.terms[dateNum%D.terms.length];
    return `<section class="hero"><div class="hero-content"><div class="hero-eyebrow">✦ Tvoja digitalna čitaonica · IV razred</div><h1>Reči imaju <em>više slojeva.</em><br>Istraži ih.</h1><p>Književnost, gramatika i teorija na jednom mestu. Uči preko preglednih beležaka, poveži pojmove i proveri znanje kroz testove.</p><button class="btn btn-light" data-view="quiz">Započni vežbanje <span>↗</span></button></div></section>
      <div class="stats"><div class="stat"><strong>${D.works.length}</strong><span>dela u biblioteci</span></div><div class="stat"><strong>${D.terms.length}</strong><span>književna pojma</span></div><div class="stat"><strong>${D.questions.length}</strong><span>pitanje za vežbu</span></div><div class="stat"><strong>${state.history.length}</strong><span>urađenih testova</span></div></div>
      <div class="section-head"><h2>Šta danas učimo?</h2><button class="text-link" data-view="quiz">Otvori testove ↗</button></div>
      <div class="tiles"><button class="tile" data-view="works"><span class="tile-icon">▤</span><h3>Književnost</h3><p>Dela, pisci, rodovi, vrste, teme i motivi.</p><small>Pogledaj biblioteku ↗</small></button><button class="tile" data-view="grammar"><span class="tile-icon">✎</span><h3>Gramatika</h3><p>Pravopis, sintaksa i kultura izražavanja.</p><small>Otvori lekcije ↗</small></button><button class="tile" data-view="terms"><span class="tile-icon">◎</span><h3>Pojmovnik</h3><p>Od soneta do intertekstualnosti i mimezisa.</p><small>Pročitaj pojmove ↗</small></button></div>
      <div class="section-head"><h2>Za početak</h2><button class="text-link" data-view="progress">Moj napredak ↗</button></div>
      <div class="spotlight"><div class="note-card"><div class="overline">Pojam dana</div><h3>${e(term.name)}</h3><p>${e(term.definition)}</p><button class="text-link" data-view="terms">Otvori pojmovnik ↗</button></div><div class="note-card"><div class="overline">Tvoj sledeći korak</div><h3>${last?'Nastavi sa vežbanjem':'Prvi mali test?'}</h3><p>${last?`Poslednji rezultat: ${last.correct} od ${last.total} tačnih odgovora. Sledeći put možeš izabrati drugu oblast.`:'Izaberi oblast, broj pitanja i odmah proveri znanje. Odgovori se mešaju pri svakom novom testu.'}</p><button class="btn btn-outline btn-small" data-view="quiz">Vežbaj sada ↗</button></div></div>
      <div class="subtle-info">📌 <strong>Novo gradivo:</strong> beleške o delima, likovima i simbolima, uz zadatke iz pravopisa i gramatike.</div>`;
  }
  function filterWidget(groups,placeholder){return `<div class="filter-bar"><label class="searchbox"><span>⌕</span><input type="search" id="contentSearch" placeholder="${e(placeholder)}" value="${e(state.search)}" autocomplete="off" aria-label="Pretraga sadržaja"></label><div class="chips">${groups.map(n=>`<button class="chip ${state.filter===n?'active':''}" data-filter="${e(n)}">${e(n)}</button>`).join('')}</div></div>`}
  function renderDeepWork(w){
    let html='';
    if(w.sections?.length){html+=w.sections.map(section=>'<section class="analysis-section"><h3>'+e(section.title)+'</h3><ul>'+section.points.map(p=>'<li>'+e(p)+'</li>').join('')+'</ul></section>').join('')}
    else html+='<p class="muted">Detaljniju analizu dodaćemo nakon što pošalješ tekstove.</p>';
    const entry=(D.characters||[]).find(x=>x.work===w.id);
    if(entry)html+='<section class="analysis-section"><h3>Likovi</h3><div class="character-list">'+entry.list.map(p=>'<div class="character-item"><strong>'+e(p[0])+'</strong><span>'+e(p[1])+'</span></div>').join('')+'</div></section>';
    if(w.sources?.length)html+='<div class="sources"><strong>Dodatni izvori: </strong>'+w.sources.map(url=>'<a href="'+e(url)+'" target="_blank" rel="noopener noreferrer">'+e(url.split('/')[2] || 'izvor')+'</a>').join(' · ')+'</div>';
    return html;
  }
  function renderCharacters(){
    const groups=['Svi',...(D.characters||[]).map(x=>D.works.find(w=>w.id===x.work)?.title||x.work)];
    const matches=(D.characters||[]).filter(x=>{const w=D.works.find(w=>w.id===x.work),name=w?.title||x.work;return(state.filter==='Svi'||name===state.filter)&&fold([name,...x.list.flat()].join(' ')).includes(fold(state.search))});
    return pageHeader('Ko je ko?','Likovi','Prepoznaj junake, njihove uloge i veze sa delima.')+filterWidget(groups,'Pretraži likove ili dela…')+'<div class="countline">'+matches.reduce((n,c)=>n+c.list.length,0)+' likova</div>'+(matches.length?'<div class="characters-view">'+matches.map(x=>{const w=D.works.find(w=>w.id===x.work);return '<section class="character-group"><h2>'+e(w?.title||x.work)+'</h2><p class="muted">'+e(w?.author||'')+'</p><div class="character-list">'+x.list.map(p=>'<div class="character-item"><strong>'+e(p[0])+'</strong><span>'+e(p[1])+'</span></div>').join('')+'</div></section>'}).join('')+'</div>':'<div class="empty-state">Nema rezultata.</div>');
  }
  function renderWorks(){
    const groups=['Svi','Lirika','Epika','Drama'];
    const items=D.works.filter(w=>(state.filter==='Svi'||w.genre===state.filter)&&fold([w.title,w.author,w.genre,w.kind,...w.topics,...(w.sections||[]).flatMap(s=>[s.title,...s.points])].join(' ')).includes(fold(state.search)));
    const cards=items.map(w=>`<article class="work-card"><div class="work-top"><div class="book-icon">${w.genre==='Drama'?'♜':w.genre==='Lirika'?'❦':'▤'}</div><button class="bookmark ${state.bookmarks.includes(w.id)?'saved':''}" data-bookmark="${e(w.id)}" title="Sačuvaj delo" aria-label="Sačuvaj delo" aria-pressed="${state.bookmarks.includes(w.id)}">${state.bookmarks.includes(w.id)?'★':'☆'}</button></div><h3>${e(w.title)}</h3><div class="byline">${e(w.author)}</div><p>${e(w.description)}</p><div class="tags">${tag(w.genre)}${tag(w.kind)}</div><div class="work-footer"><small class="muted">${e(w.period)}</small><button class="text-link" data-open-work="${e(w.id)}">Kartica dela ↗</button></div></article>`).join('');
    let selected='';
    if(state.selectedWork){const w=D.works.find(x=>x.id===state.selectedWork);if(w){selected=`<section class="detail" id="workDetail"><button class="text-link" data-close-work>← Nazad na pregled</button><div class="section-eyebrow" style="margin-top:22px">Kartica dela</div><h2>${e(w.title)}</h2><p class="muted">${e(w.author)}</p><div class="meta-grid"><div class="meta"><small>Književni rod</small><strong>${e(w.genre)}</strong></div><div class="meta"><small>Književna vrsta</small><strong>${e(w.kind)}</strong></div><div class="meta"><small>Razdoblje</small><strong>${e(w.period)}</strong></div></div><h3>O delu</h3><p class="muted">${e(w.description)}</p><h3>Tematski krugovi</h3><div class="tags">${w.topics.map(tag).join('')}</div>${renderDeepWork(w)}<button class="btn" data-quiz-category="Književnost">Vežbaj pitanja iz književnosti ↗</button></section>`}}
    return pageHeader('Biblioteka','Književnost','Dela četvrtog razreda: teme, simboli, poetika i detaljnije beleške. Otvori karticu dela.')+filterWidget(groups,'Pretraži dela, pisce, teme…')+`<div class="countline">Prikazano ${items.length} od ${D.works.length} dela</div>`+(items.length?`<div class="work-grid">${cards}</div>`:`<div class="empty-state"><strong>Nema rezultata</strong>Probaj drugi pojam ili filter.</div>`)+selected;
  }
  function renderTerms(){
    const groups=['Svi',...new Set(D.terms.map(t=>t.group))];
    const list=D.terms.filter(t=>(state.filter==='Svi'||t.group===state.filter)&&fold([t.name,t.definition,t.example,t.group].join(' ')).includes(fold(state.search)));
    return pageHeader('Rečnik teorije','Pojmovnik','Kratko i razumljivo objašnjenje književnih termina. Klikni na karticu za definiciju, primer i dodatni kontekst.')+filterWidget(groups,'Pretraži termin ili objašnjenje…')+`<div class="countline">${list.length} pojmova</div>`+(list.length?`<div class="term-grid">${list.map(t=>`<details class="term-card"><summary><span><small>${e(t.group)}</small><span class="term-name">${e(t.name)}</span></span></summary><div class="term-body">${e(t.definition)}${t.example?`<p class="term-example">${e(t.example)}</p>`:''}</div></details>`).join('')}</div>`:'<div class="empty-state"><strong>Nema pojmova</strong>Promeni filter ili reč za pretragu.</div>')+`<div class="subtle-info">✦ Pojmovnik je početna verzija. Proširivaćemo ga terminima iz tvojih lekcija i profesorkinih beležaka.</div>`;
  }
  function renderGrammar(){
    const groups=['Svi',...new Set(D.grammar.map(g=>g.group))];
    const list=D.grammar.filter(g=>(state.filter==='Svi'||g.group===state.filter)&&fold([g.title,g.summary,g.group,g.example,...g.notes].join(' ')).includes(fold(state.search)));
    return pageHeader('Pravila i primeri','Gramatika','Sintaksa, pravopis i jezička kultura — pregledne lekcije s primerima koje možeš odmah primeniti.')+filterWidget(groups,'Pretraži gramatičke lekcije…')+`<div class="countline">${list.length} gramatičkih oblasti</div>`+(list.length?`<div class="grammar-grid">${list.map(g=>`<article class="grammar-card">${tag(g.group)}<h3>${e(g.title)}</h3><p>${e(g.summary)}</p><div class="example">${e(g.example)}</div><details><summary>Pročitaj pravila i primere ↓</summary><ul>${g.notes.map(n=>`<li>${e(n)}</li>`).join('')}</ul></details></article>`).join('')}</div>`:'<div class="empty-state"><strong>Nema rezultata</strong>Promeni upit ili oblast.</div>')+`<div class="subtle-info">Sada su dostupne uvodne gramatičke lekcije. Kad pošalješ školsko gradivo za IV razred, sadržaj i zadatke prilagodićemo vašem programu.</div>`;
  }
  function renderQuiz(){return state.quiz?(state.quiz.mode==='result'?renderResult():renderQuestion()):renderSetup()}
  function renderSetup(){
    const categories=['Sve oblasti',...new Set(D.questions.map(q=>q.category))];
    const available=count(state.setup.category);
    return pageHeader('Proveri znanje','Interaktivni testovi','Poveži dela i pisce, prepoznaj pojmove, odgovori na pitanja iz gramatike i vežbaj odlomke. Ponuđeni odgovori se mešaju pri svakom testu.')+`<div class="quiz-setup"><div class="overline">Podesi svoj test</div><h2>Odakle počinjemo?</h2><label class="control-label" for="quizCategory">Izaberi oblast</label><select class="field" id="quizCategory">${categories.map(c=>`<option ${state.setup.category===c?'selected':''} value="${e(c)}">${e(c)} (${count(c)})</option>`).join('')}</select><label class="control-label" for="quizCount">Broj pitanja</label><select class="field" id="quizCount">${[5,10,20,1000].map(n=>`<option value="${n}" ${state.setup.count===n?'selected':''}>${n===1000?'Sva dostupna pitanja':n+' pitanja'}</option>`).join('')}</select><div class="quiz-notice">✳ Dostupno ${available} pitanja u odabranoj oblasti. Test će prikazati najviše taj broj. Rezultati se čuvaju samo u ovom pregledaču, na tvom uređaju.</div><button class="btn" data-start-quiz ${available===0?'disabled':''}>Pokreni test ↗</button></div><div class="subtle-info">Za prepoznavanje odlomaka trenutno se koriste samo kratki provereni citati. Pošalji tekstove iz čitanke da dodamo još.</div>`;
  }
  function startQuiz(category=state.setup.category){
    state.setup.category=category;
    const pool=shuffle(D.questions.filter(q=>category==='Sve oblasti'||q.category===category));
    const amount=Math.min(state.setup.count,pool.length);
    state.quiz={mode:'active',category,items:pool.slice(0,amount).map(q=>({...q,order:q.options?shuffle(q.options.map((_,i)=>i)):null,rightOrder:q.pairs?shuffle(q.pairs.map(p=>p[1])):null,selected:q.type==='matching'?{}:q.type==='multi'?[]:null,checked:false,correct:false})),index:0};
    render();window.scrollTo({top:0,behavior:'smooth'});
  }
  function chosen(q,i){return q.type==='multi'?q.selected.includes(i):q.selected===i}
  function isReady(q){return q.type==='matching'?q.pairs.every((_,i)=>q.selected[i]):q.type==='multi'?q.selected.length>0:q.selected!==null}
  function renderQuestion(){
    const quiz=state.quiz,q=quiz.items[quiz.index],num=quiz.index+1,total=quiz.items.length;
    let answers='';
    if(q.type==='matching'){
      answers=`<div class="matching">${q.pairs.map((pair,i)=>`<label class="matching-row"><span>${e(pair[0])}</span><select data-match-row="${i}" ${q.checked?'disabled':''} class="${q.checked?(q.selected[i]===pair[1]?'correct':'wrong'):''}"><option value="">— Izaberi odgovor —</option>${q.rightOrder.map(v=>`<option value="${e(v)}" ${q.selected[i]===v?'selected':''}>${e(v)}</option>`).join('')}</select></label>`).join('')}</div>`;
    }else{
      answers=`<div class="choices">${q.order.map((original,i)=>{const c=chosen(q,original),good=q.type==='multi'?q.answers.includes(original):q.answer===original;const cls=q.checked?(good?'correct':c?'wrong':''):(c?'selected':'');return `<button class="choice ${cls}" data-choice="${original}" ${q.checked?'disabled':''} aria-pressed="${c}"><span class="choice-letter">${q.type==='multi'?(c?'✓':'□'):String.fromCharCode(65+i)}</span>${e(q.options[original])}</button>`}).join('')}</div>`;
    }
    let feedback='';
    if(q.checked){
      const answer=q.type==='matching'?q.pairs.map(p=>p[0]+' — '+p[1]).join(' · '):q.type==='multi'?q.answers.map(i=>q.options[i]).join(', '):q.options[q.answer];
      feedback=`<div class="feedback ${q.correct?'':'incorrect'}"><strong>${q.correct?'✓ Tačno!':'✕ Nije sasvim tačno.'}</strong><p><b>Tačan odgovor:</b> ${e(answer)}</p><p>${e(q.explain)}</p></div>`;
    }
    return `<div class="quiz-wrap"><div class="quiz-progress"><span>${e(quiz.category)} · Pitanje ${num} / ${total}</span><span>${Math.round((num-1)/total*100)}% završeno</span></div><div class="progress-track"><div class="progress-fill" style="width:${(num-1)/total*100}%"></div></div><div class="question-card"><div class="question-kicker">${e(q.category)} · ${q.type==='matching'?'Povezivanje':q.type==='multi'?'Više tačnih odgovora':q.type==='quote'?'Prepoznaj odlomak':'Izaberi jedan odgovor'}</div><h2>${e(q.prompt)}</h2>${q.quote?`<blockquote class="quote">${e(q.quote)}</blockquote>`:''}${answers}<div class="question-hint">${q.type==='matching'?'Poveži svaki pojam sa odgovarajućim objašnjenjem.':q.type==='multi'?'Možeš označiti više odgovora.':'Označi odgovor pa proveri.'}</div>${feedback}</div><div class="quiz-actions"><button class="btn btn-outline" data-quit-quiz>← Izađi iz testa</button>${q.checked?`<button class="btn" data-next-question>${num===total?'Završi test →':'Sledeće pitanje →'}</button>`:`<button class="btn" data-check-question ${isReady(q)?'':'disabled'}>Proveri odgovor ✓</button>`}</div></div>`;
  }
  function checkQuestion(){const q=state.quiz.items[state.quiz.index];if(q.checked||!isReady(q))return;
    q.correct=q.type==='matching'?q.pairs.every((p,i)=>q.selected[i]===p[1]):q.type==='multi'?q.selected.length===q.answers.length&&q.answers.every(n=>q.selected.includes(n)):q.selected===q.answer;
    q.checked=true;render();
  }
  function nextQuestion(){const z=state.quiz;if(z.index<z.items.length-1){z.index++;render();window.scrollTo({top:0,behavior:'smooth'})}else{
    const correct=z.items.filter(q=>q.correct).length;
    state.history.unshift({id:Date.now(),date:new Date().toISOString(),category:z.category,correct,total:z.items.length});
    state.history=state.history.slice(0,80);persist();z.mode='result';render();window.scrollTo({top:0,behavior:'smooth'});
  }}
  function renderResult(){const z=state.quiz,correct=z.items.filter(q=>q.correct).length,percent=Math.round(correct/z.items.length*100);
    const msg=percent>=90?'Sjajno poznaješ gradivo!':percent>=65?'Vrlo dobar početak.':'Nastavi da vežbaš — svaki pokušaj pomaže.';
    return `<div class="quiz-wrap">${pageHeader('Rezultati testa','Test je završen',msg)}<div class="quiz-setup"><div class="overline">Tvoj rezultat</div><div class="result-score">${correct}<span style="font-size:29px;color:var(--muted)"> / ${z.items.length}</span></div><div class="progress-track"><div class="progress-fill" style="width:${percent}%"></div></div><p class="muted">${percent}% tačnih odgovora · ${e(z.category)}</p><div class="quiz-actions"><button class="btn btn-outline" data-quit-quiz>Izaberi novu oblast</button><button class="btn" data-retry-quiz>Ponovi test ↗</button></div></div><div class="section-head"><h2>Pregled odgovora</h2></div><div class="results-list">${z.items.map(q=>`<div class="result-row"><span>${e(q.prompt)}</span><strong class="${q.correct?'status-good':'status-bad'}">${q.correct?'✓ Tačno':'✕ Netačno'}</strong></div>`).join('')}</div></div>`;
  }
  function renderProgress(){
    const completed=state.history.reduce((n,h)=>n+h.total,0),correct=state.history.reduce((n,h)=>n+h.correct,0);
    const average=completed?Math.round(correct/completed*100):0;
    return pageHeader('Moj prostor','Napredak','Ovde vidiš urađene testove, uspešnost i dela koja si sačuvala. Podaci ostaju na ovom uređaju i u ovom pregledaču.')+`<div class="stats"><div class="stat"><strong>${state.history.length}</strong><span>urađenih testova</span></div><div class="stat"><strong>${completed}</strong><span>odgovorenih pitanja</span></div><div class="stat"><strong>${average}%</strong><span>ukupna uspešnost</span></div><div class="stat"><strong>${state.bookmarks.length}</strong><span>sačuvanih dela</span></div></div><div class="section-head"><h2>Istorija testova</h2>${state.history.length?'<button class="text-link" data-reset-history>Obriši istoriju</button>':''}</div>`+(state.history.length?`<div class="history-list">${state.history.map(h=>`<div class="history-row"><div><strong>${e(h.category)}</strong><p>${new Date(h.date).toLocaleString('sr-RS')} · ${h.correct} od ${h.total} tačno</p></div><span class="percent">${Math.round(h.correct/h.total*100)}%</span></div>`).join('')}</div>`:`<div class="empty-state"><strong>Još nema rezultata</strong>Uradi prvi test i ovde će se prikazati tvoj napredak.<div style="margin-top:16px"><button class="btn btn-small" data-view="quiz">Pokreni test</button></div></div>`)+`<div class="section-head"><h2>Sačuvana dela</h2></div>`+(state.bookmarks.length?`<div class="tags">${state.bookmarks.map(id=>D.works.find(w=>w.id===id)).filter(Boolean).map(w=>tag(w.title)).join('')}</div>`:`<p class="muted">Dodaj dela u omiljene klikom na ☆ pored kartice u biblioteci.</p>`);
  }
  root.addEventListener('click', ev=>{
    const el=ev.target.closest('button');if(!el)return;
    if(el.dataset.view){go(el.dataset.view);return}
    if(el.hasAttribute('data-filter')){state.filter=el.dataset.filter;render();return}
    if(el.dataset.bookmark){const id=el.dataset.bookmark;state.bookmarks=state.bookmarks.includes(id)?state.bookmarks.filter(x=>x!==id):[...state.bookmarks,id];persist();render();toast(state.bookmarks.includes(id)?'Delo je sačuvano.':'Delo je uklonjeno iz sačuvanih.');return}
    if(el.dataset.openWork){state.selectedWork=el.dataset.openWork;render();setTimeout(()=>$('#workDetail')?.scrollIntoView({behavior:'smooth',block:'start'}),30);return}
    if(el.hasAttribute('data-close-work')){state.selectedWork=null;render();return}
    if(el.dataset.quizCategory){state.view='quiz';state.setup.category=el.dataset.quizCategory;state.quiz=null;render();window.scrollTo({top:0,behavior:'smooth'});return}
    if(el.hasAttribute('data-start-quiz')){startQuiz();return}
    if(el.hasAttribute('data-choice')){const q=state.quiz?.items[state.quiz.index];if(!q||q.checked)return;const n=Number(el.dataset.choice);if(q.type==='multi'){q.selected=q.selected.includes(n)?q.selected.filter(x=>x!==n):[...q.selected,n]}else{q.selected=n}render();return}
    if(el.hasAttribute('data-check-question')){checkQuestion();return}
    if(el.hasAttribute('data-next-question')){nextQuestion();return}
    if(el.hasAttribute('data-quit-quiz')){state.quiz=null;render();return}
    if(el.hasAttribute('data-retry-quiz')){startQuiz();return}
    if(el.hasAttribute('data-reset-history')){if(window.confirm('Da li želiš da obrišeš istoriju testova?')){state.history=[];persist();render();toast('Istorija testova je obrisana.')}return}
  });
  root.addEventListener('change',ev=>{
    const el=ev.target;if(el.id==='quizCategory'){state.setup.category=el.value;render()}else if(el.id==='quizCount'){state.setup.count=Number(el.value)}else if(el.hasAttribute('data-match-row')){const q=state.quiz?.items[state.quiz.index];if(q&&!q.checked){q.selected[Number(el.dataset.matchRow)]=el.value;const b=$('[data-check-question]');if(b)b.disabled=!isReady(q)}}
  });
  root.addEventListener('input',ev=>{
    if(ev.target.id==='contentSearch'){const cursor=ev.target.selectionStart;state.search=ev.target.value;render();const newInput=$('#contentSearch');if(newInput){newInput.focus();try{newInput.setSelectionRange(cursor,cursor)}catch{}}}
  });
  document.querySelectorAll('.sidebar .nav-link').forEach(el=>el.addEventListener('click',()=>go(el.dataset.view)));
  $('#themeBtn').addEventListener('click',()=>{state.theme=state.theme==='dark'?'light':'dark';persist();render()});
  $('#menuBtn').addEventListener('click',()=>{const open=$('#sidebar').classList.toggle('open');$('#menuBtn').setAttribute('aria-expanded',String(open))});
  document.addEventListener('keydown',ev=>{if(ev.key==='Escape'){$('#sidebar').classList.remove('open');$('#menuBtn').setAttribute('aria-expanded','false')}});
  render();
})();