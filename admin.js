const DEMO_ORDERS = [
  {
    id: "DEMO-001", createdAt: "2026-09-08T09:20:00+08:00",
    customer: { name: "演示用户", phone: "138****8000" },
    address: { snapshot: "上海市浦东新区世纪大道 88 号" },
    items: [{ id: "chicken-berry", name: "莓果鸡胸训练粒", price: 39, spec: "80g / 袋", quantity: 2, subtotal: 78 }],
    total: 78, status: "已完成"
  },
  {
    id: "DEMO-002", createdAt: "2026-09-09T14:10:00+08:00",
    customer: { name: "林女士", phone: "139****1266" },
    address: { snapshot: "杭州市西湖区灵隐路 12 号" },
    items: [
      { id: "freeze-salmon", name: "三文鱼冻干脆粒", price: 56, spec: "60g / 罐", quantity: 1, subtotal: 56 },
      { id: "training-fish", name: "金枪鱼训练薄片", price: 49, spec: "65g / 袋", quantity: 1, subtotal: 49 }
    ],
    total: 105, status: "已完成"
  },
  {
    id: "DEMO-003", createdAt: "2026-09-10T16:42:00+08:00",
    customer: { name: "周先生", phone: "136****9088" },
    address: { snapshot: "北京市朝阳区宠物街 6 号" },
    items: [{ id: "dental-herb", name: "草本洁齿咀嚼棒", price: 42, spec: "7 支 / 盒", quantity: 2, subtotal: 84 }],
    total: 84, status: "已完成"
  }
];

let selectedImageValue = "assets/product-chicken-cheese.png";
const money = value => `¥${Number(value || 0).toFixed(2)}`;
const formatDate = value => new Intl.DateTimeFormat("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
const activeOrders = orders => orders.filter(order => !["待支付", "已取消", "退款"].includes(order.status));

function calculateDashboardStats(orders, products) {
  const stats = new Map();
  let totalRevenue = 0;
  let soldUnits = 0;
  activeOrders(orders).forEach(order => {
    (order.items || []).forEach(item => {
      const quantity = Math.max(0, Number(item.quantity) || 0);
      const subtotal = Number(item.subtotal ?? item.price * quantity) || 0;
      totalRevenue += subtotal;
      soldUnits += quantity;
      const current = stats.get(item.id || item.name) || { id: item.id, name: item.name || "历史商品", quantity: 0, revenue: 0 };
      current.quantity += quantity;
      current.revenue += subtotal;
      stats.set(item.id || item.name, current);
    });
  });
  const productStats = [...stats.values()].map(stat => {
    const product = products.find(item => item.id === stat.id);
    return { ...stat, name: product?.name || stat.name, image: product?.image || "", category: product?.category || "历史商品" };
  }).sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue);
  return { totalRevenue, orderCount: orders.length, soldUnits, productCount: products.length, productStats };
}

