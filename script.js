const state = {
  selectedTable: 7,
  cart: [],
  orders: [],
  closedBills: [],
  products: [
    { id: 1, name: 'Pizza Margherita', category: 'pizzas', price: 52.00, desc: 'Molho de tomate artesanal, mussarela fatiada e manjericão fresco.', img: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500' },
    { id: 2, name: 'Pizza Calabresa', category: 'pizzas', price: 58.00, desc: 'Molho de tomate, mussarela, calabresa fatiada e cebola.', img: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500' },
    { id: 3, name: 'Pizza Muçarela', category: 'pizzas', price: 49.00, desc: 'Molho especial, farta camada de muçarela e orégano.', img: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500' },
    { id: 4, name: 'Pizza Frango c/ Catupiry', category: 'pizzas', price: 60.00, desc: 'Frango desfiado temperado coberto com Catupiry original.', img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500' },
    { id: 7, name: 'Pizza Quatro Queijos', category: 'especiais', price: 66.00, desc: 'Mussarela, Gorgonzola, Provolone e Catupiry.', img: 'https://images.unsplash.com/photo-1573821663912-569905455b1c?w=500' },
    { id: 8, name: 'Pizza Bella Massa', category: 'especiais', price: 74.00, desc: 'Carne seca desfiada, queijo coalho grelhado e melaço.', img: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=500' },
    { id: 11, name: 'Caipirinha Tradicional', category: 'bebidas', price: 22.00, desc: 'Cachaça artesanal, limão taiti, açúcar e gelo.', img: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500' },
    { id: 12, name: 'Gin Tônica Especial', category: 'bebidas', price: 32.00, desc: 'Gin Tanqueray, água tônica e fatia de laranja.', img: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500' },
    { id: 13, name: 'Chopp Pilsen 500ml', category: 'bebidas', price: 16.00, desc: 'Chopp trincando de gelado extraído na hora.', img: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=500' },
    { id: 14, name: 'Coca-Cola Zero 350ml', category: 'bebidas', price: 7.50, desc: 'Lata 350ml bem gelada.', img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500' },
    { id: 17, name: 'Pizza Nutella c/ Morango', category: 'sobremesas', price: 58.00, desc: 'Coberta com Nutella e morangos frescos.', img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500' }
  ],
  tempSelectedItem: null
};

let chartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  renderAllViews();
  initChart();

  // Relógio em tempo real que atualiza os cronômetros e as cores a cada 1 segundo
  setInterval(() => {
    updateTimers();
  }, 1000);
});

/* CÁLCULO DE TEMPO E CLASSE DE COR DO SLA */
function getElapsedTime(createdAt) {
  const diffMs = new Date() - new Date(createdAt);
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffSeconds = Math.floor((diffMs % 60000) / 1000);

  let colorClass = 'sla-green';
  if (diffMinutes >= 51) {
    colorClass = 'sla-red';
  } else if (diffMinutes >= 26) {
    colorClass = 'sla-yellow';
  }

  const formattedTime = `${String(diffMinutes).padStart(2, '0')}:${String(diffSeconds).padStart(2, '0')}`;

  return { minutes: diffMinutes, formatted: formattedTime, colorClass };
}

function updateTimers() {
  // Atualiza relógios nas telas de Barman e Pizzaiolo sem reinstanciar os elementos HTML
  document.querySelectorAll('.kds-card').forEach(card => {
    const timeCreated = card.getAttribute('data-created-at');
    if (timeCreated) {
      const timeInfo = getElapsedTime(timeCreated);
      
      // Atualiza classe de cor do card
      card.classList.remove('sla-green', 'sla-yellow', 'sla-red');
      card.classList.add(timeInfo.colorClass);

      // Atualiza o texto do cronômetro
      const timerDisplay = card.querySelector('.timer-badge');
      if (timerDisplay) {
        timerDisplay.innerHTML = `<i class="fa-regular fa-clock"></i> ${timeInfo.formatted}`;
      }
    }
  });
}

function navigate(viewId) {
  document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
  const target = document.getElementById(`view-${viewId}`);
  if (target) target.classList.add('active');

  const header = document.getElementById('main-header');
  if (viewId === 'hub' || viewId === 'qr') {
    header.classList.add('hidden');
  } else {
    header.classList.remove('hidden');
  }

  renderAllViews();
}

/* CLIENTE */
function updateSelectedTable(val) {
  state.selectedTable = parseInt(val);
  document.querySelectorAll('.lbl-mesa').forEach(el => {
    el.innerText = state.selectedTable < 10 ? `0${state.selectedTable}` : state.selectedTable;
  });
}

function startClientMenu() {
  document.getElementById('qr-display').classList.add('hidden');
  document.getElementById('client-menu').classList.remove('hidden');
}

function resetClientMenu() {
  document.getElementById('client-menu').classList.add('hidden');
  document.getElementById('qr-display').classList.remove('hidden');
}

function renderProducts(category = 'all') {
  const container = document.getElementById('products-list');
  if (!container) return;
  container.innerHTML = '';

  const filtered = category === 'all' 
    ? state.products 
    : state.products.filter(p => p.category === category);

  filtered.forEach(p => {
    container.innerHTML += `
      <div class="product-card">
        <div class="product-img-wrapper">
          <img src="${p.img}" alt="${p.name}" class="product-img">
        </div>
        <div class="product-info">
          <h4>${p.name}</h4>
          <p class="product-desc">${p.desc}</p>
          <div class="product-bottom">
            <span class="product-price">R$ ${p.price.toFixed(2)}</span>
            <button class="btn btn-primary btn-sm" onclick="openProductModal(${p.id})">
              <i class="fa-solid fa-plus"></i> Pedir
            </button>
          </div>
        </div>
      </div>
    `;
  });
}

function filterCategory(cat, btn) {
  document.querySelectorAll('.cat-chip').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderProducts(cat);
}

function openProductModal(id) {
  state.tempSelectedItem = state.products.find(p => p.id === id);
  document.getElementById('modal-item-title').innerText = state.tempSelectedItem.name;
  document.getElementById('modal-item-desc').innerText = state.tempSelectedItem.desc;
  document.getElementById('modal-item-price').innerText = `R$ ${state.tempSelectedItem.price.toFixed(2)}`;
  document.getElementById('modal-item-img').src = state.tempSelectedItem.img;
  document.getElementById('modal-item-obs').value = '';
  document.getElementById('modal-product').classList.add('active');
}

function confirmAddToCart() {
  const obs = document.getElementById('modal-item-obs').value;
  state.cart.push({ ...state.tempSelectedItem, obs });
  closeModal('modal-product');
  updateCartUI();
}

function updateCartUI() {
  const qty = state.cart.length;
  const total = state.cart.reduce((acc, item) => acc + item.price, 0);
  document.getElementById('cart-qty').innerText = qty;
  document.getElementById('cart-total-val').innerText = `R$ ${total.toFixed(2)}`;
}

function openCartModal() {
  if (state.cart.length === 0) return alert('Seu carrinho está vazio!');
  const container = document.getElementById('cart-items-list');
  container.innerHTML = '';
  let subtotal = 0;

  state.cart.forEach((item, index) => {
    subtotal += item.price;
    container.innerHTML += `
      <div class="cart-item">
        <div class="cart-item-details">
          <strong>${item.name}</strong>
          <span class="cart-item-price">R$ ${item.price.toFixed(2)}</span>
          ${item.obs ? `<span class="cart-item-obs">Obs: ${item.obs}</span>` : ''}
        </div>
        <button class="remove-item-btn" onclick="removeFromCart(${index})">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `;
  });

  document.getElementById('cart-modal-subtotal').innerText = `R$ ${subtotal.toFixed(2)}`;
  document.getElementById('modal-cart').classList.add('active');
}

function removeFromCart(index) {
  state.cart.splice(index, 1);
  updateCartUI();
  if (state.cart.length === 0) closeModal('modal-cart');
  else openCartModal();
}

function submitClientOrder() {
  const total = state.cart.reduce((acc, item) => acc + item.price, 0);

  const preparedItems = state.cart.map(item => ({
    ...item,
    status: 'pending_authorization'
  }));

  const newOrder = {
    id: Date.now(),
    table: state.selectedTable,
    items: preparedItems,
    status: 'pending_waiter', 
    createdAt: new Date(),
    authorizedAt: null,
    total: total
  };

  state.orders.push(newOrder);
  state.cart = [];
  updateCartUI();

  closeModal('modal-cart');
  document.getElementById('modal-feedback').classList.add('active');
  renderAllViews();
}

/* GARÇOM */
function switchWaiterTab(tab, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  if (tab === 'confirm') {
    document.getElementById('tab-waiter-confirm').classList.remove('hidden');
    document.getElementById('tab-waiter-deliver').classList.add('hidden');
  } else {
    document.getElementById('tab-waiter-confirm').classList.add('hidden');
    document.getElementById('tab-waiter-deliver').classList.remove('hidden');
  }
}

function renderWaiterView() {
  const pendingContainer = document.getElementById('waiter-pending-list');
  const readyContainer = document.getElementById('waiter-ready-list');

  if (!pendingContainer || !readyContainer) return;

  pendingContainer.innerHTML = '';
  readyContainer.innerHTML = '';

  const pendingOrders = state.orders.filter(o => o.status === 'pending_waiter');
  const readyOrders = state.orders.filter(o => o.status === 'in_production' && o.items.some(i => i.status === 'ready'));

  document.getElementById('badge-confirm').innerText = pendingOrders.length;
  document.getElementById('badge-deliver').innerText = readyOrders.length;

  pendingOrders.forEach(o => {
    pendingContainer.innerHTML += `
      <div class="order-card">
        <div class="order-card-header">
          <span class="order-table">Mesa 0${o.table}</span>
          <span class="order-time">${new Date(o.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
        <ul class="order-items-list">
          ${o.items.map(i => `<li><b>1x</b> ${i.name}${i.obs ? `<small>(${i.obs})</small>` : ''}</li>`).join('')}
        </ul>
        <button class="btn btn-success btn-full" onclick="authorizeOrder(${o.id})">
          <i class="fa-solid fa-check"></i> Autorizar e Enviar p/ Preparo
        </button>
      </div>
    `;
  });

  readyOrders.forEach(o => {
    const readyItems = o.items.filter(i => i.status === 'ready');

    readyContainer.innerHTML += `
      <div class="order-card ready-border">
        <div class="order-card-header">
          <span class="order-table">Mesa 0${o.table}</span>
          <span class="badge badge-success">Pronto para Servir</span>
        </div>
        <ul class="order-items-list">
          ${readyItems.map(i => `<li><i class="fa-solid fa-bell text-success"></i> <b>1x</b> ${i.name}</li>`).join('')}
        </ul>
        <button class="btn btn-primary btn-full" onclick="serveReadyItems(${o.id})">
          <i class="fa-solid fa-hand-holding-hand"></i> Servir na Mesa
        </button>
      </div>
    `;
  });
}

function authorizeOrder(orderId) {
  const order = state.orders.find(o => o.id === orderId);
  if (order) {
    order.status = 'in_production';
    order.authorizedAt = new Date(); // Registra horário do envio para cálculo do tempo de preparo
    order.items.forEach(i => i.status = 'in_production');
    renderAllViews();
  }
}

function serveReadyItems(orderId) {
  const order = state.orders.find(o => o.id === orderId);
  if (order) {
    order.items.forEach(i => {
      if (i.status === 'ready') i.status = 'delivered';
    });
    renderAllViews();
  }
}

/* BARMAN COM RELÓGIO & SLA */
function renderBarmenScreen() {
  const container = document.getElementById('barmen-list');
  const historyContainer = document.getElementById('barmen-history-list');
  if (!container || !historyContainer) return;

  container.innerHTML = '';
  historyContainer.innerHTML = '';

  let activeCount = 0;
  let doneCount = 0;

  state.orders.forEach(o => {
    const pendingDrinks = o.items.filter(i => i.category === 'bebidas' && i.status === 'in_production');
    if (pendingDrinks.length > 0) {
      activeCount++;
      const timeInfo = getElapsedTime(o.authorizedAt || o.createdAt);

      container.innerHTML += `
        <div class="kds-card ${timeInfo.colorClass}" data-created-at="${o.authorizedAt || o.createdAt}">
          <div class="kds-card-header">
            <span>Mesa 0${o.table}</span>
            <span class="timer-badge"><i class="fa-regular fa-clock"></i> ${timeInfo.formatted}</span>
          </div>
          <ul class="kds-items">
            ${pendingDrinks.map(i => `<li><strong>1x</strong> ${i.name}${i.obs ? `<span class="kds-obs">Obs: ${i.obs}</span>` : ''}</li>`).join('')}
          </ul>
          <button class="btn btn-success btn-full" onclick="completeBarItems(${o.id})">
            <i class="fa-solid fa-check"></i> Concluir Drinks
          </button>
        </div>
      `;
    }

    const doneDrinks = o.items.filter(i => i.category === 'bebidas' && (i.status === 'ready' || i.status === 'delivered'));
    doneDrinks.forEach(i => {
      doneCount++;
      historyContainer.innerHTML += `
        <div class="history-item">
          <div class="history-item-header">
            <strong>Mesa 0${o.table}</strong> - ${i.name}
          </div>
          <span class="status-tag ${i.status === 'delivered' ? 'tag-delivered' : 'tag-ready'}">
            ${i.status === 'delivered' ? 'Entregue' : 'Pronto p/ Servir'}
          </span>
        </div>
      `;
    });
  });

  if (activeCount === 0) container.innerHTML = '<p class="empty-msg">Nenhuma bebida pendente no momento.</p>';
  if (doneCount === 0) historyContainer.innerHTML = '<p class="empty-msg">Nenhum histórico registrado.</p>';
}

function completeBarItems(orderId) {
  const order = state.orders.find(o => o.id === orderId);
  if (order) {
    order.items.forEach(i => {
      if (i.category === 'bebidas' && i.status === 'in_production') i.status = 'ready';
    });
    renderAllViews();
  }
}

/* PIZZAIOLO COM RELÓGIO & SLA */
function renderPizzaioloScreen() {
  const container = document.getElementById('pizzaiolo-list');
  const historyContainer = document.getElementById('pizzaiolo-history-list');
  if (!container || !historyContainer) return;

  container.innerHTML = '';
  historyContainer.innerHTML = '';

  let activeCount = 0;
  let doneCount = 0;

  state.orders.forEach(o => {
    const pendingFoods = o.items.filter(i => i.category !== 'bebidas' && i.status === 'in_production');
    if (pendingFoods.length > 0) {
      activeCount++;
      const timeInfo = getElapsedTime(o.authorizedAt || o.createdAt);

      container.innerHTML += `
        <div class="kds-card ${timeInfo.colorClass}" data-created-at="${o.authorizedAt || o.createdAt}">
          <div class="kds-card-header">
            <span>Mesa 0${o.table}</span>
            <span class="timer-badge"><i class="fa-regular fa-clock"></i> ${timeInfo.formatted}</span>
          </div>
          <ul class="kds-items">
            ${pendingFoods.map(i => `<li><strong>1x</strong> ${i.name}${i.obs ? `<span class="kds-obs">Obs: ${i.obs}</span>` : ''}</li>`).join('')}
          </ul>
          <button class="btn btn-success btn-full" onclick="completeKitchenItems(${o.id})">
            <i class="fa-solid fa-check"></i> Concluir Prato/Pizza
          </button>
        </div>
      `;
    }

    const doneFoods = o.items.filter(i => i.category !== 'bebidas' && (i.status === 'ready' || i.status === 'delivered'));
    doneFoods.forEach(i => {
      doneCount++;
      historyContainer.innerHTML += `
        <div class="history-item">
          <div class="history-item-header">
            <strong>Mesa 0${o.table}</strong> - ${i.name}
          </div>
          <span class="status-tag ${i.status === 'delivered' ? 'tag-delivered' : 'tag-ready'}">
            ${i.status === 'delivered' ? 'Entregue' : 'Pronto p/ Servir'}
          </span>
        </div>
      `;
    });
  });

  if (activeCount === 0) container.innerHTML = '<p class="empty-msg">Nenhum pedido pendente na cozinha.</p>';
  if (doneCount === 0) historyContainer.innerHTML = '<p class="empty-msg">Nenhum histórico registrado.</p>';
}

function completeKitchenItems(orderId) {
  const order = state.orders.find(o => o.id === orderId);
  if (order) {
    order.items.forEach(i => {
      if (i.category !== 'bebidas' && i.status === 'in_production') i.status = 'ready';
    });
    renderAllViews();
  }
}

/* CAIXA, GRÁFICOS E GERAÇÃO DE PDF */
function renderCashierView() {
  const grid = document.getElementById('tables-map-grid');
  if (!grid) return;
  grid.innerHTML = '';

  for (let i = 1; i <= 8; i++) {
    const tableOrders = state.orders.filter(o => o.table === i && o.status !== 'paid');
    const isBusy = tableOrders.length > 0;

    grid.innerHTML += `
      <div class="table-card ${isBusy ? 'busy' : 'free'}" onclick="selectCashierTable(${i})">
        <i class="fa-solid fa-chair"></i>
        <span>Mesa 0${i}</span>
        <small>${isBusy ? `${tableOrders.length} Pedido(s)` : 'Livre'}</small>
      </div>
    `;
  }

  updateMetricsAndChart();
}

function selectCashierTable(tableNum) {
  const container = document.getElementById('bill-details');
  document.getElementById('bill-table-title').innerText = `Mesa 0${tableNum}`;

  const tableOrders = state.orders.filter(o => o.table === tableNum && o.status !== 'paid');

  if (tableOrders.length === 0) {
    container.innerHTML = `<p class="empty-msg">A Mesa 0${tableNum} está sem consumação no momento.</p>`;
    return;
  }

  let grandTotal = 0;
  let itemsHTML = '';

  tableOrders.forEach(o => {
    o.items.forEach(i => {
      grandTotal += i.price;

      let statusLabel = '';
      let statusClass = '';

      switch(i.status) {
        case 'pending_authorization': statusLabel = 'Aguardando Garçom'; statusClass = 'st-pending'; break;
        case 'in_production': statusLabel = 'Em Preparo'; statusClass = 'st-production'; break;
        case 'ready': statusLabel = 'Pronto p/ Servir'; statusClass = 'st-ready'; break;
        case 'delivered': statusLabel = 'Entregue'; statusClass = 'st-delivered'; break;
      }

      itemsHTML += `
        <div class="bill-item-row">
          <div class="bill-item-info">
            <span class="bill-item-title">1x ${i.name}</span>
            <span class="bill-status ${statusClass}">${statusLabel}</span>
          </div>
          <strong>R$ ${i.price.toFixed(2)}</strong>
        </div>
      `;
    });
  });

  container.innerHTML = `
    <div class="bill-summary">
      <div class="bill-items-list">
        ${itemsHTML}
      </div>
      <div class="bill-total-row">
        <span>Total da Conta:</span>
        <span class="total-price">R$ ${grandTotal.toFixed(2)}</span>
      </div>
      
      <div class="bill-actions">
        <button class="btn btn-secondary btn-full" onclick="generateOrdersPDF(${tableNum})">
          <i class="fa-solid fa-file-pdf"></i> Imprimir Extrato da Mesa (PDF)
        </button>
        <button class="btn btn-success btn-full btn-large" onclick="closeTableBill(${tableNum})">
          <i class="fa-solid fa-receipt"></i> Fechar Comanda & Emitir Comprovante
        </button>
      </div>
    </div>
  `;
}

function closeTableBill(tableNum) {
  const tableOrders = state.orders.filter(o => o.table === tableNum && o.status !== 'paid');
  if (tableOrders.length === 0) return;

  generatePaymentPDF(tableNum, tableOrders);

  tableOrders.forEach(o => {
    o.status = 'paid';
    o.items.forEach(i => i.status = 'paid');
  });

  state.closedBills.push({
    table: tableNum,
    closedAt: new Date(),
    orders: tableOrders
  });

  alert(`Comanda da Mesa 0${tableNum} finalizada! O comprovante de pagamento foi gerado em PDF.`);
  selectCashierTable(tableNum);
  renderAllViews();
}

/* MÉTRICAS & GRÁFICOS */
function updateMetricsAndChart() {
  let totalSales = 0;
  const categoryTotals = { pizzas: 0, especiais: 0, bebidas: 0, sobremesas: 0 };

  state.orders.forEach(o => {
    if (o.status === 'paid') {
      o.items.forEach(i => {
        totalSales += i.price;
        if (categoryTotals[i.category] !== undefined) {
          categoryTotals[i.category] += i.price;
        }
      });
    }
  });

  const closedCount = state.closedBills.length;
  const avgTicket = closedCount > 0 ? totalSales / closedCount : 0;

  document.getElementById('metric-total-sales').innerText = `R$ ${totalSales.toFixed(2)}`;
  document.getElementById('metric-closed-bills').innerText = closedCount;
  document.getElementById('metric-avg-ticket').innerText = `R$ ${avgTicket.toFixed(2)}`;

  if (chartInstance) {
    chartInstance.data.datasets[0].data = [
      categoryTotals.pizzas,
      categoryTotals.especiais,
      categoryTotals.bebidas,
      categoryTotals.sobremesas
    ];
    chartInstance.update();
  }
}

function initChart() {
  const ctx = document.getElementById('salesChart')?.getContext('2d');
  if (!ctx) return;

  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Pizzas Tradicionais', 'Pizzas Especiais', 'Bebidas', 'Sobremesas'],
      datasets: [{
        data: [0, 0, 0, 0],
        backgroundColor: ['#e63946', '#fca311', '#0288d1', '#2a9d8f']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}

/* GERAÇÃO DE PDFS */
function generateOrdersPDF(tableNum) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const tableOrders = state.orders.filter(o => o.table === tableNum && o.status !== 'paid');

  doc.setFontSize(18);
  doc.text('Pizzaria Bella Massa', 14, 20);
  doc.setFontSize(12);
  doc.text(`Relatório de Pedidos - Mesa 0${tableNum}`, 14, 28);
  doc.text(`Data: ${new Date().toLocaleString('pt-BR')}`, 14, 34);

  const tableData = [];
  let grandTotal = 0;

  tableOrders.forEach(o => {
    o.items.forEach(i => {
      grandTotal += i.price;
      tableData.push([i.name, i.obs || '-', `R$ ${i.price.toFixed(2)}`]);
    });
  });

  doc.autoTable({
    startY: 40,
    head: [['Item', 'Observação', 'Preço']],
    body: tableData,
  });

  const finalY = doc.lastAutoTable.finalY || 50;
  doc.setFontSize(14);
  doc.text(`Total Acumulado: R$ ${grandTotal.toFixed(2)}`, 14, finalY + 15);

  doc.save(`Extrato_Mesa_${tableNum}.pdf`);
}

function generatePaymentPDF(tableNum, tableOrders) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text('Pizzaria Bella Massa', 14, 20);
  doc.setFontSize(12);
  doc.text('COMPROVANTE DE PAGAMENTO / CUPOM FISCAL', 14, 28);
  doc.text(`Mesa: 0${tableNum} | Data: ${new Date().toLocaleString('pt-BR')}`, 14, 34);

  const tableData = [];
  let grandTotal = 0;

  tableOrders.forEach(o => {
    o.items.forEach(i => {
      grandTotal += i.price;
      tableData.push([i.name, '1', `R$ ${i.price.toFixed(2)}`]);
    });
  });

  doc.autoTable({
    startY: 40,
    head: [['Descrição', 'Qtd', 'Valor']],
    body: tableData,
  });

  const finalY = doc.lastAutoTable.finalY || 50;
  doc.setFontSize(14);
  doc.text(`TOTAL PAGO: R$ ${grandTotal.toFixed(2)}`, 14, finalY + 15);
  doc.setFontSize(10);
  doc.text('Obrigado pela preferência! Volte sempre!', 14, finalY + 25);

  doc.save(`Comprovante_Mesa_${tableNum}_${Date.now()}.pdf`);
}

function renderAllViews() {
  renderWaiterView();
  renderBarmenScreen();
  renderPizzaioloScreen();
  renderCashierView();
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}