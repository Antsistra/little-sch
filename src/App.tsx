import { useEffect, useRef, useState } from 'react'
import { SAMPLE, TEMPLATE, ICONS, validate, type Subject, type Q } from './data'

type Stats={games:number;apples:number;answered:number;correct:number;wrong:number}
type Store={subjects:Subject[];stats:Stats;mistakes:string[];practice:string[];known:string[]}
const KEY='little-scholar-v1'
const load=():Store=>{try{const s=localStorage.getItem(KEY);if(s)return JSON.parse(s)}catch{}
 return{subjects:[SAMPLE],stats:{games:0,apples:0,answered:0,correct:0,wrong:0},mistakes:[],practice:[],known:[]}}
const qk=(s:string,q:string)=>s+'/'+q
type Screen='menu'|'subjects'|'chapters'|'game'|'stats'|'review'|'import'
type Diff='Chill'|'Normal'|'Challenge'
const SPEED:Record<Diff,number>={Chill:170,Normal:120,Challenge:80}
const N=22,C=24

export default function App(){
 const [st,setSt]=useState<Store>(load)
 const [screen,setScreen]=useState<Screen>('menu')
 const [subId,setSubId]=useState<string>(()=>load().subjects[0]?.subject.id??'')
 const [chap,setChap]=useState<string>('all')
 const [diff,setDiff]=useState<Diff>('Normal')
 const [gameKey,setGameKey]=useState(0)
 useEffect(()=>{localStorage.setItem(KEY,JSON.stringify(st))},[st])
 const sub=st.subjects.find(s=>s.subject.id===subId)
 const pool=(s:Subject|undefined,c:string)=>(s?.chapters.filter(x=>c==='all'||x.id===c).flatMap(x=>x.questions)??[])
 const upd=(f:(s:Store)=>Store)=>setSt(f)
 const go=(s:Screen)=>setScreen(s)
 const Back=()=><button className="btn btn2 mb-4" onClick={()=>go('menu')}>← Menu</button>
 const play=()=>{if(!sub)return go('subjects');setGameKey(k=>k+1);go('game')}

 return <div className="max-w-5xl mx-auto p-6 min-h-screen">
 {screen==='menu'&&<div className="flex flex-col items-center pt-8 pop">
  <div className="text-6xl mb-3" aria-hidden></div>
  <h1 className="font-pix text-3xl text-moss mb-2" style={{textShadow:'3px 3px 0 #3b2f22'}}>Little Scholar</h1>
  <p className="mb-8 font-bold">Eat an apple, answer a card, grow longer.</p>
  <div className="card w-96 flex flex-col gap-3">
   <p className="text-sm text-center">Subject: <b>{sub?.subject.name??'none selected'}</b> · {chap==='all'?'All chapters':sub?.chapters.find(c=>c.id===chap)?.title}</p>
   <button className="btn" onClick={play}>Play Game</button>
   <button className="btn btn2" onClick={()=>go('subjects')}>Choose Subject</button>
   <button className="btn btn2" onClick={()=>go('import')}>Import Questions</button>
   <button className="btn btn2" onClick={()=>go('stats')}>Statistics</button>
   <button className="btn btn2" onClick={()=>go('review')}>Review Mistakes ({st.mistakes.length})</button>
   <div className="flex gap-2 justify-center mt-1">{(['Chill','Normal','Challenge'] as Diff[]).map(d=>
    <button key={d} onClick={()=>setDiff(d)} className={'px-3 py-1 rounded-full border-2 border-bark text-sm font-bold '+(diff===d?'bg-apple text-paper':'bg-paper')}>{d}</button>)}</div>
  </div></div>}

 {screen==='subjects'&&<div className="pop"><Back/><h2 className="font-pix text-xl mb-5">Choose subject</h2>
  {!st.subjects.length&&<p className="card">No subjects yet. Import a JSON file to begin.</p>}
  <div className="grid grid-cols-3 gap-4">{st.subjects.map(s=>{const n=pool(s,'all');const k=n.filter(q=>st.known.includes(qk(s.subject.id,q.id))).length
   return <button key={s.subject.id} className="card text-left hover:-translate-y-1 transition" onClick={()=>{setSubId(s.subject.id);setChap('all');go('chapters')}}>
    <div className="text-4xl">{ICONS[s.subject.icon??'']??'📚'}</div>
    <div className="font-extrabold text-lg mt-2">{s.subject.name}</div>
    <div className="text-sm opacity-80">{s.chapters.length} chapters · {n.length} questions</div>
    <div className="h-3 bg-paper border-2 border-bark rounded-full mt-3 overflow-hidden"><div className="h-full bg-leaf" style={{width:(n.length?k/n.length*100:0)+'%'}}/></div>
    <div className="text-xs mt-1">{n.length?Math.round(k/n.length*100):0}% learned</div></button>})}</div></div>}

 {screen==='chapters'&&sub&&<div className="pop"><button className="btn btn2 mb-4" onClick={()=>go('subjects')}>← Subjects</button>
  <h2 className="font-pix text-xl mb-5">{sub.subject.name}</h2>
  <div className="grid grid-cols-2 gap-4">
  {[{id:'all',title:'All Chapters',n:pool(sub,'all').length},...sub.chapters.map(c=>({id:c.id,title:c.title,n:c.questions.length}))].map(c=>
   <div key={c.id} className="card flex items-center justify-between"><div><div className="font-extrabold">{c.title}</div><div className="text-sm">{c.n} questions</div></div>
    <button className="btn" onClick={()=>{setChap(c.id);setGameKey(k=>k+1);go('game')}}>Play</button></div>)}</div></div>}

 {screen==='game'&&sub&&<Game key={gameKey} sub={sub} chap={chap} diff={diff} st={st} upd={upd} pool={pool(sub,chap)} onExit={()=>go('menu')} onAgain={()=>setGameKey(k=>k+1)}/>}

 {screen==='stats'&&<div className="pop"><Back/><h2 className="font-pix text-xl mb-5">Statistics</h2>
  <div className="grid grid-cols-4 gap-4 mb-6">{[['Games',st.stats.games],['Apples',st.stats.apples],['Answered',st.stats.answered],['Accuracy',(st.stats.answered?Math.round(st.stats.correct/st.stats.answered*100):0)+'%'],['Correct',st.stats.correct],['Incorrect',st.stats.wrong]].map(([l,v])=>
   <div key={l as string} className="card text-center"><div className="font-pix text-lg text-moss">{v}</div><div className="text-sm mt-2">{l}</div></div>)}</div>
  <div className="grid grid-cols-2 gap-4"><div className="card"><h3 className="font-extrabold mb-2">Progress per subject</h3>
   {st.subjects.map(s=>{const n=pool(s,'all');const k=n.filter(q=>st.known.includes(qk(s.subject.id,q.id))).length;return <div key={s.subject.id} className="mb-2 text-sm">{s.subject.name}: {k}/{n.length}
    <div className="h-2 bg-paper border border-bark rounded-full"><div className="h-full bg-leaf rounded-full" style={{width:(n.length?k/n.length*100:0)+'%'}}/></div></div>})}</div>
   <div className="card"><h3 className="font-extrabold mb-2">Needs more practice</h3>
    {!st.practice.length&&<p className="text-sm">Nothing flagged yet.</p>}
    {st.practice.slice(-8).map(k=>{const q=find(st,k);return q&&<p key={k} className="text-sm mb-1">• {q.question}</p>})}</div></div></div>}

 {screen==='review'&&<div className="pop"><Back/><h2 className="font-pix text-xl mb-5">Review mistakes</h2>
  {!st.mistakes.length&&<p className="card">No mistakes saved. Nice work!</p>}
  <div className="flex flex-col gap-3">{st.mistakes.map(k=>{const q=find(st,k);if(!q)return null
   return <div key={k} className="card"><div className="font-bold">{q.question}</div>
    <div className="text-sm mt-1">Answer: <b>{ansText(q)}</b></div>{q.explanation&&<div className="text-sm opacity-80">{q.explanation}</div>}
    <button className="btn btn2 mt-3 !py-1 text-sm" onClick={()=>upd(s=>({...s,mistakes:s.mistakes.filter(m=>m!==k)}))}>Got it, remove</button></div>})}</div></div>}

 {screen==='import'&&<ImportScreen st={st} upd={upd} back={()=>go('menu')}/>}
 </div>
}
function find(st:Store,k:string):Q|undefined{const[sid,qid]=k.split('/');return st.subjects.find(s=>s.subject.id===sid)?.chapters.flatMap(c=>c.questions).find(q=>q.id===qid)}
function ansText(q:Q){return q.type==='multiple_choice'?q.options![q.answer as number]:q.type==='true_false'?(q.answer?'True':'False'):String(q.answer)}

