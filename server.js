const SIZE = 15;
function checkWin(board){
  const DR=[0,1,1,1], DC=[1,0,1,-1];
  for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++){
    const p=board[r*SIZE+c];
    if(!p) continue;
    for(let d=0;d<4;d++){
      let ok=true;
      for(let k=1;k<5;k++){
        const nr=r+k*DR[d], nc=c+k*DC[d];
        if(nr<0||nr>=SIZE||nc<0||nc>=SIZE||board[nr*SIZE+nc]!==p){ok=false;break;}
      }
      if(ok) return p;
    }
  }
  return 0;
}
function getRandomMove(board){
  const empty=[];
  for(let i=0;i<SIZE*SIZE;i++) if(board[i]===0) empty.push(i);
  return empty[Math.floor(Math.random()*empty.length)];
}
async function playOneGame(n){
  let board=new Uint8Array(SIZE*SIZE);
  let turn=1, moves=0;
  while(moves<225){
    const move=getRandomMove(board);
    if(move===undefined) break;
    board[move]=turn; moves++;
    if(checkWin(board)!==0) return {winner:turn, moves};
    turn=3-turn;
  }
  return {winner:0, moves};
}
async function run(){
  console.log("=== HELL SERVER STARTED 24/7 ===");
  let total=0;
  while(true){
    total++;
    const r=await playOneGame(total);
    console.log(`[${new Date().toLocaleTimeString()}] Van ${total}: ${r.winner===0?"Hoa":`BOT ${r.winner} thang`} sau ${r.moves} nuoc`);
    await new Promise(res=>setTimeout(res,3000));
  }
}
run();
