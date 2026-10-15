const http = require('http');
const PORT = process.env.PORT || 10000;
let stats = { total: 0, results: {} };
let currentMatch = "Dang khoi dong...";

http.createServer((req,res)=>{
  res.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
  res.end(`<h1>HELL ARENA v8-12 24/7</h1>
  <p>${currentMatch}</p>
  <p>Tong van: ${stats.total}</p>
  <pre>${JSON.stringify(stats.results, null, 2)}</pre>`);
}).listen(PORT, ()=>console.log('Web running on '+PORT));

const SIZE = 15;
const BOTS = [
  { name: 'v8', depth: 2, evalLevel: 1 },
  { name: 'v9', depth: 2, evalLevel: 2 },
  { name: 'v10', depth: 3, evalLevel: 2 },
  { name: 'v11', depth: 3, evalLevel: 3 },
  { name: 'v12', depth: 4, evalLevel: 3 },
];

function checkWin(board){
  const DR=[0,1,1,1], DC=[1,0,1,-1];
  for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++){
    const p=board[r*SIZE+c]; if(!p) continue;
    for(let d=0;d<4;d++){
      let win=true;
      for(let k=1;k<5;k++){
        const nr=r+k*DR[d], nc=c+k*DC[d];
        if(nr<0||nr>=SIZE||nc<0||nc>=SIZE||board[nr*SIZE+nc]!==p){win=false;break;}
      }
      if(win) return p;
    }
  }
  return 0;
}

function getNeighbors(board){
  const set=new Set();
  let has=false;
  for(let i=0;i<SIZE*SIZE;i++) if(board[i]){ has=true; break; }
  if(!has) return [112]; // di giua ban
  for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++){
    if(board[r*SIZE+c]){
      for(let dr=-2;dr<=2;dr++)for(let dc=-2;dc<=2;dc++){
        const nr=r+dr, nc=c+dc;
        if(nr>=0&&nr<SIZE&&nc>=0&&nc<SIZE&&board[nr*SIZE+nc]==0) set.add(nr*SIZE+nc);
      }
    }
  }
  return Array.from(set);
}

function evaluate(board, player, level){
  // dem so 2,3,4 lien tiep
  let score=0;
  const DR=[0,1,1,1], DC=[1,0,1,-1];
  for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++){
    for(let d=0;d<4;d++){
      let cntMe=0,cntEmpty=0;
      for(let k=0;k<5;k++){
        const nr=r+k*DR[d], nc=c+k*DC[d];
        if(nr<0||nr>=SIZE||nc<0||nc>=SIZE) break;
        const p=board[nr*SIZE+nc];
        if(p==player) cntMe++;
        else if(p==0) cntEmpty++;
      }
      if(cntMe==4&&cntEmpty==1) score+= level>=2 ? 5000:1000;
      if(cntMe==3&&cntEmpty==2) score+= level>=2 ? 200:50;
      if(cntMe==2&&cntEmpty==3) score+= level>=3 ? 20:5;
    }
  }
  return score;
}

function minimax(board, depth, isMax, player, alpha, beta, level){
  const win=checkWin(board);
  if(win) return win==player ? 100000 : -100000;
  if(depth==0) return evaluate(board, player, level) - evaluate(board, 3-player, level);

  const moves=getNeighbors(board).slice(0, level==1?8: level==2?12:20);
  if(isMax){
    let max=-Infinity;
    for(const m of moves){
      board[m]=player;
      const val=minimax(board, depth-1, false, player, alpha, beta, level);
      board[m]=0;
      max=Math.max(max,val); alpha=Math.max(alpha,val);
      if(beta<=alpha) break;
    }
    return max;
  } else {
    let min=Infinity;
    for(const m of moves){
      board[m]=3-player;
      const val=minimax(board, depth-1, true, player, alpha, beta, level);
      board[m]=0;
      min=Math.min(min,val); beta=Math.min(beta,val);
      if(beta<=alpha) break;
    }
    return min;
  }
}

function getBestMove(board, bot, player){
  const moves=getNeighbors(board);
  let best=-1, bestScore=-Infinity;
  for(const m of moves){
    board[m]=player;
    if(checkWin(board)==player){ board[m]=0; return m; }
    // chan thang ngay
    board[m]=3-player;
    if(checkWin(board)==3-player){ board[m]=0; board[m]=player; const s=90000; if(s>bestScore){bestScore=s; best=m;} board[m]=0; continue; }
    board[m]=0;
    
    board[m]=player;
    const score=minimax(board, bot.depth-1, false, player, -Infinity, Infinity, bot.evalLevel);
    board[m]=0;
    if(score>bestScore){ bestScore=score; best=m; }
  }
  return best==-1? moves[0]: best;
}

async function runHell(){
  console.log("=== HELL ARENA v8-9-10-11-12 STARTED ===");
  let pairIdx=0;
  const pairs=[];
  for(let i=0;i<BOTS.length;i++)for(let j=i+1;j<BOTS.length;j++){
    pairs.push([BOTS[i], BOTS[j]]); pairs.push([BOTS[j], BOTS[i]]);
  }
  
  while(true){
    const [bot1, bot2]=pairs[pairIdx % pairs.length];
    pairIdx++;
    currentMatch=`${bot1.name} (X) vs ${bot2.name} (O)`;
    
    let board=new Uint8Array(SIZE*SIZE);
    let turn=1, moves=0, winner=0;
    while(moves<225){
      const bot = turn==1 ? bot1 : bot2;
      const mv=getBestMove(board, bot, turn);
      if(mv==undefined) break;
      board[mv]=turn; moves++;
      if(checkWin(board)){ winner=turn; break; }
      turn=3-turn;
    }
    
    stats.total++;
    const key=`${bot1.name} vs ${bot2.name}`;
    const resultKey= winner==0 ? 'hoa' : (winner==1 ? bot1.name+' thang' : bot2.name+' thang');
    if(!stats.results[key]) stats.results[key]={};
    stats.results[key][resultKey]=(stats.results[key][resultKey]||0)+1;

    const winName = winner==0 ? "HOA" : (winner==1 ? bot1.name : bot2.name);
    console.log(`[Van ${stats.total}] ${bot1.name} vs ${bot2.name} -> ${winName} THANG sau ${moves} nuoc | ${JSON.stringify(stats.results[key])}`);
    
    await new Promise(r=>setTimeout(r, 1000)); // nghi 1s cho do nong
  }
}
runHell();