function ImportScreen({st,upd,back}:{st:Store;upd:(f:(s:Store)=>Store)=>void;back:()=>void}){
 const [res,setRes]=useState<ReturnType<typeof validate>|null>(null)
 const [msg,setMsg]=useState('')
 const file=async(f?:File)=>{if(!f)return;setMsg('');setRes(validate(await f.text()))}
 const save=()=>{const d=res!.data!;upd(s=>({...s,subjects:[...s.subjects.filter(x=>x.subject.id!==d.subject.id),d]}));setMsg(`Saved "${d.subject.name}". It's ready to play.`);setRes(null)}
 const del=(id:string)=>{if(confirm('Delete this subject and its progress?'))upd(s=>({...s,subjects:s.subjects.filter(x=>x.subject.id!==id),mistakes:s.mistakes.filter(k=>!k.startsWith(id+'/')),practice:s.practice.filter(k=>!k.startsWith(id+'/')),known:s.known.filter(k=>!k.startsWith(id+'/'))}))}
 const dl=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([TEMPLATE],{type:'application/json'}));a.download='sample-questions.json';a.click()}
 return <div className="pop"><button className="btn btn2 mb-4" onClick={back}>← Menu</button><h2 className="font-pix text-xl mb-5">Import questions</h2>
 <div className="grid grid-cols-2 gap-4"><div className="card flex flex-col gap-3">
  <label className="btn text-center cursor-pointer">Import JSON<input type="file" accept=".json,application/json" className="hidden" onChange={e=>{file(e.target.files?.[0]);e.target.value=''}}/></label>
  <button className="btn btn2" onClick={dl}>Download sample template</button>
  {msg&&<p className="font-bold text-moss">{msg}</p>}
  {res?.errors.length?<div className="bg-paper border-2 border-apple rounded-xl p-3 text-sm"><b>Can't import yet:</b><ul className="list-disc ml-5">{res.errors.map((e,i)=><li key={i}>{e}</li>)}</ul></div>:null}
  {res?.data&&<div className="bg-paper border-2 border-bark rounded-xl p-3 text-sm max-h-72 overflow-auto"><b>{res.data.subject.name}</b>
   {res.data.chapters.map(c=><div key={c.id} className="mt-2"><b>{c.title}</b> ({c.questions.length})<ul className="ml-4 list-disc">{c.questions.slice(0,3).map(q=><li key={q.id}>{q.question}</li>)}</ul></div>)}
   <button className="btn mt-3" onClick={save}>Confirm and save</button></div>}
 </div>
 <div className="card"><h3 className="font-extrabold mb-3">Imported subjects</h3>
  {st.subjects.map(s=><div key={s.subject.id} className="flex justify-between items-center mb-2"><span>{s.subject.name}</span>
   <button className="text-apple font-bold underline" onClick={()=>del(s.subject.id)}>Delete</button></div>)}</div></div></div>
}

