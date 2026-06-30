// ===== 商品数据（500💎 +100，0.99$）=====
const products = [
  { id: "p1", amount: "500", bonus: "+100", price: "0.99 $", tag: "" },
  { id: "p2", amount: "500", bonus: "+100", price: "0.99 $", tag: "" },
  { id: "p3", amount: "500", bonus: "+100", price: "0.99 $", tag: "" },
  { id: "p4", amount: "500", bonus: "+100", price: "0.99 $", tag: "" },
  { id: "p5", amount: "500", bonus: "+100", price: "0.99 $", tag: "" },
  { id: "p6", amount: "500", bonus: "+100", price: "0.99 $", tag: "" },
];

let currentOS = "ios";
let pending = null; // 当前购买商品
let isLoggedIn = false; // 登录态（默认未登录）

// ===== 渲染商品（图片素材）=====
const list = document.getElementById("productList");
products.forEach(p => {
  const card = document.createElement("div");
  card.className = "product-card";
  card.innerHTML = `<img class="product-img" src="assets/product-card.png" alt="${p.amount}${p.bonus} 💎 ${p.price}">`;
  card.addEventListener("click", () => startPurchase({
    name: `${p.amount} 💎 礼包`,
    price: p.price,
    amount: parseInt(p.amount) + (p.bonus ? parseInt(p.bonus.replace(/\D/g, "")) : 0),
    label: `${p.amount}${p.bonus || ""} 💎`
  }));
  list.appendChild(card);
});

// 限量优惠大卡
document.getElementById("limitedCard").addEventListener("click", () => startPurchase({
  name: "1000 💎 限量礼包",
  price: "US$0.99",
  amount: 1000,
  label: "1000 💎"
}));

// 关闭宣传 banner（下方内容自动上移）
const promoClose = document.getElementById("promoClose");
if (promoClose) {
  promoClose.addEventListener("click", (e) => {
    e.stopPropagation();
    const banner = document.getElementById("promoBanner");
    banner.classList.add("hide");
    setTimeout(() => { banner.style.display = "none"; }, 400);
  });
}

// ===== 平台切换 =====
document.querySelectorAll(".ps-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".ps-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentOS = btn.dataset.os;
    document.getElementById("phone").classList.toggle("android", currentOS === "android");
  });
});

// ===== 登录状态切换（模拟用）=====
document.querySelectorAll(".ls-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".ls-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    isLoggedIn = btn.dataset.login === "true";
    showToast(isLoggedIn ? "已切换为：已登录" : "已切换为：未登录");
  });
});

// ===== DOM 引用 =====
const overlay = document.getElementById("overlay");
const appleSheet = document.getElementById("appleSheet");
const googleSheet = document.getElementById("googleSheet");
const processing = document.getElementById("processing");
const successToast = document.getElementById("successToast");

// ===== 发起购买：先校验登录，再拉起对应平台支付面板 =====
function startPurchase(prod) {
  pending = prod;

  // 未登录：toast 提示 → 跳转登录页
  if (!isLoggedIn) {
    showToast("请登录后购买");
    setTimeout(openLogin, 900);
    return;
  }

  openPaySheet(prod);
}

// ===== 拉起支付面板 =====
function openPaySheet(prod) {
  pending = prod;
  overlay.classList.add("show");

  if (currentOS === "ios") {
    document.getElementById("appleProd").textContent = prod.name;
    document.getElementById("applePrice").textContent = prod.price;
    document.getElementById("appleHint").textContent = "双击侧边按钮以确认";
    document.getElementById("faceIcon").classList.remove("scanning");
    appleSheet.classList.add("show");
  } else {
    document.getElementById("gProd").textContent = prod.name;
    document.getElementById("gPrice").textContent = prod.price;
    document.getElementById("gBuyText").textContent = "购买";
    googleSheet.classList.add("show");
  }
}

// ===== Toast 提示 =====
let toastTimer = null;
function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 1600);
}

// ===== 登录页 =====
const loginPage = document.getElementById("loginPage");
function openLogin() { loginPage.classList.add("show"); }
function closeLogin() { loginPage.classList.remove("show"); }

function doLogin() {
  isLoggedIn = true;
  syncLoginSwitch();
  showToast("登录成功");
  closeLogin();
  // 登录后自动继续之前的购买
  if (pending) {
    setTimeout(() => openPaySheet(pending), 500);
  }
}

// 同步顶部登录状态切换按钮
function syncLoginSwitch() {
  document.querySelectorAll(".ls-btn").forEach(b => {
    b.classList.toggle("active", (b.dataset.login === "true") === isLoggedIn);
  });
}

document.getElementById("loginBack").addEventListener("click", closeLogin);
document.getElementById("appleLogin").addEventListener("click", doLogin);
document.getElementById("googleLogin").addEventListener("click", doLogin);
document.getElementById("accountLogin").addEventListener("click", doLogin);

// ===== 关闭所有面板 =====
function closeSheets() {
  overlay.classList.remove("show");
  appleSheet.classList.remove("show");
  googleSheet.classList.remove("show");
}

// 点遮罩关闭（取消支付）
overlay.addEventListener("click", closeSheets);

// ===== Apple：模拟双击侧边按钮 → Face ID =====
appleSheet.addEventListener("click", (e) => {
  e.stopPropagation();
  const faceIcon = document.getElementById("faceIcon");
  const hint = document.getElementById("appleHint");
  if (faceIcon.classList.contains("scanning")) return;
  faceIcon.classList.add("scanning");
  hint.textContent = "正在验证…";
  setTimeout(() => {
    hint.textContent = "完成 ✓";
    setTimeout(() => { closeSheets(); runPayment(); }, 350);
  }, 1000);
});

// ===== Google：点购买按钮 =====
document.getElementById("gBuyBtn").addEventListener("click", (e) => {
  e.stopPropagation();
  document.getElementById("gBuyText").textContent = "处理中…";
  setTimeout(() => { closeSheets(); runPayment(); }, 500);
});
document.getElementById("gClose").addEventListener("click", (e) => {
  e.stopPropagation();
  closeSheets();
});
googleSheet.addEventListener("click", e => e.stopPropagation());

// ===== 支付处理 → 成功 =====
function runPayment() {
  setTimeout(() => {
    processing.classList.add("show");
    setTimeout(() => {
      processing.classList.remove("show");
      showSuccess();
    }, 1400);
  }, 200);
}

function showSuccess() {
  const desc = document.getElementById("successDesc");
  if (pending.isSub) {
    desc.textContent = "月度会员已开通";
  } else {
    desc.textContent = `${pending.amount.toLocaleString()} 💎 已到账`;
    updateBalance(pending.amount);
  }
  // 重置成功动画
  const check = document.querySelector(".check");
  check.style.animation = "none";
  void check.offsetWidth;
  check.style.animation = "";

  successToast.classList.add("show");
  setTimeout(() => successToast.classList.remove("show"), 2000);
}

// ===== 更新余额 =====
function updateBalance(add) {
  const el = document.getElementById("balanceNum");
  let cur = parseInt(el.textContent.replace(/,/g, ""));
  const target = cur + add;
  const step = Math.max(1, Math.floor(add / 30));
  const timer = setInterval(() => {
    cur += step;
    if (cur >= target) { cur = target; clearInterval(timer); }
    el.textContent = cur.toLocaleString();
  }, 25);
}
