// ================= GAME =================
const symbols=["💀","🎧","🍺","🔥","⚽","🧠","🦊","🐱","🎸","🚀","🍕","👾","🎲","🌈","🥁","🍓","🍉","🍔"];
const BASE_SIDE=4;
const MOBILE_BREAKPOINT=768;
let rows=BASE_SIDE, cols=BASE_SIDE, moves=0, timer=0, intervalId;
let first=null, second=null, lock=false;

const grid=document.getElementById("grid");
const movesEl=document.getElementById("moves");
const timerEl=document.getElementById("timer");
const matrixSelect=document.getElementById("matrixSelect");
const celebrationEl=document.getElementById("celebration");
const confettiLayer=document.getElementById("confettiLayer");
const resultMatrixEl=document.getElementById("resultMatrix");
const resultMovesEl=document.getElementById("resultMoves");
const resultTimeEl=document.getElementById("resultTime");
const resultBadgeEl=document.getElementById("resultBadge");
const recordsModal=document.getElementById("recordsModal");
const recordsListEl=document.getElementById("recordsList");
const RECORDS_KEY="memoryRecordsV1";
const MATRIX_LABELS={16:"4x4",20:"4x5",24:"4x6",28:"4x7"};

function layout(total){
  const isMobile=window.matchMedia(`(max-width:${MOBILE_BREAKPOINT}px)`).matches;
  if(isMobile){
    cols=BASE_SIDE;
    rows=Math.ceil(total/cols);
  }else{
    rows=BASE_SIDE;
    cols=Math.ceil(total/rows);
  }
  const gap=16;
  const vh=window.innerHeight;
  const vw=window.innerWidth;
  const headerH=document.querySelector("header").offsetHeight;
  const footerH=document.querySelector("footer").offsetHeight;
  const h=vh-headerH-footerH-10;
  const w=vw-10;
  const size=Math.floor(Math.min(
    (w-(cols-1)*gap)/cols,
    (h-(rows-1)*gap)/rows
  ));
  document.documentElement.style.setProperty("--card-size",size+"px");
  grid.style.gridTemplateColumns=`repeat(${cols},${size}px)`;
  grid.style.gridTemplateRows=`repeat(${rows},${size}px)`;
}

const shuffle=a=>a.sort(()=>Math.random()-.5);

function build(total){
  grid.innerHTML="";
  const pairs=Math.floor(total/2);
  const chosen=shuffle(symbols).slice(0,pairs);
  const cards=shuffle([...chosen,...chosen]);
  cards.forEach((sym,index)=>{
    const el=document.createElement("div");
    el.className="card";
    el.dataset.sym=sym;
    el.style.setProperty("--i",index);
    el.innerHTML=`<div class="inner"><div class="face"></div><div class="face back">${sym}</div></div>`;
    el.onclick=flip;
    grid.appendChild(el);
  });
}

function flip(e){
  const c=e.currentTarget;
  if(lock||c.classList.contains("flipped"))return;
  c.classList.add("flipped");
  if(!first){first=c;return;}
  second=c;
  moves++;movesEl.textContent="Mosse: "+moves;

  if(first.dataset.sym===second.dataset.sym){
    first=second=null;
    if(document.querySelectorAll(".flipped").length===grid.children.length){
      win();
      return;
    }
  }else{
    lock=true;
    setTimeout(()=>{
      first.classList.remove("flipped");
      second.classList.remove("flipped");
      first=second=null;lock=false;
    },600);
  }
}

function win(){
  clearInterval(intervalId);
  const matrixLabel=matrixSelect.options[matrixSelect.selectedIndex].textContent;
  const hasNewRecord=saveRecord(+matrixSelect.value,moves,timer);
  celebrate({matrixLabel,moves,time:timer,hasNewRecord});
}

function celebrate(result){
  const colors=["#ff3b30","#ff9500","#ffcc00","#34c759","#5ac8fa","#007aff","#ff2d55"];
  confettiLayer.innerHTML="";
  resultMatrixEl.textContent=`Matrice: ${result.matrixLabel}`;
  resultMovesEl.textContent=`Mosse: ${result.moves}`;
  resultTimeEl.textContent=`Tempo: ${formatTime(result.time)}`;
  resultBadgeEl.classList.toggle("show",result.hasNewRecord);

  for(let i=0;i<56;i++){
    const piece=document.createElement("span");
    piece.className="confettiPiece";
    piece.style.left=Math.random()*100+"vw";
    piece.style.background=colors[Math.floor(Math.random()*colors.length)];
    piece.style.setProperty("--dur",(1.2+Math.random()*1.5)+"s");
    piece.style.setProperty("--delay",(Math.random()*.25)+"s");
    piece.style.setProperty("--dx",(Math.random()*120-60)+"px");
    piece.style.setProperty("--spin",(220+Math.random()*760)+"deg");
    confettiLayer.appendChild(piece);
  }

  celebrationEl.classList.add("show");
  setTimeout(()=>celebrationEl.classList.remove("show"),1800);
}