type Phase='play'|'question'|'count'|'over'
function Game({sub,chap,diff,st,upd,pool,onExit,onAgain}:{sub:Subject;chap:string;diff:Diff;st:Store;upd:(f:(s:Store)=>Store)=>void;pool:Q[];onExit:()=>void;onAgain:()=>void}){
 const cv=useRef<HTMLCanvasElement>(null)
 const g=useRef({snake:[{x:10,y:11},{x:9,y:11},{x:8,y:11}],dir:{x:1,y:0},next:{x:1,y:0},apple:{x:15,y:11},recent:[] as string[],moved:false})
 const [phase,setPhase]=useState<Phase>('play')
 const [score,setScore]=useState(0)
 const [apples,setApples]=useState(0)
 const [q,setQ]=useState<Q|null>(null)
 const [count,setCount]=useState(3)
 const [sess,setSess]=useState({right:0,wrong:0})
 const [started,setStarted]=useState(false)
 const counted=useRef(false)

 const spawn=()=>{const s=g.current.snake;let p:{x:number;y:number};do{p={x:Math.floor(Math.random()*N),y:Math.floor(Math.random()*N)}}while(s.some(c=>c.x===p.x&&c.y===p.y));g.current.apple=p}
 const pick=():Q=>{const r=g.current.recent;let c=pool.filter(x=>!r.includes(x.id));if(!c.length)c=pool
  const w=c.flatMap(x=>st.practice.includes(qk(sub.subject.id,x.id))?[x,x,x]:[x]);const x=w[Math.floor(Math.random()*w.length)]
  g.current.recent=[...r,x.id].slice(-Math.min(5,Math.max(pool.length-1,0)));return x}

 const draw=()=>{const c=cv.current!.getContext('2d')!;const{snake,apple}=g.current
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){c.fillStyle=(x+y)%2?'#c8dca2':'#d4e5b0';c.fillRect(x*C,y*C,C,C)}
  c.fillStyle='#d6453d';c.fillRect(apple.x*C+4,apple.y*C+6,C-8,C-9);c.fillStyle='#8e2a25';c.fillRect(apple.x*C+4,apple.y*C+C-6,C-8,3)
  c.fillStyle='#3b2f22';c.fillRect(apple.x*C+11,apple.y*C+2,3,5);c.fillStyle='#4f7a3a';c.fillRect(apple.x*C+14,apple.y*C+2,5,4)
  snake.forEach((s,i)=>{c.fillStyle=i?'#4f7a3a':'#34592a';c.fillRect(s.x*C+1,s.y*C+1,C-2,C-2);c.fillStyle='#8fb86a';if(i)c.fillRect(s.x*C+4,s.y*C+4,C-10,4)
   if(!i){c.fillStyle='#fffaea';const d=g.current.dir;const ex=d.x?(d.x>0?14:4):4,ey=d.y?(d.y>0?14:4):4
    c.fillRect(s.x*C+(d.x?ex:4),s.y*C+(d.y?ey:5),5,5);c.fillRect(s.x*C+(d.x?ex:15),s.y*C+(d.y?ey:5),5,5)
    c.fillStyle='#3b2f22';c.fillRect(s.x*C+(d.x?ex+2:6),s.y*C+(d.y?ey+2:7),2,2);c.fillRect(s.x*C+(d.x?ex+2:17),s.y*C+(d.y?ey+2:7),2,2)}})}

 const end=()=>{setPhase('over');if(!counted.current){counted.current=true;upd(s=>({...s,stats:{...s.stats,games:s.stats.games+1}}))}}
 const tick=()=>{const G=g.current;G.dir=G.next;const h={x:G.snake[0].x+G.dir.x,y:G.snake[0].y+G.dir.y}
  if(h.x<0||h.y<0||h.x>=N||h.y>=N||G.snake.slice(0,-1).some(c=>c.x===h.x&&c.y===h.y)){draw();return end()}
  G.snake.unshift(h)
  if(h.x===G.apple.x&&h.y===G.apple.y){spawn();setApples(a=>a+1);setScore(s=>s+10);upd(s=>({...s,stats:{...s.stats,apples:s.stats.apples+1}}))
   if(pool.length){setQ(pick());setPhase('question')}else{setCount(3);setPhase('count')}}
  else G.snake.pop()
  draw()}

 useEffect(()=>{draw()},[phase])
 useEffect(()=>{if(phase!=='play'||!started)return;const id=setInterval(tick,SPEED[diff]);return()=>clearInterval(id)},[phase,started])
 useEffect(()=>{if(phase!=='count')return;if(count<=0){setPhase('play');return}const t=setTimeout(()=>setCount(count-1),700);return()=>clearTimeout(t)},[phase,count])
 useEffect(()=>{const m:Record<string,[number,number]>={ArrowUp:[0,-1],w:[0,-1],W:[0,-1],ArrowDown:[0,1],s:[0,1],S:[0,1],ArrowLeft:[-1,0],a:[-1,0],A:[-1,0],ArrowRight:[1,0],d:[1,0],D:[1,0]}
  const f=(e:KeyboardEvent)=>{const v=m[e.key];if(!v)return;e.preventDefault();if(phase!=='play')return
   const G=g.current;if(v[0]===-G.dir.x&&v[1]===-G.dir.y)return;G.next={x:v[0],y:v[1]};setStarted(true)}
  window.addEventListener('keydown',f);return()=>window.removeEventListener('keydown',f)},[phase])

 const answered=(ok:boolean,mark:'know'|'practice'|null)=>{const k=qk(sub.subject.id,q!.id)
  upd(s=>({...s,stats:{...s.stats,answered:s.stats.answered+1,correct:s.stats.correct+(ok?1:0),wrong:s.stats.wrong+(ok?0:1)},
   mistakes:ok?s.mistakes:s.mistakes.includes(k)?s.mistakes:[...s.mistakes,k],
   known:ok&&!s.known.includes(k)?[...s.known,k]:s.known,
   practice:mark==='practice'?(s.practice.includes(k)?s.practice:[...s.practice,k]):ok?s.practice.filter(p=>p!==k):s.practice}))
  setSess(x=>({right:x.right+(ok?1:0),wrong:x.wrong+(ok?0:1)}));if(ok)setScore(s=>s+25)}
 const resume=()=>{setQ(null);setCount(3);setPhase('count')}
 const cname=chap==='all'?'All chapters':sub.chapters.find(c=>c.id===chap)?.title

 return <div className="flex gap-6 justify-center pt-2">
  <div className="relative"><canvas ref={cv} width={N*C} height={N*C} className="rounded-2xl border-4 border-bark shadow-soft"/>
   {!started&&phase==='play'&&<div className="absolute inset-0 flex items-center justify-center pointer-events-none"><p className="bg-cream border-2 border-bark rounded-xl px-4 py-2 font-bold">Press an arrow key or WASD to start</p></div>}
   {phase==='count'&&<div className="absolute inset-0 flex items-center justify-center bg-bark/30 rounded-2xl"><span className="font-pix text-6xl text-paper pop" key={count}>{count||'Go!'}</span></div>}
   {phase==='question'&&q&&<QCard q={q} onDone={answered} onNext={resume}/>}
   {phase==='over'&&<div className="absolute inset-0 flex items-center justify-center bg-bark/50 rounded-2xl"><div className="card text-center pop w-80">
    <h2 className="font-pix text-lg text-apple mb-4">Game over</h2><p>Score: <b>{score}</b></p><p>Apples: <b>{apples}</b></p>
    <p>Correct: <b>{sess.right}</b> · Missed: <b>{sess.wrong}</b></p>
    <div className="flex flex-col gap-2 mt-4"><button className="btn" onClick={onAgain}>Play again</button><button className="btn btn2" onClick={onExit}>Menu</button></div></div></div>}
  </div>
  <div className="card w-60 h-fit flex flex-col gap-3"><div><div className="text-xs">Subject</div><div className="font-extrabold">{sub.subject.name}</div><div className="text-sm">{cname}</div></div>
   <div><div className="text-xs">Score</div><div className="font-pix text-xl text-moss">{score}</div></div>
   <div>🍎 Apples: <b>{apples}</b></div><div>Mode: <b>{diff}</b></div>
   <button className="btn btn2 !py-2" onClick={onExit}>Quit</button></div></div>
}

