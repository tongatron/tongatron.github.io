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
const winSummaryEl=document.getElementById("winSummary");

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
  cards.forEach(sym=>{
    const el=document.createElement("div");
    el.className="card";
    el.dataset.sym=sym;
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
    if(document.querySelectorAll(".flipped").length===grid.children.length) win();
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
  celebrate({
    matrix:matrixSelect.options[matrixSelect.selectedIndex].textContent,
    moves,
    elapsed:timer
  });
}

function formatElapsed(totalSeconds){
  const mins=Math.floor(totalSeconds/60);
  const secs=String(totalSeconds%60).padStart(2,"0");
  return `${mins}:${secs}`;
}

function celebrate(result){
  const colors=["#ff3b30","#ff9500","#ffcc00","#34c759","#5ac8fa","#007aff","#ff2d55"];
  confettiLayer.innerHTML="";
  winSummaryEl.textContent=`Matrice ${result.matrix} • Mosse ${result.moves} • Tempo ${formatElapsed(result.elapsed)}`;

  for(let i=0;i<56;i++){
    const piece=document.createElement("span");
    piece.className="confettiPiece";
    piece.style.left=Math.random()*100+"vw";
    piece.style.background=colors[Math.floor(Math.random()*colors.length)];
    piece.style.setProperty("--dur",(1.1+Math.random()*1.2)+"s");
    piece.style.setProperty("--delay",(Math.random()*.35)+"s");
    confettiLayer.appendChild(piece);
  }

  celebrationEl.classList.add("show");
  setTimeout(()=>celebrationEl.classList.remove("show"),1800);
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
