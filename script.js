const totalRodadas = 6;
const desafios = [
  { lado: 'esquerda', tipo: 'pequeno', titulo: '🚨 Invasor detectado à ESQUERDA!', texto: 'A base está sendo atacada! O campo de força protege o núcleo, mas você precisa virar o canhão para o lado da ameaça. Primeiro configure a arma; depois deixe o zumbi atingir a barreira para abrir a chance de contra-ataque.', dica: 'Aponte para a esquerda, mantenha a arma no tamanho normal e use overflow: hidden para limitar a área do escudo.', direcao: 1, tamanho: 1, overflow: 'hidden' },
  { lado: 'direita', tipo: 'pequeno', titulo: '⚠️ Ataque pelo FLANCO DIREITO!', texto: 'O radar detectou outro invasor do lado oposto! A barreira vai proteger a base novamente. Gire o canhão para a direita e prepare a defesa.', dica: 'Aponte para a direita, mantenha scale(1) e overflow: hidden.', direcao: -1, tamanho: 1, overflow: 'hidden' },
  { lado: 'esquerda', tipo: 'grande', titulo: '☠️ CHEFE GIGANTE — lado ESQUERDO!', texto: 'Um colosso está avançando! O escudo vai segurar a pancada, mas o canhão precisa crescer para alcançar esse inimigo enorme. Aguarde o impacto bloqueado e então dispare!', dica: 'Aponte para a esquerda, use scale(2.2) e overflow: visible para ampliar a área útil da arma.', direcao: 1, tamanho: 2.2, overflow: 'visible' },
  { lado: 'direita', tipo: 'pequeno', titulo: '🎯 Invasor veloz à DIREITA!', texto: 'O gigante não veio sozinho! Um zumbi rápido tenta aproveitar a distração. Reposicione a arma para o lado direito e mantenha o equipamento dentro da proteção.', dica: 'Aponte para a direita, use scale(1) e overflow: hidden.', direcao: -1, tamanho: 1, overflow: 'hidden' },
  { lado: 'direita', tipo: 'grande', titulo: '💀 O GIGANTE VOLTOU — lado DIREITO!', texto: 'ALERTA MÁXIMO! O chefe gigante retornou pelo outro lado e está pressionando a barreira! Vire o canhão, aumente seu alcance e prepare o disparo decisivo depois que o escudo repelir o impacto.', dica: 'Aponte para a direita, use scale(2.2) e overflow: visible.', direcao: -1, tamanho: 2.2, overflow: 'visible' },
  { lado: 'esquerda', tipo: 'mini', titulo: '🧪 Último invasor: alvo pequeno à ESQUERDA!', texto: 'A energia do escudo está estabilizando. Um último alvo pequeno apareceu à esquerda. Faça um ajuste preciso para proteger o núcleo e encerrar a missão!', dica: 'Aponte para a esquerda, reduza a arma com scale(0.7) e mantenha overflow: hidden.', direcao: 1, tamanho: 0.7, overflow: 'hidden' }
];

let rodada = 0;
let direcao = 1;
let tamanho = 1;
let overflow = 'hidden';
let desafioAtual = null;
let fase = 'inicio'; // inicio, configurando, andando, tiro, fim
let zombieX = 0;
let moveTimer = null;
let tiroTimer = null;

const $ = (id) => document.getElementById(id);
const world = $('game-world');
const zombie = $('zombie');
const hero = $('hero');
const shield = $('shield-box');

