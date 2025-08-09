(function(){
  const STORE_KEY = 'gl_editor_lessons_v1';
  function load(){ try{ const raw=localStorage.getItem(STORE_KEY); return raw? JSON.parse(raw):[] }catch{return []} }
  function save(list){ localStorage.setItem(STORE_KEY, JSON.stringify(list)); }

  function renderEditor(){
    const view = document.querySelector('#view'); view.innerHTML='';
    const root = document.createElement('div'); root.className='editor';
    const sidebar = document.createElement('div'); sidebar.className='sidebar';
    const canvas = document.createElement('div'); canvas.className='canvas';

    const header = document.createElement('div'); header.className='row';
    const title = document.createElement('h3'); title.textContent='Lesson Editor';
    const addBtn = document.createElement('button'); addBtn.className='btn primary'; addBtn.textContent='New Lesson';
    header.append(title, document.createElement('div')).className='space';
    sidebar.appendChild(header); sidebar.appendChild(addBtn);

    const listEl = document.createElement('div'); listEl.className='list'; sidebar.appendChild(listEl);

    const lessons = load(); let activeIndex = -1;

    function refreshList(){ listEl.innerHTML=''; lessons.forEach((l,i)=>{ const item=document.createElement('div'); item.className='item'+(i===activeIndex?' active':''); item.textContent=`${l.title} (${l.questions.length} Qs)`; item.onclick=()=>{ activeIndex=i; renderActive(); refreshList(); }; listEl.appendChild(item); }); }

    function renderActive(){ canvas.innerHTML=''; if (activeIndex<0){ canvas.textContent='Select or create a lesson'; return; } const lesson=lessons[activeIndex];
      const form=document.createElement('div'); form.className='form';
      const fTitle=document.createElement('input'); fTitle.type='text'; fTitle.value=lesson.title; const fDesc=document.createElement('input'); fDesc.type='text'; fDesc.value=lesson.description||'';
      const btnSave=document.createElement('button'); btnSave.className='btn primary'; btnSave.textContent='Save Lesson'; btnSave.onclick=()=>{ lesson.title=fTitle.value; lesson.description=fDesc.value; save(lessons); refreshList(); };
      const btnDelete=document.createElement('button'); btnDelete.className='btn danger'; btnDelete.textContent='Delete'; btnDelete.onclick=()=>{ if(confirm('Delete lesson?')){ lessons.splice(activeIndex,1); activeIndex=-1; save(lessons); refreshList(); renderActive(); } };
      form.append(fTitle,fDesc,btnSave,btnDelete);

      const qList=document.createElement('div'); qList.className='stack';
      const addQ=document.createElement('button'); addQ.className='btn'; addQ.textContent='Add Question'; addQ.onclick=()=>{ lesson.questions.push({ id: 'q'+(lesson.questions.length+1), text:'New question', answers:['A','B','C','D'], correctIndex:0, explanation:'' }); save(lessons); renderActive(); };

      lesson.questions.forEach((q,qi)=>{ const qCard=document.createElement('div'); qCard.className='card';
        const t=document.createElement('input'); t.type='text'; t.value=q.text; const exp=document.createElement('input'); exp.type='text'; exp.value=q.explanation||'';
        const answers=document.createElement('div'); answers.className='grid-auto'; q.answers.forEach((ans,ai)=>{ const inp=document.createElement('input'); inp.type='text'; inp.value=ans; inp.oninput=()=>{ q.answers[ai]=inp.value; save(lessons) }; answers.appendChild(inp); });
        const sel=document.createElement('select'); q.answers.forEach((_,i)=>{ const opt=document.createElement('option'); opt.value=String(i); opt.textContent='Correct '+(i+1); if (i===q.correctIndex) opt.selected=true; sel.appendChild(opt); }); sel.onchange=()=>{ q.correctIndex=Number(sel.value); save(lessons) };
        const rm=document.createElement('button'); rm.className='btn danger'; rm.textContent='Remove'; rm.onclick=()=>{ lesson.questions.splice(qi,1); save(lessons); renderActive(); };
        t.oninput=()=>{ q.text=t.value; save(lessons) }; exp.oninput=()=>{ q.explanation=exp.value; save(lessons) };
        qCard.append(t,exp,answers,sel,rm); qList.appendChild(qCard);
      });
      canvas.append(form, addQ, qList);
    }

    addBtn.onclick=()=>{ lessons.push({ id: 'custom_'+(Date.now()), title:'Untitled', description:'', questions:[] }); activeIndex=lessons.length-1; save(lessons); refreshList(); renderActive(); };

    refreshList(); renderActive();
    root.append(sidebar, canvas); document.querySelector('#view').appendChild(root);
  }

  window.EDITOR = { renderEditor };
})();