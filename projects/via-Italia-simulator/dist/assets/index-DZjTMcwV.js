const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./BootScene-Sti6a6Rw.js","./phaser-BQIkxI0w.js","./StreetScene-C2u9-xgc.js"])))=>i.map(i=>d[i]);
var e=Object.create,t=Object.defineProperty,n=Object.getOwnPropertyDescriptor,r=Object.getOwnPropertyNames,i=Object.getPrototypeOf,a=Object.prototype.hasOwnProperty,o=(e,t)=>()=>(t||e((t={exports:{}}).exports,t),t.exports),s=(e,i,o,s)=>{if(i&&typeof i==`object`||typeof i==`function`)for(var c=r(i),l=0,u=c.length,d;l<u;l++)d=c[l],!a.call(e,d)&&d!==o&&t(e,d,{get:(e=>i[e]).bind(null,d),enumerable:!(s=n(i,d))||s.enumerable});return e},c=(n,r,a)=>(a=n==null?{}:e(i(n)),s(r||!n||!n.__esModule?t(a,`default`,{value:n,enumerable:!0}):a,n));(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var l=new class{flags=new Set;quests=new Map;listeners=new Set;subscribe(e){return this.listeners.add(e),e(this.getSnapshot()),()=>{this.listeners.delete(e)}}hasFlag(e){return this.flags.has(e)}matchesConditions(e){let t=e.requiredFlags??[],n=e.absentFlags??[];return t.every(e=>this.flags.has(e))&&n.every(e=>!this.flags.has(e))}setFlag(e){this.flags.has(e)||(this.flags.add(e),this.notify())}startQuest(e){return this.quests.has(e.id)?!1:(this.quests.set(e.id,{...e,currentStep:0,completed:!1}),this.notify(),!0)}advanceQuest(e){let t=this.quests.get(e);if(!t||t.completed)return!1;let n=t.currentStep+1;return t.currentStep=n,t.completed=n>=t.steps.length,this.notify(),!0}getQuest(e){let t=this.quests.get(e);return t?{...t,steps:[...t.steps]}:void 0}getSnapshot(){return{flags:[...this.flags],quests:[...this.quests.values()].map(e=>({...e,steps:[...e.steps]}))}}notify(){let e=this.getSnapshot();this.listeners.forEach(t=>{t(e)})}},u=null;function d(e){return e.quests.length===0?`
      <p class="quest-empty">
        Nessuna missione attiva. Avvicinati all'Assessore del Decoro e ascolta la sua emergenza amministrativa.
      </p>
    `:e.quests.map(e=>{let t=e.completed?`Chiusa`:`Attiva`,n=e.steps.map((t,n)=>{let r=e.completed||n<e.currentStep,i=!e.completed&&n===e.currentStep;return`<li class="${[`quest-step`,r?`is-done`:``,i?`is-active`:``].filter(Boolean).join(` `)}">${t}</li>`}).join(``);return`
        <article class="quest-card">
          <div class="quest-card-header">
            <h3>${e.title}</h3>
            <span class="quest-status ${e.completed?`is-complete`:``}">${t}</span>
          </div>
          <p class="quest-summary">${e.summary}</p>
          <ol class="quest-steps">${n}</ol>
          <p class="quest-reward">${e.rewardText}</p>
        </article>
      `}).join(``)}function f(e){return{renderSnapshot(t){e.questLog.innerHTML=d(t)},setPrompt(t){if(!t){e.promptChip.classList.add(`hidden`),e.promptChip.textContent=``;return}e.promptChip.textContent=`E - ${t}`,e.promptChip.classList.remove(`hidden`)},showDialogue(t,n){e.dialogueSpeaker.textContent=t.speaker,e.dialogueText.textContent=t.text,e.dialogueChoices.replaceChildren(),t.choices.forEach(t=>{let r=document.createElement(`button`);r.type=`button`,r.textContent=t.label,r.addEventListener(`click`,()=>{n(t.id)}),e.dialogueChoices.append(r)}),e.dialoguePanel.classList.remove(`hidden`)},hideDialogue(){e.dialoguePanel.classList.add(`hidden`),e.dialogueChoices.replaceChildren()},pushToast(t){let n=document.createElement(`div`);n.className=`toast`,n.textContent=t,e.toastStack.prepend(n),window.setTimeout(()=>{n.remove()},3200)}}}function p(e){u=e}function m(){if(!u)throw Error(`Overlay controller non registrato.`);return u}var h=`modulepreload`,g=function(e,t){return new URL(e,t).href},_={},v=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e=document.getElementsByTagName(`link`),i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}r=o(t.map(t=>{if(t=g(t,n),t in _)return;_[t]=!0;let r=t.endsWith(`.css`),i=r?`[rel="stylesheet"]`:``;if(n)for(let n=e.length-1;n>=0;n--){let i=e[n];if(i.href===t&&(!r||i.rel===`stylesheet`))return}else if(document.querySelector(`link[href="${t}"]${i}`))return;let o=document.createElement(`link`);if(o.rel=r?`stylesheet`:h,r||(o.as=`script`),o.crossOrigin=``,o.href=t,a&&o.setAttribute(`nonce`,a),document.head.appendChild(o),r)return new Promise((e,n)=>{o.addEventListener(`load`,e),o.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${t}`)))})}))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},y=document.querySelector(`#app`);if(!y)throw Error(`App root non trovato.`);y.innerHTML=`
  <div class="page-shell">
    <aside class="info-panel">
      <p class="eyebrow">Biella, favori minori e grandi opinioni</p>
      <h1>Via Italia Simulator</h1>
      <p class="lede">
        Un prototipo giocabile ambientato nel tratto pedonale piu chiacchierato della citta.
        Passeggia, parla con l'Assessore del Decoro e inaugura il primo micro-dramma civico.
      </p>

      <section class="card">
        <h2>Loop iniziale</h2>
        <ul class="bullet-list">
          <li>Cammina con <strong>WASD</strong> o frecce.</li>
          <li>Interagisci con <strong>E</strong>.</li>
          <li>Attiva una missione e chiudila tornando dal personaggio.</li>
        </ul>
      </section>

      <section class="card">
        <h2>Missioni e stato</h2>
        <div id="quest-log" class="quest-log"></div>
      </section>
    </aside>

    <section class="stage-panel">
      <div id="game-root" class="game-root"></div>
      <div id="prompt-chip" class="prompt-chip hidden"></div>
      <div id="toast-stack" class="toast-stack"></div>

      <div id="dialogue-panel" class="dialogue-panel hidden">
        <div class="dialogue-card">
          <p id="dialogue-speaker" class="dialogue-speaker"></p>
          <p id="dialogue-text" class="dialogue-text"></p>
          <div id="dialogue-choices" class="dialogue-choices"></div>
        </div>
      </div>
    </section>
  </div>
`;var b=document.querySelector(`#quest-log`),x=document.querySelector(`#prompt-chip`),S=document.querySelector(`#toast-stack`),C=document.querySelector(`#dialogue-panel`),w=document.querySelector(`#dialogue-speaker`),T=document.querySelector(`#dialogue-text`),E=document.querySelector(`#dialogue-choices`);if(!b||!x||!S||!C||!w||!T||!E)throw Error(`Overlay UI incompleta.`);var D=f({questLog:b,promptChip:x,toastStack:S,dialoguePanel:C,dialogueSpeaker:w,dialogueText:T,dialogueChoices:E});p(D),l.subscribe(e=>{D.renderSnapshot(e)});async function O(){let[{default:e},{BootScene:t},{StreetScene:n}]=await Promise.all([v(()=>import(`./phaser-BQIkxI0w.js`).then(e=>c(e.default,1)),[],import.meta.url),v(()=>import(`./BootScene-Sti6a6Rw.js`),__vite__mapDeps([0,1]),import.meta.url),v(()=>import(`./StreetScene-C2u9-xgc.js`),__vite__mapDeps([2,1]),import.meta.url)]),r={type:e.AUTO,parent:`game-root`,backgroundColor:`#efe0c1`,scale:{mode:e.Scale.FIT,autoCenter:e.Scale.CENTER_BOTH,width:1280,height:720},physics:{default:`arcade`,arcade:{gravity:{x:0,y:0},debug:!1}},scene:[t,n]};new e.Game(r)}O();export{c as i,l as n,o as r,m as t};