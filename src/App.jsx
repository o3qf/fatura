import React, { useEffect, useMemo, useState } from "react";
import {
  getFirestore,
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signInWithCustomToken,
} from "firebase/auth";

import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { runTransaction, increment } from "firebase/firestore";



import {
  ShoppingCart,
  Plus,
  Minus,
  X,
  CheckCircle,
  Utensils,
  Settings,
  LayoutDashboard,
  CreditCard,
  Banknote,
  Trash2,
  Edit3,
  Sparkles,
  Loader2,
  ChevronRight,
  ArrowRight,
  User,
  Clock,
  Check,
  Ban,
} from "lucide-react";

import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";



const CURRENCY = "₺"; // Turkish Lira



/* =========================
   Firebase Config
   ========================= */
// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCQdSmyGXU7ckhrUzyrSIMDBZcreF9b-No",
  authDomain: "smart-restaurant-a7725.firebaseapp.com",
  projectId: "smart-restaurant-a7725",
  storageBucket: "smart-restaurant-a7725.firebasestorage.app",
  messagingSenderId: "890591633029",
  appId: "1:890591633029:web:577882510689b8e65693ec",
  measurementId: "G-XE554Z3L60"
};

// Initialize Firebase





// ✅ 1) أول شيء initializeApp
const firebaseApp = initializeApp(firebaseConfig);

// ✅ 2) بعده استخدمه في كل الخدمات
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);



// (اختياري) Analytics - فقط بالمتصفح
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(firebaseApp);
}

// App ID (مهم لمسارات Firestore)
const appId =
  (typeof __app_id !== "undefined" && __app_id) ||
  import.meta.env.VITE_APP_ID ||
  "wingi-pro";

// Gemini API Key (اختياري)
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyB05MQWmtxnWxKnbCnMXWhLuPyqJMczWCU";

/* =========================
   Translations
   ========================= */
const translations = {
  ar: {
    brand: "Wingi",
    portalTitle: "لوحة Wingi",
    admin: "الإدارة",
    customer: "العميل",
    openAdmin: "الدخول للإدارة",
    openCustomer: "فتح واجهة العميل",
    welcome: "مرحباً بك",
    selectTable: "اختر طاولتك للبدء",
    startOrder: "فتح المنيو",
    menu: "قائمة الطعام",
    cart: "سلة الطلبات",
    total: "الإجمالي",
    payment: "طريقة الدفع",
    cash: "كاش",
    card: "بطاقة",
    completeOrder: "إرسال الطلب الآن",
    orderSuccess: "تم إرسال طلبك للمطبخ!",
    all: "الكل",
    table: "طاولة",
    activeOrders: "الطلبات النشطة",
    oldOrders: "الطلبات القديمة",
    prepared: "تم التحضير",
    cancelled: "ملغي",
    markPrepared: "تم التحضير",
    markCancel: "إلغاء",
    items: "الأصناف",
    addProduct: "إضافة منتج",
    save: "حفظ",
    cancel: "إلغاء",
    price: "السعر",
    image: "رابط الصورة",
    translating: "جاري الترجمة...",
    aiTranslate: "ترجمة AI",
    category: "التصنيف",
    name: "الاسم",
    desc: "الوصف",
    changeTable: "تغيير",
    emptyCart: "السلة فارغة",
    adminLang: "لغة الإدارة",
    customerLang: "لغة العميل",
    portalHint: "هذه الصفحة للإدارة فقط",
    goPortal: "العودة للبوابة",
    missingApiKey: "ميزة الترجمة تحتاج API Key",
    notes: "ملاحظات خاصة (اختياري)",
addToCart: "إضافة للسلة",
skip: "تخطي",
outOfStock: "نفذت الكمية",
available: "متوفر",
adminLogin: "تسجيل دخول الإدارة",
adminRegister: "إنشاء حساب إدارة",
username: "اسم المستخدم",
password: "كلمة المرور",
ownerPin: "كلمة سر صاحب المطعم",
createAccount: "إنشاء حساب",
login: "تسجيل الدخول",
logout: "تسجيل خروج",
invalidCredentials: "اسم المستخدم أو كلمة المرور غير صحيحة",
ownerPinWrong: "كلمة سر صاحب المطعم خاطئة",
usernameTaken: "اسم المستخدم مستخدم مسبقًا",
requiredFields: "يرجى تعبئة كل الحقول",
markedBy: "تم بواسطة",
iban: "تحويل إلى IBAN",
ibanInfoTitle: "معلومات التحويل",
receiptUploadTitle: "إرفاق إيصال التحويل",
receiptRequired: "يجب إرفاق صورة الإيصال قبل تقديم الطلب",

  },
  en: {
    brand: "Wingi",
    portalTitle: "Wingi Panel",
    admin: "Admin",
    customer: "Customer",
    openAdmin: "Enter Admin",
    openCustomer: "Open Customer",
    welcome: "Welcome",
    selectTable: "Choose your table to start",
    startOrder: "Open Menu",
    menu: "Menu",
    cart: "Cart",
    total: "Total",
    payment: "Payment",
    cash: "Cash",
    card: "Card",
    completeOrder: "Send Order",
    orderSuccess: "Order sent to kitchen!",
    all: "All",
    table: "Table",
    activeOrders: "Active Orders",
    oldOrders: "Order History",
    prepared: "Prepared",
    cancelled: "Cancelled",
    markPrepared: "Prepared",
    markCancel: "Cancel",
    items: "Items",
    addProduct: "Add Product",
    save: "Save",
    cancel: "Cancel",
    price: "Price",
    image: "Image URL",
    translating: "Translating...",
    aiTranslate: "AI Translate",
    category: "Category",
    name: "Name",
    desc: "Description",
    changeTable: "Change",
    emptyCart: "Cart is empty",
    adminLang: "Admin Language",
    customerLang: "Customer Language",
    portalHint: "This page is admin only",
    goPortal: "Back to Portal",
    missingApiKey: "Translation needs an API key",
      notes: "Special notes (optional)",
  addToCart: "Add to cart",
  skip: "Skip",
  outOfStock: "Out of stock",
  available: "Available",
  notesPlaceholder: "Example: no onion / extra sauce...",
iban: "IBAN Transfer",
ibanInfoTitle: "Transfer Info",
receiptUploadTitle: "Upload receipt",
receiptRequired: "You must upload the receipt image before submitting the order",

  },
  tr: {
    brand: "Wingi",
    portalTitle: "Wingi Paneli",
    admin: "Yönetici",
    customer: "Müşteri",
    openAdmin: "Yöneticiye Gir",
    openCustomer: "Müşteriyi Aç",
    welcome: "Hoş Geldiniz",
    selectTable: "Başlamak için masa seçin",
    startOrder: "Menüyü Aç",
    menu: "Menü",
    cart: "Sepet",
    total: "Toplam",
    payment: "Ödeme",
    cash: "Nakit",
    card: "Kart",
    completeOrder: "Siparişi Gönder",
    orderSuccess: "Sipariş mutfağa gönderildi!",
    all: "Hepsi",
    table: "Masa",
    activeOrders: "Aktif Siparişler",
    oldOrders: "Eski Siparişler",
    prepared: "Hazırlandı",
    cancelled: "İptal",
    markPrepared: "Hazırlandı",
    markCancel: "İptal",
    items: "Ürünler",
    addProduct: "Ürün Ekle",
    save: "Kaydet",
    cancel: "İptal",
    price: "Fiyat",
    image: "Resim URL",
    translating: "Çevriliyor...",
    aiTranslate: "AI Çeviri",
    category: "Kategori",
    name: "Ad",
    desc: "Açıklama",
    changeTable: "Değiştir",
    emptyCart: "Sepet boş",
    adminLang: "Yönetici Dili",
    customerLang: "Müşteri Dili",
    portalHint: "Bu sayfa sadece yönetici için",
    goPortal: "Portala Dön",
    missingApiKey: "Çeviri için API anahtarı gerekli",
      notes: "Özel notlar (isteğe bağlı)",
  addToCart: "Sepete ekle",
  skip: "Atla",
  outOfStock: "Stok tükendi",
  available: "Mevcut",
  notesPlaceholder: "Örn: soğansız / ekstra sos...",
iban: "IBAN Havale",
ibanInfoTitle: "Havale Bilgileri",
receiptUploadTitle: "Dekont yükle",
receiptRequired: "Siparişi göndermeden önce dekont görseli yüklemelisiniz",

  },
};

/* =========================
   Helpers (Luxury UI)
   ========================= */
