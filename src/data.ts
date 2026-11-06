export type Q={id:string;type:'multiple_choice'|'true_false'|'flashcard';question:string;options?:string[];answer:number|boolean|string;explanation?:string}
export type Chapter={id:string;title:string;questions:Q[]}
export type Subject={subject:{id:string;name:string;description?:string;icon?:string};chapters:Chapter[]}
export const SAMPLE:Subject={subject:{id:'pengantar-pariwisata',name:'Pengantar Pariwisata',description:'Materi dasar ilmu pariwisata',icon:'book-open'},chapters:[
{id:'chapter-1',title:'Konsep Dasar Pariwisata',questions:[
{id:'q001',type:'multiple_choice',question:'Apa yang dimaksud dengan pariwisata?',options:['Kegiatan perjalanan wisata','Kegiatan perdagangan','Kegiatan industri','Kegiatan pertanian'],answer:0,explanation:'Pariwisata berkaitan dengan aktivitas perjalanan dan kegiatan wisata.'},
{id:'q002',type:'true_false',question:'Pariwisata hanya mencakup perjalanan internasional.',answer:false,explanation:'Pariwisata juga mencakup perjalanan domestik.'},
{id:'q003',type:'flashcard',question:'Apa yang dimaksud dengan wisatawan?',answer:'Seseorang yang melakukan perjalanan ke luar lingkungan biasanya untuk tujuan tertentu.'},
{id:'q004',type:'true_false',question:'Wisatawan menetap selamanya di daerah tujuan.',answer:false,explanation:'Wisatawan hanya tinggal sementara.'}]},
{id:'chapter-2',title:'Komponen Pariwisata',questions:[
{id:'q005',type:'multiple_choice',question:'Mana yang termasuk komponen 4A pariwisata?',options:['Attraction','Auction','Alloy','Archive'],answer:0,explanation:'4A: Attraction, Accessibility, Amenity, Ancillary.'},
{id:'q006',type:'flashcard',question:'Sebutkan arti Amenity dalam pariwisata.',answer:'Fasilitas pendukung seperti penginapan, restoran, dan sarana umum.'},
{id:'q007',type:'multiple_choice',question:'Aksesibilitas berkaitan dengan…',options:['Kemudahan mencapai destinasi','Harga tiket','Cuaca','Souvenir'],answer:0}]}]}
export const TEMPLATE=JSON.stringify(SAMPLE,null,2)
export const ICONS:Record<string,string>={'book-open':'📖',book:'📘',globe:'🌏',code:'💻',calculator:'🧮',flask:'🧪',heart:'❤️',map:'🗺️'}
export function validate(raw:string):{data?:Subject;errors:string[]}{
 let j:any;try{j=JSON.parse(raw)}catch(e){return{errors:['File bukan JSON yang valid: '+(e as Error).message]}}
 const er:string[]=[];const s=j?.subject
 if(!s||typeof s.id!=='string'||!s.id)er.push('"subject.id" wajib berupa teks.')
 if(!s||typeof s.name!=='string'||!s.name)er.push('"subject.name" wajib berupa teks.')
 if(!Array.isArray(j?.chapters)||!j.chapters.length)er.push('"chapters" harus berisi minimal satu bab.')
 else j.chapters.forEach((c:any,ci:number)=>{const p=`Bab ${ci+1}`
  if(!c.id||!c.title)er.push(`${p}: "id" dan "title" wajib ada.`)
  if(!Array.isArray(c.questions)||!c.questions.length){er.push(`${p}: "questions" kosong.`);return}
  c.questions.forEach((q:any,qi:number)=>{const w=`${p}, soal ${qi+1}`
   if(!q.id)er.push(`${w}: "id" wajib ada.`)
   if(!q.question)er.push(`${w}: "question" wajib ada.`)
   if(q.type==='multiple_choice'){if(!Array.isArray(q.options)||q.options.length<2)er.push(`${w}: "options" minimal 2 pilihan.`)
    else if(!Number.isInteger(q.answer)||q.answer<0||q.answer>=q.options.length)er.push(`${w}: "answer" harus nomor pilihan (mulai dari 0).`)}
   else if(q.type==='true_false'){if(typeof q.answer!=='boolean')er.push(`${w}: "answer" harus true atau false.`)}
   else if(q.type==='flashcard'){if(typeof q.answer!=='string')er.push(`${w}: "answer" harus berupa teks.`)}
   else er.push(`${w}: "type" harus multiple_choice, true_false, atau flashcard.`)})})
 return er.length?{errors:er.slice(0,12)}:{data:j as Subject,errors:[]}}