function formatTime(totalSeconds){
  const mins=Math.floor(totalSeconds/60);
  const secs=String(totalSeconds%60).padStart(2,"0");
  return `${mins}:${secs}`;
}

function readRecords(){
  try{
    return JSON.parse(localStorage.getItem(RECORDS_KEY) || "{}");
  }catch{
    return {};
  }
}

function isBetterRecord(next,current){
  if(!current) return true;
  if(next.moves<current.moves) return true;
  if(next.moves===current.moves && next.time<current.time) return true;
  return false;
}

function saveRecord(total,movesCount,timeSpent){
  const matrix=MATRIX_LABELS[total] || `${rows}x${cols}`;
  const records=readRecords();
  const candidate={moves:movesCount,time:timeSpent,updatedAt:Date.now()};
  if(isBetterRecord(candidate,records[matrix])){
    records[matrix]=candidate;
    localStorage.setItem(RECORDS_KEY,JSON.stringify(records));
    return true;
  }
  return false;
}

function renderRecords(){
  const order=["4x4","4x5","4x6","4x7"];
  const records=readRecords();
  const lines=order.map(matrix=>{
    const item=records[matrix];
    if(!item) return `<div class="recordRow"><strong>${matrix}</strong><span>—</span></div>`;
    return `<div class="recordRow"><strong>${matrix}</strong><span>${item.moves} mosse · ${formatTime(item.time)}</span></div>`;
  });
  recordsListEl.innerHTML=lines.join("");
}

function openRecords(){
  renderRecords();
  recordsModal.style.display="flex";
}

function closeRecords(){
  recordsModal.style.display="none";
}

function resetRecords(){
  localStorage.removeItem(RECORDS_KEY);
  renderRecords();
}

function newGame(total){
  moves=0;timer=0;
  movesEl.textContent="Mosse: 0";
  timerEl.textContent="Tempo: 0s";
  clearInterval(intervalId);
  layout(total);
  build(total);
  intervalId=setInterval(()=>{
    timer++;
    timerEl.textContent="Tempo: "+timer+"s";
  },1000);
}

function newGameManual(){
  newGame(+matrixSelect.value);
}

matrixSelect.addEventListener("change",()=>newGame(+matrixSelect.value));

window.addEventListener("resize",()=>{
  newGame(+matrixSelect.value);
});

recordsModal.addEventListener("click",e=>{
  if(e.target===recordsModal) closeRecords();
});

newGame(+matrixSelect.value);

// ================= SERVICE WORKER =================
let newWorker=null;
let isRefreshing=false;

if("serviceWorker" in navigator){
  window.addEventListener("load",()=>{
    navigator.serviceWorker.register("/sw.js",{updateViaCache:"none"}).then(reg=>{
      reg.update();

      navigator.serviceWorker.ready.then(()=>{
        if(navigator.serviceWorker.controller){
          navigator.serviceWorker.controller.postMessage({type:"GET_VERSION"});
        }
      });

      if(reg.waiting){
        newWorker=reg.waiting;
        showUpdateButton();
      }

      reg.addEventListener("updatefound",()=>{
        newWorker=reg.installing;
        newWorker.addEventListener("statechange",()=>{
          if(newWorker.state==="installed" && navigator.serviceWorker.controller){
            showUpdateButton();
          }
        });
      });

      navigator.serviceWorker.addEventListener("controllerchange",()=>{
        if(isRefreshing) return;
        isRefreshing=true;
        window.location.reload();
      });

    });

    navigator.serviceWorker.addEventListener("message",event=>{
      if(event.data?.type==="VERSION"){
        const versionEl=document.getElementById("appVersion") || document.querySelector(".topVersion");
        if(versionEl){
          versionEl.textContent="Versione: "+event.data.version;
        }
      }
    });
  });
}

function showUpdateButton(){
  const btn=document.getElementById("updateBtn");
  btn.style.display="block";
  btn.onclick=()=>{
    if(newWorker && newWorker.state==="installed"){
      newWorker.postMessage({type:"SKIP_WAITING"});
      return;
    }
    window.location.reload();
  };
}
