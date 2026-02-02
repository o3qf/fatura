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
import { query, orderBy, limit } from "firebase/firestore";
import { jsPDF } from "jspdf";
import "./fonts/Cairo";



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

// ===== Order Date Helper (VERY IMPORTANT) =====
const orderDateToJS = (order) => {
  const v =
    order?.createdAt ??
    order?.created_at ??
    order?.timestamp ??
    order?.date ??
    order?.time;

  if (!v) return null;

  if (typeof v?.toDate === "function") return v.toDate();
  if (typeof v?.seconds === "number") return new Date(v.seconds * 1000);
  if (typeof v === "number") return new Date(v);

  if (typeof v === "string") {
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
};


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
notesPlaceholder: "مثال: بدون بصل / صوص زيادة...",
invalidCredentials: "اسم المستخدم أو كلمة المرور غير صحيحة",
ownerPinWrong: "كلمة سر صاحب المطعم خاطئة",
usernameTaken: "اسم المستخدم مستخدم مسبقًا",
requiredFields: "يرجى تعبئة كل الحقول",
markedBy: "تم بواسطة",
iban: "تحويل إلى IBAN",
ibanInfoTitle: "معلومات التحويل",
receiptUploadTitle: "إرفاق إيصال التحويل",
receiptRequired: "يجب إرفاق صورة الإيصال قبل تقديم الطلب",
tax: "ضريبة القيمة المضافة",
taxPercent: "نسبة الضريبة %",
taxAmount: "قيمة الضريبة",
totalBeforeTax: "قبل الضريبة",
totalAfterTax: "الإجمالي بعد الضريبة",
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
tax: "VAT / Tax",
taxPercent: "Tax %",
taxAmount: "Tax amount",
totalBeforeTax: "Before tax",
totalAfterTax: "Total after tax",
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
tax: "KDV / Vergi",
taxPercent: "Vergi %",
taxAmount: "Vergi tutarı",
totalBeforeTax: "Vergi öncesi",
totalAfterTax: "Vergi sonrası toplam",
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


const getAccLabel = (accId, accSettings, lang) => {
  if (!accId) return "-";

  // 1) أسماء مخصصة محفوظة (لو موجودة)
  const names = accSettings?.names || {};
  const row = names?.[accId];
  if (row) {
    return (
      row?.[lang] ||
      row?.ar ||
      row?.en ||
      row?.tr ||
      accId
    );
  }

  // 2) أسماء افتراضية للحسابات الأساسية
  const fallback = {
    cash: "Cash / صندوق",
    bank: "Bank / بنك",
    ar: "Accounts Receivable / عملاء",
    ap: "Accounts Payable / موردين",
    sales: "Sales / مبيعات",
    vat_output: "VAT Output / ضريبة",
    expense: "Expense / مصروف",
  };

  return fallback[accId] || accId;
};



  // أسماء افتراضية لو ما انضافت في names
//const fallback = {
 // cash: { ar: "الصندوق", en: "Cash", tr: "Kasa" },
 // bank: { ar: "البنك", en: "Bank", tr: "Banka" },
  //sales: { ar: "المبيعات", en: "Sales", tr: "Satışlar" },
 // vat_output: { ar: "ضريبة المخرجات", en: "VAT Output", tr: "KDV Çıkış" },
//};

//return fallback?.[accId]?.[lang] || fallback?.[accId]?.ar || accId;
//};

function ReceiptsPage({
  customers,
  receipts,
  appId,
  db,
  CURRENCY,
  postReceiptEntry,
}) {
  const [form, setForm] = React.useState({
    customerId: "",
    amount: "",
    method: "cash",
    note: "",
    date: new Date().toISOString().slice(0, 10),
  });

  const customer = (customers || []).find((c) => c.id === form.customerId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black">💵 سندات القبض</h2>
      </div>

      <div className="bg-white p-4 rounded-2xl border space-y-3">
        <div className="font-black">سند قبض جديد</div>

        <select
          className="w-full border rounded-xl px-4 py-3 font-bold"
          value={form.customerId}
          onChange={(e) => setForm((p) => ({ ...p, customerId: e.target.value }))}
        >
          <option value="">— اختر عميل —</option>
          {(customers || []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <div className="grid md:grid-cols-3 gap-3">
          <input
            className="border rounded-xl px-4 py-3 font-bold"
            placeholder="المبلغ"
            value={form.amount}
            onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
            dir="ltr"
          />

          <select
            className="border rounded-xl px-4 py-3 font-bold"
            value={form.method}
            onChange={(e) => setForm((p) => ({ ...p, method: e.target.value }))}
            dir="ltr"
          >
            <option value="cash">cash</option>
            <option value="bank">bank</option>
          </select>

          <input
            type="date"
            className="border rounded-xl px-4 py-3 font-bold"
            value={form.date}
            onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
            dir="ltr"
          />
        </div>

        <input
          className="w-full border rounded-xl px-4 py-3 font-bold"
          placeholder="ملاحظة (اختياري)"
          value={form.note}
          onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
        />

        <button
          onClick={async () => {
            const amount = Number(form.amount || 0);
            if (!form.customerId) return alert("اختر عميل");
            if (amount <= 0) return alert("اكتب مبلغ صحيح");

            const customerName = customer?.name || "";

            const ref = await addDoc(
              collection(db, "artifacts", appId, "public", "data", "receipts"),
              {
                customerId: form.customerId,
                customerName,
                amount,
                method: form.method,
                note: form.note || "",
                date: form.date,
                createdAt: Date.now(),
                accountingPosted: false,
                accountingPostedAt: null,
              }
            );

            // ترحيل محاسبي مرة واحدة
            await postReceiptEntry({ id: ref.id, ...form, amount, customerName });

            await updateDoc(
              doc(db, "artifacts", appId, "public", "data", "receipts", ref.id),
              {
                accountingPosted: true,
                accountingPostedAt: Date.now(),
              }
            );

            setForm((p) => ({ ...p, amount: "", note: "" }));
            alert("تم حفظ سند القبض وترحيله ✅");
          }}
          className="px-5 py-3 rounded-2xl bg-emerald-600 text-white font-black"
        >
          حفظ وترحيل
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border">
        <div className="font-black mb-3">سندات القبض</div>

        {receipts.length === 0 ? (
          <div className="text-sm text-slate-500 font-bold">لا يوجد سندات.</div>
        ) : (
          <div className="overflow-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="text-sm text-slate-500">
                  <th className="text-right p-2">التاريخ</th>
                  <th className="text-right p-2">العميل</th>
                  <th className="text-right p-2">المبلغ</th>
                  <th className="text-right p-2">الطريقة</th>
                  <th className="text-right p-2">تم الترحيل</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="p-2 font-bold">{r.date || "-"}</td>
                    <td className="p-2 font-black">{r.customerName || "-"}</td>
                    <td className="p-2 font-black">{Number(r.amount || 0).toFixed(2)} {CURRENCY}</td>
                    <td className="p-2 font-bold" dir="ltr">{r.method || "-"}</td>
                    <td className="p-2 font-bold">{r.accountingPosted ? "✅" : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


function CustomerLedger({
  customers,
  invoices,
  selectedCustomerId,
  setSelectedCustomerId,
  CURRENCY,
}) {
  const customer = (customers || []).find((c) => c.id === selectedCustomerId) || null;

  const custInvoices = (invoices || [])
    .filter((inv) => inv.customerId === selectedCustomerId)
    .sort((a, b) => Number(a.createdAt || 0) - Number(b.createdAt || 0));


    const custReceipts = (receipts || [])
  .filter((r) => r.customerId === selectedCustomerId)
  .sort((a, b) => Number(a.createdAt || 0) - Number(b.createdAt || 0));

const receiptsTotal = custReceipts.reduce((s, r) => s + Number(r.amount || 0), 0);


  const paidTotal = custInvoices
    .filter((x) => x.status === "paid")
    .reduce((s, x) => s + Number(x.total || 0), 0);

  const unpaidTotal = custInvoices
    .filter((x) => x.status !== "paid" && x.status !== "void")
    .reduce((s, x) => s + Number(x.total || 0), 0);

  const balance = Math.max(0, unpaidTotal - receiptsTotal);
 // مبدئيًا: الرصيد = غير المدفوع (لاحقًا نضيف دفعات جزئية)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black">📒 كشف حساب عميل</h2>
      </div>

      <div className="bg-white p-4 rounded-2xl border space-y-3">
        <div className="font-black mb-1">اختر العميل</div>

        <select
          className="w-full border rounded-xl px-4 py-3 font-bold"
          value={selectedCustomerId || ""}
          onChange={(e) => setSelectedCustomerId(e.target.value)}
        >
          <option value="">— اختر عميل —</option>
          {(customers || []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {customer ? (
          <div className="grid md:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-slate-50 border">
              <div className="text-sm text-slate-500 font-bold">مدفوع</div>
              <div className="text-2xl font-black mt-1">
                {paidTotal.toFixed(2)} {CURRENCY}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border">
              <div className="text-sm text-slate-500 font-bold">غير مدفوع</div>
              <div className="text-2xl font-black mt-1">
                {unpaidTotal.toFixed(2)} {CURRENCY}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border">
              <div className="text-sm text-slate-500 font-bold">الرصيد</div>
              <div className="text-2xl font-black mt-1">
                {balance.toFixed(2)} {CURRENCY}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-500 font-bold">اختر عميل لعرض كشف الحساب.</div>
        )}
      </div>

      {customer && (
        <div className="bg-white p-4 rounded-2xl border">
          <div className="font-black mb-3">حركات العميل (الفواتير)</div>

          {custInvoices.length === 0 ? (
            <div className="text-sm text-slate-500 font-bold">لا توجد فواتير لهذا العميل.</div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="text-sm text-slate-500">
                    <th className="text-right p-2">التاريخ</th>
                    <th className="text-right p-2">الفاتورة</th>
                    <th className="text-right p-2">الحالة</th>
                    <th className="text-right p-2">الإجمالي</th>
                    <th className="text-right p-2">مدين</th>
                    <th className="text-right p-2">دائن</th>
                  </tr>
                </thead>
                <tbody>
                  {custInvoices.map((inv) => {
                    const total = Number(inv.total || 0);
                    const isPaid = inv.status === "paid";
                    const dateStr = inv.createdAt
                      ? new Date(inv.createdAt).toISOString().slice(0, 10)
                      : "-";

                    // ledger style: invoice creates debit (customer owes)
                    const debit = total;
                    const credit = isPaid ? total : 0;

                    return (
                      <tr key={inv.id} className="border-t">
                        <td className="p-2 font-bold">{dateStr}</td>
                        <td className="p-2 font-black" dir="ltr">
                          {inv.invoiceNumber}
                        </td>
                        <td className="p-2 font-bold">{inv.status}</td>
                        <td className="p-2 font-black">
                          {total.toFixed(2)} {CURRENCY}
                        </td>
                        <td className="p-2 font-black">{debit.toFixed(2)}</td>
                        <td className="p-2 font-black">{credit.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}



function ReportsPanel({ journalEntries, CURRENCY, accSettings, accounts, lang }) {


const ACC = accSettings?.accounts || { vatOutput: ACC.vatOutput };


  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const monthStr = todayStr.slice(0, 7);



  const [plFrom, setPlFrom] = React.useState(() => {
  const d = new Date();
  const first = new Date(d.getFullYear(), d.getMonth(), 1);
  return first.toISOString().slice(0, 10);
});
const [plTo, setPlTo] = React.useState(() => new Date().toISOString().slice(0, 10));

const inRange = (dStr) => {
  if (!dStr) return false;
  return dStr >= plFrom && dStr <= plTo;
};

const accTypeById = (accId) => {
  const a = (accounts || []).find((x) => x.key === accId);
  return a?.type || null; // revenue / expense / ...
};


  const safe = Array.isArray(journalEntries) ? journalEntries : [];

  const salesEntries = safe.filter((j) => j?.refType === "order");



  // ===== P&L (Profit & Loss) =====
let revenueTotal = 0;
let expenseTotal = 0;

const plByAccount = {}; // accId -> amount

for (const j of safe) {
  if (!inRange(j?.date || "")) continue;

  const lines = Array.isArray(j.lines) ? j.lines : [];
  for (const l of lines) {
    const accId = String(l?.accountId || "");
    if (!accId) continue;

    const t = accTypeById(accId);
    if (t !== "revenue" && t !== "expense") continue;

    const debit = Number(l?.debit || 0);
    const credit = Number(l?.credit || 0);

    // revenue الطبيعي: credit - debit
    // expense الطبيعي: debit - credit
    const amt = t === "revenue" ? (credit - debit) : (debit - credit);

    plByAccount[accId] = (plByAccount[accId] || 0) + amt;

    if (t === "revenue") revenueTotal += amt;
    if (t === "expense") expenseTotal += amt;
  }
}



const profit = revenueTotal - expenseTotal;


// ===== Export P&L CSV =====
const exportPLCSV = () => {
  const rows = [
    ["from", plFrom],
    ["to", plTo],
    [],
    ["accountId", "accountName", "amount"],
    ...plRows.map((r) => [
      r.accountId,
      getAccLabel(r.accountId, accounts, lang),
      Number(r.amount || 0).toFixed(2),
    ]),
    [],
    ["total_revenue", Number(revenueTotal || 0).toFixed(2)],
    ["total_expense", Number(expenseTotal || 0).toFixed(2)],
    ["profit", Number(profit || 0).toFixed(2)],
  ];

  const csv = rows
    .map((r) => r.map((x) => `"${String(x ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `PL_${plFrom}_to_${plTo}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

// ===== Export P&L PDF =====
const printPL = () => {
  const html = `
    <html dir="rtl">
    <head>
      <meta charset="utf-8" />
      <title>P&L</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { margin-bottom: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
        th { background: #f5f5f5; }
      </style>
    </head>
    <body>
      <h1>تقرير الأرباح والخسائر</h1>
      <div>الفترة: ${plFrom} — ${plTo}</div>
      <div>إجمالي الإيرادات: ${revenueTotal.toFixed(2)} ${CURRENCY}</div>
      <div>إجمالي المصروفات: ${expenseTotal.toFixed(2)} ${CURRENCY}</div>
      <div><b>صافي الربح: ${profit.toFixed(2)} ${CURRENCY}</b></div>

      <table>
        <thead>
          <tr><th>الحساب</th><th>المبلغ</th></tr>
        </thead>
        <tbody>
          ${plRows
            .map(
              (r) =>
                `<tr>
                  <td>${getAccLabel(r.accountId, accounts, lang)} (${r.accountId})</td>
                  <td>${Number(r.amount || 0).toFixed(2)} ${CURRENCY}</td>
                </tr>`
            )
            .join("")}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const w = window.open("", "_blank");
  w.document.write(html);
  w.document.close();
  w.print();
};


const plRows = Object.entries(plByAccount)
  .map(([accountId, amount]) => ({ accountId, amount }))
  .sort((a, b) => b.amount - a.amount);



  const sumTotal = (arr) =>
    arr.reduce((s, j) => s + Number(j?.totalDebit || 0), 0);

  const todaySales = sumTotal(
    salesEntries.filter((j) => (j?.date || "") === todayStr)
  );
  const monthSales = sumTotal(
    salesEntries.filter((j) => (j?.date || "").startsWith(monthStr))
  );

  const vatToday = salesEntries
    .filter((j) => (j?.date || "") === todayStr)
    .reduce((s, j) => {
      const l = (j.lines || []).find((x) => x.accountId === ACC.vatOutput);
      return s + Number(l?.credit || 0);
    }, 0);

  const vatMonth = salesEntries
    .filter((j) => (j?.date || "").startsWith(monthStr))
    .reduce((s, j) => {
      const l = (j.lines || []).find((x) => x.accountId === ACC.vatOutput);
      return s + Number(l?.credit || 0);
    }, 0);

  const tb = {};
  safe.forEach((j) =>
    (j.lines || []).forEach((l) => {
      tb[l.accountId] ??= { d: 0, c: 0 };
      tb[l.accountId].d += Number(l.debit || 0);
      tb[l.accountId].c += Number(l.credit || 0);
    })
  );

  const money = (n) => `${Number(n || 0).toFixed(2)} ${CURRENCY}`;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-black">📊 التقارير</h2>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl border">
          <div className="font-bold text-slate-500">مبيعات اليوم</div>
          <div className="text-2xl font-black">{money(todaySales)}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border">
          <div className="font-bold text-slate-500">مبيعات الشهر</div>
          <div className="text-2xl font-black">{money(monthSales)}</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border">
        <div className="font-black mb-2">ملخص الضريبة</div>
        <div className="flex gap-6">
          <div>اليوم: {money(vatToday)}</div>
          <div>الشهر: {money(vatMonth)}</div>
        </div>
      </div>


<div className="bg-white p-4 rounded-2xl border">
  <div className="flex items-center justify-between gap-3 mb-3">
   <div className="flex items-center justify-between gap-3 mb-3">
  <div className="font-black">تقرير الأرباح والخسائر (P&L)</div>

  <div className="flex items-center gap-2">
    <button
      onClick={exportPLCSV}
      className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-black"
    >
      تصدير CSV
    </button>

    <button
      onClick={printPL}
      className="px-4 py-2 rounded-xl bg-slate-950 text-white font-black"
    >
      تصدير PDF
    </button>
  </div>
</div>


    <div className="flex items-center gap-2">
      <input
        type="date"
        value={plFrom}
        onChange={(e) => setPlFrom(e.target.value)}
        className="border rounded-xl px-3 py-2 font-bold"
        dir="ltr"
      />
      <span className="text-slate-400 font-black">—</span>
      <input
        type="date"
        value={plTo}
        onChange={(e) => setPlTo(e.target.value)}
        className="border rounded-xl px-3 py-2 font-bold"
        dir="ltr"
      />
    </div>
  </div>

  <div className="grid md:grid-cols-3 gap-3 mb-4">
    <div className="p-3 rounded-2xl bg-slate-50 border">
      <div className="text-sm text-slate-500 font-bold">إجمالي الإيرادات</div>
      <div className="text-2xl font-black mt-1">{money(revenueTotal)}</div>
    </div>
    <div className="p-3 rounded-2xl bg-slate-50 border">
      <div className="text-sm text-slate-500 font-bold">إجمالي المصروفات</div>
      <div className="text-2xl font-black mt-1">{money(expenseTotal)}</div>
    </div>
    <div className="p-3 rounded-2xl bg-slate-50 border">
      <div className="text-sm text-slate-500 font-bold">صافي الربح</div>
      <div className="text-2xl font-black mt-1">{money(profit)}</div>
    </div>
  </div>

  {plRows.length === 0 ? (
    <div className="text-sm text-slate-500 font-bold">
      لا توجد حسابات إيرادات/مصروفات ضمن الفترة. تأكد أن نوع الحساب في شجرة الحسابات = revenue أو expense.
    </div>
  ) : (
    <div className="overflow-auto">
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="text-sm text-slate-500">
            <th className="text-right p-2">الحساب</th>
            <th className="text-right p-2">المبلغ</th>
          </tr>
        </thead>
        <tbody>
          {plRows.map((r) => (
            <tr key={r.accountId} className="border-t">
              <td className="p-2 font-black">
                {getAccLabel(r.accountId, accounts, lang)}
                <div className="text-xs text-slate-500 font-bold" dir="ltr">
                  {r.accountId}
                </div>
              </td>
              <td className="p-2 font-black">{money(r.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>


      <div className="bg-white p-4 rounded-2xl border">
        <div className="font-black mb-2">ميزان المراجعة</div>
        <table className="w-full" dir="ltr">

          <thead>
  <tr>
    <th className="text-left">الحساب</th>
    <th className="text-right">مدين</th>
    <th className="text-right">دائن</th>
  </tr>
</thead>

          <tbody>
            {Object.entries(tb).map(([k, v]) => (
              <tr key={k}>
               <td className="p-2 font-black">
  <div className="flex flex-col">
    <span className="font-black">
      {getAccLabel(k, accounts, lang)
}
    </span>
    <span className="text-xs text-slate-500 font-bold" dir="ltr">
      {k}
    </span>
  </div>
</td>


                <td>{money(v.d)}</td>
                <td>{money(v.c)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


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
const [adminPage, setAdminPage] = useState("menu"); 
// "menu" | "orders" | "inventory" | "finance" | "accounting"


const [ordersTab, setOrdersTab] = useState("active"); // "active" | "old"




// ===== Finance (Revenue / Expenses) =====
// ===== Finance States =====
const [financeMode, setFinanceMode] = useState("daily");
const [finDate, setFinDate] = useState(() =>
  new Date().toISOString().slice(0, 10)
);
const [finFrom, setFinFrom] = useState("");
const [finTo, setFinTo] = useState("");

const [finError, setFinError] = useState("");

const inFinanceRange = (order) => {
  const d = orderDateToJS(order);
  if (!d) return false;

  const ymd = d.toISOString().slice(0, 10);

  if (financeMode === "daily") {
    return ymd === finDate;
  }

  if (finFrom && ymd < finFrom) return false;
  if (finTo && ymd > finTo) return false;
  return true;
};


// لإدارة حسابات الموظفين (Owner فقط)
const [accountsOpen, setAccountsOpen] = useState(false);
const [adminUsers, setAdminUsers] = useState([]);

const [accEdit, setAccEdit] = useState(null);
const [accUsername, setAccUsername] = useState("");
const [accPassword, setAccPassword] = useState("");

const [newOwnerPass, setNewOwnerPass] = useState("");
const [newOwnerUser, setNewOwnerUser] = useState("");

const [taxPercent, setTaxPercent] = useState(0); // ✅ ضريبة عامة %


// =========================
// Accounting Engine (Golden-like)
// =========================
const DEFAULT_ACCOUNTS = {
  cash: "cash",
  bank: "bank",
  sales: "sales",
  vatOutput: "vat_output",
};

async function createJournalEntry({ date, memo, lines, refType, refId }) {
  const cleanLines = (lines || []).map((l) => ({
    accountId: String(l.accountId),
    debit: Number(l.debit || 0),
    credit: Number(l.credit || 0),
  }));

  const totalDebit = cleanLines.reduce((s, l) => s + l.debit, 0);
  const totalCredit = cleanLines.reduce((s, l) => s + l.credit, 0);

  if (Math.abs(totalDebit - totalCredit) > 0.0001) {
    throw new Error("Journal not balanced");
  }

  const payload = {
    date: date || new Date().toISOString().slice(0, 10),
    memo: memo || "",
    refType: refType || null,
    refId: refId || null,
    lines: cleanLines,
    totalDebit,
    totalCredit,
    createdAt: Date.now(),
  };

  await addDoc(
    collection(db, "artifacts", appId, "public", "data", "journalEntries"),
    payload
  );
}

async function postSalesEntryForInvoice(invoice) {
  const total = Number(invoice.total || 0);
  const tax = Number(invoice.taxAmount || 0);
  const netSales = Math.max(0, total - tax);

  const ACC = accSettings?.accounts || {
    cash: "cash",
    bank: "bank",
    sales: "sales",
    vatOutput: "vat_output",
  };

  const debitAccount = ACC.cash; // لاحقًا نخليها حسب طريقة الدفع

  const lines = [
    { accountId: debitAccount, debit: total, credit: 0 },
    { accountId: ACC.sales, debit: 0, credit: netSales },
  ];

  if (tax > 0) {
    lines.push({ accountId: ACC.vatOutput, debit: 0, credit: tax });
  }

  await createJournalEntry({
    date: new Date().toISOString().slice(0, 10),
    memo: "فاتورة مبيعات",
    refText: invoice.invoiceNumber,
    lines,
    refType: "invoice",
    refId: invoice.id,
  });
}



async function exportJournalPDF() {
  try {

    
    const docPdf = new jsPDF({ unit: "pt", format: "a4" });
docPdf.setFont("Cairo");
docPdf.setR2L(true);


docPdf.text("قيود اليومية", 550, 50, { align: "right" });


docPdf.text(accName, 550, y, { align: "right" });

    // عنوان
    docPdf.setFontSize(16);
    docPdf.text("Journal Entries - قيود اليومية", 40, 50);

    // تاريخ الطباعة
    docPdf.setFontSize(10);
    docPdf.text(`Generated: ${new Date().toISOString().slice(0, 10)}`, 40, 70);

    let y = 100;

    // كل قيد
    (journalEntries || []).slice(0, 40).forEach((j, idx) => {
      if (y > 760) {
        docPdf.addPage();
        y = 50;
      }

      docPdf.setFontSize(11);
      docPdf.text(
        `${idx + 1}) ${j.date || "-"} | ${j.memo || ""} | ${j.refText || ""}`,
        40,
        y
      );

      y += 16;

      // البنود
      (j.lines || []).forEach((l) => {
        if (y > 760) {
          docPdf.addPage();
          y = 50;
        }

        const accName = getAccLabel(l.accountId, accSettings, lang);

docPdf.text(accName, 550, y, { align: "right" });
docPdf.text(`Dr: ${debit}`, 320, y);
docPdf.text(`Cr: ${credit}`, 430, y);

        const debit = Number(l.debit || 0).toFixed(2);
        const credit = Number(l.credit || 0).toFixed(2);

        docPdf.setFontSize(10);
        docPdf.text(`- ${accName}`, 60, y);
        docPdf.text(`Dr: ${debit}`, 320, y);
        docPdf.text(`Cr: ${credit}`, 430, y);

        y += 14;
      });

      y += 10;
    });

    docPdf.save("journal.pdf");
  } catch (err) {
    console.error(err);
    alert("PDF Error: " + (err?.message || String(err)));
  }
}



async function postBillEntry(bill) {
  const total = Number(bill.total || 0);
  if (total <= 0) return;

  const ACC = accSettings?.accounts || {
    ap: "ap",
    cash: "cash",
    bank: "bank",
  };

  // حساب المصروف/المخزون اللي تحطه في الفاتورة
  const expenseAcc = bill.expenseAccountId || "expense";

  const lines = [
    { accountId: expenseAcc, debit: total, credit: 0 },
    { accountId: ACC.ap || "ap", debit: 0, credit: total },
  ];

  await createJournalEntry({
    date: bill.date || new Date().toISOString().slice(0, 10),
    memo: "فاتورة مشتريات",
    refText: bill.billNumber || `BILL-${String(bill.id || "").slice(0, 6)}`,
    lines,
    refType: "bill",
    refId: bill.id,
  });
}




async function postVendorPaymentEntry(p) {
  const amount = Number(p.amount || 0);
  if (amount <= 0) return;

  const ACC = accSettings?.accounts || {
    ap: "ap",
    cash: "cash",
    bank: "bank",
  };

  const creditAcc = p.method === "bank" ? ACC.bank : ACC.cash;

  const lines = [
    { accountId: ACC.ap || "ap", debit: amount, credit: 0 },
    { accountId: creditAcc, debit: 0, credit: amount },
  ];

  await createJournalEntry({
    date: p.date || new Date().toISOString().slice(0, 10),
    memo: "سند صرف مورد",
    refText: `VP-${String(p.id || "").slice(0, 6)}`,
    lines,
    refType: "vendor_payment",
    refId: p.id,
  });
}



const getAccountBalances = (journal) => {
  const bal = {};
  (journal || []).forEach((j) => {
    (j.lines || []).forEach((l) => {
      if (!bal[l.accountId]) bal[l.accountId] = 0;
      bal[l.accountId] += Number(l.debit || 0) - Number(l.credit || 0);
    });
  });
  return bal;
};


const getCashFlow = (journal, acc) => {
  let inflow = 0;
  let outflow = 0;

  (journal || []).forEach((j) => {
    (j.lines || []).forEach((l) => {
      if (l.accountId === acc.cash || l.accountId === acc.bank) {
        const d = Number(l.debit || 0);
        const c = Number(l.credit || 0);
        inflow += d;
        outflow += c;
      }
    });
  });

  return {
    inflow,
    outflow,
    net: inflow - outflow,
  };
};



async function postSalesEntryForInvoice(invoice) {
  const total = Number(invoice.total || 0);
  const tax = Number(invoice.taxAmount || 0);
  const netSales = Math.max(0, total - tax);

  const ACC = accSettings?.accounts || {
    cash: "cash",
    bank: "bank",
    sales: "sales",
    vatOutput: "vat_output",
  };


  async function postReceiptEntry(receipt) {
  const amount = Number(receipt.amount || 0);
  if (amount <= 0) return;

  const ACC = accSettings?.accounts || {
    cash: "cash",
    bank: "bank",
    ar: "ar",
    ap: "ap",

  };



  


  const method = receipt.method || "cash";
  const debitAccount = method === "bank" ? ACC.bank : ACC.cash;

  // قبض: Dr Cash/Bank, Cr AR
  const lines = [
    { accountId: debitAccount, debit: amount, credit: 0 },
    { accountId: ACC.ar || "ar", debit: 0, credit: amount },
  ];

  await createJournalEntry({
    date: receipt.date || new Date().toISOString().slice(0, 10),
    memo: "سند قبض عميل",
    refText: `RCPT-${String(receipt.id || "").slice(0, 6)}`,
    lines,
    refType: "receipt",
    refId: receipt.id,
  });
}


  // افتراض: الدفع نقدي (نطوّرها لاحقًا)
  const debitAccount = ACC.cash;

  const lines = [
    { accountId: debitAccount, debit: total, credit: 0 },
    { accountId: ACC.sales, debit: 0, credit: netSales },
  ];

  if (tax > 0) {
    lines.push({ accountId: ACC.vatOutput, debit: 0, credit: tax });
  }

  await createJournalEntry({
    date: new Date().toISOString().slice(0, 10),
    memo: "فاتورة مبيعات",
    refText: invoice.invoiceNumber,
    lines,
    refType: "invoice",
    refId: invoice.id,
  });
}


// =========================
// Firestore Paths (لازم تكون فوق قبل أي استخدام)
// =========================
const adminUsersColPath = ["artifacts", appId, "public", "data", "adminUsers"];
const ownerDocPath = ["artifacts", appId, "public", "data", "adminConfig", "owner"];
const vipCustomersColPath = ["artifacts", appId, "public", "data", "vipCustomers"];
const financeDocPath = ["artifacts", appId, "public", "data", "appConfig", "finance"];



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


const validateOldDates = (from, to) => {
  if (!from && !to) return { ok: true };

  const fromDate = from ? new Date(from) : null;
  const toDate = to ? new Date(to) : null;

  if (from && (!fromDate || isNaN(fromDate.getTime()))) {
    return { ok: false, msg: "تاريخ البداية غير صحيح" };
  }

  if (to && (!toDate || isNaN(toDate.getTime()))) {
    return { ok: false, msg: "تاريخ النهاية غير صحيح" };
  }

  if (fromDate && toDate && fromDate > toDate) {
    return { ok: false, msg: "التاريخ غير صحيح: (من) يجب أن يكون قبل (إلى)" };
  }

  return { ok: true };
};

const applyOldOrdersFilter = () => {
  const res = validateOldDates(oldFrom, oldTo);

  if (!res.ok) {
    setOldFilterError(res.msg);
    setApplyOldFilter(false);
    return;
  }

  setOldFilterError("");
  setApplyOldFilter(true);
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
const [oldFilterError, setOldFilterError] = useState("");


const [orders, setOrders] = useState([]);

const [invoices, setInvoices] = useState([]);
const [receipts, setReceipts] = useState([]);
const [vendorPayments, setVendorPayments] = useState([]);

const [bills, setBills] = useState([]);



const [customers, setCustomers] = useState([]);

const [vendors, setVendors] = useState([]);
const [editingVendor, setEditingVendor] = useState(null);


const [selectedCustomerId, setSelectedCustomerId] = useState("");

const [editingCustomer, setEditingCustomer] = useState(null);


const [editingInvoice, setEditingInvoice] = useState(null); // modal/form


const [accSettings, setAccSettings] = useState({
  accounts: {
    cash: "cash",
    bank: "bank",
    sales: "sales",
    vatOutput: "vat_output",
    ar: "ar",
    ap: "ap",

  },
});

const [accounts, setAccounts] = useState([]);



const [journalEntries, setJournalEntries] = useState([]);
const [openJournalId, setOpenJournalId] = useState(null);



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

const exportInventoryCSV = () => {
  const rows = (menuItems || []).map((it) => ({
    id: it.id ?? "",
    nameAr: it.nameAr ?? "",
    nameEn: it.nameEn ?? "",
    nameTr: it.nameTr ?? "",
    price: it.price ?? "",
    outOfStock: it.outOfStock ? "yes" : "no",
  }));

  const headers = Object.keys(rows[0] || { id: "", nameAr: "", nameEn: "", nameTr: "", price: "", outOfStock: "" });
  const csv = [
    headers.join(","),
    ...rows.map((r) =>
      headers
        .map((h) => {
          const v = String(r[h] ?? "");
          // escape quotes + commas
          const escaped = v.replace(/"/g, '""');
          return /[,"\n]/.test(escaped) ? `"${escaped}"` : escaped;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "inventory.csv";
  a.click();
  URL.revokeObjectURL(url);
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


    const unsubInvoices = onSnapshot(
  query(
    collection(db, "artifacts", appId, "public", "data", "invoices"),
    orderBy("createdAt", "desc")
  ),
  (snap) => {
    setInvoices(snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) })));
  }
);


const unsubCustomers = onSnapshot(
  query(
    collection(db, "artifacts", appId, "public", "data", "customers"),
    orderBy("createdAt", "desc")
  ),
  (snap) => {
    setCustomers(snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) })));
  }
);


const unsubReceipts = onSnapshot(
  query(
    collection(db, "artifacts", appId, "public", "data", "receipts"),
    orderBy("createdAt", "desc")
  ),
  (snap) => {
    setReceipts(snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) })));
  }
);


     const unsubInv = onSnapshot(
    collection(db, "artifacts", appId, "public", "data", "inventory"),
    (snap) => {
      setInventory(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }
  );



  const unsubVendors = onSnapshot(
  query(
    collection(db, "artifacts", appId, "public", "data", "vendors"),
    orderBy("createdAt", "desc")
  ),
  (snap) => {
    setVendors(snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) })));
  }
);


const unsubBills = onSnapshot(
  query(
    collection(db, "artifacts", appId, "public", "data", "bills"),
    orderBy("createdAt", "desc")
  ),
  (snap) => {
    setBills(snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) })));
  }
);



const unsubVendorPayments = onSnapshot(
  query(
    collection(db, "artifacts", appId, "public", "data", "vendor_payments"),
    orderBy("createdAt", "desc")
  ),
  (snap) => {
    setVendorPayments(snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) })));
  }
);


    return () => {
      unsubMenu();
      unsubOrders();
       unsubInv();
       unsubJournal();
       unsubAccounts();
       unsubInvoices();
       unsubCustomers();
       unsubReceipts();
       unsubVendors();
       unsubBills();
       unsubVendorPayments();
    };
  }, [user]);


  const unsubJournal = onSnapshot(
  query(
    collection(db, "artifacts", appId, "public", "data", "journalEntries"),
    orderBy("createdAt", "desc"),
    limit(50)
  ),
  (snap) => {
    setJournalEntries(snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) })));
  }
);



const unsubAccounts = onSnapshot(
  query(
    collection(db, "artifacts", appId, "public", "data", "accounts"),
    orderBy("code", "asc")
  ),
  (snap) => {
    setAccounts(snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) })));
  }
);



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



useEffect(() => {
  if (!user) return;

  const ensureFinance = async () => {
    const ref = doc(db, ...financeDocPath);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      await setDoc(ref, {
        cashDiscountPercent: 0,
        taxPercent: 0,
        updatedAt: Date.now(),
      });
      return;
    }

    const data = snap.data() || {};
    if (typeof data.cashDiscountPercent !== "number" || typeof data.taxPercent !== "number") {
      await setDoc(
        ref,
        {
          cashDiscountPercent: Number(data.cashDiscountPercent || 0),
          taxPercent: Number(data.taxPercent || 0),
          updatedAt: Date.now(),
        },
        { merge: true }
      );
    }
  };

  ensureFinance();
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



useEffect(() => {
  if (!user) return;

  const unsub = onSnapshot(doc(db, ...financeDocPath), (snap) => {
    if (!snap.exists()) return;
    const d = snap.data() || {};
    setCashDiscountPercent(Number(d.cashDiscountPercent || 0));
    setTaxPercent(Number(d.taxPercent || 0));
  });

  return () => unsub();
}, [user]);


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


  const cashFlow = useMemo(
  () =>
    getCashFlow(journalEntries, {
      cash: accSettings?.accounts?.cash || "cash",
      bank: accSettings?.accounts?.bank || "bank",
    }),
  [journalEntries, accSettings]
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

 const listToShow = ordersTab === "active" ? activeOrders : oldOrders;


 const financeData = useMemo(() => {
  const filteredOrders = (orders || []).filter((o) => {
    const d = orderDateToJS(o);
    if (!d) return false;

    const ymd = d.toISOString().slice(0, 10);

    if (financeMode === "daily") return ymd === finDate;
    if (finFrom && ymd < finFrom) return false;
    if (finTo && ymd > finTo) return false;
    return true;
  });

  const soldMap = new Map();

  filteredOrders.forEach((o) => {
    (o.items || []).forEach((it) => {
      const q = Number(it.quantity || 1);
      soldMap.set(it.id, (soldMap.get(it.id) || 0) + q);
    });
  });

  const rows = menuItems.map((m) => {
    const soldQty = soldMap.get(m.id) || 0;
    const cost = Number(m.cost || 0);
    const sell = Number(m.price || 0);

    return {
      id: m.id,
      name: m.nameAr || m.nameEn || m.name,
      cost,
      sell,
      soldQty,
      netOne: sell - cost,
      netTotal: (sell - cost) * soldQty,
    };
  });

  return {
    rows,
    totalNet: rows.reduce((s, r) => s + r.netTotal, 0),
  };
}, [orders, menuItems, financeMode, finDate, finFrom, finTo]);

const financeWithInventory = useMemo(() => {
  // ✅ فلترة الطلبات حسب التاريخ + (اختياري) حسب الحالة
  const filteredOrders = (orders || []).filter((o) => {
    if (!inFinanceRange(o)) return false;

    // ✅ اختياري: احسب فقط الطلبات المحضّرة
    // لو تبغاه يحسب كل الطلبات شيل الشرط هذا
    if (o.status !== "prepared") return false;

    return true;
  });

  // مباع لكل منتج
  const soldMap = new Map(); // menuId -> qty
  filteredOrders.forEach((o) => {
    (o.items || []).forEach((it) => {
      const q = Number(it.quantity || 1);
      soldMap.set(it.id, (soldMap.get(it.id) || 0) + q);
    });
  });

  // خرائط للمخزون
  const invMap = new Map(inventory.map((x) => [x.id, x])); // invId -> invObj

  // ✅ إجمالي الاستهلاك لكل عنصر مخزون عبر كل المنتجات
  const invUsageTotalMap = new Map(); // invId -> usedQty

  // صفوف المنتجات (مع استهلاك المخزون لكل منتج)
  const rows = menuItems.map((m) => {
    const soldQty = soldMap.get(m.id) || 0;
    const cost = Number(m.cost || 0);
    const sell = Number(m.price || 0);

    const recipe = Array.isArray(m.recipe) ? m.recipe : [];

    // استهلاك المخزون لهذا المنتج
    const usage = recipe
      .map((ing) => {
        const invId = ing.invId;
        const needForOne = Number(ing.amountPerOne || 0);
        if (!invId || needForOne <= 0 || soldQty <= 0) return null;

        const inv = invMap.get(invId);
        if (!inv || inv.unit === "none") return null;

        const used = needForOne * soldQty; // ✅ الاستهلاك = لكل 1 * المباع
        invUsageTotalMap.set(invId, (invUsageTotalMap.get(invId) || 0) + used);

        return {
          invId,
          invName: inv.name || invId,
          unit: inv.unit,       // g / ml / piece
          used,
          perOne: needForOne,
        };
      })
      .filter(Boolean);

    return {
      id: m.id,
      name: m.nameAr || m.nameEn || m.nameTr || m.name || m.id,
      cost,
      sell,
      soldQty,
      netOne: sell - cost,
      netTotal: (sell - cost) * soldQty,
      usage, // ✅ تفاصيل الاستهلاك لهذا المنتج
    };
  });

  // ✅ جدول إجمالي استهلاك المخزون
  const invRows = Array.from(invUsageTotalMap.entries())
    .map(([invId, used]) => {
      const inv = invMap.get(invId) || {};
      return {
        invId,
        name: inv.name || invId,
        unit: inv.unit || "-",
        used: Number(used || 0),
        currentQty: inv.unit === "none" ? "" : Number(inv.quantity || 0),
      };
    })
    .sort((a, b) => (b.used || 0) - (a.used || 0));

  return {
    rows,
    invRows,
    totalNet: rows.reduce((s, r) => s + Number(r.netTotal || 0), 0),
  };
}, [orders, menuItems, inventory, financeMode, finDate, finFrom, finTo]);


const balances = useMemo(
  () => getAccountBalances(journalEntries),
  [journalEntries]
);

const assets = [
  { id: accSettings?.accounts?.cash || "cash", name: "Cash / صندوق" },
  { id: accSettings?.accounts?.bank || "bank", name: "Bank / بنك" },
  { id: accSettings?.accounts?.ar || "ar", name: "Accounts Receivable / عملاء" },
];

const liabilities = [
  { id: accSettings?.accounts?.ap || "ap", name: "Accounts Payable / موردين" },
  { id: accSettings?.accounts?.vatOutput || "vat_output", name: "VAT Output / ضريبة" },
];

const totalAssets = assets.reduce(
  (s, a) => s + Math.max(0, balances[a.id] || 0),
  0
);

const totalLiabilities = liabilities.reduce(
  (s, l) => s + Math.max(0, -(balances[l.id] || 0)),
  0
);

const equity = totalAssets - totalLiabilities;



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

     const nextInvoiceNumber = async () => {
  const counterRef = doc(db, "artifacts", appId, "public", "data", "counters", "invoices");
  const year = new Date().getFullYear();

  const result = await runTransaction(db, async (tx) => {
    const snap = await tx.get(counterRef);
    const data = snap.exists() ? snap.data() : {};
    const currYear = data.year || year;
    let seq = Number(data.seq || 0);

    // لو سنة جديدة نرجّع العدّاد
    if (currYear !== year) seq = 0;

    seq += 1;

    tx.set(counterRef, { year, seq }, { merge: true });

    const num = `INV-${year}-${String(seq).padStart(4, "0")}`;
    return num;
  });

  return result;
};



const nextBillNumber = async () => {
  const counterRef = doc(db, "artifacts", appId, "public", "data", "counters", "bills");
  const year = new Date().getFullYear();

  const result = await runTransaction(db, async (tx) => {
    const snap = await tx.get(counterRef);
    const data = snap.exists() ? snap.data() : {};
    const currYear = data.year || year;
    let seq = Number(data.seq || 0);

    if (currYear !== year) seq = 0;
    seq += 1;

    tx.set(counterRef, { year, seq }, { merge: true });

    return `BILL-${year}-${String(seq).padStart(4, "0")}`;
  });

  return result;
};



const createInvoiceDraft = async ({ customerName = "", items = [] } = {}) => {
  const invoiceNumber = await nextInvoiceNumber();

  const subtotal = (items || []).reduce(
    (s, it) => s + Number(it.price || 0) * Number(it.qty || 0),
    0
  );

  const tax = 0; // لاحقًا نخليها من VAT
  const total = subtotal + tax;

  const docData = {
  invoiceNumber,
  status: "draft",

  // 👇 هذا السطر الجديد
  customerId: null,

  // هذا موجود عندك، خليه
  customerName: customerName || "",

  items,
  subtotal,
  taxAmount: tax,
  total,
  createdAt: Date.now(),
  paidAt: null,
  accountingPosted: false,
  accountingPostedAt: null,
};


  const ref = await addDoc(
    collection(db, "artifacts", appId, "public", "data", "invoices"),
    docData
  );

  return ref.id;
};


const saveAccSettings = async () => {
  await setDoc(
    doc(db, "artifacts", appId, "public", "data", "settings", "accounting"),
    accSettings,
    { merge: true }
  );
  alert("تم حفظ إعدادات المحاسبة");
};





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

      // ✅ بعد نجاح Transaction (خصم المخزون + تحديث الطلب)
const orderRefAfter = doc(db, "artifacts", appId, "public", "data", "orders", orderId);
const snap = await getDoc(orderRefAfter);
if (!snap.exists()) return;

const fresh = { ...(snap.data() || {}), id: orderId };

// ✅ منع الترحيل المحاسبي مرتين
if (!fresh.accountingPosted) {
  await postSalesEntryForOrder(fresh);

  await updateDoc(orderRefAfter, {
    accountingPosted: true,
    accountingPostedAt: Date.now(),
  });
}


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

    const taxP = Math.min(100, Math.max(0, Number(taxPercent || 0)));
const taxAmount = (total * taxP) / 100;
const totalWithTax = total + taxAmount;



    

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

      // ✅ الضريبة
  taxPercent: taxP,
  taxAmount,
  totalWithTax,

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



const downloadCSV = (filename, rows) => {
  const csv = rows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
};

const exportInventoryCSV = () => {
  const rows = [
    ["المادة", "الاستخدام", "الوحدة", "المتبقي"],
    ...financeWithInventory.invRows.map(i => [
      i.name,
      i.used,
      i.unit,
      i.currentQty,
    ])
  ];
  downloadCSV("inventory_usage.csv", rows);
};

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
  <span className="text-sm font-black text-slate-700">خصم الكاش %</span>
  <input
    type="number"
    min="0"
    max="100"
    value={cashDiscountPercent}
    onChange={async (e) => {
      const v = Math.min(100, Math.max(0, Number(e.target.value || 0)));
      setCashDiscountPercent(v);
      await setDoc(doc(db, ...financeDocPath), { cashDiscountPercent: v, updatedAt: Date.now() }, { merge: true });
    }}
    className="w-20 p-2 rounded-lg border text-center font-black"
  />
</div>

<div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl">
  <span className="text-sm font-black text-slate-700">{admT.taxPercent || "Tax %"}</span>
  <input
    type="number"
    min="0"
    max="100"
    value={taxPercent}
    onChange={async (e) => {
      const v = Math.min(100, Math.max(0, Number(e.target.value || 0)));
      setTaxPercent(v);
      await setDoc(doc(db, ...financeDocPath), { taxPercent: v, updatedAt: Date.now() }, { merge: true });
    }}
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

        <button
  onClick={() => setAdminPage("finance")}
  className={`w-full mt-3 px-4 py-3 rounded-2xl font-black text-right ${
    adminPage === "finance"
      ? "bg-slate-950 text-white"
      : "bg-slate-50 text-slate-700"
  }`}
>
  💰 الإيرادات والإخراجات
</button>


<button
  onClick={() => setAdminPage("accounting")}
  className={`w-full mt-3 px-4 py-3 rounded-2xl font-black text-right ${
    adminPage === "accounting"
      ? "bg-slate-950 text-white"
      : "bg-slate-50 text-slate-700"
  }`}
>
  📘 المحاسبة (قيود يومية)
</button>


<button
  onClick={() => setAdminPage("reports")}
  className={`w-full mt-3 px-4 py-3 rounded-2xl font-black text-right ${
    adminPage === "reports"
      ? "bg-slate-950 text-white"
      : "bg-slate-50 text-slate-700"
  }`}
>
  📊 التقارير
</button>


<button
  onClick={() => setAdminPage("balanceSheet")}
  className={`w-full mt-3 px-4 py-3 rounded-2xl font-black text-right ${
    adminPage === "balanceSheet"
      ? "bg-slate-950 text-white"
      : "bg-slate-50 text-slate-700"
  }`}
>
  📊 الميزانية العمومية
</button>


<button
  onClick={() => setAdminPage("cashFlow")}
  className={`w-full mt-3 px-4 py-3 rounded-2xl font-black text-right ${
    adminPage === "cashFlow"
      ? "bg-slate-950 text-white"
      : "bg-slate-50 text-slate-700"
  }`}
>
  💧 التدفقات النقدية
</button>




<button
  onClick={() => setAdminPage("invoices")}
  className={`w-full mt-3 px-4 py-3 rounded-2xl font-black text-right ${
    adminPage === "invoices"
      ? "bg-slate-950 text-white"
      : "bg-slate-50 text-slate-700"
  }`}
>
  🧾 الفواتير
</button>


<button
  onClick={() => setAdminPage("customers")}
  className={`w-full mt-3 px-4 py-3 rounded-2xl font-black text-right ${
    adminPage === "customers"
      ? "bg-slate-950 text-white"
      : "bg-slate-50 text-slate-700"
  }`}
>
  👥 العملاء
</button>


<button
  onClick={() => setAdminPage("vendors")}
  className={`w-full mt-3 px-4 py-3 rounded-2xl font-black text-right ${
    adminPage === "vendors"
      ? "bg-slate-950 text-white"
      : "bg-slate-50 text-slate-700"
  }`}
>
  🏭 الموردون
</button>


<button
  onClick={() => setAdminPage("bills")}
  className={`w-full mt-3 px-4 py-3 rounded-2xl font-black text-right ${
    adminPage === "bills"
      ? "bg-slate-950 text-white"
      : "bg-slate-50 text-slate-700"
  }`}
>
  🧾 فواتير المشتريات
</button>


<button
  onClick={() => setAdminPage("vendorPayments")}
  className={`w-full mt-3 px-4 py-3 rounded-2xl font-black text-right ${
    adminPage === "vendorPayments"
      ? "bg-slate-950 text-white"
      : "bg-slate-50 text-slate-700"
  }`}
>
  💸 سندات صرف الموردين
</button>






<button
  onClick={() => setAdminPage("settings")}
  className={`w-full mt-3 px-4 py-3 rounded-2xl font-black text-right ${
    adminPage === "settings"
      ? "bg-slate-950 text-white"
      : "bg-slate-50 text-slate-700"
  }`}
>
  ⚙️ إعدادات المحاسبة
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
                  cost: 0,            // ✅ جديد
  recipe: [],         // ✅ جديد: [{invId, invName, qty}]
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

    {/* ✅ فلتر الطلبات القديمة (دائماً ظاهر حتى لو لا يوجد طلبات) */}
    {ordersTab === "old" && (
      <div className="bg-white border rounded-2xl p-4">
        <div className="font-black mb-3">فلترة الطلبات حسب التاريخ</div>

        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <div className="text-xs font-bold text-slate-500">من تاريخ</div>
            <input
              type="date"
              value={oldFrom}
              onChange={(e) => {
                setOldFrom(e.target.value);
                setOldFilterError("");
              }}
              className="border rounded-xl px-3 py-2"
            />
          </div>

          <div>
            <div className="text-xs font-bold text-slate-500">إلى تاريخ</div>
            <input
              type="date"
              value={oldTo}
              onChange={(e) => {
                setOldTo(e.target.value);
                setOldFilterError("");
              }}
              className="border rounded-xl px-3 py-2"
            />
          </div>

          <button
            type="button"
            onClick={applyOldOrdersFilter}
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
              setOldFilterError("");
            }}
            className="bg-slate-200 px-5 py-3 rounded-2xl font-black"
          >
            إلغاء
          </button>
        </div>

        {/* رسالة خطأ التاريخ */}
        {oldFilterError && (
          <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 font-black">
            {oldFilterError}
          </div>
        )}
      </div>
    )}

    {/* ✅ الآن عرض الطلبات أو رسالة فارغة */}
    {listToShow.length === 0 ? (
      <div className="p-5 rounded-2xl bg-white border font-bold text-slate-500">
        لا يوجد طلبات هنا
      </div>
    ) : (
      <div className="space-y-3">
        {listToShow.map((o) => (
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

              <div className="font-black text-slate-900 text-right space-y-1">

  {/* قبل الخصم / بعد الخصم */}
  {Number(o.discountPercent || 0) > 0 ? (
    <>
      <div className="text-sm text-slate-500 font-black">
        قبل الخصم: {Number(o.subtotal || 0).toFixed(2)} TL
      </div>

      <div className="text-sm text-orange-600 font-black">
        خصم ({Number(o.discountPercent || 0)}%): -
        {Number(o.discountAmount || 0).toFixed(2)} TL
      </div>

      <div className="text-sm font-black">
        بعد الخصم: {Number(o.total || 0).toFixed(2)} TL
      </div>
    </>
  ) : (
    <div className="text-sm font-black">
      قبل الضريبة: {Number(o.total || 0).toFixed(2)} TL
    </div>
  )}

  {/* ✅ الضريبة (مستقلة عن الخصم) */}
  {Number(o.taxPercent || 0) > 0 && (
    <>
      <div className="text-sm text-blue-700 font-black">
        ضريبة ({Number(o.taxPercent || 0)}%):
        {Number(o.taxAmount || 0).toFixed(2)} TL
      </div>

      <div className="text-lg font-black text-slate-900">
        الإجمالي بعد الضريبة:
        {Number(o.totalWithTax || (Number(o.total || 0) + Number(o.taxAmount || 0))).toFixed(2)} TL
      </div>
    </>
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


      {adminPage === "finance" && (
  <div className="space-y-6">

<button
  onClick={exportInventoryCSV}
  className="bg-emerald-600 text-white px-5 py-3 rounded-xl font-black"
>
  تصدير المخزون إلى Excel
</button>

    
    <div className="bg-white p-4 rounded-2xl border">
  <h3 className="font-black mb-3">📦 إجمالي استخدام المخزون</h3>

  <table className="w-full">
    <thead>
      <tr>
        <th>المادة</th>
        <th>الاستخدام</th>
        <th>الوحدة</th>
        <th>المتبقي</th>
      </tr>
    </thead>
    <tbody>
      {financeWithInventory.invRows.map((i) => (
        <tr key={i.invId}>
          <td className="font-black">{i.name}</td>
          <td>{i.used}</td>
          <td>{i.unit}</td>
          <td>{i.currentQty}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

    <h2 className="text-xl font-black">💰 الإيرادات والإخراجات</h2>

    {/* الفلتر */}
    <div className="bg-white p-4 rounded-2xl border flex gap-3 flex-wrap">
      <button
        onClick={() => setFinanceMode("daily")}
        className={`px-4 py-2 rounded-xl font-black ${
          financeMode === "daily" ? "bg-black text-white" : "bg-slate-100"
        }`}
      >
        يومي
      </button>

      <button
        onClick={() => setFinanceMode("range")}
        className={`px-4 py-2 rounded-xl font-black ${
          financeMode === "range" ? "bg-black text-white" : "bg-slate-100"
        }`}
      >
        فترة
      </button>

      {financeMode === "daily" ? (
        <input
          type="date"
          value={finDate}
          onChange={(e) => setFinDate(e.target.value)}
          className="border rounded-xl px-3 py-2"
        />
      ) : (
        <>
          <input
            type="date"
            value={finFrom}
            onChange={(e) => setFinFrom(e.target.value)}
            className="border rounded-xl px-3 py-2"
          />
          <input
            type="date"
            value={finTo}
            onChange={(e) => setFinTo(e.target.value)}
            className="border rounded-xl px-3 py-2"
          />
        </>
      )}
    </div>

    {/* الإجمالي */}
    <div className="bg-white p-4 rounded-2xl border font-black text-emerald-700 text-xl">
      صافي الربح: {financeData.totalNet.toFixed(2)} TL
    </div>

    {/* الجدول */}
    <div className="bg-white p-4 rounded-2xl border overflow-x-auto">
  <table className="min-w-[1100px] w-full">
    <thead>
      <tr>
        <th>المنتج</th>
        <th>التكلفة</th>
        <th>البيع</th>
        <th>المباع</th>
        <th>استهلاك المخزون</th> {/* ✅ جديد */}
        <th>صافي الربح الاجمالي</th>
      </tr>
    </thead>
    <tbody>
      {financeWithInventory.rows.map((r) => (
        <tr key={r.id} className="border-t align-top">
          <td className="font-black">{r.name}</td>
          <td>{r.cost}</td>
          <td>{r.sell}</td>
          <td>{r.soldQty}</td>

          {/* ✅ الاستهلاك لكل منتج */}
          <td className="text-sm">
            {(!r.usage || r.usage.length === 0) ? (
              <span className="text-slate-400 font-bold">-</span>
            ) : (
              <div className="space-y-1">
                {r.usage.map((u) => (
                  <div key={u.invId} className="font-bold text-slate-700">
                    • {u.invName}: {u.used} {u.unit}
                  </div>
                ))}
              </div>
            )}
          </td>

          <td className="text-emerald-700 font-black">
            {Number(r.netTotal || 0).toFixed(2)}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
  </div>
)}



{adminPage === "accounting" && (
  <div className="space-y-6">
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-xl font-black">📘 المحاسبة</h2>
      <div className="text-sm font-bold text-slate-500">
        آخر القيود: {journalEntries.length}
      </div>
    </div>

    <div className="bg-white p-4 rounded-2xl border">
      <div className="font-black mb-3">قيود اليومية</div>

      <button
  onClick={() => exportJournalPDF()}
  className="px-5 py-3 rounded-2xl bg-slate-950 text-white font-black"
>
  🧾 تصدير PDF (قيود اليومية)
</button>


      {journalEntries.length === 0 ? (
        <div className="text-sm text-slate-500 font-bold">
          لا يوجد قيود بعد. جرّب “تم التحضير” لطلب جديد.
        </div>
      ) : (
        <div className="overflow-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="text-sm text-slate-500">
                <th className="text-right p-2">التاريخ</th>
                <th className="text-right p-2">الوصف</th>
                <th className="text-right p-2">المرجع</th>
                <th className="text-right p-2">الإجمالي</th>
                <th className="text-right p-2">بنود</th>
              </tr>
            </thead>
            <tbody>
              {journalEntries.map((j) => {
  const total = Number(j.totalDebit || 0);
  const linesCount = Array.isArray(j.lines) ? j.lines.length : 0;

  return (
    <React.Fragment key={j.id}>
      {/* صف القيد */}
      <tr
        className="border-t cursor-pointer hover:bg-slate-50"
        onClick={() =>
          setOpenJournalId((p) => (p === j.id ? null : j.id))
        }
      >
        <td className="p-2 font-bold">{j.date || "-"}</td>

        <td className="p-2 font-bold">
          طلب بيع <span dir="ltr">{j.refText}</span>
        </td>

        <td className="p-2 text-sm text-slate-600 font-bold">
          <span className="opacity-70">order</span>{" "}
          <span dir="ltr" className="font-mono">#{j.refId}</span>
        </td>

        <td className="p-2 font-black">
          {Number.isFinite(total) ? total.toFixed(2) : "0.00"} {CURRENCY}
        </td>

        <td className="p-2 text-sm text-slate-600 font-bold">
          {linesCount} بند
        </td>
      </tr>

      {/* 🔽 تفاصيل القيد */}
      {openJournalId === j.id && (
        <tr className="bg-slate-50">
          <td colSpan={5} className="p-3">
            <div className="font-black mb-2">تفاصيل القيد</div>

            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500">
                  <th className="text-right p-2">الحساب</th>
                  <th className="text-right p-2">مدين</th>
                  <th className="text-right p-2">دائن</th>
                </tr>
              </thead>
              <tbody>
                {(j.lines || []).map((l, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="p-2 font-bold">
                      {getAccLabel(l.accountId, accSettings, lang)}
                    </td>
                    <td className="p-2 font-black" dir="ltr">
                      {Number(l.debit || 0).toFixed(2)}
                    </td>
                    <td className="p-2 font-black" dir="ltr">
                      {Number(l.credit || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </td>
        </tr>
      )}
    </React.Fragment>
  );
})}

            </tbody>
          </table>
        </div>
      )}
    </div>
  </div>
)}

{adminPage === "reports" && (
  <div className="space-y-6">
    <h2 className="text-xl font-black">📊 التقارير</h2>

    <div className="bg-white p-4 rounded-2xl border">
      <div className="font-black mb-2">تقارير المبيعات والضريبة</div>
      <div className="text-sm text-slate-500 font-bold">
        (قريبًا: تقرير يومي/شهري + VAT + ميزان مراجعة)
      </div>
    </div>
  </div>
)}



{adminPage === "reports" && (
  <ReportsPanel
  journalEntries={journalEntries}
  CURRENCY={CURRENCY}
  accSettings={accSettings}
  accounts={accounts}
  lang={lang}
/>

)}

{adminPage === "invoices" && (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-black">🧾 الفواتير</h2>

      <button
        onClick={async () => {
          const id = await createInvoiceDraft({ customerName: "" , items: []});
          alert("تم إنشاء فاتورة مسودة ✅");
          // لو تبي: افتحها مباشرة
        }}
        className="px-5 py-3 rounded-2xl bg-emerald-600 text-white font-black"
      >
        + فاتورة جديدة
      </button>
    </div>

    <div className="bg-white p-4 rounded-2xl border">
      <div className="font-black mb-3">قائمة الفواتير</div>

      {invoices.length === 0 ? (
        <div className="text-sm text-slate-500 font-bold">لا يوجد فواتير بعد.</div>
      ) : (
        <div className="overflow-auto">

          <div className="text-xs text-slate-500 font-bold mb-2" dir="ltr">
  customers: {customers?.length || 0}
</div>

          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="text-sm text-slate-500">
                <th className="text-right p-2">رقم</th>
                <th className="text-right p-2">العميل</th>
                <th className="text-right p-2">الحالة</th>
                <th className="text-right p-2">الإجمالي</th>
                <th className="text-right p-2">تاريخ</th>
                <th className="text-right p-2">إجراء</th>

              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-t">
                  <td className="p-2 font-black" dir="ltr">{inv.invoiceNumber}</td>
                  <td className="p-2">
  <select
    className="w-full border rounded-xl px-3 py-2 font-bold"
    value={inv.customerId || ""}
    onChange={async (e) => {
      const cid = e.target.value;
      const c = customers.find((x) => x.id === cid);

      await updateDoc(
        doc(db, "artifacts", appId, "public", "data", "invoices", inv.id),
        {
          customerId: cid || null,
          customerName: c?.name || "",
        }
      );
    }}
  >
    <option value="">— بدون عميل —</option>
    {customers.map((c) => (
      <option key={c.id} value={c.id}>
        {c.name}
      </option>
    ))}
  </select>
</td>


                  <td className="p-2 font-bold">{inv.status}</td>
                  <td className="p-2 font-black">
                    {Number(inv.total || 0).toFixed(2)} {CURRENCY}
                  </td>
                  <td className="p-2 font-bold">
                    {inv.createdAt ? new Date(inv.createdAt).toISOString().slice(0,10) : "-"}
                  </td>
                  <td className="p-2">
  {inv.status !== "paid" ? (
    <button
      onClick={async () => {
        if (inv.accountingPosted) return alert("تم ترحيلها سابقًا ✅");

        await postSalesEntryForInvoice({ ...inv, id: inv.id });

        await updateDoc(
          doc(db, "artifacts", appId, "public", "data", "invoices", inv.id),
          {
            status: "paid",
            paidAt: Date.now(),
            accountingPosted: true,
            accountingPostedAt: Date.now(),
          }
        );

        alert("تم دفع الفاتورة وترحيلها محاسبيًا ✅");
      }}
      className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-black"
    >
      Paid
    </button>
  ) : (
    <span className="text-xs font-black text-emerald-700">مدفوعة</span>
  )}
</td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </div>
)}


{adminPage === "customers" && (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-black">👥 العملاء</h2>

      <button
        onClick={() =>
          setEditingCustomer({
            name: "",
            phone: "",
            taxNo: "",
            address: "",
            active: true,
          })
        }
        className="px-5 py-3 rounded-2xl bg-emerald-600 text-white font-black"
      >
        + عميل جديد
      </button>
    </div>

    {/* نموذج إضافة/تعديل عميل */}
    {editingCustomer && (
      <div className="bg-white p-4 rounded-2xl border space-y-3">
        <div className="font-black">بيانات العميل</div>

        <input
          className="w-full border rounded-xl px-4 py-3 font-bold"
          placeholder="اسم العميل"
          value={editingCustomer.name}
          onChange={(e) => setEditingCustomer((p) => ({ ...p, name: e.target.value }))}
        />

        <input
          className="w-full border rounded-xl px-4 py-3 font-bold"
          placeholder="الهاتف"
          value={editingCustomer.phone}
          onChange={(e) => setEditingCustomer((p) => ({ ...p, phone: e.target.value }))}
          dir="ltr"
        />

        <input
          className="w-full border rounded-xl px-4 py-3 font-bold"
          placeholder="الرقم الضريبي (اختياري)"
          value={editingCustomer.taxNo}
          onChange={(e) => setEditingCustomer((p) => ({ ...p, taxNo: e.target.value }))}
          dir="ltr"
        />

        <textarea
          className="w-full border rounded-xl px-4 py-3 font-bold"
          placeholder="العنوان (اختياري)"
          value={editingCustomer.address}
          onChange={(e) => setEditingCustomer((p) => ({ ...p, address: e.target.value }))}
          rows={3}
        />

        <div className="flex gap-2">
          <button
            onClick={async () => {
              const data = {
                ...editingCustomer,
                name: String(editingCustomer.name || "").trim(),
              };
              if (!data.name) return alert("اكتب اسم العميل");

              if (data.id) {
                await updateDoc(
                  doc(db, "artifacts", appId, "public", "data", "customers", data.id),
                  data
                );
              } else {
                await addDoc(
                  collection(db, "artifacts", appId, "public", "data", "customers"),
                  { ...data, createdAt: Date.now() }
                );
              }
              setEditingCustomer(null);
            }}
            className="px-5 py-3 rounded-2xl bg-slate-950 text-white font-black"
          >
            حفظ
          </button>

          <button
            onClick={() => setEditingCustomer(null)}
            className="px-5 py-3 rounded-2xl bg-slate-100 text-slate-700 font-black"
          >
            إلغاء
          </button>
        </div>
      </div>
    )}

    {/* جدول العملاء */}
    <div className="bg-white p-4 rounded-2xl border">
      <div className="font-black mb-3">قائمة العملاء</div>

      {customers.length === 0 ? (
        <div className="text-sm text-slate-500 font-bold">لا يوجد عملاء بعد.</div>
      ) : (
        <div className="overflow-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="text-sm text-slate-500">
                <th className="text-right p-2">الاسم</th>
                <th className="text-right p-2">الهاتف</th>
                <th className="text-right p-2">الضريبي</th>
                <th className="text-right p-2">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="p-2 font-black">{c.name}</td>
                  <td className="p-2 font-bold" dir="ltr">{c.phone || "-"}</td>
                  <td className="p-2 font-bold" dir="ltr">{c.taxNo || "-"}</td>
                  <td className="p-2">
                    <button
                      onClick={() => setEditingCustomer({ ...c, id: c.id })}
                      className="px-4 py-2 rounded-xl bg-slate-950 text-white font-black"
                    >
                      تعديل
                    </button>

                    <button
  onClick={() => {
    setSelectedCustomerId(c.id);
    setAdminPage("customer_ledger");
  }}
  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-black mr-2"
>
  كشف حساب
</button>


<button
  onClick={() => setAdminPage("customer_ledger")}
  className={`w-full mt-3 px-4 py-3 rounded-2xl font-black text-right ${
    adminPage === "customer_ledger"
      ? "bg-slate-950 text-white"
      : "bg-slate-50 text-slate-700"
  }`}
>
  📒 كشف حساب عميل
</button>


<button
  onClick={() => setAdminPage("receipts")}
  className={`w-full mt-3 px-4 py-3 rounded-2xl font-black text-right ${
    adminPage === "receipts"
      ? "bg-slate-950 text-white"
      : "bg-slate-50 text-slate-700"
  }`}
>
  💵 سندات القبض
</button>


                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </div>
)}





{adminPage === "vendors" && (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-black">🏭 الموردون</h2>

      <button
        onClick={() =>
          setEditingVendor({
            name: "",
            phone: "",
            taxNo: "",
            address: "",
            active: true,
          })
        }
        className="px-5 py-3 rounded-2xl bg-emerald-600 text-white font-black"
      >
        + مورد جديد
      </button>
    </div>

    {editingVendor && (
      <div className="bg-white p-4 rounded-2xl border space-y-3">
        <input
          className="w-full border rounded-xl px-4 py-3 font-bold"
          placeholder="اسم المورد"
          value={editingVendor.name}
          onChange={(e) => setEditingVendor((p) => ({ ...p, name: e.target.value }))}
        />

        <input
          className="w-full border rounded-xl px-4 py-3 font-bold"
          placeholder="الهاتف"
          value={editingVendor.phone}
          onChange={(e) => setEditingVendor((p) => ({ ...p, phone: e.target.value }))}
          dir="ltr"
        />

        <button
          onClick={async () => {
            if (!editingVendor.name) return alert("اكتب اسم المورد");

            if (editingVendor.id) {
              await updateDoc(
                doc(db, "artifacts", appId, "public", "data", "vendors", editingVendor.id),
                editingVendor
              );
            } else {
              await addDoc(
                collection(db, "artifacts", appId, "public", "data", "vendors"),
                { ...editingVendor, createdAt: Date.now() }
              );
            }
            setEditingVendor(null);
          }}
          className="px-5 py-3 rounded-2xl bg-slate-950 text-white font-black"
        >
          حفظ
        </button>
      </div>
    )}

    <div className="bg-white p-4 rounded-2xl border">
      <div className="font-black mb-3">قائمة الموردين</div>

      <table className="w-full">
        <thead>
          <tr className="text-sm text-slate-500">
            <th className="text-right p-2">الاسم</th>
            <th className="text-right p-2">الهاتف</th>
          </tr>
        </thead>
        <tbody>
          {vendors.map((v) => (
            <tr key={v.id} className="border-t">
              <td className="p-2 font-black">{v.name}</td>
              <td className="p-2 font-bold" dir="ltr">{v.phone || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}


{adminPage === "bills" && (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-black">🧾 فواتير المشتريات</h2>

      <button
        onClick={async () => {
          const billNumber = await nextBillNumber();

          await addDoc(
            collection(db, "artifacts", appId, "public", "data", "bills"),
            {
              billNumber,
              status: "draft", // draft | approved | paid | void
              vendorId: null,
              vendorName: "",
              date: new Date().toISOString().slice(0, 10),
              total: 0,
              expenseAccountId: "expense",
              createdAt: Date.now(),
              accountingPosted: false,
              accountingPostedAt: null,
            }
          );

          alert("تم إنشاء فاتورة مشتريات مسودة ✅");
        }}
        className="px-5 py-3 rounded-2xl bg-emerald-600 text-white font-black"
      >
        + فاتورة مشتريات جديدة
      </button>
    </div>

    <div className="bg-white p-4 rounded-2xl border">
      <div className="font-black mb-3">قائمة فواتير المشتريات</div>

      {bills.length === 0 ? (
        <div className="text-sm text-slate-500 font-bold">لا يوجد فواتير مشتريات بعد.</div>
      ) : (
        <div className="overflow-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="text-sm text-slate-500">
                <th className="text-right p-2">الرقم</th>
                <th className="text-right p-2">المورد</th>
                <th className="text-right p-2">التاريخ</th>
                <th className="text-right p-2">الإجمالي</th>
                <th className="text-right p-2">الحالة</th>
                <th className="text-right p-2">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((b) => (
                <tr key={b.id} className="border-t">
                  <td className="p-2 font-black" dir="ltr">{b.billNumber}</td>

                  <td className="p-2">
                    <select
                      className="w-full border rounded-xl px-3 py-2 font-bold"
                      value={b.vendorId || ""}
                      onChange={async (e) => {
                        const vid = e.target.value;
                        const v = vendors.find((x) => x.id === vid);
                        await updateDoc(
                          doc(db, "artifacts", appId, "public", "data", "bills", b.id),
                          { vendorId: vid || null, vendorName: v?.name || "" }
                        );
                      }}
                    >
                      <option value="">— بدون مورد —</option>
                      {vendors.map((v) => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                    </select>
                  </td>

                  <td className="p-2">
                    <input
                      type="date"
                      className="border rounded-xl px-3 py-2 font-bold"
                      value={b.date || ""}
                      onChange={async (e) => {
                        await updateDoc(
                          doc(db, "artifacts", appId, "public", "data", "bills", b.id),
                          { date: e.target.value }
                        );
                      }}
                      dir="ltr"
                    />
                  </td>

                  <td className="p-2">
                    <input
                      className="border rounded-xl px-3 py-2 font-bold w-40"
                      value={b.total ?? 0}
                      onChange={async (e) => {
                        const val = Number(e.target.value || 0);
                        await updateDoc(
                          doc(db, "artifacts", appId, "public", "data", "bills", b.id),
                          { total: val }
                        );
                      }}
                      dir="ltr"
                    />
                  </td>

                  <td className="p-2 font-bold">{b.status}</td>

                  <td className="p-2">
                    {b.status === "draft" && (
                      <button
                        onClick={async () => {
                          if (b.accountingPosted) return alert("تم ترحيلها سابقًا");
                          if (!b.total || Number(b.total) <= 0) return alert("ضع إجمالي صحيح");
                          await postBillEntry({ ...b, id: b.id });

                          await updateDoc(
                            doc(db, "artifacts", appId, "public", "data", "bills", b.id),
                            {
                              status: "approved",
                              accountingPosted: true,
                              accountingPostedAt: Date.now(),
                            }
                          );

                          alert("تم اعتماد الفاتورة وترحيلها ✅");
                        }}
                        className="px-4 py-2 rounded-xl bg-slate-950 text-white font-black"
                      >
                        اعتماد (Approve)
                      </button>
                    )}

                    {b.status === "approved" && (
                      <span className="text-xs font-black text-emerald-700">بانتظار السداد</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </div>
)}


{adminPage === "vendorPayments" && (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-black">💸 سندات صرف الموردين</h2>

      <button
        onClick={() =>
          addDoc(
            collection(db, "artifacts", appId, "public", "data", "vendor_payments"),
            {
              vendorId: null,
              vendorName: "",
              amount: 0,
              method: "cash", // cash | bank
              date: new Date().toISOString().slice(0, 10),
              createdAt: Date.now(),
              accountingPosted: false,
            }
          )
        }
        className="px-5 py-3 rounded-2xl bg-emerald-600 text-white font-black"
      >
        + سند صرف جديد
      </button>
    </div>

    <div className="bg-white p-4 rounded-2xl border">
      <table className="w-full min-w-[1000px]">
        <thead>
          <tr className="text-sm text-slate-500">
            <th className="text-right p-2">المورد</th>
            <th className="text-right p-2">المبلغ</th>
            <th className="text-right p-2">الطريقة</th>
            <th className="text-right p-2">التاريخ</th>
            <th className="text-right p-2">إجراء</th>
          </tr>
        </thead>
        <tbody>
          {vendorPayments.map((p) => (
            <tr key={p.id} className="border-t">
              <td className="p-2">
                <select
                  className="w-full border rounded-xl px-3 py-2 font-bold"
                  value={p.vendorId || ""}
                  onChange={async (e) => {
                    const vid = e.target.value;
                    const v = vendors.find((x) => x.id === vid);
                    await updateDoc(
                      doc(db, "artifacts", appId, "public", "data", "vendor_payments", p.id),
                      { vendorId: vid || null, vendorName: v?.name || "" }
                    );
                  }}
                >
                  <option value="">— بدون مورد —</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </td>

              <td className="p-2">
                <input
                  className="border rounded-xl px-3 py-2 font-bold w-40"
                  value={p.amount ?? 0}
                  onChange={async (e) => {
                    const val = Number(e.target.value || 0);
                    await updateDoc(
                      doc(db, "artifacts", appId, "public", "data", "vendor_payments", p.id),
                      { amount: val }
                    );
                  }}
                  dir="ltr"
                />
              </td>

              <td className="p-2">
                <select
                  className="border rounded-xl px-3 py-2 font-bold"
                  value={p.method || "cash"}
                  onChange={async (e) => {
                    await updateDoc(
                      doc(db, "artifacts", appId, "public", "data", "vendor_payments", p.id),
                      { method: e.target.value }
                    );
                  }}
                >
                  <option value="cash">Cash</option>
                  <option value="bank">Bank</option>
                </select>
              </td>

              <td className="p-2">
                <input
                  type="date"
                  className="border rounded-xl px-3 py-2 font-bold"
                  value={p.date || ""}
                  onChange={async (e) => {
                    await updateDoc(
                      doc(db, "artifacts", appId, "public", "data", "vendor_payments", p.id),
                      { date: e.target.value }
                    );
                  }}
                  dir="ltr"
                />
              </td>

              <td className="p-2">
                {!p.accountingPosted && (
                  <button
                    onClick={async () => {
                      if (Number(p.amount || 0) <= 0) return alert("المبلغ غير صحيح");
                      await postVendorPaymentEntry({ ...p, id: p.id });

                      await updateDoc(
                        doc(db, "artifacts", appId, "public", "data", "vendor_payments", p.id),
                        {
                          accountingPosted: true,
                          accountingPostedAt: Date.now(),
                        }
                      );

                      alert("تم ترحيل سند الصرف ✅");
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-950 text-white font-black"
                  >
                    ترحيل
                  </button>
                )}

                {p.accountingPosted && (
                  <span className="text-xs font-black text-emerald-700">مرحّل</span>
                )}
              </td>

              <td className="p-2">
  <button
    onClick={async () => {
      try {
        if (Number(p.amount || 0) <= 0) return alert("المبلغ غير صحيح");

        // لو مرحّل مسبقاً، لا نكرره
        if (p.accountingPosted) return alert("هذا السند مرحّل مسبقًا ✅");

        await postVendorPaymentEntry({ ...p, id: p.id });

        await updateDoc(
          doc(db, "artifacts", appId, "public", "data", "vendor_payments", p.id),
          {
            accountingPosted: true,
            accountingPostedAt: Date.now(),
          }
        );

        alert("تم ترحيل سند الصرف ✅");
      } catch (err) {
        console.error(err);
        alert("فشل الترحيل: " + (err?.message || String(err)));
      }
    }}
    className="px-4 py-2 rounded-xl bg-slate-950 text-white font-black"
  >
    ترحيل
  </button>

  {p.accountingPosted && (
    <div className="text-xs font-black text-emerald-700 mt-2">✅ مرحّل</div>
  )}
</td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}



{adminPage === "balanceSheet" && (
  <div className="space-y-6">
    <h2 className="text-xl font-black">📊 الميزانية العمومية</h2>

    <div className="grid md:grid-cols-2 gap-6">
      {/* الأصول */}
      <div className="bg-white p-4 rounded-2xl border">
        <div className="font-black mb-3">الأصول</div>
        {assets.map((a) => (
          <div key={a.id} className="flex justify-between py-1 font-bold">
            <span>{a.name}</span>
            <span dir="ltr">
              {(balances[a.id] || 0).toFixed(2)}
            </span>
          </div>
        ))}
        <div className="border-t mt-2 pt-2 flex justify-between font-black">
          <span>إجمالي الأصول</span>
          <span dir="ltr">{totalAssets.toFixed(2)}</span>
        </div>
      </div>

      {/* الخصوم وحقوق الملكية */}
      <div className="bg-white p-4 rounded-2xl border">
        <div className="font-black mb-3">الخصوم</div>
        {liabilities.map((l) => (
          <div key={l.id} className="flex justify-between py-1 font-bold">
            <span>{l.name}</span>
            <span dir="ltr">
              {Math.abs(balances[l.id] || 0).toFixed(2)}
            </span>
          </div>
        ))}

        <div className="flex justify-between py-2 font-bold">
          <span>حقوق الملكية</span>
          <span dir="ltr">{equity.toFixed(2)}</span>
        </div>

        <div className="border-t mt-2 pt-2 flex justify-between font-black">
          <span>إجمالي الخصوم + حقوق الملكية</span>
          <span dir="ltr">{(totalLiabilities + equity).toFixed(2)}</span>
        </div>
      </div>
    </div>
  </div>
)}



{adminPage === "cashFlow" && (
  <div className="space-y-6">
    <h2 className="text-xl font-black">💧 قائمة التدفقات النقدية</h2>

    <div className="grid md:grid-cols-3 gap-6">
      <div className="bg-white p-4 rounded-2xl border">
        <div className="font-black mb-2">المتحصلات النقدية</div>
        <div className="text-2xl font-black" dir="ltr">
          {cashFlow.inflow.toFixed(2)}
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border">
        <div className="font-black mb-2">المدفوعات النقدية</div>
        <div className="text-2xl font-black" dir="ltr">
          {cashFlow.outflow.toFixed(2)}
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border">
        <div className="font-black mb-2">صافي التدفق النقدي</div>
        <div
          className={`text-2xl font-black ${
            cashFlow.net >= 0 ? "text-emerald-600" : "text-red-600"
          }`}
          dir="ltr"
        >
          {cashFlow.net.toFixed(2)}
        </div>
      </div>
    </div>
  </div>
)}




{adminPage === "customer_ledger" && (
  <CustomerLedger
    customers={customers}
    invoices={invoices}
    selectedCustomerId={selectedCustomerId}
    setSelectedCustomerId={setSelectedCustomerId}
    CURRENCY={CURRENCY}
    receipts={receipts}

  />
)}



{adminPage === "receipts" && (
  <ReceiptsPage
    customers={customers}
    receipts={receipts}
    appId={appId}
    db={db}
    CURRENCY={CURRENCY}
    accSettings={accSettings}
    createJournalEntry={createJournalEntry}
    postReceiptEntry={postReceiptEntry}
  />
)}


{adminPage === "settings" && (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-black">⚙️ إعدادات المحاسبة</h2>

      <button
        onClick={saveAccSettings}
        className="px-5 py-3 rounded-2xl bg-black text-white font-black"
      >
        حفظ
      </button>
    </div>

    <div className="bg-white p-4 rounded-2xl border">
      <div className="font-black mb-3">الحسابات الافتراضية</div>


<div className="bg-white p-4 rounded-2xl border">
  <div className="flex items-center justify-between mb-3">
    <div className="font-black">شجرة الحسابات</div>

    <button
      onClick={async () => {
        await addDoc(
          collection(db, "artifacts", appId, "public", "data", "accounts"),
          {
            code: String(1000 + accounts.length + 1),
            key: "",
            nameAr: "",
            nameEn: "",
            nameTr: "",
            type: "asset",
            active: true,
            createdAt: Date.now(),
          }
        );
      }}
      className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-black"
    >
      + حساب جديد
    </button>
  </div>

  {accounts.length === 0 ? (
    <div className="text-sm text-slate-500 font-bold">لا يوجد حسابات بعد.</div>
  ) : (
    <div className="overflow-auto">
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="text-sm text-slate-500">
            <th className="text-right p-2">الكود</th>
            <th className="text-right p-2">المفتاح</th>
            <th className="text-right p-2">الاسم (AR)</th>
            <th className="text-right p-2">الاسم (EN)</th>
            <th className="text-right p-2">النوع</th>
            <th className="text-right p-2">إجراء</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((a) => (
            <tr key={a.id} className="border-t">
              <td className="p-2">
                <input
                  className="w-24 border rounded-lg px-2 py-1 font-bold"
                  value={a.code || ""}
                  onChange={(e) =>
                    updateDoc(
                      doc(db, "artifacts", appId, "public", "data", "accounts", a.id),
                      { code: e.target.value }
                    )
                  }
                  dir="ltr"
                />
              </td>

              <td className="p-2">
                <input
                  className="w-40 border rounded-lg px-2 py-1 font-bold"
                  value={a.key || ""}
                  onChange={(e) =>
                    updateDoc(
                      doc(db, "artifacts", appId, "public", "data", "accounts", a.id),
                      { key: e.target.value }
                    )
                  }
                  dir="ltr"
                />
              </td>

              <td className="p-2">
                <input
                  className="w-52 border rounded-lg px-2 py-1 font-bold"
                  value={a.nameAr || ""}
                  onChange={(e) =>
                    updateDoc(
                      doc(db, "artifacts", appId, "public", "data", "accounts", a.id),
                      { nameAr: e.target.value }
                    )
                  }
                />
              </td>

              <td className="p-2">
                <input
                  className="w-52 border rounded-lg px-2 py-1 font-bold"
                  value={a.nameEn || ""}
                  onChange={(e) =>
                    updateDoc(
                      doc(db, "artifacts", appId, "public", "data", "accounts", a.id),
                      { nameEn: e.target.value }
                    )
                  }
                  dir="ltr"
                />
              </td>

              <td className="p-2">
                <select
                  className="border rounded-lg px-2 py-1 font-bold"
                  value={a.type || "asset"}
                  onChange={(e) =>
                    updateDoc(
                      doc(db, "artifacts", appId, "public", "data", "accounts", a.id),
                      { type: e.target.value }
                    )
                  }
                >
                  <option value="asset">Asset</option>
                  <option value="liability">Liability</option>
                  <option value="equity">Equity</option>
                  <option value="revenue">Revenue</option>
                  <option value="expense">Expense</option>
                </select>
              </td>

              <td className="p-2">
                <button
                  onClick={() =>
                    deleteDoc(
                      doc(db, "artifacts", appId, "public", "data", "accounts", a.id)
                    )
                  }
                  className="px-3 py-2 rounded-xl bg-red-600 text-white font-black"
                >
                  حذف
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>


      {["cash", "bank", "sales", "vatOutput", "ar", "ap"].map((k) => (
        <div key={k} className="mb-3">
          <div className="text-sm text-slate-500 font-bold">{k}</div>
          <select
  className="w-full border rounded-xl px-4 py-3 font-bold"
  value={accSettings.accounts?.[k] || ""}
  onChange={(e) =>
    setAccSettings((p) => ({
      ...p,
      accounts: { ...(p.accounts || {}), [k]: e.target.value },
    }))
  }
  dir="ltr"
>
  <option value="">-- اختر حساب --</option>

  {accounts
    .filter((a) => a.active !== false && a.key)
    .map((a) => {
      const label =
        (lang === "ar" ? a.nameAr : lang === "tr" ? a.nameTr : a.nameEn) ||
        a.nameAr ||
        a.nameEn ||
        a.key;

      return (
        <option key={a.id} value={a.key}>
          {a.code ? `${a.code} - ` : ""}{label} ({a.key})
        </option>
      );
    })}
</select>

        </div>
      ))}
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

                <input
  type="number"
  placeholder="تكلفة المنتج"
  value={editingItem.cost ?? ""}
  onChange={(e) =>
    setEditingItem({
      ...editingItem,
      cost: Number(e.target.value || 0),
    })
  }
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

  const cartSubtotal = cart.reduce(
  (s, i) => s + (i.price || 0) * (i.quantity || 1),
  0
);

const cartTaxP = Math.min(100, Math.max(0, Number(taxPercent || 0)));
const cartTaxAmount = (cartSubtotal * cartTaxP) / 100;
const cartTotalWithTax = cartSubtotal + cartTaxAmount;


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
  placeholder={t.notesPlaceholder || "مثال: بدون بصل / صوص زيادة..."}
  className="w-full p-4 rounded-2xl border bg-slate-50 outline-none font-bold text-slate-800 h-28"
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
                    <div className="space-y-2">
  <div className="flex justify-between">
    <span>{cartSubtotal.toFixed(2)} TL</span>
  </div>

  {cartTaxP > 0 && (
    <>
      <div className="flex justify-between">
        <span>ضريبة ({cartTaxP}%)</span>
        <span>{cartTaxAmount.toFixed(2)} TL</span>
      </div>

      <div className="flex justify-between font-black text-xl">
        <span>الإجمالي</span>
        <span>{cartTotalWithTax.toFixed(2)} TL</span>
      </div>
    </>
  )}
</div>

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
         total: cartSubtotal,
          taxPercent: cartTaxP,
  taxAmount: cartTaxAmount,
  totalWithTax: cartTotalWithTax,

        paymentMethod,
        status: "new",
  timestamp: Date.now(),

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