const LuxuryShell = ({ children, dir = "rtl", tone = "dark" }) => {
  const base =
    tone === "dark"
      ? "bg-slate-950 text-white"
      : "bg-slate-50 text-slate-900";
  return (
    <div dir={dir} className={`min-h-screen relative overflow-hidden ${base}`}>
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -top-48 -right-48 w-[520px] h-[520px] bg-orange-500/20 blur-3xl rounded-full" />
      <div className="pointer-events-none absolute -bottom-56 -left-56 w-[640px] h-[640px] bg-blue-500/15 blur-3xl rounded-full" />
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 w-[520px] h-[520px] bg-purple-500/10 blur-3xl rounded-full" />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

const GlassCard = ({ children, className = "", tone = "dark" }) => {
  const cls =
    tone === "dark"
      ? "bg-white/10 border-white/10"
      : "bg-white border-slate-100";
  return (
    <div
      className={`backdrop-blur-md border rounded-[2.5rem] shadow-2xl ${cls} ${className}`}
    >
      {children}
    </div>
  );
};

const Pill = ({ children, variant = "neutral" }) => {
  const map = {
    neutral: "bg-slate-100 text-slate-600",
    orange: "bg-orange-100 text-orange-700",
    green: "bg-emerald-100 text-emerald-700",
    red: "bg-red-100 text-red-700",
    blue: "bg-blue-100 text-blue-700",
    dark: "bg-slate-950 text-white",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[11px] font-black ${map[variant]}`}>
      {children}
    </span>
  );
};

const normalizeDigits = (s = "") =>
  String(s)
    // Arabic-Indic ٠١٢٣٤٥٦٧٨٩
    .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d))
    // Eastern Arabic-Indic ۰۱۲۳۴۵۶۷۸۹
    .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d));


export default function App() {
  /* =========================
     Router (بدون مكتبة)
     - العميل: "/" أو "/customer"
     - الإدارة + Portal: "/admin"
     ========================= */
  

  // portal لا يظهر للعميل (العميل يدخل مباشرة الاختيار)
  const path = typeof window !== "undefined" ? window.location.pathname : "/";
const isAdminRoute = path.startsWith("/admin");

  const [appMode, setAppMode] = useState(isAdminRoute ? "portal" : "customer");

  // Admin Auth (simple)
const [adminSession, setAdminSession] = useState(null); // { username }
const [adminAuthMode, setAdminAuthMode] = useState("login"); // login | register
const [adminUsername, setAdminUsername] = useState("");
const [adminPassword, setAdminPassword] = useState("");
const [ownerPin, setOwnerPin] = useState("");
const [adminAuthError, setAdminAuthError] = useState("");
const [ownerConfig, setOwnerConfig] = useState(null); // { ownerUsername, ownerPassword }
const [isOwner, setIsOwner] = useState(false);


// Admin navigation (NEW)
const [adminPage, setAdminPage] = useState("menu"); // "menu" | "orders" | "inventory"
const [ordersTab, setOrdersTab] = useState("active"); // "active" | "old"


// لإدارة حسابات الموظفين (Owner فقط)
const [accountsOpen, setAccountsOpen] = useState(false);
const [adminUsers, setAdminUsers] = useState([]);

const [accEdit, setAccEdit] = useState(null);
const [accUsername, setAccUsername] = useState("");
const [accPassword, setAccPassword] = useState("");

const [newOwnerPass, setNewOwnerPass] = useState("");
const [newOwnerUser, setNewOwnerUser] = useState("");

// =========================
// Firestore Paths (لازم تكون فوق قبل أي استخدام)
// =========================
const adminUsersColPath = ["artifacts", appId, "public", "data", "adminUsers"];
const ownerDocPath = ["artifacts", appId, "public", "data", "adminConfig", "owner"];
const vipCustomersColPath = ["artifacts", appId, "public", "data", "vipCustomers"];



const updateOwnerCredentials = async () => {
  if (adminSession?.role !== "owner") return;

  const nu = normalizeDigits(newOwnerUser).trim().toLowerCase();
  const np = normalizeDigits(newOwnerPass).trim();
  if (!nu || !np) return;

  await updateDoc(doc(db, ...ownerDocPath), {
    ownerUsername: nu,
    ownerPassword: np,
    updatedAt: Date.now(),
  });

  const session = { username: nu, role: "owner" };
  setAdminSession(session);
  setIsOwner(true);
  localStorage.setItem("wingi_admin_session", JSON.stringify(session));

  setNewOwnerUser("");
  setNewOwnerPass("");
};





// 5B: restore admin session
useEffect(() => {
  if (typeof window === "undefined") return;

  const raw = localStorage.getItem("wingi_admin_session");
  if (raw) {
    try {
      const s = JSON.parse(raw);
      setAdminSession(s);
      setIsOwner(s?.role === "owner");
    } catch {}
  }
}, []);




useEffect(() => {
  if (typeof window === "undefined") return;

  const path = window.location.pathname;

  if (path.startsWith("/admin")) {
    setAppMode("portal"); // إدارة
  } else {
    setAppMode("customer"); // عميل
  }
}, []);



  const [user, setUser] = useState(null);

  // Customer language
  const [lang, setLang] = useState("ar");
  // Admin language
  const [adminLang, setAdminLang] = useState("ar");

  // Customer views
  const [view, setView] = useState("selection"); // selection | menu
  const [table, setTable] = useState(null);

  const [menuItems, setMenuItems] = useState([]);

  // ===== فلتر الطلبات القديمة =====
const [oldFrom, setOldFrom] = useState(""); // تاريخ البداية
const [oldTo, setOldTo] = useState("");     // تاريخ النهاية


// ===== تحويل تاريخ الطلب إلى Date (مهم لفلترة الطلبات القديمة) =====
const orderDateToJS = (o) => {
  const v = o?.createdAt ?? o?.timestamp ?? o?.date ?? o?.time;

  if (!v) return null;

  // Firestore Timestamp (toDate)
  if (typeof v?.toDate === "function") {
    return v.toDate();
  }

  // Firestore Timestamp (seconds)
  if (typeof v === "object" && typeof v.seconds === "number") {
    return new Date(v.seconds * 1000);
  }

  // رقم (milliseconds)
  if (typeof v === "number") {
    return new Date(v);
  }

  // نص تاريخ
  if (typeof v === "string") {
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }

  // Date جاهز
  if (v instanceof Date) return v;

  return null;
};


const [applyOldFilter, setApplyOldFilter] = useState(false);

const [orders, setOrders] = useState([]);

console.log("APP ID =", appId, "MENU =", menuItems.length);

// ✅ Inventory
const [inventory, setInventory] = useState([]);

const computedOutOfStock = useMemo(() => {
  const invMap = new Map(inventory.map((x) => [x.id, x]));

  const orderDateToJS = (createdAt) => {
  if (!createdAt) return null;

  if (typeof createdAt?.toDate === "function") return createdAt.toDate();
  if (typeof createdAt === "number") return new Date(createdAt);

  const d = new Date(createdAt);
  return isNaN(d.getTime()) ? null : d;
};


  const outMap = {};

  for (const m of menuItems) {
    const recipe = Array.isArray(m.recipe) ? m.recipe : [];

    if (recipe.length === 0) {
      outMap[m.id] = false;
      continue;
    }

    let out = false;

    for (const ing of recipe) {
      const inv = invMap.get(ing.invId);

      if (!inv) { out = true; break; }
      if (inv.unit === "none") continue;

      const invQty = Number(inv.quantity || 0);
      const need = Number(ing.amountPerOne || 0);

      if (need > 0 && invQty < need) { out = true; break; }
    }

    outMap[m.id] = out;
  }

  return outMap;
}, [inventory, menuItems]);


  // ===== Inventory =====

  const [invNewName, setInvNewName] = useState("");
const [invNewQty, setInvNewQty] = useState("");
const [invNewError, setInvNewError] = useState("");


const [invNewCost, setInvNewCost] = useState("");
const [invNewSell, setInvNewSell] = useState("");
const [invNewUnit, setInvNewUnit] = useState("kg"); // kg | piece | liter | none


// ✅ Edit Inventory
const [invEditOpen, setInvEditOpen] = useState(false);
const [invEditItem, setInvEditItem] = useState(null);

const [invEditName, setInvEditName] = useState("");
const [invEditUnit, setInvEditUnit] = useState("kg");
const [invEditQty, setInvEditQty] = useState("");
const [invEditCost, setInvEditCost] = useState("");
const [invEditSell, setInvEditSell] = useState("");
const [invEditError, setInvEditError] = useState("");


// ربط عنصر مخزون بمنتجات المنيو
const [invLinkOpen, setInvLinkOpen] = useState(false);
const [invLinkTarget, setInvLinkTarget] = useState(null); // inventory item
const [invLinkRows, setInvLinkRows] = useState([]); // [{menuId, amountPerOne}]


// ✅ NEW: روابط الوصفة وقت إضافة عنصر مخزون جديد
const [invNewLinksOpen, setInvNewLinksOpen] = useState(false);
const [invNewLinks, setInvNewLinks] = useState([]); // [{ menuId, amountPerOne }]
// ✅ وحدة الإدخال للوصفة (جرام / مل / قطعة)
const [invNewLinksInputUnit, setInvNewLinksInputUnit] = useState("");






  // Cart
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [orderStatus, setOrderStatus] = useState(null);
  const [receiptDataUrl, setReceiptDataUrl] = useState("");
const [receiptError, setReceiptError] = useState("");
const [receiptOpen, setReceiptOpen] = useState(false);
const [receiptView, setReceiptView] = useState("");



  // Notes modal (customer)
const [notesOpen, setNotesOpen] = useState(false);
const [notesItem, setNotesItem] = useState(null);
const [notesText, setNotesText] = useState("");

  // Admin edit
  const [editingItem, setEditingItem] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [isTranslating, setIsTranslating] = useState(false);

  // ===== Admin create order =====
const [createOrderOpen, setCreateOrderOpen] = useState(false);
const [orderTable, setOrderTable] = useState("");
const [orderPay, setOrderPay] = useState("cash");
const [orderItems, setOrderItems] = useState([]);
const [createOrderError, setCreateOrderError] = useState("");
const [orderDiscount, setOrderDiscount] = useState(0); // نسبة الخصم %
const [uploadingImage, setUploadingImage] = useState(false);
const [imageUploadError, setImageUploadError] = useState("");
// ✅ خصم خاص بالدفع كاش (إعداد عام)
const [cashDiscountPercent, setCashDiscountPercent] = useState(0);


// VIP Customers
const [vipOpen, setVipOpen] = useState(false);
const [vipList, setVipList] = useState([]);
const [vipName, setVipName] = useState("");
const [vipDiscount, setVipDiscount] = useState(0);
const [vipError, setVipError] = useState("");
const [vipEdit, setVipEdit] = useState(null); // وضع التعديل


// داخل create order
const [vipPickerOpen, setVipPickerOpen] = useState(false);
const [selectedVip, setSelectedVip] = useState(null);



// تحويل كمية الاستهلاك إلى وحدة المخزون الأساسية
// baseUnit: g | ml | piece
// inputUnit: g | kg | ml | L | piece
const normalizeRecipeAmount = (baseUnit, inputUnit, amount) => {
  const v = Number(amount || 0);
  if (v <= 0) return 0;

  if (baseUnit === "g") {
    if (inputUnit === "kg") return v * 1000;
    return v; // g
  }

  if (baseUnit === "ml") {
    if (inputUnit === "L") return v * 1000;
    return v; // ml
  }

  // piece
  return v;
};

// حفظ روابط invNewLinks داخل menu.recipe
const saveNewInvLinksToMenu = async (invId) => {
  // لو "بدون كمية" ما نربطه
  if (invNewUnit === "none") return;

  // تحقق من وحدة الإدخال للكيلو/اللتر
  if ((invNewUnit === "g" || invNewUnit === "ml") && !invNewLinksInputUnit) {
    alert("اختر وحدة الاستهلاك أولاً (g أو ml).");
    return;
  }

  if (!invNewLinks.length) return;

  const updates = [];

  for (const row of invNewLinks) {
    const menuId = row.menuId;
    const amtRaw = Number(row.amountPerOne || 0);
    if (!menuId || amtRaw <= 0) continue;

    const m = menuItems.find((x) => x.id === menuId);
    if (!m) continue;

    const recipe = Array.isArray(m.recipe) ? [...m.recipe] : [];

    const normalizedAmt = normalizeRecipeAmount(
      invNewUnit,
      row.inputUnit || invNewLinksInputUnit,
      amtRaw
    );

    if (normalizedAmt <= 0) continue;

    const idx = recipe.findIndex((r) => r.invId === invId);
    const nextIng = { invId, amountPerOne: normalizedAmt };

    if (idx >= 0) recipe[idx] = nextIng;
    else recipe.push(nextIng);

    updates.push(
      updateDoc(doc(db, "artifacts", appId, "public", "data", "menu", menuId), {
        recipe,
        updatedAt: Date.now(),
      })
    );
  }

  if (updates.length) await Promise.all(updates);
};

const deleteOrderPermanently = async (orderId) => {
  if (!window.confirm("هل تريد حذف الطلب نهائياً؟")) return;

  try {
    await deleteDoc(doc(db, "artifacts", appId, "public", "data", "orders", orderId));
    alert("تم حذف الطلب");
  } catch (e) {
    console.error(e);
    alert("خطأ أثناء الحذف");
  }
};


const handleAddInventory = async () => {
  try {
    setInvNewError("");

    if (!invNewName.trim()) {
      setInvNewError("اكتب اسم المادة");
      return;
    }

    const id = invNewName.trim().toLowerCase().replace(/\s+/g, "_");

    await setDoc(
      doc(db, "artifacts", appId, "public", "data", "inventory", id),
      {
        name: invNewName.trim(),
        unit: invNewUnit,
        costPrice: Number(invNewCost || 0),
        sellPrice: Number(invNewSell || 0),
        quantity: invNewUnit === "none" ? 999999999 : Number(invNewQty || 0),
        baselineQuantity:
          invNewUnit === "none" ? 999999999 : Number(invNewQty || 0),
        lowPercent: 0.2,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      { merge: true }
    );


    // ✅ حفظ الربط مع المنيو
await saveNewInvLinksToMenu(id);


    setInvNewName("");
    setInvNewCost("");
    setInvNewSell("");
    setInvNewQty("");
    setInvNewUnit("g");
    setInvNewLinks([]);
    setInvNewLinksOpen(false);
  } catch (e) {
    console.error(e);
    setInvNewError("فشل إضافة المخزون");
  }
};


const deleteInventory = async (invId) => {
  const ok = confirm("حذف عنصر المخزون؟");
  if (!ok) return;

  await deleteDoc(
    doc(db, "artifacts", appId, "public", "data", "inventory", invId)
  );
};


const openEditInventory = (inv) => {
  setInvEditError("");
  setInvEditItem(inv);

  setInvEditName(inv?.name || "");
  setInvEditUnit(inv?.unit || "g"); // عندك kg لكن معناها g ثابت، و liter معناها ml ثابت
  setInvEditQty(String(inv?.unit === "none" ? "" : (inv?.quantity ?? "")));

  setInvEditCost(String(inv?.costPrice ?? ""));
  setInvEditSell(String(inv?.sellPrice ?? ""));

  setInvEditOpen(true);
};

const saveEditInventory = async () => {
  try {
    setInvEditError("");
    if (!invEditItem?.id) return;

    if (!invEditName.trim()) {
      setInvEditError("اكتب اسم المادة");
      return;
    }

    const payload = {
      name: invEditName.trim(),
      unit: invEditUnit,
      costPrice: Number(invEditCost || 0),
      sellPrice: Number(invEditSell || 0),
      updatedAt: Date.now(),
    };

    if (invEditUnit === "none") {
      payload.quantity = 999999999;
      payload.baselineQuantity = 999999999;
    } else {
      const q = Number(invEditQty || 0);
      payload.quantity = q;
      payload.baselineQuantity = q; // عشان تنبيهات 20% تكون صحيحة
    }

    await updateDoc(
      doc(db, "artifacts", appId, "public", "data", "inventory", invEditItem.id),
      payload
    );

    setInvEditOpen(false);
    setInvEditItem(null);
  } catch (e) {
    console.error(e);
    setInvEditError("فشل حفظ التعديل");
  }
};



// ===== Preview totals (Admin Create Order) =====
const adminPreviewItems = useMemo(() => {
  return (orderItems || [])
    .map((it) => {
      const m = menuItems.find((x) => x.id === it.id) || {};
      const qty = Number(it.quantity || 1);
      const price = Number(m.price || it.price || 0);

      return { ...it, quantity: qty, price };
    })
    .filter((x) => x.id);
}, [orderItems, menuItems]);

const adminSubtotal = useMemo(() => {
  return adminPreviewItems.reduce(
    (s, it) => s + Number(it.price || 0) * Number(it.quantity || 1),
    0
  );
}, [adminPreviewItems]);

const adminDiscountPercent = useMemo(() => {
  return Math.min(100, Math.max(0, Number(orderDiscount || 0)));
}, [orderDiscount]);

const adminDiscountAmount = useMemo(() => {
  return (adminSubtotal * adminDiscountPercent) / 100;
}, [adminSubtotal, adminDiscountPercent]);

const adminTotal = useMemo(() => {
  return Math.max(0, adminSubtotal - adminDiscountAmount);
}, [adminSubtotal, adminDiscountAmount]);






  const t = translations[lang];
  const admT = translations[adminLang];

  /* =========================
     Auth init
     ========================= */
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (
          typeof __initial_auth_token !== "undefined" &&
          __initial_auth_token
        ) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) {
        console.error("Auth init error:", e);
      }
    };
    initAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);

  /* =========================
     Firestore realtime
     ========================= */
  useEffect(() => {
    if (!user) return;

    const unsubMenu = onSnapshot(
      collection(db, "artifacts", appId, "public", "data", "menu"),
      (snap) => {
        setMenuItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    );

    const unsubOrders = onSnapshot(
      collection(db, "artifacts", appId, "public", "data", "orders"),
      (snap) => {
        const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        // newest first
        arr.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        setOrders(arr);
      }
    );

     const unsubInv = onSnapshot(
    collection(db, "artifacts", appId, "public", "data", "inventory"),
    (snap) => {
      setInventory(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }
  );
    return () => {
      unsubMenu();
      unsubOrders();
       unsubInv();
    };
  }, [user]);

  const refreshOutOfStockForAllMenu = async () => {
    
  try {
    const invMap = new Map(inventory.map((x) => [x.id, Number(x.quantity || 0)]));

    const updates = [];

    for (const m of menuItems) {
      const recipe = Array.isArray(m.recipe) ? m.recipe : [];

      if (recipe.length === 0) {
        if (m.outOfStock) {
          updates.push(
            updateDoc(doc(db, "artifacts", appId, "public", "data", "menu", m.id), {
              outOfStock: false,
              updatedAt: Date.now(),
            })
          );
        }
        continue;
      }

      let out = false;

      for (const ing of recipe) {
        const invQty = Number(invMap.get(ing.invId) ?? 0);
        const needForOne = Number(ing.amountPerOne || 0);
        if (needForOne <= 0) continue;

        // ✅ الشرط المطلوب: أقل من احتياج صنف واحد
        if (invQty < needForOne) {
          out = true;
          break;
        }
      }

      if (!!m.outOfStock !== out) {
        updates.push(
          updateDoc(doc(db, "artifacts", appId, "public", "data", "menu", m.id), {
            outOfStock: out,
            updatedAt: Date.now(),
          })
        );
      }
    }

    if (updates.length) await Promise.all(updates);
  } catch (e) {
    console.error(e);
  }
};


useEffect(() => {
  if (!menuItems.length) return;
  refreshOutOfStockForAllMenu();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [inventory, menuItems]);



  const uploadMenuImage = async (file) => {
  setImageUploadError("");

  if (!file) return "";
  if (!file.type.startsWith("image/")) {
    setImageUploadError("الملف لازم يكون صورة");
    return "";
  }

  try {
    setUploadingImage(true);

    const safeName = `${Date.now()}_${file.name}`.replace(/\s+/g, "_");
    const path = `menuImages/${appId}/${safeName}`;
    const r = storageRef(storage, path);

    await uploadBytes(r, file);
    const url = await getDownloadURL(r);

    return url;
  } catch (e) {
    console.error(e);
    setImageUploadError("فشل رفع الصورة");
    return "";
  } finally {
    setUploadingImage(false);
  }
};

  // (A) إنشاء/تصحيح owner إذا ناقص
useEffect(() => {
  if (!user) return;

  const ensureOwner = async () => {
    const ref = doc(db, ...ownerDocPath);
    const snap = await getDoc(ref);

    // إذا الوثيقة غير موجودة -> أنشئها
    if (!snap.exists()) {
      await setDoc(ref, {
        ownerUsername: "admin",
        ownerPassword: "12344321",
        updatedAt: Date.now(),
      });
      return;
    }

    // إذا موجودة لكن ناقصة (مثل ownerPassword undefined) -> أصلحها
    const data = snap.data() || {};
    if (!data.ownerUsername || !data.ownerPassword) {
      await setDoc(
        ref,
        {
          ownerUsername: data.ownerUsername || "admin",
          ownerPassword: data.ownerPassword || "12344321",
          updatedAt: Date.now(),
        },
        { merge: true }
      );
    }
  };

  ensureOwner();
}, [user]);


// (B) جلب ownerConfig realtime
useEffect(() => {
  if (!user) return;

  const unsub = onSnapshot(doc(db, ...ownerDocPath), (snap) => {
    if (snap.exists()) setOwnerConfig(snap.data());
  });

  return () => unsub();
}, [user]);

// (C) جلب حسابات الموظفين realtime (لـ owner فقط)
useEffect(() => {
  if (!user) return;
  if (!adminSession || adminSession.role !== "owner") return;

  const unsub = onSnapshot(collection(db, ...adminUsersColPath), (snap) => {
    setAdminUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });

  

  return () => unsub();
}, [user, adminSession]);

// ✅ VIP list realtime (خليها لوحدها)
useEffect(() => {
  if (!user) return;
  if (!adminSession) return;

  const unsub = onSnapshot(collection(db, ...vipCustomersColPath), (snap) => {
    const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    arr.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
    setVipList(arr);
  });

  return () => unsub();
}, [user, adminSession]);


  /* =========================
     Localization helpers
     ========================= */
  const getLocalizedValue = (item, key, forceLang = null) => {
    const targetLang = forceLang || lang;
    const k = targetLang.charAt(0).toUpperCase() + targetLang.slice(1);
    return item?.[`${key}${k}`] || item?.[`${key}Ar`] || "";
  };

  const categories = useMemo(() => {
    const distinct = ["All", ...new Set(menuItems.map((i) => i.categoryAr).filter(Boolean))];
    return distinct;
  }, [menuItems]);

  const filteredItems =
    activeCategory === "All"
      ? menuItems
      : menuItems.filter((i) => i.categoryAr === activeCategory);

  const activeOrders = useMemo(
    () => orders.filter((o) => o.status === "new"),
    [orders]
  );

  const oldOrders = useMemo(() => {
  let list = orders.filter(o => o.status !== "new");

  if (applyOldFilter && (oldFrom || oldTo)) {
    list = list.filter(o => {
      const d = orderDateToJS(o);
      if (!d) return false;

      if (oldFrom) {
        const from = new Date(oldFrom);
        if (d < from) return false;
      }

      if (oldTo) {
        const to = new Date(oldTo);
        to.setHours(23, 59, 59, 999);
        if (d > to) return false;
      }

      return true;
    });
  }

  return list;
}, [orders, applyOldFilter, oldFrom, oldTo]);



  const inventoryAlerts = useMemo(() => {
  const invMap = new Map(inventory.map((x) => [x.id, x]));
  const usedInv = new Map(); // invId -> أقل كمية لصنع منتج واحد

  // نجمع أقل amountPerOne لكل عنصر مخزون (يعني: أقل كمية يحتاجها منتج واحد)
  for (const m of menuItems) {
    const recipe = Array.isArray(m.recipe) ? m.recipe : [];
    for (const r of recipe) {
      if (!r?.invId) continue;
      const need = Number(r.amountPerOne || 0);
      if (need <= 0) continue;

      const prev = usedInv.get(r.invId);
      if (!prev || need < prev) usedInv.set(r.invId, need);
    }
  }

  const out = [];
  const low = [];

  for (const [invId, minNeedForOne] of usedInv.entries()) {
    const inv = invMap.get(invId);
    if (!inv || inv.unit === "none") continue;

    const qty = Number(inv.quantity || 0);
    const base = Number(inv.baselineQuantity || 0);
    const lowPercent = Number(inv.lowPercent ?? 0.2);

    // 🚫 لا يكفي لصنع منتج واحد
    if (qty < minNeedForOne) {
      out.push({
        invId,
        name: inv.name || inv.id,
        qty,
        needForOne: minNeedForOne,
      });
      continue;
    }

    // ⚠️ اقترب من 20%
    if (base > 0 && qty <= base * lowPercent) {
      low.push({
        invId,
        name: inv.name || inv.id,
        qty,
        base,
      });
    }
  }

  return { out, low };
}, [inventory, menuItems]);


  const handleStartOrder = (tableNumber) => {
    setTable(tableNumber);
    setCart([]);
    setPaymentMethod(null);
    setOrderStatus(null);
    setView("menu");
  };

  const addToCartWithNote = (item, note) => {
  // إذا المنتج نفذت كميته لا نضيفه
 if (computedOutOfStock[item?.id]) return;


  const cleanNote = (note || "").trim();
  const key = `${item.id}__${cleanNote}`; // نفس المنتج + نفس الملاحظة = نفس السطر

  const exist = cart.find((c) => c._key === key);
  if (exist) {
    setCart(
      cart.map((c) =>
        c._key === key ? { ...c, quantity: (c.quantity || 1) + 1 } : c
      )
    );
  } else {
    setCart([
      ...cart,
      {
        ...item,
        quantity: 1,
        note: cleanNote, // <-- المهم
        _key: key,       // <-- مفتاح داخلي
      },
    ]);
  }
};


  /* =========================
     Admin actions
     ========================= */
 const markOrder = async (orderId, status) => {
  try {
    const orderRef = doc(db, "artifacts", appId, "public", "data", "orders", orderId);

    // لو مو "prepared" فقط غيّر الحالة بدون خصم
    if (status !== "prepared") {
      await updateDoc(orderRef, {
        status,
        closedAt: Date.now(),
        closedBy: adminSession?.username || "unknown",
      });
      return;
    }

    // ✅ prepared: خصم المخزون + تحديث الطلب داخل Transaction
    await runTransaction(db, async (tx) => {
      const orderSnap = await tx.get(orderRef);
      if (!orderSnap.exists()) throw new Error("Order not found");

      const order = orderSnap.data() || {};

      // ✅ منع الخصم مرتين
      if (order.inventoryDeducted) {
        // فقط حدّث الحالة إن احتجت
        tx.update(orderRef, {
          status: "prepared",
          closedAt: Date.now(),
          closedBy: adminSession?.username || "unknown",
        });
        return;
      }

      const items = Array.isArray(order.items) ? order.items : [];
      if (items.length === 0) {
        tx.update(orderRef, {
          status: "prepared",
          closedAt: Date.now(),
          closedBy: adminSession?.username || "unknown",
          inventoryDeducted: true,
          inventoryDeductedAt: Date.now(),
        });
        return;
      }

      // 1) نجمع الخصم المطلوب لكل ingredient (invId) عبر كل عناصر الطلب
      //    deductionMap: invId -> totalToDeduct
      const deductionMap = new Map();

      for (const it of items) {
        const itemId = it.id;
        const qtyOrdered = Number(it.quantity || 1);

        // نجيب المنيو من الذاكرة (menuItems)
        const m = menuItems.find((x) => x.id === itemId);
        const recipe = Array.isArray(m?.recipe) ? m.recipe : [];

        
        for (const ing of recipe) {
          const invId = ing.invId;
          const invObj = inventory.find((x) => x.id === invId);
if (invObj?.unit === "none") continue;


          const needForOne = Number(ing.amountPerOne || 0);
          if (!invId || needForOne <= 0) continue;

          const totalNeed = needForOne * qtyOrdered;
          // بدل Map عادي نخليه يحمل تفاصيل كمان
// deductionMap: invId -> { totalNeed, reasons: [{ itemName, itemId, qtyOrdered, needForOne }] }
if (!deductionMap.has(invId)) {
  deductionMap.set(invId, { totalNeed: 0, reasons: [] });
}

const rec = deductionMap.get(invId);
rec.totalNeed += totalNeed;
rec.reasons.push({
  itemId,
  itemName: m?.nameAr || m?.nameEn || m?.nameTr || itemId,
  qtyOrdered,
  needForOne,
});
deductionMap.set(invId, rec);

        }
      }

      // 2) نتأكد أن المخزون يكفي قبل الخصم (عشان ما يصير سالب)
      //    ثم نكتب الخصم
     // 2) ✅ لازم نقرأ كل المخزون أولاً (بدون أي كتابة)
const invReads = [];
for (const [invId, info] of deductionMap.entries()) {
  const totalNeed = info.totalNeed;
  const reason = info.reasons?.[0];

  const invRef = doc(db, "artifacts", appId, "public", "data", "inventory", invId);
  invReads.push({ invId, invRef, totalNeed });
}

// اقرأهم كلهم
const snaps = await Promise.all(invReads.map((x) => tx.get(x.invRef)));

// ✅ تحقق + جهّز القيم الجديدة بدون كتابة
const newQtyMap = new Map(); // invId -> {invRef, newQty}

for (let i = 0; i < invReads.length; i++) {
  const { invId, totalNeed, invRef } = invReads[i];
  const invSnap = snaps[i];

  const currentQtyRaw = invSnap.exists() ? invSnap.data()?.quantity : 0;
  const currentQty = Number(currentQtyRaw);
  const totalNeedNum = Number(totalNeed || 0);

  if (!Number.isFinite(currentQty)) {
    throw new Error(`Inventory quantity is not a number for: ${invId} (value=${currentQtyRaw})`);
  }

  if (!Number.isFinite(totalNeedNum)) {
    throw new Error(`Recipe amount is not a number for: ${invId} (need=${totalNeed})`);
  }

  const newQty = currentQty - totalNeedNum;

  if (newQty < 0) {
  throw new Error(
  `تعذر التحضير: مكوّن (${invId}) غير كافٍ. (المتوفر=${currentQty}, المطلوب=${totalNeedNum})`
);



  }

  newQtyMap.set(invId, { invRef, newQty });
}

// ✅ الآن بعد انتهاء كل القراءات: نبدأ الكتابة
for (const [, data] of newQtyMap.entries()) {
  tx.set(
    data.invRef,
    { quantity: data.newQty, updatedAt: Date.now() },
    { merge: true }
  );
}


      // 3) بعد ما خصمنا المخزون، نحدّث الطلب
      tx.update(orderRef, {
        status: "prepared",
        closedAt: Date.now(),
        closedBy: adminSession?.username || "unknown",
        inventoryDeducted: true,
        inventoryDeductedAt: Date.now(),
      });
    });

  } catch (e) {
  console.error(e);
  alert("تعذر التحضير: " + (e?.message || "خطأ غير معروف"));
}

};



// ✅ تطبيق خصم الكاش تلقائيًا عند اختيار طريقة الدفع
useEffect(() => {
  // لو مختار VIP -> خله هو الخصم
  if (selectedVip) {
    setOrderDiscount(Number(selectedVip.discountPercent || 0));
    return;
  }

  // لو ما فيه VIP -> خصم الكاش فقط
  if (orderPay === "cash") {
    setOrderDiscount(Number(cashDiscountPercent || 0));
  } else {
    setOrderDiscount(0);
  }
}, [orderPay, cashDiscountPercent, selectedVip]);



// ===== Admin create order helpers =====
const addAdminOrderItem = (menuItem) => {
  setOrderItems((prev) => {
    const exist = prev.find((x) => x.id === menuItem.id);
    if (exist) {
      return prev.map((x) =>
        x.id === menuItem.id
          ? { ...x, quantity: x.quantity + 1 }
          : x
      );
    }
    return [...prev, { id: menuItem.id, quantity: 1, note: "" }];
  });
};

const changeAdminOrderQty = (id, delta) => {
  setOrderItems((prev) =>
    prev.map((x) =>
      x.id === id
        ? { ...x, quantity: Math.max(1, x.quantity + delta) }
        : x
    )
  );
};

const removeAdminOrderItem = (id) => {
  setOrderItems((prev) => prev.filter((x) => x.id !== id));
};

// ✅ VIP helpers (لازم تكون خارج submitAdminOrder)
const addVipCustomer = async () => {
  setVipError("");

  const name = String(vipName || "").trim();
  const disc = Math.min(100, Math.max(0, Number(vipDiscount || 0)));

  if (!name) {
    setVipError("اكتب اسم العميل");
    return;
  }

  const id = `${name}_${Date.now()}`.replace(/\s+/g, "_");

  await setDoc(doc(db, ...vipCustomersColPath, id), {
    name,
    discountPercent: disc,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  setVipName("");
  setVipDiscount(0);
  setVipOpen(false);
};

const updateVipCustomer = async () => {
  setVipError("");

  if (!vipEdit?.id) return;

  const name = String(vipName || "").trim();
  const disc = Math.min(100, Math.max(0, Number(vipDiscount || 0)));

  if (!name) {
    setVipError("اكتب اسم العميل");
    return;
  }

  await updateDoc(doc(db, ...vipCustomersColPath, vipEdit.id), {
    name,
    discountPercent: disc,
    updatedAt: Date.now(),
  });

  setVipEdit(null);
  setVipName("");
  setVipDiscount(0);
};

const deleteVipCustomer = async (vip) => {
  const ok = confirm(`حذف العميل: ${vip.name} ؟`);
  if (!ok) return;

  await deleteDoc(doc(db, ...vipCustomersColPath, vip.id));

  if (selectedVip?.id === vip.id) {
    clearVipForOrder();
  }
};


const chooseVipForOrder = (vip) => {
  setSelectedVip(vip);
  setOrderTable(vip.name);
  setOrderDiscount(Number(vip.discountPercent || 0));
  setVipPickerOpen(false);
};

const clearVipForOrder = () => {
  setSelectedVip(null);
  setOrderTable("");
  setOrderDiscount(0);
};


useEffect(() => {
  if (!invLinkOpen || !invLinkTarget) return;

  const rows = [];
  for (const m of menuItems) {
    const recipe = Array.isArray(m.recipe) ? m.recipe : [];
    const found = recipe.find((r) => r.invId === invLinkTarget.id);
    if (found) rows.push({ menuId: m.id, amountPerOne: Number(found.amountPerOne || 0) });
  }
  setInvLinkRows(rows);
}, [invLinkOpen, invLinkTarget, menuItems]);

const saveInvLinksToMenu = async () => {
  if (!invLinkTarget) return;

  if (invLinkTarget.unit === "none") {
    alert("هذا العنصر (بدون كمية محددة) لا يحتاج ربط للوصفات.");
    return;
  }

  const updates = [];

  // (1) إضافة/تحديث الربط للأصناف المختارة
  for (const row of invLinkRows) {
    const menuId = row.menuId;
    const amt = Number(row.amountPerOne || 0);
    if (!menuId || amt <= 0) continue;

    const m = menuItems.find((x) => x.id === menuId);
    if (!m) continue;

    const recipe = Array.isArray(m.recipe) ? [...m.recipe] : [];
    const idx = recipe.findIndex((r) => r.invId === invLinkTarget.id);

  // هنا نخلي الإدخال بنفس وحدة المخزون مباشرة
// بما أن مخزونك الآن g/ml/piece فـ amountPerOne لازم يكون بنفسها
const normalizedAmt = normalizeRecipeAmount(
  invLinkTarget.unit,         // g/ml/piece
  invLinkTarget.unit,         // نفس الوحدة (أو لو بتدعم kg/L لاحقًا)
  amt
);

const nextIng = { invId: invLinkTarget.id, amountPerOne: normalizedAmt };

    if (idx >= 0) recipe[idx] = nextIng;
    else recipe.push(nextIng);

    updates.push(
      updateDoc(doc(db, "artifacts", appId, "public", "data", "menu", menuId), {
        recipe,
        updatedAt: Date.now(),
      })
    );
  }

  // (2) حذف الربط من الأصناف اللي كانت مرتبطة سابقاً وتم إلغاء تحديدها
  const selectedSet = new Set(invLinkRows.map((r) => r.menuId));
  for (const m of menuItems) {
    const recipe = Array.isArray(m.recipe) ? [...m.recipe] : [];
    const had = recipe.some((r) => r.invId === invLinkTarget.id);
    if (!had) continue;

    if (!selectedSet.has(m.id)) {
      const next = recipe.filter((r) => r.invId !== invLinkTarget.id);
      updates.push(
        updateDoc(doc(db, "artifacts", appId, "public", "data", "menu", m.id), {
          recipe: next,
          updatedAt: Date.now(),
        })
      );
    }
  }

  await Promise.all(updates);

  setInvLinkOpen(false);
  setInvLinkTarget(null);
  setInvLinkRows([]);
};


const submitAdminOrder = async () => {
  try {
    setCreateOrderError("");

    if (!String(orderTable).trim()) {
      setCreateOrderError("اكتب اسم المستلم");
      return;
    }
    if (!orderItems || orderItems.length === 0) {
      setCreateOrderError("اختر منتجات");
      return;
    }

    // جهز العناصر بشكل صحيح (يربط id بالمنيو للحصول على الاسم + السعر)
    const items = (orderItems || [])
      .map((it) => {
        const m = menuItems.find((x) => x.id === it.id) || {};
        const qty = Number(it.quantity || 1);

        return {
          id: it.id,
          quantity: qty,
          note: it.note || "",
          price: Number(m.price || it.price || 0),

          // نخزن أسماء المنتج بكل اللغات عشان تظهر في الفاتورة والطلبات
          nameAr: m.nameAr || it.nameAr || "",
          nameEn: m.nameEn || it.nameEn || "",
          nameTr: m.nameTr || it.nameTr || "",

          _key: `${it.id}__${it.note || ""}`,
        };
      })
      .filter((x) => x.id);

    const subtotal = items.reduce(
      (s, it) => s + Number(it.price || 0) * Number(it.quantity || 1),
      0
    );

    const discountPercent = Math.min(100, Math.max(0, Number(orderDiscount || 0)));
    const discountAmount = (subtotal * discountPercent) / 100;
    const total = Math.max(0, subtotal - discountAmount);

    await addDoc(collection(db, "artifacts", appId, "public", "data", "orders"), {
      table: orderTable,
      items,
      subtotal,
      discountPercent,
      discountAmount,
      total,
      paymentMethod: orderPay,
      status: "new",
      timestamp: Date.now(),
    });

    // reset
    setCreateOrderOpen(false);
    setOrderTable("");
    setOrderPay("cash");
    setOrderItems([]);
    setCreateOrderError("");
    setSelectedVip(null);
    setOrderDiscount(0);
  } catch (e) {
    console.error(e);
    setCreateOrderError("فشل حفظ الطلب");
  }
};


  // ✅ جهز العناصر بصيغة الفاتورة + الملاحظات
  



const printInvoice = (order) => {
  const shopName = "Wingi";

  const paymentLabel =
  order.paymentMethod === "cash"
    ? "Cash"
    : order.paymentMethod === "card"
    ? "Card"
    : "Transfer (IBAN)";


  const itemsHtml = (order.items || [])
    .map(
      (it) => `
      <tr>
        <td>${it.quantity}x ${it.nameAr || it.name}</td>
        <td style="text-align:right;">
          ${(it.price * it.quantity).toFixed(2)} TL
        </td>
      </tr>
      ${
        it.note
          ? `<tr><td colspan="2">📝 ${it.note}</td></tr>`
          : ""
      }
    `
    )
    .join("");

  const html = `
  <html>
    <head>
      <style>
        body { font-family: Arial; width:300px }
        h2 { text-align:center }
        table { width:100% }
        hr { border:1px dashed #000 }
      </style>
    </head>
    <body>
      <h2>${shopName}</h2>
      <hr />
      <p>Table: ${order.table}</p>
      <p>Payment: ${paymentLabel}</p>
      <hr />
      <table>${itemsHtml}</table>
      <hr />
      ${order.discountPercent > 0 ? `
  <p>Subtotal: ${order.subtotal} TL</p>
  <p>Discount (${order.discountPercent}%): -${order.discountAmount} TL</p>
` : ""}

<h3>Total: ${order.total} TL</h3>


      <script>
        window.onload = function () {
          window.print();
          setTimeout(() => window.close(), 300);
        };
      </script>
    </body>
  </html>
  `;

  const w = window.open("", "_blank", "width=400,height=600");
  w.document.write(html);
  w.document.close();
};


  /* =========================
     AI Translate (Optional)
     ========================= */
  const translateWithAI = async () => {
    if (!editingItem?.nameAr) return;
    if (!apiKey) {
      alert(admT.missingApiKey);
      return;
    }
    setIsTranslating(true);
    try {
      const prompt = `Translate this menu item:
Name: ${editingItem.nameAr}
Desc: ${editingItem.descAr || ""}
Category: ${editingItem.categoryAr || ""}

Return JSON only:
{
  "nameEn": "...",
  "nameTr": "...",
  "descEn": "...",
  "descTr": "...",
  "categoryEn": "...",
  "categoryTr": "..."
}`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" },
          }),
        }
      );

      const result = await res.json();
      const text = result?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      const data = JSON.parse(text);
      setEditingItem((prev) => ({ ...prev, ...data }));
    } catch (e) {
      console.error(e);
    } finally {
      setIsTranslating(false);
    }
  };

  // =========================
// Admin Auth helpers (MUST be before any route returns)
// =========================



const adminLogin = async () => {
  setAdminAuthError("");
  setIsOwner(false);

  if (!adminUsername || !adminPassword) {
    setAdminAuthError(admT.requiredFields);
    return;
  }

  try {
    const u = normalizeDigits(adminUsername).trim().toLowerCase();
    const p = normalizeDigits(adminPassword).trim();

    // اقرأ بيانات المالك
    const ref = doc(db, ...ownerDocPath);
    let snap = await getDoc(ref);

    // لو ما موجودة أنشئها افتراضي
    if (!snap.exists()) {
      await setDoc(ref, {
        ownerUsername: "admin",
        ownerPassword: "12344321",
        updatedAt: Date.now(),
      });
      snap = await getDoc(ref);
    }

    const owner = snap.data() || {};
    const ownerU = normalizeDigits(owner.ownerUsername || "admin").trim().toLowerCase();
    const ownerP = normalizeDigits(owner.ownerPassword || "12344321").trim();

    // ✅ Owner login
    if (u === ownerU) {
      if (p !== ownerP) {
        setAdminAuthError(admT.invalidCredentials);
        return;
      }

      const session = { username: ownerU, role: "owner" };
      setAdminSession(session);
      setIsOwner(true);
      localStorage.setItem("wingi_admin_session", JSON.stringify(session));
      return;
    }

    // ✅ Staff login
    const staffRef = doc(db, ...adminUsersColPath, u);
    const staffSnap = await getDoc(staffRef);
    if (!staffSnap.exists()) {
      setAdminAuthError(admT.invalidCredentials);
      return;
    }

    const data = staffSnap.data();
    const staffPass = normalizeDigits(data.password || "").trim();
    if (p !== staffPass) {
      setAdminAuthError(admT.invalidCredentials);
      return;
    }

    const session = { username: u, role: "staff" };
    setAdminSession(session);
    setIsOwner(false);
    localStorage.setItem("wingi_admin_session", JSON.stringify(session));
  } catch (e) {
    console.error(e);
    setAdminAuthError("Error");
  }
};



const adminLogout = () => {
  setAdminSession(null);
  if (typeof window !== "undefined") {
    localStorage.removeItem("wingi_admin_session");
  }
};

const upsertAdminUser = async () => {
  if (adminSession?.role !== "owner") return;
  if (!accUsername || !accPassword) return;

  // امنع إنشاء حساب باسم admin
  if (accUsername === (ownerConfig?.ownerUsername || "admin")) return;

  const ref = doc(db, ...adminUsersColPath, accUsername);

  await setDoc(
    ref,
    {
      username: accUsername,
      password: accPassword,
      createdAt: accEdit?.createdAt || Date.now(),
      updatedAt: Date.now(),
    },
    { merge: true }
  );

  setAccEdit(null);
  setAccUsername("");
  setAccPassword("");
};

const deleteAdminUser = async (u) => {
  if (adminSession?.role !== "owner") return;
  await deleteDoc(doc(db, ...adminUsersColPath, u.username));
};

const updateOwnerPassword = async () => {
  if (adminSession?.role !== "owner") return;
  if (!newOwnerPass) return;

  await updateDoc(doc(db, ...ownerDocPath), {
    ownerPassword: newOwnerPass,
    updatedAt: Date.now(),
  });

  setNewOwnerPass("");
};


const adminRegister = async () => {
  setAdminAuthError("");

  if (!adminUsername || !adminPassword || !ownerPin) {
    setAdminAuthError(admT.requiredFields);
    return;
  }

  const pin = normalizeDigits(ownerPin).trim();

  // 🔐 PIN = كلمة مرور صاحب المطعم الحالية
  const currentPin = normalizeDigits(ownerConfig?.ownerPassword || "").trim();


  if (!currentPin) {
    setAdminAuthError("Owner config not loaded");
    return;
  }

  if (pin !== currentPin) {

    setAdminAuthError(admT.ownerPinWrong);
    return;
  }

  try {
    // ممنوع إنشاء حساب باسم admin
    if (adminUsername === (ownerConfig?.ownerUsername || "admin")) {
      setAdminAuthError("This username is reserved");
      return;
    }

    const ref = doc(db, ...adminUsersColPath, adminUsername);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      setAdminAuthError(admT.usernameTaken);
      return;
    }

    await setDoc(ref, {
      username: adminUsername,
      password: adminPassword,
      createdAt: Date.now(),
    });

    const session = { username: adminUsername, role: "staff" };
    setAdminSession(session);
    localStorage.setItem("wingi_admin_session", JSON.stringify(session));
  } catch (e) {
    console.error(e);
    setAdminAuthError("Error");
  }
};

const getPayLabel = (pm) => {
  if (pm === "cash") return "كاش";
  if (pm === "card") return "بطاقة";
  if (pm === "iban") return "تحويل IBAN";
  return pm || "-";
};


  /* ==========================================================
     1) ADMIN ROUTE: /admin  -> يظهر Portal + Admin
     ========================================================== */
  if (isAdminRoute && appMode === "portal") {
    return (
      <LuxuryShell dir={adminLang === "ar" ? "rtl" : "ltr"} tone="dark">
        <div className="min-h-screen flex flex-col items-center justify-center p-8">
          <div className="relative mb-10">
            <div className="absolute -inset-10 bg-orange-600/20 blur-3xl rounded-full animate-pulse" />
            <div className="relative w-24 h-24 rounded-[2.5rem] bg-white/10 border border-white/10 backdrop-blur-md flex items-center justify-center">
              <Utensils className="text-orange-500" size={42} />
            </div>
          </div>

          <h1 className="text-5xl font-black tracking-tighter mb-4">
            {admT.brand}
          </h1>
          <p className="text-white/50 font-bold mb-12">{admT.portalHint}</p>

          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => setAppMode("admin")}
              className="group rounded-[3rem] p-10 bg-white/10 border border-white/10 backdrop-blur-md hover:bg-white/15 transition-all text-center"
            >
              <LayoutDashboard className="mx-auto mb-6 text-blue-400 group-hover:scale-110 transition-transform" size={44} />
              <div className="text-2xl font-black">{admT.admin}</div>
            </button>

            <button
              onClick={() => {
                // Admin ممكن يفتح العميل للاختبار من نفس الرابط
                setAppMode("customer");
                setView("selection");
              }}
              className="group rounded-[3rem] p-10 bg-orange-600 hover:bg-orange-500 transition-all text-center shadow-2xl shadow-orange-900/30"
            >
              <User className="mx-auto mb-6 text-white group-hover:scale-110 transition-transform" size={44} />
              <div className="text-2xl font-black text-white">{admT.customer}</div>
            </button>
          </div>

          {/* Admin language switch */}
          <div className="mt-10 flex bg-white/10 border border-white/10 backdrop-blur-md p-1 rounded-2xl gap-1">
            {["ar", "tr", "en"].map((l) => (
              <button
                key={l}
                onClick={() => setAdminLang(l)}
                className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase transition-all ${
                  adminLang === l ? "bg-white text-slate-950" : "text-white/60"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </LuxuryShell>
    );
  }

  /* ==========================================================
     2) ADMIN UI
     ========================================================== */



  if (isAdminRoute && appMode === "admin") {

  if (!adminSession) {
    return (
      <LuxuryShell dir={adminLang === "ar" ? "rtl" : "ltr"} tone="dark">
        <div className="min-h-screen flex items-center justify-center p-6">
          <GlassCard className="w-full max-w-lg p-8" tone="dark">
            <h2 className="text-3xl font-black mb-2 text-white">
              {adminAuthMode === "login" ? admT.adminLogin : admT.adminRegister}
            </h2>

            <div className="space-y-3 mt-6">
              <input
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                placeholder={admT.username}
                className="w-full p-4 rounded-2xl bg-white/10 border border-white/10 text-white outline-none"
              />

              <input
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder={admT.password}
                type="password"
                className="w-full p-4 rounded-2xl bg-white/10 border border-white/10 text-white outline-none"
              />


              {adminAuthMode === "register" && (
                <input
                  value={ownerPin}
                  onChange={(e) => setOwnerPin(e.target.value)}
                  placeholder={admT.ownerPin}
                  type="password"
                  className="w-full p-4 rounded-2xl bg-white/10 border border-white/10 text-white outline-none"
                />
              )}

              {adminAuthError && (
                <div className="bg-red-500/20 border border-red-500/30 text-red-100 p-3 rounded-2xl text-sm font-bold">
                  {adminAuthError}
                </div>
              )}

              <button
                onClick={adminAuthMode === "login" ? adminLogin : adminRegister}
                className="w-full py-4 rounded-2xl font-black bg-orange-600 hover:bg-orange-500 transition-all text-white"
              >
                {adminAuthMode === "login" ? admT.login : admT.createAccount}
              </button>



              <button
                onClick={() => {
                  setAdminAuthError("");
                  setAdminAuthMode(adminAuthMode === "login" ? "register" : "login");
                }}
                className="w-full py-4 rounded-2xl font-black bg-white/10 hover:bg-white/15 transition-all text-white"
              >
                {adminAuthMode === "login" ? admT.adminRegister : admT.adminLogin}
              </button>
            </div>
          </GlassCard>
        </div>
      </LuxuryShell>
    );
  }

  // ✅ إذا الأدمن داخل: كمل لوحة الأدمن عندك (نفس كودك الحالي)
  return (
  <div
    className="min-h-screen bg-slate-50 font-sans"
    dir={adminLang === "ar" ? "rtl" : "ltr"}
  >
    <header className="bg-white border-b px-8 py-5 sticky top-0 z-50">
  <div className="flex flex-wrap items-center gap-3 justify-between">
    {/* يسار: عنوان/شعار بسيط (اختياري) */}
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-2xl bg-slate-950 text-white flex items-center justify-center font-black">
        W
      </div>
      <div className="font-black text-slate-900">Admin</div>
    </div>

    {/* يمين: كل الأزرار */}
    <div className="flex flex-wrap items-center gap-3">
      {/* Admin language */}
      <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
        {["ar", "tr", "en"].map((l) => (
          <button
            key={l}
            onClick={() => setAdminLang(l)}
            className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${
              adminLang === l ? "bg-white shadow-sm text-slate-950" : "text-slate-400"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      <button
        onClick={() => setAppMode("portal")}
        className="bg-slate-100 text-slate-600 px-5 py-2 rounded-xl font-black hover:bg-slate-200 transition-all"
      >
        {admT.goPortal}
      </button>

      {adminSession?.role === "owner" && (
        <button
          onClick={() => setAccountsOpen(true)}
          className="bg-slate-950 text-white px-5 py-2 rounded-xl font-black hover:bg-black transition-all"
        >
          Manage Accounts
        </button>
      )}

      <button
        onClick={() => setCreateOrderOpen(true)}
        className="bg-orange-600 text-white px-5 py-2 rounded-xl font-black hover:bg-orange-500 transition-all"
      >
        + إضافة طلب جديد
      </button>

      <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl">
  <span className="text-sm font-black text-slate-700">
    خصم الكاش %
  </span>
  <input
    type="number"
    min="0"
    max="100"
    value={cashDiscountPercent}
    onChange={(e) =>
      setCashDiscountPercent(Number(e.target.value || 0))
    }
    className="w-20 p-2 rounded-lg border text-center font-black"
  />
</div>


      {/* زر العميل الدائم */}
      <button
        onClick={() => setVipOpen(true)}
        className="bg-emerald-600 text-white px-5 py-2 rounded-xl font-black hover:bg-emerald-500 transition-all"
      >
        + إضافة عميل دائم
      </button>

      <button
        onClick={adminLogout}
        className="bg-slate-100 text-slate-600 px-5 py-2 rounded-xl font-black hover:bg-slate-200 transition-all"
      >
        {admT.logout} ({adminSession?.username})
      </button>
    </div>
  </div>
</header>


{(inventoryAlerts.out.length > 0 || inventoryAlerts.low.length > 0) && (
  <div className="px-6 pt-4 space-y-3">
    {inventoryAlerts.out.length > 0 && (
      <div className="p-4 rounded-2xl bg-red-50 border border-red-200">
        <div className="font-black text-red-700 mb-2">
          🚫 انتهت الكمية – لا يمكن صنع منتج
        </div>
        {inventoryAlerts.out.map((x) => (
          <div key={x.invId} className="text-sm font-bold text-red-700">
            • {x.name} — المتوفر: {x.qty} — يحتاج: {x.needForOne}
          </div>
        ))}
      </div>
    )}

    {inventoryAlerts.low.length > 0 && (
      <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200">
        <div className="font-black text-orange-700 mb-2">
          ⚠️ المخزون اقترب من الانتهاء (20%)
        </div>
        {inventoryAlerts.low.map((x) => (
          <div key={x.invId} className="text-sm font-bold text-orange-700">
            • {x.name} — المتبقي: {x.qty} من {x.base}
          </div>
        ))}
      </div>
    )}
  </div>
)}



   <main className="p-6 max-w-[1900px] mx-auto w-full">
  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

    {/* ===== SIDEBAR ===== */}
    <aside className="xl:col-span-3">
      <div className="bg-white rounded-[2rem] border p-4 sticky top-[92px]">
        <div className="text-sm font-black text-slate-500 mb-3">
          Navigation
        </div>

        <button
          onClick={() => setAdminPage("menu")}
          className={`w-full px-4 py-3 rounded-2xl font-black text-right ${
            adminPage === "menu"
              ? "bg-slate-950 text-white"
              : "bg-slate-50 text-slate-700"
          }`}
        >
          🍽️ قائمة الطعام
        </button>

        <button
          onClick={() => setAdminPage("orders")}
          className={`w-full mt-3 px-4 py-3 rounded-2xl font-black text-right ${
            adminPage === "orders"
              ? "bg-slate-950 text-white"
              : "bg-slate-50 text-slate-700"
          }`}
        >
          🧾 الطلبات
        </button>

        <button
          onClick={() => setAdminPage("inventory")}
          className={`w-full mt-3 px-4 py-3 rounded-2xl font-black text-right ${
            adminPage === "inventory"
              ? "bg-slate-950 text-white"
              : "bg-slate-50 text-slate-700"
          }`}
        >
          🧺 المخزون
        </button>
      </div>
    </aside>

    {/* ===== CONTENT ===== */}
    <section className="xl:col-span-9 space-y-6">

      {/* ============ MENU ============ */}
      {adminPage === "menu" && (
        <div className="space-y-6">
          <h2 className="text-xl font-black">قائمة الطعام</h2>

          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-bold text-slate-500">
              عدد المنتجات: {menuItems.length}
            </div>

            <button
              onClick={() =>
                setEditingItem({
                  nameAr: "",
                  nameEn: "",
                  nameTr: "",
                  descAr: "",
                  descEn: "",
                  descTr: "",
                  categoryAr: "",
                  categoryEn: "",
                  categoryTr: "",
                  price: 0,
                  image: "",
                  outOfStock: false,
                  isOffer: false,
                  oldPrice: 0,
                })
              }
              className="bg-orange-600 text-white px-5 py-3 rounded-2xl font-black hover:bg-orange-500 transition-all"
            >
              + {admT.addProduct}
            </button>
          </div>

          {/* عرض المنتجات الحالية */}
          {menuItems.length === 0 ? (
            <div className="p-4 rounded-2xl bg-slate-50 text-slate-500 font-bold">
              لا يوجد منتجات في المنيو
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {menuItems.map((m) => (
                <div
                  key={m.id}
                  className="bg-white border rounded-2xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {m.image ? (
                      <img
                        src={m.image}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover bg-slate-100"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-100" />
                    )}

                    <div>
                      <div className="font-black text-slate-900">
                        {getLocalizedValue(m, "name", adminLang)}
                      </div>
                      <div className="text-xs text-slate-500 font-bold">
                        {Number(m.price || 0)} TL
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingItem(m)}
                      className="px-4 py-2 rounded-xl bg-slate-950 text-white font-black"
                    >
                      تعديل
                    </button>

                    {/* ✅ حذف منتج: فقط احذف المنتج من menu (بدون invId) */}
                    <button
                      onClick={async () => {
                        const ok = confirm("حذف المنتج؟");
                        if (!ok) return;

                        await deleteDoc(
                          doc(db, "artifacts", appId, "public", "data", "menu", m.id)
                        );
                      }}
                      className="px-4 py-2 rounded-xl bg-red-100 text-red-700 font-black"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============ ORDERS ============ */}
      {adminPage === "orders" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black">الطلبات</h2>

            <div className="flex gap-2">
              <button
                onClick={() => setOrdersTab("active")}
                className={`px-4 py-2 rounded-xl font-black ${
                  ordersTab === "active"
                    ? "bg-orange-600 text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                الطلبات النشطة
              </button>

              <button
                onClick={() => setOrdersTab("old")}
                className={`px-4 py-2 rounded-xl font-black ${
                  ordersTab === "old"
                    ? "bg-orange-600 text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                الطلبات القديمة
              </button>
            </div>
          </div>

          {(ordersTab === "active" ? activeOrders : oldOrders).length === 0 ? (
            <div className="p-5 rounded-2xl bg-white border font-bold text-slate-500">
              لا يوجد طلبات هنا
            </div>
          ) : (
            <>
              {/* فلتر الطلبات القديمة */}
              {/* فلتر الطلبات القديمة – يجب أن يكون دائماً ظاهر */}
{ordersTab === "old" && (
  <div className="bg-white border rounded-2xl p-4">
    <div className="font-black mb-3">فلترة الطلبات حسب التاريخ</div>

    <div className="flex flex-wrap gap-3 items-end">
      <div>
        <div className="text-xs font-bold text-slate-500">من تاريخ</div>
        <input
          type="date"
          value={oldFrom}
          onChange={(e) => setOldFrom(e.target.value)}
          className="border rounded-xl px-3 py-2"
        />
      </div>

      <div>
        <div className="text-xs font-bold text-slate-500">إلى تاريخ</div>
        <input
          type="date"
          value={oldTo}
          onChange={(e) => setOldTo(e.target.value)}
          className="border rounded-xl px-3 py-2"
        />
      </div>

      <button
        type="button"
        onClick={() => setApplyOldFilter(true)}
        className="bg-orange-600 text-white px-5 py-3 rounded-2xl font-black"
      >
        بحث
      </button>

      <button
        type="button"
        onClick={() => {
          setOldFrom("");
          setOldTo("");
          setApplyOldFilter(false);
        }}
        className="bg-slate-200 px-5 py-3 rounded-2xl font-black"
      >
        إلغاء
      </button>
    </div>
  </div>
)}


              <div className="space-y-3">
                {(ordersTab === "active" ? activeOrders : oldOrders).map((o) => (
                  <div key={o.id} className="bg-white border rounded-2xl p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-black text-slate-900">
                          {o.table ? `المستلم/الطاولة: ${o.table}` : "طلب"}
                        </div>
                        <div className="text-xs font-bold text-slate-500 mt-1">
                          {o.timestamp ? new Date(o.timestamp).toLocaleString() : ""}
                        </div>

                        
{/* ✅ حالة الطلب + من قام به */}
{o.status !== "new" && (
  <div className="mt-2 flex flex-wrap gap-2">
    <span
      className={`px-3 py-1 rounded-full text-[11px] font-black ${
        o.status === "prepared"
          ? "bg-emerald-100 text-emerald-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      {o.status === "prepared" ? "✅ تم التحضير" : "⛔ تم الإلغاء"}
    </span>

    {o.closedBy && (
      <span className="px-3 py-1 rounded-full text-[11px] font-black bg-slate-100 text-slate-700">
        👤 تم بواسطة: {o.closedBy}
      </span>
    )}

    {o.closedAt && (
      <span className="px-3 py-1 rounded-full text-[11px] font-black bg-slate-100 text-slate-700">
        🕒 وقت الإغلاق: {new Date(o.closedAt).toLocaleString()}
      </span>
    )}
  </div>
)}

                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="px-3 py-1 rounded-full text-[11px] font-black bg-slate-100 text-slate-700">
                            💳 الدفع: {getPayLabel(o.paymentMethod)}
                          </span>

                          {Number(o.discountPercent || 0) > 0 && (
                            <span className="px-3 py-1 rounded-full text-[11px] font-black bg-orange-100 text-orange-700">
                              🔻 خصم: {Number(o.discountPercent || 0)}%
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="font-black text-slate-900 text-right">
                        {Number(o.discountPercent || 0) > 0 ? (
                          <div className="space-y-1">
                            <div className="text-sm text-slate-500 font-black">
                              قبل الخصم: {Number(o.subtotal || 0).toFixed(2)} TL
                            </div>
                            <div className="text-sm text-orange-600 font-black">
                              خصم ({Number(o.discountPercent || 0)}%): -
                              {Number(o.discountAmount || 0).toFixed(2)} TL
                            </div>
                            <div className="text-lg text-slate-900 font-black">
                              بعد الخصم: {Number(o.total || 0).toFixed(2)} TL
                            </div>
                          </div>
                        ) : (
                          <div className="text-lg text-slate-900 font-black">
                            الإجمالي: {Number(o.total || 0).toFixed(2)} TL
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 space-y-1">
                      {(o.items || []).map((it, idx) => (
                        <div key={idx} className="text-sm font-bold text-slate-700">
                          • {it.quantity}x {(it.nameAr || it.nameEn || it.nameTr || it.id)}
                          {it.note ? (
                            <span className="text-slate-500"> — 📝 {it.note}</span>
                          ) : null}
                        </div>
                      ))}
                    </div>

                    {/* زر حذف الطلب (فقط في الطلبات القديمة) */}
                    {ordersTab === "old" && (
                      <button
                        onClick={() => deleteOrderPermanently(o.id)}
                        className="mt-3 bg-red-600 text-white px-4 py-2 rounded-2xl font-black hover:bg-red-500"
                      >
                        حذف الطلب
                      </button>
                    )}

                    {/* أزرار الإدارة للطلبات النشطة فقط */}
                    {o.status === "new" && (
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => markOrder(o.id, "prepared")}
                          className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-black"
                        >
                          تم التحضير
                        </button>

                        <button
                          onClick={() => markOrder(o.id, "cancelled")}
                          className="px-4 py-2 rounded-xl bg-red-600 text-white font-black"
                        >
                          إلغاء
                        </button>

                        <button
                          onClick={() => printInvoice(o)}
                          className="px-4 py-2 rounded-xl bg-slate-950 text-white font-black"
                        >
                          طباعة فاتورة
                        </button>
                      </div>
                    )}

                    {o.receiptDataUrl && (
                      <button
                        onClick={() => {
                          setReceiptView(o.receiptDataUrl);
                          setReceiptOpen(true);
                        }}
                        className="mt-3 px-4 py-2 rounded-xl bg-blue-600 text-white font-black"
                      >
                        عرض الإيصال
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ============ INVENTORY ============ */}
      {adminPage === "inventory" && (
        <div className="space-y-6">
          <h2 className="text-xl font-black">المخزون</h2>

          {/* نموذج الإضافة */}
          <div className="bg-white p-4 rounded-2xl border space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <input
                value={invNewName}
                onChange={(e) => setInvNewName(e.target.value)}
                placeholder="اسم المادة"
                className="p-3 rounded-xl border"
              />

              <input
                type="number"
                value={invNewCost}
                onChange={(e) => setInvNewCost(e.target.value)}
                className="p-3 rounded-xl border"
                placeholder="سعر الشراء"
              />

              <input
                type="number"
                value={invNewSell}
                onChange={(e) => setInvNewSell(e.target.value)}
                className="p-3 rounded-xl border"
                placeholder="سعر البيع"
              />

              <select
                value={invNewUnit}
                onChange={(e) => setInvNewUnit(e.target.value)}
                className="p-3 rounded-xl border font-black"
              >
                <option value="g">جرام (g)</option>
                <option value="ml">مل (ml)</option>
                <option value="piece">قطعة</option>
                <option value="none">بدون كمية</option>
              </select>

              <input
                type="number"
                value={invNewQty}
                onChange={(e) => setInvNewQty(e.target.value)}
                className="p-3 rounded-xl border"
                placeholder="الكمية"
              />
            </div>

            <button
              onClick={() => setInvNewLinksOpen(true)}
              className="px-4 py-3 rounded-xl bg-slate-950 text-white font-black"
            >
              + ربط منتجات من المنيو
            </button>

            <button
              onClick={handleAddInventory}
              className="w-full py-3 rounded-xl bg-orange-600 text-white font-black"
            >
              + إضافة للمخزون
            </button>

            {invNewError && (
              <div className="text-sm font-black text-red-600">
                {invNewError}
              </div>
            )}
          </div>

          {/* قائمة المخزون */}
          <div className="bg-white p-4 rounded-2xl border">
            {inventory.length === 0 ? (
              <div className="p-4 rounded-2xl bg-slate-50 text-slate-500 font-bold">
                لا يوجد عناصر مخزون
              </div>
            ) : (
              <div className="space-y-2">
                {inventory.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-4 rounded-2xl border flex justify-between items-center"
                  >
                    <button
                      onClick={() => openEditInventory(inv)}
                      className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-black"
                    >
                      تعديل
                    </button>

                    <div>
                      <div className="font-black">{inv.name}</div>
                      <div className="text-xs text-slate-500 font-bold">
                        الكمية: {inv.quantity} {inv.unit}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setInvLinkTarget(inv);
                          setInvLinkOpen(true);
                        }}
                        className="px-4 py-2 rounded-xl bg-slate-950 text-white font-black"
                      >
                        ربط
                      </button>

                      <button
                        onClick={() => deleteInventory(inv.id)}
                        className="px-4 py-2 rounded-xl bg-red-100 text-red-700 font-black"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  </div>
</main>






        
{receiptOpen && (
  <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="w-full max-w-3xl bg-white rounded-[2.5rem] p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-black text-slate-900">صورة الإيصال</h3>

        <button
          type="button"
          onClick={() => {
            setReceiptOpen(false);
            setReceiptView("");
          }}
          className="p-2 bg-slate-50 rounded-2xl text-slate-400"
        >
          <X size={18} />
        </button>
      </div>

      <img
        src={receiptView}
        alt="receipt"
        className="w-full max-h-[75vh] object-contain rounded-2xl border"
      />
    </div>
  </div>
)}

{vipOpen && (
  <div className="fixed inset-0 z-[260] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="w-full max-w-3xl bg-white rounded-[2.5rem] p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-black text-slate-900">العملاء الدائمون</h3>
        <button
          type="button"
          onClick={() => {
            setVipOpen(false);
            setVipEdit(null);
            setVipName("");
            setVipDiscount(0);
            setVipError("");
          }}
          className="p-2 bg-slate-50 rounded-2xl text-slate-400"
        >
          <X size={18} />
        </button>
      </div>

      {/* إضافة / تعديل */}
      <div className="bg-slate-50 p-4 rounded-2xl mb-5">
        <div className="font-black text-slate-800 mb-3">
          {vipEdit ? "تعديل عميل" : "إضافة عميل"}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            value={vipName}
            onChange={(e) => setVipName(e.target.value)}
            placeholder="اسم العميل"
            className="p-3 rounded-xl border"
          />

          <input
            type="number"
            min="0"
            max="100"
            value={vipDiscount}
            onChange={(e) => setVipDiscount(Number(e.target.value || 0))}
            placeholder="خصم %"
            className="p-3 rounded-xl border text-center font-black"
          />

          <button
            type="button"
            onClick={vipEdit ? updateVipCustomer : addVipCustomer}
            className="py-3 rounded-xl bg-emerald-600 text-white font-black hover:bg-emerald-500 transition-all"
          >
            {vipEdit ? "حفظ التعديل" : "إضافة"}
          </button>
        </div>

        {vipEdit && (
          <button
            type="button"
            onClick={() => {
              setVipEdit(null);
              setVipName("");
              setVipDiscount(0);
              setVipError("");
            }}
            className="mt-3 px-4 py-2 rounded-xl bg-white border font-black text-slate-700"
          >
            إلغاء التعديل
          </button>
        )}

        {vipError && (
          <div className="mt-3 p-3 rounded-xl bg-red-100 text-red-700 font-bold">
            {vipError}
          </div>
        )}
      </div>

      {/* قائمة العملاء */}
      <div className="space-y-2 max-h-[55vh] overflow-y-auto">
        {vipList.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-50 text-slate-500 font-bold">
            لا يوجد عملاء دائمين بعد
          </div>
        ) : (
          vipList.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-2xl border flex items-center justify-between"
            >
              <div>
                <div className="font-black text-slate-900">{c.name}</div>
                <div className="text-xs font-black text-orange-600">
                  خصم {Number(c.discountPercent || 0)}%
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setVipEdit(c);
                    setVipName(c.name || "");
                    setVipDiscount(Number(c.discountPercent || 0));
                    setVipError("");
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-black"
                >
                  تعديل
                </button>

                <button
                  type="button"
                  onClick={() => deleteVipCustomer(c)}
                  className="px-4 py-2 rounded-xl bg-red-100 text-red-700 font-black"
                >
                  حذف
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
)}




{invLinkOpen && invLinkTarget && (
  <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="w-full max-w-4xl bg-white rounded-[2.5rem] p-6 max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-black text-slate-900">
          ربط المخزون بالمنيو — {invLinkTarget.name}
        </h3>
        <button
          type="button"
          onClick={() => {
            setInvLinkOpen(false);
            setInvLinkTarget(null);
            setInvLinkRows([]);
          }}
          className="p-2 bg-slate-50 rounded-2xl text-slate-400"
        >
          <X size={18} />
        </button>
      </div>

      <div className="text-sm font-bold text-slate-600 mb-4">
        اختر أصناف من المنيو وحدد: كم يحتاج الصنف من هذا العنصر لكل 1.
      </div>

      <div className="space-y-2">
        {menuItems.map((m) => {
          const row = invLinkRows.find((r) => r.menuId === m.id);
          const checked = !!row;

          return (
            <div key={m.id} className="p-4 rounded-2xl border flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    const on = e.target.checked;
                    setInvLinkRows((prev) => {
                      if (on) return [...prev, { menuId: m.id, amountPerOne: 1 }];
                      return prev.filter((x) => x.menuId !== m.id);
                    });
                  }}
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-black text-slate-900">
                    {getLocalizedValue(m, "name", adminLang)}
                  </div>
                  <div className="text-xs text-slate-500 font-bold">
                    {Number(m.price || 0)} TL
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-xs font-black text-slate-600">الكمية لكل 1</div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={row?.amountPerOne ?? ""}
                  disabled={!checked}
                  onChange={(e) => {
                    const v = Number(e.target.value || 0);
                    setInvLinkRows((prev) =>
                      prev.map((x) => (x.menuId === m.id ? { ...x, amountPerOne: v } : x))
                    );
                  }}
                  className="w-28 p-2 rounded-xl border text-center font-black"
                />
                <div className="text-xs font-bold text-slate-500">
                  {invNewLinksInputUnit || "-"}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => {
            setInvLinkOpen(false);
            setInvLinkTarget(null);
            setInvLinkRows([]);
          }}
          className="px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-black"
        >
          إلغاء
        </button>

        <button
          type="button"
          onClick={saveInvLinksToMenu}
          className="px-6 py-3 rounded-xl bg-orange-600 text-white font-black"
        >
          حفظ الربط
        </button>
      </div>
    </div>
  </div>
)}


{invNewLinksOpen && (
  <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="w-full max-w-4xl bg-white rounded-[2.5rem] p-6 max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-black text-slate-900">
          ربط هذا العنصر بمنتجات المنيو
        </h3>
        <button
          type="button"
          onClick={() => setInvNewLinksOpen(false)}
          className="p-2 bg-slate-50 rounded-2xl text-slate-400"
        >
          <X size={18} />
        </button>
      </div>

      {/* اختيار وحدة الإدخال */}
      <div className="mb-4 flex items-center gap-3">
        <div className="text-sm font-black text-slate-700">وحدة الاستهلاك:</div>

        {invNewUnit === "g" && (
          <select
            value={invNewLinksInputUnit}
            onChange={(e) => setInvNewLinksInputUnit(e.target.value)}
            className="p-2 rounded-xl border font-black"
          >
            <option value="g">جرام (g)</option>
          </select>
        )}

        {invNewUnit === "ml" && (
          <select
            value={invNewLinksInputUnit}
            onChange={(e) => setInvNewLinksInputUnit(e.target.value)}
            className="p-2 rounded-xl border font-black"
          >
            <option value="ml">مل (ml)</option>
          </select>
        )}

        {invNewUnit === "piece" && (
          <div className="px-3 py-2 rounded-xl border font-black bg-slate-50">
            قطعة (pcs)
          </div>
        )}
      </div>

      <div className="space-y-2">
        {menuItems.length === 0 ? (
          <div className="p-4 rounded-2xl bg-slate-50 text-slate-500 font-bold">
            لا يوجد منتجات بالمنيو بعد
          </div>
        ) : (
          menuItems.map((m) => {
            const row = invNewLinks.find((r) => r.menuId === m.id);
            const checked = !!row;

            return (
              <div key={m.id} className="p-4 rounded-2xl border flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      const on = e.target.checked;
                      setInvNewLinks((prev) => {
                        if (on) return [...prev, { menuId: m.id, amountPerOne: 1, inputUnit: invNewLinksInputUnit }];
                        return prev.filter((x) => x.menuId !== m.id);
                      });
                    }}
                    className="w-5 h-5"
                  />
                  <div>
                    <div className="font-black text-slate-900">
                      {getLocalizedValue(m, "name", adminLang)}
                    </div>
                    <div className="text-xs text-slate-500 font-bold">
                      {Number(m.price || 0)} TL
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-xs font-black text-slate-600">الكمية لكل 1</div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={row?.amountPerOne ?? ""}
                    disabled={!checked}
                    onChange={(e) => {
                      const v = Number(e.target.value || 0);
                      setInvNewLinks((prev) =>
                        prev.map((x) =>
                          x.menuId === m.id ? { ...x, amountPerOne: v, inputUnit: invNewLinksInputUnit } : x
                        )
                      );
                    }}
                    className="w-28 p-2 rounded-xl border text-center font-black"
                  />
                  <div className="text-xs font-bold text-slate-500">
                    {invNewUnit === "kg" ? invNewLinksInputUnit : invNewUnit === "liter" ? invNewLinksInputUnit : "pcs"}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-6 flex justify-end gap-3">
  <button
    type="button"
    onClick={() => setInvNewLinksOpen(false)}
    className="px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-black"
  >
    إغلاق
  </button>

  <button
    type="button"
    onClick={() => {
      if (
        (invNewUnit === "kg" || invNewUnit === "liter") &&
        !invNewLinksInputUnit
      ) {
        alert("اختر وحدة الاستهلاك أولاً");
        return;
      }
      setInvNewLinksOpen(false);
    }}
    className="px-6 py-3 rounded-xl bg-orange-600 text-white font-black"
  >
    حفظ
  </button>
</div>

    </div>
  </div>
)}

{invEditOpen && invEditItem && (
  <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="w-full max-w-2xl bg-white rounded-[2.5rem] p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-black text-slate-900">
          تعديل المخزون — {invEditItem.name}
        </h3>
        <button
          type="button"
          onClick={() => {
            setInvEditOpen(false);
            setInvEditItem(null);
            setInvEditError("");
          }}
          className="p-2 bg-slate-50 rounded-2xl text-slate-400"
        >
          <X size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          value={invEditName}
          onChange={(e) => setInvEditName(e.target.value)}
          className="p-3 rounded-xl border"
          placeholder="اسم المادة"
        />

        <select
          value={invEditUnit}
          onChange={(e) => setInvEditUnit(e.target.value)}
          className="p-3 rounded-xl border font-black"
        >
          <option value="g">جرام (g)</option>
          <option value="ml">مل (ml)</option>
          <option value="piece">قطعة</option>
          <option value="none">بدون كمية</option>
        </select>

        <input
          type="number"
          value={invEditCost}
          onChange={(e) => setInvEditCost(e.target.value)}
          className="p-3 rounded-xl border"
          placeholder="سعر الشراء"
        />

        <input
          type="number"
          value={invEditSell}
          onChange={(e) => setInvEditSell(e.target.value)}
          className="p-3 rounded-xl border"
          placeholder="سعر البيع"
        />

        {invEditUnit !== "none" ? (
          <input
            type="number"
            value={invEditQty}
            onChange={(e) => setInvEditQty(e.target.value)}
            className="p-3 rounded-xl border md:col-span-2"
            placeholder="الكمية"
          />
        ) : (
          <div className="md:col-span-2 p-3 rounded-xl bg-slate-50 border font-bold text-slate-600">
            هذا العنصر بدون كمية (سيُعامل كمخزون غير محدود)
          </div>
        )}
      </div>

      {invEditError && (
        <div className="mt-4 p-3 rounded-xl bg-red-100 text-red-700 font-bold">
          {invEditError}
        </div>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => {
            setInvEditOpen(false);
            setInvEditItem(null);
            setInvEditError("");
          }}
          className="px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-black"
        >
          إلغاء
        </button>

        <button
          type="button"
          onClick={saveEditInventory}
          className="px-6 py-3 rounded-xl bg-orange-600 text-white font-black"
        >
          حفظ التعديل
        </button>
      </div>
    </div>
  </div>
)}


{createOrderOpen && (
  <div className="fixed inset-0 z-[250] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="w-full max-w-5xl bg-white rounded-[2.5rem] p-6 max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-black text-slate-900">إضافة طلب جديد</h3>
        <button
          onClick={() => setCreateOrderOpen(false)}
          className="p-2 bg-slate-50 rounded-2xl text-slate-400"
        >
          <X size={18} />
        </button>
      </div>

      {/* بيانات الطلب */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
       
       <input
  type="number"
  min="0"
  max="100"
  value={orderDiscount}
  onChange={(e) => setOrderDiscount(Number(e.target.value || 0))}
  placeholder="خصم %"
  className="p-3 rounded-xl border"
/>

        <input
          value={orderTable}
          onChange={(e) => setOrderTable(e.target.value)}
          placeholder= "اسم المستلم"
          className="p-3 rounded-xl border"
        />
        <select
  value={orderPay}
  onChange={(e) => setOrderPay(e.target.value)}
  className="p-3 rounded-xl border font-black"
>
  <option value="cash">كاش</option>
  <option value="card">بطاقة</option>
  <option value="iban">تحويل إلى IBAN</option>
</select>

{orderPay === "iban" && (
  <div className="mt-3 p-3 rounded-xl bg-orange-50 text-orange-700 font-bold text-sm">
    سيتم الدفع عن طريق تحويل بنكي (IBAN)
  </div>
)}

      </div>


      <div className="mb-6 flex items-center gap-3">
  <button
    type="button"
    onClick={() => setVipPickerOpen(true)}
    className="px-4 py-2 rounded-xl bg-slate-950 text-white font-black"
  >
    + اختيار عميل دائم
  </button>

  {selectedVip && (
    <div className="flex items-center gap-2">
      <span className="text-sm font-black text-slate-700">
        العميل: {selectedVip.name} — خصم {selectedVip.discountPercent}%
      </span>
      <button
        type="button"
        onClick={clearVipForOrder}
        className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 font-black"
      >
        إزالة
      </button>
    </div>
  )}
</div>


{vipPickerOpen && (
  <div className="fixed inset-0 z-[270] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="w-full max-w-lg bg-white rounded-[2.5rem] p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-black text-slate-900">اختر عميل دائم</h3>
        <button
          type="button"
          onClick={() => setVipPickerOpen(false)}
          className="p-2 bg-slate-50 rounded-2xl text-slate-400"
        >
          <X size={18} />
        </button>
      </div>

      {vipList.length === 0 ? (
        <div className="p-4 rounded-xl bg-slate-50 text-slate-500 font-bold">
          لا يوجد عملاء دائمين بعد
        </div>
      ) : (
        <div className="space-y-2 max-h-[55vh] overflow-y-auto">
          {vipList.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => chooseVipForOrder(c)}
              className="w-full p-4 rounded-2xl border flex items-center justify-between hover:bg-slate-50"
            >
              <div className="font-black text-slate-900">{c.name}</div>
              <div className="text-sm font-black text-orange-600">
                خصم {Number(c.discountPercent || 0)}%
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  </div>
)}



      {/* المنيو */}
      <div className="mb-6">
        <div className="font-black text-slate-900 mb-2">اختر المنتجات من المنيو</div>

        {menuItems.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-50 text-slate-500 font-bold">
            المنيو فاضي أو ما زال يحمل… تأكد أنك أضفت منتجات في المنيو أولاً.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {menuItems.map((m) => {
              const selected = orderItems.find((x) => x.id === m.id);
              return (
                <div
                  key={m.id}
                  className="p-4 rounded-2xl border flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {m.image ? (
                      <img
                        src={m.image}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover bg-slate-100"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-100" />
                    )}
                    <div>
                      <div className="font-black text-slate-900">
                        {getLocalizedValue(m, "name", adminLang)}
                      </div>
                      <div className="text-xs text-slate-500 font-bold">
                        {m.price} TL
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setOrderItems((prev) => {
                          const ex = prev.find((x) => x.id === m.id);
                          if (ex) {
                            return prev.map((x) =>
                              x.id === m.id ? { ...x, quantity: (x.quantity || 1) + 1 } : x
                            );
                          }
                          return [...prev, { ...m, quantity: 1 }];
                        });
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-950 text-white font-black"
                    >
                      +
                    </button>

                    <div className="w-8 text-center font-black text-slate-900">
                      {selected?.quantity || 0}
                    </div>

                    <button
                      onClick={() => {
                        setOrderItems((prev) => {
                          const ex = prev.find((x) => x.id === m.id);
                          if (!ex) return prev;
                          if ((ex.quantity || 1) <= 1) return prev.filter((x) => x.id !== m.id);
                          return prev.map((x) =>
                            x.id === m.id ? { ...x, quantity: (x.quantity || 1) - 1 } : x
                          );
                        });
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-100 text-slate-800 font-black"
                    >
                      -
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>


{/* ملخص الخصم */}
{adminDiscountPercent > 0 && (
  <div className="mt-4 p-4 rounded-xl bg-orange-50 text-orange-700 font-black space-y-1">
    <div>المجموع قبل الخصم: {adminSubtotal.toFixed(2)} TL</div>
    <div>نسبة الخصم: {adminDiscountPercent}%</div>
    <div>قيمة الخصم: {adminDiscountAmount.toFixed(2)} TL</div>
    <div className="text-slate-900">
      الإجمالي بعد الخصم: {adminTotal.toFixed(2)} TL
    </div>
  </div>
)}



      {/* خطأ */}
      {createOrderError && (
        <div className="mt-4 p-3 rounded-xl bg-red-100 text-red-700 font-bold">
          {createOrderError}
        </div>
      )}

      {/* أزرار */}
      <div className="flex justify-between items-center mt-6 gap-3">
        <button
          onClick={() => {
            setCreateOrderOpen(false);
            setOrderTable("");
setOrderPay("cash");
setOrderItems([]);
setCreateOrderError("");
          }}
          className="px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-black"
        >
          إلغاء
        </button>

        <button
  type="button"
  onClick={submitAdminOrder}
  disabled={
  !String(orderTable).trim() ||
  orderItems.length === 0
}
  className="px-6 py-3 bg-orange-600 text-white rounded-xl font-black disabled:opacity-40"
>
  حفظ الطلب
</button>

      </div>
    </div>
  </div>
)}


        {/* Edit Modal */}
        {editingItem && (
          <div className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-5xl rounded-[3.5rem] p-10 shadow-2xl overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black">{admT.addProduct}</h2>

                <button
                  onClick={translateWithAI}
                  disabled={isTranslating}
                  className="bg-purple-600 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-3 disabled:opacity-50"
                >
                  {isTranslating ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Sparkles />
                  )}{" "}
                  {isTranslating ? admT.translating : admT.aiTranslate}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-right" dir="rtl">
                <div className="space-y-4 bg-slate-50 p-6 rounded-[2.5rem]">
                  <h3 className="font-black border-b pb-2 text-orange-600">العربية</h3>
                  <input
                    value={editingItem.nameAr || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, nameAr: e.target.value })}
                    placeholder={admT.name}
                    className="w-full p-3 rounded-xl border"
                  />
                  <textarea
                    value={editingItem.descAr || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, descAr: e.target.value })}
                    placeholder={admT.desc}
                    className="w-full p-3 rounded-xl border h-24"
                  />
                  <input
                    value={editingItem.categoryAr || ""}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, categoryAr: e.target.value })
                    }
                    placeholder={admT.category}
                    className="w-full p-3 rounded-xl border"
                  />
                </div>

                <div className="space-y-4 bg-slate-50 p-6 rounded-[2.5rem]" dir="ltr">
                  <h3 className="font-black border-b pb-2 text-red-600">Turkish</h3>
                  <input
                    value={editingItem.nameTr || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, nameTr: e.target.value })}
                    placeholder="Ad"
                    className="w-full p-3 rounded-xl border"
                  />
                  <textarea
                    value={editingItem.descTr || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, descTr: e.target.value })}
                    placeholder="Açıklama"
                    className="w-full p-3 rounded-xl border h-24"
                  />
                  <input
                    value={editingItem.categoryTr || ""}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, categoryTr: e.target.value })
                    }
                    placeholder="Kategori"
                    className="w-full p-3 rounded-xl border"
                  />
                </div>

                <div className="space-y-4 bg-slate-50 p-6 rounded-[2.5rem]" dir="ltr">
                  <h3 className="font-black border-b pb-2 text-blue-600">English</h3>
                  <input
                    value={editingItem.nameEn || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, nameEn: e.target.value })}
                    placeholder="Name"
                    className="w-full p-3 rounded-xl border"
                  />
                  <textarea
                    value={editingItem.descEn || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, descEn: e.target.value })}
                    placeholder="Description"
                    className="w-full p-3 rounded-xl border h-24"
                  />
                  <input
                    value={editingItem.categoryEn || ""}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, categoryEn: e.target.value })
                    }
                    placeholder="Category"
                    className="w-full p-3 rounded-xl border"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-8">
                <input
                  value={editingItem.price ?? ""}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, price: parseFloat(e.target.value || "0") })
                  }
                  type="number"
                  placeholder={admT.price}
                  className="p-4 rounded-2xl border font-black"
                />

                {/* السعر القديم */}
<input
  type="number"
  placeholder="السعر قبل العرض"
  value={editingItem.oldPrice ?? ""}
  onChange={(e) =>
    setEditingItem({ ...editingItem, oldPrice: parseFloat(e.target.value || "0") })
  }
  className="p-4 rounded-2xl border"
/>

{/* تفعيل العرض */}
<div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl">
  <span className="font-black text-slate-800">تفعيل العرض</span>
  <input
    type="checkbox"
    checked={!!editingItem.isOffer}
    onChange={(e) =>
      setEditingItem({ ...editingItem, isOffer: e.target.checked })
    }
    className="w-6 h-6"
  />
</div>

                {/* رابط الصورة */}
<input
  value={editingItem.image || ""}
  onChange={(e) => setEditingItem({ ...editingItem, image: e.target.value })}
  placeholder="رابط الصورة (اختياري)"
  className="p-4 rounded-2xl border"
/>

{/* رفع صورة من الجهاز */}
<div className="p-4 rounded-2xl border bg-slate-50 space-y-3">
  <div className="font-black text-slate-800">أو ارفع صورة من جهازك</div>

  <input
    type="file"
    accept="image/*"
    onChange={async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const url = await uploadMenuImage(file);
      if (url) {
        setEditingItem((prev) => ({ ...prev, image: url })); // ✅ نخزن رابط الصورة النهائي
      }
    }}
    className="block w-full text-sm"
  />

  {uploadingImage && (
    <div className="text-xs font-black text-slate-500">جاري رفع الصورة...</div>
  )}

  {imageUploadError && (
    <div className="text-xs font-black text-red-600">{imageUploadError}</div>
  )}

  {editingItem.image && (
    <img
      src={editingItem.image}
      alt="preview"
      className="w-full h-40 object-cover rounded-2xl border"
    />
  )}
</div>

              </div>
              <div className="mt-4 flex items-center justify-between bg-slate-50 p-4 rounded-2xl">
  <div className="font-black text-slate-800">{admT.outOfStock}</div>
  <input
    type="checkbox"
    checked={!!editingItem.outOfStock}
    onChange={(e) =>
      setEditingItem({ ...editingItem, outOfStock: e.target.checked })
    }
    className="w-6 h-6"
  />
</div>


              <div className="flex gap-4 mt-10">
                <button
                  onClick={async () => {
                    const ref = collection(db, "artifacts", appId, "public", "data", "menu");
                    if (editingItem.id) {
                      const { id, ...rest } = editingItem;
                      await updateDoc(
                        doc(db, "artifacts", appId, "public", "data", "menu", editingItem.id),
                        { ...rest, updatedAt: Date.now() }
                      );
                    } else {
                      await addDoc(ref, { ...editingItem, timestamp: Date.now() });
                    }
                    setEditingItem(null);
                  }}
                  className="flex-grow py-5 bg-slate-950 text-white rounded-[1.5rem] font-black text-xl hover:bg-black transition-all"
                >
                  {admT.save}
                </button>

                <button
                  onClick={() => setEditingItem(null)}
                  className="px-12 py-5 bg-slate-100 text-slate-600 rounded-[1.5rem] font-black"
                >
                  {admT.cancel}
                </button>
              </div>
            </div>
          </div>
        )}

{accountsOpen && adminSession?.role === "owner" && (
  <div className="fixed inset-0 z-[200] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="w-full max-w-4xl bg-white rounded-[2.5rem] p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-black text-slate-900">Manage Accounts</h3>
        <button
          onClick={() => setAccountsOpen(false)}
          className="p-2 bg-slate-50 rounded-2xl text-slate-400"
        >
          <X size={18} />
        </button>
      </div>


      {/* تغيير كلمة مرور المالك (تصير PIN) */}
      <div className="bg-slate-50 p-4 rounded-2xl mb-6">
  <div className="font-black text-slate-800 mb-2">Owner credentials</div>

  <div className="grid grid-cols-2 gap-3">
    <input
      value={newOwnerUser}
      onChange={(e) => setNewOwnerUser(e.target.value)}
      placeholder="New owner username"
      className="p-3 rounded-xl border"
    />
    <input
      value={newOwnerPass}
      onChange={(e) => setNewOwnerPass(e.target.value)}
      type="password"
      placeholder="New owner password (PIN)"
      className="p-3 rounded-xl border"
    />
    <button
      onClick={updateOwnerCredentials}
      className="col-span-2 px-5 py-3 rounded-xl bg-slate-950 text-white font-black"
    >
      Save Owner Changes
    </button>
  </div>

  <div className="mt-2 text-xs text-slate-500 font-bold">
    PIN لإنشاء حسابات جديدة = كلمة مرور المالك الحالية
  </div>
</div>


      {/* إضافة/تعديل حساب موظف */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <input
          value={accUsername}
          onChange={(e) => setAccUsername(e.target.value)}
          placeholder="Username"
          className="p-3 rounded-xl border"
        />
        <input
          value={accPassword}
          onChange={(e) => setAccPassword(e.target.value)}
          placeholder="Password"
          type="password"
          className="p-3 rounded-xl border"
        />
        <button
          onClick={upsertAdminUser}
          className="col-span-2 py-3 rounded-xl bg-orange-600 text-white font-black"
        >
          {accEdit ? "Update User" : "Add User"}
        </button>
      </div>

      {/* قائمة الحسابات */}
      <div className="space-y-3 max-h-[45vh] overflow-y-auto">
        {adminUsers.length === 0 ? (
          <div className="text-slate-400 font-bold">No users yet</div>
        ) : (
          adminUsers.map((u) => (
            <div
              key={u.username}
              className="p-4 rounded-2xl border flex items-center justify-between"
            >
              <div>
                <div className="font-black text-slate-900">{u.username}</div>
                <div className="text-xs text-slate-400 font-bold">
                  updated: {u.updatedAt ? new Date(u.updatedAt).toLocaleString() : "-"}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setAccEdit(u);
                    setAccUsername(u.username);
                    setAccPassword(u.password || "");
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-black"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteAdminUser(u)}
                  className="px-4 py-2 rounded-xl bg-red-100 text-red-700 font-black"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
)}




        <style
  dangerouslySetInnerHTML={{
    __html: `
      @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;700;900&display=swap');
      body { font-family: 'Noto Sans Arabic', sans-serif; }
      .no-scrollbar::-webkit-scrollbar { display: none; }

      /* 🔒 منع أسهم الزيادة والنقصان */
      input[type="number"]::-webkit-outer-spin-button,
      input[type="number"]::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      input[type="number"] {
        -moz-appearance: textfield;
      }
    `,
  }}
/>

      </div>
    );
  }

  /* ==========================================================
     3) CUSTOMER (ممنوع يظهر Portal للعميل)
     ========================================================== */
  // إذا دخل العميل من /admin وغيّر إلى customer (للاختبار) أو من / مباشرة
  if (appMode === "customer" && view === "selection") {
    return (
      <div
        className="min-h-screen bg-white flex flex-col items-center justify-center p-6"
        dir={lang === "ar" ? "rtl" : "ltr"}
      >
        <div className="w-full max-w-md space-y-12 text-center">
          <div className="bg-orange-50 w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-xl shadow-orange-100">
            <Utensils size={40} className="text-orange-600" />
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-black text-slate-900">{t.brand}</h1>
            <p className="text-slate-400 font-bold">{t.selectTable}</p>
          </div>

          <div className="grid grid-cols-5 gap-3">
            {[...Array(20)].map((_, i) => (
              <button
                key={i}
                onClick={() => setTable(i + 1)}
                className={`h-12 rounded-2xl font-black transition-all ${
                  table === i + 1
                    ? "bg-slate-950 text-white scale-110 shadow-xl"
                    : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {/* لغة العميل */}
          <div className="flex justify-center gap-3 pt-4 border-t border-dashed">
            {["ar", "tr", "en"].map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-5 py-2 rounded-xl text-xs font-black uppercase transition-all ${
                  lang === l
                    ? "bg-slate-950 text-white"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* لا يوجد زر خروج هنا */}
          <button
            disabled={!table}
            onClick={() => handleStartOrder(table)}
            className="w-full py-6 bg-orange-600 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-orange-200 disabled:opacity-20 flex items-center justify-center gap-3"
          >
            {t.startOrder} <ArrowRight size={24} />
          </button>
        </div>
      </div>
    );
  }

  /* ==========================================================
     4) CUSTOMER MENU
     ========================================================== */
  if (appMode === "customer" && view === "menu") {
    return (
      <div className="min-h-screen bg-slate-50 pb-32" dir={lang === "ar" ? "rtl" : "ltr"}>
      
        <header className="sticky top-0 z-[60] bg-white/90 backdrop-blur-md border-b px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-950 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg">
              {table}
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900">{t.table}</h2>
              <button
                onClick={() => setView("selection")}
                className="text-[10px] text-orange-600 font-bold uppercase tracking-widest flex items-center gap-1"
              >
                {t.changeTable} <ChevronRight size={10} />
              </button>
            </div>
          </div>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-4 bg-orange-600 text-white rounded-2xl shadow-xl shadow-orange-100 active:scale-90 transition-all"
          >
            <ShoppingCart size={24} />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-slate-950 text-white text-[10px] w-6 h-6 rounded-full flex items-center justify-center font-black border-4 border-white animate-bounce">
                {cart.length}
              </span>
            )}
          </button>
        </header>

        <div className="p-4 sticky top-[89px] z-50 bg-slate-50/80 backdrop-blur-md border-b overflow-x-auto flex gap-3 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-8 py-3 rounded-full whitespace-nowrap text-sm font-black transition-all shadow-sm ${
                activeCategory === cat
                  ? "bg-orange-600 text-white shadow-orange-200"
                  : "bg-white text-slate-400"
              }`}
            >
              {cat === "All"
                ? t.all
                : lang === "ar"
                ? cat
                : getLocalizedValue(menuItems.find((i) => i.categoryAr === cat), "category")}
            </button>
          ))}
        </div>

        <main className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
         {filteredItems.map((item) => {
  const isOut = !!computedOutOfStock[item.id];

  return (
    <div
      key={item.id}
      className="bg-white p-5 rounded-[2.5rem] flex gap-5 border border-white shadow-sm hover:shadow-xl transition-all group"
    >
      {/* الصورة */}
      <div className="relative overflow-hidden rounded-[1.8rem] w-32 h-32 shrink-0 bg-slate-100">
        {/* عرض */}
        {item.isOffer && (
          <div className="absolute top-3 right-3 z-10">
            <span className="px-3 py-1 rounded-full text-[11px] font-black bg-red-100 text-red-700">
              🔥 عرض
            </span>
          </div>
        )}

        {/* نفذت الكمية (محسوبة من المخزون) */}
        {isOut && (
          <div className="absolute top-3 left-3 z-10">
            <span className="px-3 py-1 rounded-full text-[11px] font-black bg-red-100 text-red-700">
              {t.outOfStock}
            </span>
          </div>
        )}

        <img
          src={item.image}
          alt=""
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
      </div>

      {/* المحتوى */}
      <div className="flex flex-col justify-between flex-grow">
        <div>
          <h3 className="font-black text-slate-900 text-xl leading-tight">
            {getLocalizedValue(item, "name")}
          </h3>
          <p className="text-[11px] text-slate-400 font-medium line-clamp-2 mt-1">
            {getLocalizedValue(item, "desc")}
          </p>
        </div>

        {/* السعر + زر الإضافة */}
        <div className="flex justify-between items-center mt-2">
          {item.isOffer ? (
            <div className="flex flex-col">
              <span className="text-sm text-slate-400 line-through font-bold">
                {item.oldPrice} TL
              </span>
              <span className="text-2xl font-black text-orange-600">
                {item.price} <small className="text-[10px] font-bold">TL</small>
              </span>
            </div>
          ) : (
            <span className="text-2xl font-black text-orange-600">
              {item.price} <small className="text-[10px] font-bold">TL</small>
            </span>
          )}

          <button
            onClick={() => {
              if (isOut) return;
              setNotesItem(item);
              setNotesText("");
              setNotesOpen(true);
            }}
            disabled={isOut}
            className={`p-3.5 rounded-2xl shadow-lg active:scale-90 transition-all ${
              isOut
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-slate-950 text-white"
            }`}
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
    </div>
  );
})}

        </main>

        {/* Notes Modal */}
{notesOpen && notesItem && (
  <div className="fixed inset-0 z-[120] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="w-full max-w-lg bg-white rounded-[2.5rem] p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-black text-slate-900">
          {getLocalizedValue(notesItem, "name")}
        </h3>
        <button
          onClick={() => setNotesOpen(false)}
          className="p-2 bg-slate-50 rounded-2xl text-slate-400"
        >
          <X size={18} />
        </button>
      </div>

      <label className="block text-sm font-black text-slate-700 mb-2">
        {t.notes}
      </label>
      <textarea
        value={notesText}
        onChange={(e) => setNotesText(e.target.value)}
        placeholder={t.notesPlaceholder}
        className="w-full p-4 rounded-2xl border h-28"
      />

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          onClick={() => {
            addToCartWithNote(notesItem, notesText);
            setNotesOpen(false);
          }}
          className="py-4 bg-slate-950 text-white rounded-2xl font-black"
        >
          {t.addToCart}
        </button>

        <button
          onClick={() => {
            addToCartWithNote(notesItem, "");
            setNotesOpen(false);
          }}
          className="py-4 bg-slate-100 text-slate-700 rounded-2xl font-black"
        >
          {t.skip}
        </button>
      </div>
    </div>
  </div>
)}


        {/* Cart */}
        {isCartOpen && (
          <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex justify-end">
            <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
              <div className="p-8 border-b flex justify-between items-center">
                <h2 className="text-2xl font-black">{t.cart}</h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-3 bg-slate-50 rounded-2xl text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-grow p-8 space-y-6 overflow-y-auto text-right">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-50">
                    <ShoppingCart size={80} strokeWidth={1} />
                    <p className="mt-4 font-black">{t.emptyCart}</p>
                  </div>
                ) : (
                  cart.map((it, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 p-5 rounded-[2rem] flex justify-between items-center"
                    >
                      <div>
                        <p className="font-black text-slate-900">{getLocalizedValue(it, "name")}</p>
                        {it.note && (
  <p className="text-[11px] text-slate-500 font-bold mt-1">
    📝 {it.note}
  </p>
)}

                        <p className="text-xs text-orange-600 font-bold">
                          {(it.price || 0) * (it.quantity || 1)} TL
                        </p>
                      </div>
                      

                      <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-2xl shadow-sm">
                        <button
                          onClick={() => {
                            const nc = [...cart];
                            if (nc[idx].quantity > 1) nc[idx].quantity--;
                            else nc.splice(idx, 1);
                            setCart(nc);
                          }}
                          className="text-slate-300"
                        >
                          <Minus size={16} />
                        </button>

                        <span className="font-black w-4 text-center">{it.quantity}</span>

                        <button
                          onClick={() => {
                            const nc = [...cart];
                            nc[idx].quantity++;
                            setCart(nc);
                          }}
                          className="text-slate-950"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}

                {cart.length > 0 && (
                  <div className="pt-6 space-y-4">
                    <p className="font-black text-slate-900">{t.payment}</p>
                    <div className="grid grid-cols-3 gap-4">
  {/* cash */}
  <button
    onClick={() => { setPaymentMethod("cash"); setReceiptDataUrl(""); setReceiptError(""); }}
    className={`p-5 rounded-[1.8rem] border-2 flex flex-col items-center gap-2 transition-all ${
      paymentMethod === "cash"
        ? "border-orange-600 bg-orange-50 text-orange-600 shadow-lg shadow-orange-100"
        : "bg-white border-slate-100 text-slate-400"
    }`}
  >
    <Banknote size={24} />
    <span className="text-xs font-black">{t.cash}</span>
  </button>

  {/* card */}
  <button
    onClick={() => { setPaymentMethod("card"); setReceiptDataUrl(""); setReceiptError(""); }}
    className={`p-5 rounded-[1.8rem] border-2 flex flex-col items-center gap-2 transition-all ${
      paymentMethod === "card"
        ? "border-orange-600 bg-orange-50 text-orange-600 shadow-lg shadow-orange-100"
        : "bg-white border-slate-100 text-slate-400"
    }`}
  >
    <CreditCard size={24} />
    <span className="text-xs font-black">{t.card}</span>
  </button>

  {/* iban */}
  <button
    onClick={() => { setPaymentMethod("iban"); setReceiptError(""); }}
    className={`p-5 rounded-[1.8rem] border-2 flex flex-col items-center gap-2 transition-all ${
      paymentMethod === "iban"
        ? "border-orange-600 bg-orange-50 text-orange-600 shadow-lg shadow-orange-100"
        : "bg-white border-slate-100 text-slate-400"
    }`}
  >
    <Banknote size={24} />
    <span className="text-xs font-black">{t.iban || "IBAN"}</span>
  </button>
</div>

{paymentMethod === "iban" && (
  <div className="mt-4 bg-slate-50 p-4 rounded-2xl space-y-3">
    <div className="font-black text-slate-900">{t.ibanInfoTitle}</div>

    <div className="text-sm font-bold text-slate-700">
     رقم الطاولة: <span className="font-black">wingi</span>
    </div>

    <div className="text-sm font-bold text-slate-700 break-all">
      IBAN: <span className="font-black">TR00000000000000000000000000000000000</span>
    </div>

    <div className="text-sm font-black text-red-600">
      {t.receiptRequired}
    </div>

    <input
      type="file"
      accept="image/*"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (!file) {
          setReceiptDataUrl("");
          return;
        }
        const reader = new FileReader();
        reader.onload = () => setReceiptDataUrl(String(reader.result || ""));
        reader.readAsDataURL(file);
      }}
      className="block w-full text-sm"
    />
  </div>
)}


                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-10 bg-slate-50 border-t space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold">{t.total}</span>
                    <span className="text-3xl font-black text-slate-950">
                      {cart.reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0)}{" "}
                      <small className="text-sm">TL</small>
                    </span>
                  </div>

                  <button
                    disabled={!paymentMethod || (paymentMethod === "iban" && !receiptDataUrl)}
                    onClick={async () => {
  try {
    setOrderStatus("sending");

    const items = cart; // ✅ تعريف items هنا
    const total = items.reduce(
      (s, i) => s + (i.price || 0) * (i.quantity || 1),
      0
    );

    await addDoc(
      collection(db, "artifacts", appId, "public", "data", "orders"),
      {
        table,
        items,
        total,
        paymentMethod,
        receiptDataUrl: paymentMethod === "iban" ? receiptDataUrl : "",
        ibanName: paymentMethod === "iban" ? "wingi" : "",
        ibanNumber:
          paymentMethod === "iban"
            ? "TR00000000000000000000000000000000000"
            : "",
        status: "new",
        timestamp: Date.now(),
      }
    );

    setOrderStatus("completed");
    setCart([]);
    setIsCartOpen(false);
    setPaymentMethod(null);
    setReceiptDataUrl("");
  } catch (e) {
    console.error(e);
    setOrderStatus(null);
  }
}}

                    className="w-full py-6 bg-orange-600 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-orange-200 disabled:opacity-30 active:scale-95 transition-all"
                  >
                    {t.completeOrder}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Success */}
        {orderStatus === "completed" && (
          <div className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center p-10 text-center animate-in zoom-in duration-300">
            <div className="relative mb-10">
              <div className="absolute -inset-8 bg-emerald-100 blur-3xl rounded-full animate-pulse" />
              <div className="relative w-32 h-32 bg-emerald-500 text-white rounded-[3.5rem] flex items-center justify-center shadow-2xl shadow-emerald-200">
                <CheckCircle size={64} />
              </div>
            </div>

            <h2 className="text-4xl font-black text-slate-950 mb-4">{t.orderSuccess}</h2>

            <div className="bg-slate-50 px-8 py-4 rounded-3xl mb-12">
              <p className="text-slate-500 font-bold">
                طاولتك رقم <span className="text-slate-950 text-2xl font-black">{table}</span>
              </p>
            </div>

            <button
              onClick={() => setOrderStatus(null)}
              className="w-full max-w-xs py-5 bg-slate-950 text-white rounded-[2rem] font-black text-xl shadow-xl active:scale-95 transition-all"
            >
              العودة للمنيو
            </button>
          </div>
        )}

        <style
          dangerouslySetInnerHTML={{
            __html: `
          @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;700;900&display=swap');
          body { font-family: 'Noto Sans Arabic', sans-serif; }
          .no-scrollbar::-webkit-scrollbar { display: none; }
        `,
          }}
        />
      </div>
    );
  }

  // Fallback
  return null;
}