function QCard({q,onDone,onNext}:{q:Q;onDone:(ok:boolean,m:'know'|'practice'|null)=>void;onNext:()=>void}){
 const [sel,setSel]=useState<number|boolean|null>(null)
 const [rev,setRev]=useState(false)
 const [fin,setFin]=useState(false)
 const pickAns=(v:number|boolean)=>{if(sel!==null)return;setSel(v);onDone(v===q.answer,null);setFin(true)}
 const cls=(v:number|boolean)=>'w-full text-left rounded-xl border-2 border-bark px-4 py-3 font-bold transition '+(sel===null?'bg-paper hover:bg-sage':v===q.answer?'bg-leaf':v===sel?'bg-apple text-paper':'bg-paper opacity-60')
 return <div className="absolute inset-0 flex items-center justify-center bg-bark/40 rounded-2xl p-4"><div className="card w-full pop max-h-full overflow-auto">
  <div className="text-xs mb-1">{q.type==='flashcard'?'Flashcard':q.type==='true_false'?'True or false':'Multiple choice'}</div>
  <p className="font-extrabold text-lg mb-4">{q.question}</p>
  {q.type==='multiple_choice'&&<div className="flex flex-col gap-2">{q.options!.map((o,i)=><button key={i} className={cls(i)} onClick={()=>pickAns(i)}>{o}</button>)}</div>}
  {q.type==='true_false'&&<div className="flex gap-3">{[true,false].map(v=><button key={String(v)} className={cls(v)+' text-center'} onClick={()=>pickAns(v)}>{v?'True':'False'}</button>)}</div>}
  {q.type==='flashcard'&&(!rev?<button className="btn" onClick={()=>setRev(true)}>Reveal answer</button>:<div>
   <p className="bg-paper border-2 border-bark rounded-xl p-3 mb-3">{String(q.answer)}</p>
   {!fin&&<div className="flex gap-3"><button className="btn" onClick={()=>{onDone(true,'know');setFin(true)}}>Know it</button><button className="btn btn2" onClick={()=>{onDone(false,'practice');setFin(true)}}>Need practice</button></div>}</div>)}
  {fin&&<div className="mt-4">{q.type!=='flashcard'&&<p className="font-bold mb-1">{sel===q.answer?'Correct! +25':'Not quite.'}</p>}
   {q.explanation&&<p className="text-sm mb-3">{q.explanation}</p>}<button className="btn" onClick={onNext} autoFocus>Continue</button></div>}
 </div></div>
}