function getOrdersForDashboard() {
  return [...DEMO_ORDERS, ...PettreatsData.getOrders()].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function renderDashboard() {
  const products = PettreatsData.getAllProducts();
  const orders = getOrdersForDashboard();
  const stats = calculateDashboardStats(orders, products);
  document.querySelector("#adminDate").textContent = new Intl.DateTimeFormat("zh-CN", { dateStyle: "full" }).format(new Date());
  document.querySelector("#statsNote").textContent = `${orders.length} 笔订单`;
  document.querySelector("#metricGrid").innerHTML = [
    ["总营业额", money(stats.totalRevenue), "已完成订单合计", "metric-revenue"],
    ["订单数", stats.orderCount, "演示与本地订单", ""],
    ["售出件数", stats.soldUnits, "有效订单商品件数", ""],
    ["在售商品", stats.productCount, "默认商品与新品", ""]
  ].map(([label, value, note, modifier], index) => {
    const target = ["", "ordersSection", "salesSection", "inventorySection"][index];
    return `<button class="metric-card ${modifier}" type="button" data-dashboard-target="${target}"><span>${label}</span><strong>${value}</strong><small>${note} <em>查看明细 →</em></small></button>`;
  }).join("");
  document.querySelector("#rankingList").innerHTML = stats.productStats.slice(0, 5).map((item, index) => `
    <div class="ranking-item"><span class="ranking-number">0${index + 1}</span><div class="ranking-info"><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.category)}</span><div class="ranking-bar"><i style="width:${Math.max(12, item.quantity / Math.max(stats.productStats[0]?.quantity || 1, 1) * 100)}%"></i></div></div><b>${item.quantity}</b></div>`).join("") || `<p class="empty-state">还没有可统计的商品销售。</p>`;
  document.querySelector("#ordersBody").innerHTML = orders.map(order => `<tr><td><strong>${escapeHtml(order.id)}</strong><small>${order.id.startsWith("DEMO-") ? "演示订单" : "本地订单"}</small></td><td><strong>${escapeHtml(order.customer?.name || "未填写")}</strong><small>${escapeHtml(order.address?.snapshot || "")}</small></td><td>${(order.items || []).map(item => `${escapeHtml(item.name)} × ${item.quantity}`).join("<br>")}</td><td><strong>${money(order.total)}</strong></td><td><span class="status status-${order.status === "已完成" ? "done" : "pending"}">${escapeHtml(order.status)}</span></td><td>${formatDate(order.createdAt)}</td></tr>`).join("");
  document.querySelector("#productsBody").innerHTML = products.map(product => {
    const stat = stats.productStats.find(item => item.id === product.id);
    return `<tr><td><strong>${escapeHtml(product.name)}</strong><small>${escapeHtml(product.spec)}</small></td><td>${escapeHtml(product.category)}</td><td>${Number(product.monthlySales || product.sales || 0).toLocaleString()}</td><td>${stat?.quantity || 0}</td><td><strong>${money(stat?.revenue || 0)}</strong></td></tr>`;
  }).join("");
  document.querySelector("#inventoryCount").textContent = products.length;
  document.querySelector("#inventoryGrid").innerHTML = products.map(product => `
    <article class="inventory-card">
      <img src="${escapeHtml(product.image || "assets/product-chicken-cheese.png")}" alt="${escapeHtml(product.name)}">
      <div class="inventory-card-body">
        <div class="inventory-card-top"><span>${escapeHtml(product.category)}</span><b>${money(product.price)}</b></div>
        <h3>${escapeHtml(product.name)}</h3>
        <p>${escapeHtml(product.spec || "规格待补充")}</p>
        <div class="inventory-card-bottom"><span>初始销量 ${Number(product.monthlySales || product.sales || 0).toLocaleString()}</span><span>${product.id.startsWith("admin-") ? "后台新品" : "默认商品"}</span></div>
      </div>
    </article>`).join("");
}

document.querySelector("#metricGrid").addEventListener("click", event => {
  const target = event.target.closest("[data-dashboard-target]")?.dataset.dashboardTarget;
  if (target) document.querySelector(`#${target}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
});

document.querySelector("#adminBackTop").addEventListener("click", () => {
  document.querySelector("#metricGrid").scrollIntoView({ behavior: "smooth", block: "start" });
});

document.querySelector("#imageFilePicker").addEventListener("change", event => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    selectedImageValue = reader.result;
    document.querySelector('input[name="imageDisplay"]').value = `assets/${file.name}`;
    document.querySelector("#imagePickerPreview").src = reader.result;
  });
  reader.readAsDataURL(file);
});

document.querySelector("#productForm").addEventListener("submit", event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const price = Number(data.get("price"));
  if (!data.get("name") || !price || price < 0 || !data.get("ingredients") || !data.get("suitableFor")) return;
  const product = {
    id: `admin-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: String(data.get("name")).trim(), category: String(data.get("foodCategory")).trim(),
    petTypes: [String(data.get("petCategory"))], price, spec: String(data.get("spec")).trim(),
    monthlySales: Number(data.get("sales")) || 0, tagline: String(data.get("sellingPoints") || "认真挑选的日常奖励").trim(),
    sellingPoints: String(data.get("sellingPoints") || "").split(/[,，]/).map(item => item.trim()).filter(Boolean),
    ingredients: String(data.get("ingredients")).trim(), suitableFor: String(data.get("suitableFor")).trim(),
    palatability: "口感友好，适合作为日常奖励", tags: String(data.get("tags") || "").split(/[,，]/).map(item => item.trim()).filter(Boolean),
    image: selectedImageValue, createdAt: new Date().toISOString()
  };
  const saved = (() => { try { const items = JSON.parse(localStorage.getItem(PettreatsData.PRODUCTS_KEY) || "[]"); items.push(product); localStorage.setItem(PettreatsData.PRODUCTS_KEY, JSON.stringify(items)); return true; } catch { return false; } })();
  const message = document.querySelector("#productMessage");
  message.textContent = saved ? "新品已保存，刷新商城即可看到。" : "保存失败，请检查浏览器本地存储。";
  if (saved) {
    event.currentTarget.reset();
    selectedImageValue = "assets/product-chicken-cheese.png";
    document.querySelector('input[name="imageDisplay"]').value = selectedImageValue;
    document.querySelector("#imagePickerPreview").src = selectedImageValue;
    renderDashboard();
  }
});

renderDashboard();
