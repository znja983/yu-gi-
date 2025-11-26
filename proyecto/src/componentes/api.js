export default function mostrarApi() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h2>YGO API — Buscador de Cartas</h2>
    <div style="display:flex;gap:8px;margin-bottom:12px;align-items:center;">
      <input id="apiInput" type="text" placeholder="Escribe el nombre (parcial o completo)" style="flex:1;padding:6px;" />
      <button id="apiBuscar" style="padding:6px 10px;">Buscar</button>
      <button id="apiRandom" style="padding:6px 10px;">Sorpréndeme</button>
    </div>
    <div id="apiMensaje" style="color:#666;margin-bottom:8px;">Busca por nombre para ver cartas.</div>
    <div id="apiResultados" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;"></div>
  `;

  const resultados = document.getElementById('apiResultados');
  const mensaje = document.getElementById('apiMensaje');
  // contenedor para la carta seleccionada
  const seleccionDiv = document.createElement('div');
  seleccionDiv.id = 'apiSeleccion';
  seleccionDiv.style = 'margin-top:12px;padding:8px;border-radius:8px;background:linear-gradient(180deg,#fafafa,#fff);min-height:120px;';
  app.appendChild(seleccionDiv);

  async function mostrarError(text) {
    mensaje.textContent = text;
    resultados.innerHTML = '';
  }

  function renderCard(card) {
    const img = (card.card_images && card.card_images[0] && card.card_images[0].image_url) || '';
    const div = document.createElement('div');
    div.style = 'border-radius:8px;padding:6px;background:#fff;box-shadow:0 2px 6px rgba(0,0,0,0.08);text-align:center;';
    div.innerHTML = `
      <div style="height:220px;display:flex;align-items:center;justify-content:center;overflow:hidden;">
        ${img ? `<img src="${img}" alt="${card.name}" style="max-width:100%;max-height:100%;transition:transform .3s;"/>` : '<div style="color:#999">Sin imagen</div>'}
      </div>
      <h4 style="margin:8px 0 4px;font-size:14px">${card.name}</h4>
      <div style="font-size:12px;color:#555">${card.type || ''}</div>
    `;
    // efecto simple al pasar el ratón
    div.addEventListener('mouseenter', () => {
      const imgEl = div.querySelector('img'); if (imgEl) imgEl.style.transform = 'scale(1.06)';
    });
    div.addEventListener('mouseleave', () => {
      const imgEl = div.querySelector('img'); if (imgEl) imgEl.style.transform = 'scale(1)';
    });

    // selección: al hacer click se marca y muestra detalles abajo
    div.addEventListener('click', () => selectCard(card, div));
    return div;
  }

  async function buscarPorNombre(name) {
    if (!name) {
      mostrarError('Introduce un nombre para buscar.');
      return;
    }
    mensaje.textContent = 'Buscando...';
    resultados.innerHTML = '';
    try {
      const res = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?name=${encodeURIComponent(name)}`);
      if (!res.ok) throw new Error('Respuesta de red no OK');
      const json = await res.json();
      if (!json.data || json.data.length === 0) {
        mostrarError('No se encontraron cartas para: ' + name);
        return;
      }
      mensaje.textContent = `Resultados para "${name}" (${json.data.length})`;
      json.data.forEach(c => resultados.appendChild(renderCard(c)));
      // limpiar selección previa
      clearSelectionDisplay();
    } catch (err) {
      mostrarError('Error al buscar: ' + (err.message || err));
      console.error(err);
    }
  }

  // Intento simple de carta aleatoria: generar una búsqueda por una letra aleatoria
  async function buscarRandom() {
    mensaje.textContent = 'Buscando carta aleatoria...';
    resultados.innerHTML = '';
    try {
      const letra = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      // Usamos el parámetro fname para búsqueda parcial si existe; si no, usamos name
      const res = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${letra}`);
      if (!res.ok) throw new Error('Respuesta de red no OK');
      const json = await res.json();
      if (!json.data || json.data.length === 0) {
        // fallback usando name por la letra
        await buscarPorNombre(letra);
        return;
      }
      // elegimos una carta aleatoria del array
      const card = json.data[Math.floor(Math.random() * json.data.length)];
      mensaje.textContent = 'Carta aleatoria';
      resultados.appendChild(renderCard(card));
      clearSelectionDisplay();
    } catch (err) {
      // fallback sencillo: intenta buscar por una letra aleatoria con name
      try { await buscarPorNombre(String.fromCharCode(65 + Math.floor(Math.random() * 26))); } catch(e){ mostrarError('Error al obtener carta aleatoria'); }
      console.error(err);
    }
  }

  document.getElementById('apiBuscar').addEventListener('click', () => {
    const q = document.getElementById('apiInput').value.trim();
    buscarPorNombre(q);
  });

  document.getElementById('apiRandom').addEventListener('click', () => buscarRandom());
}

// ===== funciones de selección fuera del scope de mostrarApi =====
function clearSelectionDisplay() {
  const sel = document.getElementById('apiSeleccion');
  if (sel) sel.innerHTML = '';
  // quitar clases selected de resultados si están
  const items = document.querySelectorAll('#apiResultados > div');
  items.forEach(i => { i.style.outline = 'none'; i.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)'; });
}

function selectCard(card, element) {
  // limpiar seleccion previa
  clearSelectionDisplay();
  // marcar visualmente
  element.style.outline = '3px solid #1976d2';
  element.style.boxShadow = '0 6px 12px rgba(25,118,210,0.12)';

  const sel = document.getElementById('apiSeleccion');
  if (!sel) return;
  const img = (card.card_images && card.card_images[0] && card.card_images[0].image_url) || '';
  sel.innerHTML = `
    <div style="display:flex;gap:12px;align-items:center;">
      <div style="width:160px;height:220px;display:flex;align-items:center;justify-content:center;background:#fff;border-radius:6px;overflow:hidden;">
        ${img ? `<img src="${img}" alt="${card.name}" style="max-width:100%;max-height:100%;"/>` : '<div style="color:#999">Sin imagen</div>'}
      </div>
      <div>
        <h3 style="margin:0 0 6px">${card.name}</h3>
        <div style="color:#444;margin-bottom:6px">${card.type || ''}</div>
        <div style="font-size:13px;color:#555;max-width:560px">${card.desc || ''}</div>
      </div>
    </div>
  `;
}