function log(msg) { $('terminal-log').innerHTML = `<span class="prompt">ps1&gt;</span> ${msg}`; }
function atualizarArma() {
  hero.style.transform = `scale(${tamanho}) scaleX(${direcao})`;
  shield.classList.toggle('overflow-hidden', overflow === 'hidden');
  shield.classList.toggle('overflow-visible', overflow === 'visible');
  $('btn-left').classList.toggle('active-rule', direcao === -1);
  $('btn-right').classList.toggle('active-rule', direcao === 1);
  $('btn-mini').classList.toggle('active-rule', tamanho === 0.7);
  $('btn-normal').classList.toggle('active-rule', tamanho === 1);
  $('btn-big').classList.toggle('active-rule', tamanho > 1);
  $('btn-hidden').classList.toggle('active-rule', overflow === 'hidden');
  $('btn-visible').classList.toggle('active-rule', overflow === 'visible');
  const transformLine = `transform: scale(${tamanho}) scaleX(${direcao});`;
  $('btn-left').innerHTML = `/* ${transformLine} */ <span class="comment">/* ESQUERDA */</span>`;
  $('btn-right').innerHTML = `/* ${transformLine} */ <span class="comment">/* DIREITA */</span>`;
  $('btn-mini').innerHTML = `/* transform: scale(0.7); */ <span class="comment">/* ARMA PRECISA */</span>`;
  $('btn-normal').innerHTML = `/* transform: scale(1); */ <span class="comment">/* ARMA NORMAL */</span>`;
  $('btn-big').innerHTML = `/* transform: scale(2.2); */ <span class="comment">/* SUPER ARMA */</span>`;
  $('btn-hidden').innerHTML = `/* overflow: hidden; */ <span class="comment">/* MANTER DENTRO */</span>`;
  $('btn-visible').innerHTML = `/* overflow: visible; */ <span class="comment">/* SAIR DO ESCUDO */</span>`;
  if (direcao === -1) $('btn-left').innerHTML = `<span class="live-code">${transformLine}</span> <span class="comment">/* ESQUERDA */</span>`;
  if (direcao === 1) $('btn-right').innerHTML = `<span class="live-code">${transformLine}</span> <span class="comment">/* DIREITA */</span>`;
  if (tamanho === 0.7) $('btn-mini').innerHTML = `<span class="live-code">transform: scale(0.7);</span> <span class="comment">/* ARMA PRECISA */</span>`;
  if (tamanho === 1) $('btn-normal').innerHTML = `<span class="live-code">transform: scale(1);</span> <span class="comment">/* ARMA NORMAL */</span>`;
  if (tamanho > 1) $('btn-big').innerHTML = `<span class="live-code">transform: scale(2.2);</span> <span class="comment">/* SUPER ARMA */</span>`;
  if (overflow === 'hidden') $('btn-hidden').innerHTML = `<span class="live-code">overflow: hidden;</span> <span class="comment">/* MANTER DENTRO */</span>`;
  if (overflow === 'visible') $('btn-visible').innerHTML = `<span class="live-code">overflow: visible;</span> <span class="comment">/* SAIR DO ESCUDO */</span>`;
  $('code-status').textContent = `CSS ativo: ${transformLine} overflow: ${overflow};`;
  validarConfiguracao();
}
function aplicarDirecao(valor) { if (fase !== 'configurando') return; direcao = valor; atualizarArma(); }
function aplicarTamanho(valor) { if (fase !== 'configurando') return; tamanho = valor; atualizarArma(); }
function aplicarOverflow(valor) { if (fase !== 'configurando') return; overflow = valor; atualizarArma(); }
function validarConfiguracao() {
  if (!desafioAtual || fase !== 'configurando') return;
  const ok = direcao === desafioAtual.direcao && tamanho === desafioAtual.tamanho && overflow === desafioAtual.overflow;
  $('btn-continue').disabled = !ok;
  $('btn-continue').textContent = ok ? 'Continuar →' : 'Complete o CSS para continuar';
  $('shoot-button').disabled = true;
  if (ok) log('✅ Código correto! Clique em <strong>Continuar</strong> para liberar o zumbi.');
}
function iniciarJogo() {
  clearTimeout(moveTimer); clearTimeout(tiroTimer);
  rodada = 0; fase = 'configurando';
  $('btn-start').disabled = true; $('btn-start').textContent = 'Partida em andamento';
  $('hud-hp').textContent = '100 HP';
  $('hud-kills').textContent = totalRodadas;
  proximoDesafio();
}
function proximoDesafio() {
  if (rodada >= totalRodadas) { finalizarJogo(); return; }
  desafioAtual = desafios[rodada];
  fase = 'configurando';
  shield.classList.remove('shield-hit');
  direcao = 1; tamanho = 1; overflow = 'hidden'; atualizarArma();
  zombie.className = `character zombie ${desafioAtual.tipo === 'grande' ? 'zombie-big' : ''}`;
  zombie.textContent = '🧟';
  zombie.style.left = desafioAtual.lado === 'esquerda' ? '18px' : 'auto';
  zombie.style.right = desafioAtual.lado === 'direita' ? '18px' : 'auto';
  zombie.classList.remove('hidden', 'zombie-repelled', 'zombie-repelled-left', 'zombie-repelled-right', 'zombie-attacking');
  $('pause-overlay').classList.add('show');
  $('btn-continue').disabled = true;
  $('btn-continue').textContent = 'Complete o CSS para continuar';
  $('shoot-button').disabled = true;
  $('hud-round').textContent = `${rodada + 1}/${totalRodadas}`;
  $('instruction-title').textContent = desafioAtual.titulo;
  $('instruction-text').textContent = desafioAtual.texto;
  $('instruction-tip').textContent = desafioAtual.dica;
  $('instruction-panel').classList.add('attention');
  log(`⏸ <strong>Jogo pausado.</strong> Configure as três regras CSS indicadas acima.`);
}
function continuarRodada() {
  if (fase !== 'configurando' || !desafioAtual) return;
  if (direcao !== desafioAtual.direcao || tamanho !== desafioAtual.tamanho || overflow !== desafioAtual.overflow) return;
  fase = 'andando';
  $('pause-overlay').classList.remove('show');
  $('instruction-panel').classList.remove('attention');
  $('instruction-title').textContent = '🚨 INVASOR SE APROXIMANDO!';
  $('instruction-text').textContent = 'O inimigo avança contra a barreira que protege o núcleo da base. Observe o campo de força: ele vai absorver a investida e repelir o invasor. O disparo só será liberado depois da defesa!';
  $('instruction-tip').textContent = 'Aguarde o aviso IMPACTO BLOQUEADO. Depois, clique em DISPARAR para contra-atacar.';
  $('shoot-button').disabled = true;
  const worldWidth = world.clientWidth;
  const start = desafioAtual.lado === 'esquerda' ? 25 : worldWidth - 75;
  const target = worldWidth / 2 + (desafioAtual.lado === 'esquerda' ? -48 : 48);
  zombieX = start;
  zombie.style.left = `${start}px`; zombie.style.right = 'auto';
  const direction = desafioAtual.lado === 'esquerda' ? 1 : -1;
  const distance = Math.abs(target - start);
  const duration = 7200;
  const startTime = performance.now();
  function step(now) {
    if (fase !== 'andando') return;
    const progress = Math.min((now - startTime) / duration, 1);
    zombieX = start + direction * distance * progress;
    zombie.style.left = `${zombieX}px`;
    if (progress > 0.88) zombie.classList.add('zombie-attacking');
    if (progress < 1) moveTimer = requestAnimationFrame(step);
    else {
      fase = 'perigo';
      $('shoot-button').disabled = false;
      $('instruction-title').textContent = '🛡️ IMPACTO BLOQUEADO! NÚCLEO PROTEGIDO!';
      $('instruction-text').textContent = 'KRAAAASH! O zumbi bateu no campo de força. A barreira absorveu a energia do golpe, brilhou e lançou o invasor para trás! A base continua protegida. Agora é sua vez: contra-ataque liberado!';
      $('instruction-tip').textContent = 'O escudo segurou a invasão. Pressione DISPARAR ou Enter para afastar o inimigo.';
      zombie.classList.add('zombie-repelled', desafioAtual.lado === 'esquerda' ? 'zombie-repelled-left' : 'zombie-repelled-right');
      shield.classList.remove('shield-hit');
      void shield.offsetWidth;
      shield.classList.add('shield-hit');
      $('impact').textContent = '💥⚡';
      $('impact').classList.remove('hidden');
      setTimeout(() => $('impact').classList.add('hidden'), 700);
      log('🛡️ <strong>DEFESA PERFEITA!</strong> O escudo absorveu o ataque e repeliu o invasor. CONTRA-ATAQUE LIBERADO!');
    }
  }
  moveTimer = requestAnimationFrame(step);
  log('▶ Zumbi avançando devagar. Mire e dispare!');
}
function disparar() {
  if (fase !== 'andando' && fase !== 'perigo') return;
  if (direcao !== desafioAtual.direcao || tamanho !== desafioAtual.tamanho || overflow !== desafioAtual.overflow) {
    log('❌ A configuração CSS não corresponde ao desafio.'); return;
  }
  fase = 'tiro'; $('shoot-button').disabled = true;
  shield.classList.remove('shield-hit');
  cancelAnimationFrame(moveTimer);
  const projectile = document.createElement('div');
  projectile.className = 'projectile'; projectile.textContent = tamanho > 1 ? '🔥' : '⚡';
  world.appendChild(projectile);
  const heroRect = hero.getBoundingClientRect();
  const worldRect = world.getBoundingClientRect();
  const zombieRect = zombie.getBoundingClientRect();
  const from = heroRect.left + heroRect.width / 2 - worldRect.left;
  const to = zombieRect.left + zombieRect.width / 2 - worldRect.left;
  projectile.style.left = `${from}px`;
  projectile.style.top = `${heroRect.top + heroRect.height / 2 - worldRect.top}px`;
  projectile.getBoundingClientRect();
  projectile.style.left = `${to}px`;
  projectile.style.top = `${zombieRect.top + zombieRect.height / 2 - worldRect.top}px`;
  log('⚡ Disparo lançado!');
  tiroTimer = setTimeout(() => {
    projectile.remove();
    zombie.classList.add('hidden');
    zombie.classList.remove('zombie-repelled', 'zombie-repelled-left', 'zombie-repelled-right', 'zombie-attacking');
    $('impact').textContent = '💥🎯';
    $('impact').classList.remove('hidden');
    setTimeout(() => $('impact').classList.add('hidden'), 450);
    rodada++;
    $('hud-kills').textContent = totalRodadas - rodada;
    fase = 'acerto';
    $('instruction-title').textContent = 'Acertou! 🎯';
    $('instruction-text').textContent = 'Boa! O disparo afastou o invasor e o escudo manteve a base segura. Prepare-se para o próximo alerta.';
    $('instruction-tip').textContent = 'Observe como scaleX muda a direção, scale muda o tamanho e overflow controla o que sai do escudo.';
    log('🎯 <strong>Invasor repelido!</strong> O núcleo segue protegido. Próximo alerta em instantes...');
    setTimeout(proximoDesafio, 1350);
  }, 420);
}
function finalizarJogo() {
  fase = 'fim'; desafioAtual = null;
  $('zombie').classList.add('hidden'); $('pause-overlay').classList.remove('show');
  $('instruction-title').textContent = '🏆 Você venceu!';
  $('instruction-text').textContent = 'Você protegeu o núcleo em seis desafios, conteve dois ataques do gigante e praticou scale(), scaleX() e overflow.';
  $('instruction-tip').textContent = 'A base está segura! Clique em Jogar novamente para repetir a missão.';
  $('btn-start').disabled = false; $('btn-start').textContent = '↻ Jogar novamente';
  $('btn-continue').disabled = true; $('shoot-button').disabled = true;
  $('hud-round').textContent = '6/6';
  log('🏆 <strong>VITÓRIA!</strong> Todos os desafios concluídos.');
}
document.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') { event.preventDefault(); disparar(); }
});
window.addEventListener('resize', () => { if (fase === 'configurando' && desafioAtual) { zombie.style.left = desafioAtual.lado === 'esquerda' ? '18px' : 'auto'; zombie.style.right = desafioAtual.lado === 'direita' ? '18px' : 'auto'; } });
