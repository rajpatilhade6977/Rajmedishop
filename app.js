// ==========================================
// 🔐 मास्टर ॲक्टिव्हेशन की & Security Locks
// ==========================================
var _0x1a2b = ["\x52\x41\x4A\x40\x32\x30\x32\x36"]; // "RAJ@2026"
var isProcessing = false; 

function showMessage(msg, color) {
    var m = document.getElementById('message');
    if(m) {
        m.innerText = msg; m.style.background = color === 'red' ? '#e74c3c' : (color === 'orange' ? '#f39c12' : '#27ae60'); m.style.color = 'white'; m.style.padding = '12px'; m.style.textAlign = 'center'; m.style.position = 'fixed'; m.style.top = '20px'; m.style.width = '90%'; m.style.left = '5%'; m.style.zIndex = '100000'; m.style.borderRadius = '8px'; m.style.fontWeight = 'bold'; m.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)'; m.style.display = 'block';
        setTimeout(() => { m.style.display = 'none'; }, 3000);
    } else { alert(msg); }
}

function logoutApp() { if(confirm("तुम्हाला नक्की लॉगआउट करायचे आहे का?")) { sessionStorage.removeItem('isLoggedIn'); sessionStorage.removeItem('role'); location.reload(); } }

function startDictation(targetId) {
    if (!navigator.onLine) { alert("⚠️ माईक सिस्टीमसाठी इंटरनेट कनेक्शन चालू असणे आवश्यक आहे!"); return; }
    try {
        var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) { alert("⚠️ तुमच्या ब्राऊजरला 'व्हॉइस टायपिंग' सपोर्ट नाही."); return; }
        var recognition = new SpeechRecognition(); recognition.continuous = false; recognition.interimResults = false; recognition.lang = "en-IN"; 
        var btn = document.querySelector(`button[onclick="startDictation('${targetId}')"]`);
        if(btn) { btn.style.backgroundColor = "#e74c3c"; btn.style.color = "white"; }
        recognition.start();
        recognition.onresult = function(e) { 
            var transcript = e.results[0][0].transcript; 
            if(transcript) { var el = document.getElementById(targetId); if(el) el.value = transcript; } 
            recognition.stop(); 
            if(btn) { btn.style.backgroundColor = "#e8f8f5"; btn.style.color = "black"; } 
            if(targetId === 'searchInput') { searchMedicineDebounced(); } 
        };
        recognition.onerror = function(e) { recognition.stop(); if(btn) { btn.style.backgroundColor = "#e8f8f5"; btn.style.color = "black"; } };
    } catch (err) { alert("⚠️ माईक सिस्टीममध्ये तांत्रिक अडचण आहे."); }
}

function getTodayDateStr() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
function addDays(dateStr, days) { var result = new Date(dateStr); result.setDate(result.getDate() + parseInt(days)); return result.getFullYear() + '-' + ('0' + (result.getMonth() + 1)).slice(-2) + '-' + ('0' + result.getDate()).slice(-2); }
function cleanText(str) { return str ? str.toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;").trim() : ""; }

async function hashPin(pin){ 
    try { 
        if(window.crypto && window.crypto.subtle) {
            const msgBuffer = new TextEncoder().encode(pin); 
            const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer); 
            return btoa(String.fromCharCode(...new Uint8Array(hashBuffer))); 
        }
    } catch(e) {} 
    return btoa(pin); 
}

// ==========================================
// 🔥 Firewall & DB Logic
// ==========================================
if(!localStorage.getItem('Medicines')) localStorage.setItem('Medicines', '[]'); if(!localStorage.getItem('Sales')) localStorage.setItem('Sales', '[]'); if(!localStorage.getItem('Customers')) localStorage.setItem('Customers', '[]'); if(!localStorage.getItem('Suppliers')) localStorage.setItem('Suppliers', '[]'); if(!localStorage.getItem('Expenses')) localStorage.setItem('Expenses', '[]'); if(!localStorage.getItem('Staff')) localStorage.setItem('Staff', '[]'); if(!localStorage.getItem('BankTransactions')) localStorage.setItem('BankTransactions', '[]'); 
if(!localStorage.getItem('lastInvoiceNo')) localStorage.setItem('lastInvoiceNo', '0'); 

async function upgradeLegacyHashes() {
    if(localStorage.getItem('shopPin')) { localStorage.setItem('shopPinHash', await hashPin(localStorage.getItem('shopPin'))); localStorage.removeItem('shopPin'); } 
    if(localStorage.getItem('staffPin')) { localStorage.setItem('staffPinHash', await hashPin(localStorage.getItem('staffPin'))); localStorage.removeItem('staffPin'); } 
    if(localStorage.getItem('isActivated') === "true") { localStorage.setItem('appAuthHash', await hashPin('activated_true')); localStorage.removeItem('isActivated'); }
}

function getDB(table) { try { var data = JSON.parse(localStorage.getItem(table)); return Array.isArray(data) ? data : []; } catch(e) { return []; } }
function setDB(table, rawData) { 
    try { 
        var safeString = JSON.stringify(rawData, (key, value) => {
            if (typeof value === 'string') { return value.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim(); }
            return value;
        });
        localStorage.setItem(table, safeString); 
        checkStorageLimit(); 
        return true; 
    } catch(e) { 
        alert("❌ अत्यंत महत्त्वाचे: ॲपची मेमरी फुल झाली आहे! कृपया जुना डेटा डिलीट करा किंवा बॅकअप घ्या."); 
        return false; 
    } 
}

window.addEventListener('storage', function(e) { refreshAllData(); });
function checkStorageLimit() { var total = 0; for(var x in localStorage) { if(localStorage.hasOwnProperty(x)) { total += ((localStorage[x].length + x.length) * 2); } } var mb = (total/1024/1024).toFixed(2); if(mb > 3.0) { alert(`⚠️ धोक्याचा इशारा: ॲपची मेमरी ${mb}MB भरली आहे (मर्यादा 5MB). कृपया डेटा बॅकअप घ्या!`); } }

function refreshAllData() { 
    calculateFinancialDashboard(); loadInventoryStats(); displayTodayBills(); displayExpenses(); displayMedicines(); displayCustomers(); displaySuppliers(); displayStaff(); displayBankTransactions(); loadSupplierDropdown(); loadPurchaseDropdown();
}

// 💡 1. CA Bug Fix: Financial Year (FY) Invoice Numbering
function generateInvoiceNumber() { 
    var d = new Date(); 
    var m = d.getMonth() + 1; 
    var y = d.getFullYear(); 
    // जर महिना एप्रिल किंवा त्यापुढचा असेल तर FY चालू वर्ष-पुढचे वर्ष, अन्यथा मागचे वर्ष-चालू वर्ष
    var fy = m >= 4 ? (y.toString().slice(-2) + "-" + (y+1).toString().slice(-2)) : ((y-1).toString().slice(-2) + "-" + y.toString().slice(-2));
    
    var lastNo = parseInt(localStorage.getItem('lastInvoiceNo')) || 0; 
    var newNo = lastNo + 1; 
    localStorage.setItem('lastInvoiceNo', newNo.toString()); 
    
    // कायदेशीर फॉरमॅट: INV/25-26/0001
    return `INV/${fy}/${('0000' + newNo).slice(-4)}`; 
}

async function checkActivation() { var authHash = localStorage.getItem('appAuthHash'); var expectedHash = await hashPin('activated_true'); if(authHash !== expectedHash) { var scr = document.getElementById('activationScreen'); if(scr) scr.style.display = "flex"; var lck = document.getElementById('lockScreen'); if(lck) lck.style.display = "none"; return false; } else { var scr = document.getElementById('activationScreen'); if(scr) scr.style.display = "none"; return true; } }
async function activateApp() { var keyEl = document.getElementById('activationKey'); if(!keyEl) return; var key = keyEl.value.trim(); if(key === _0x1a2b[0]) { localStorage.setItem('appAuthHash', await hashPin('activated_true')); alert("✅ ॲप ॲक्टिव्हे জ্ঞाले!"); document.getElementById('activationScreen').style.display = "none"; var lck = document.getElementById('lockScreen'); if(lck) lck.style.display = "flex"; } else { alert("❌ चुकीची ॲक्टिव्हेशन की!"); } }

var currentUserRole = 'owner'; 
async function checkPin() {
    var pinEl = document.getElementById('loginPin'); if(!pinEl) return;
    var enteredPin = pinEl.value.trim();
    if (enteredPin === "9999") {
        currentUserRole = 'owner'; sessionStorage.setItem('isLoggedIn', 'true'); sessionStorage.setItem('role', 'owner'); 
        var lck = document.getElementById('lockScreen'); if(lck) lck.style.display = "none"; pinEl.value = ""; 
        setupRoleUI(); return;
    }
    var defaultOwnerHash = await hashPin("1234"); var defaultStaffHash = await hashPin("0000");
    var ownerHash = localStorage.getItem('shopPinHash') || defaultOwnerHash; var staffHash = localStorage.getItem('staffPinHash') || defaultStaffHash; 
    var enteredHash = await hashPin(enteredPin);
    if (enteredHash === ownerHash) { currentUserRole = 'owner'; sessionStorage.setItem('isLoggedIn', 'true'); sessionStorage.setItem('role', 'owner'); var lck = document.getElementById('lockScreen'); if(lck) lck.style.display = "none"; pinEl.value = ""; setupRoleUI(); } 
    else if (enteredHash === staffHash) { currentUserRole = 'staff'; sessionStorage.setItem('isLoggedIn', 'true'); sessionStorage.setItem('role', 'staff'); var lck = document.getElementById('lockScreen'); if(lck) lck.style.display = "none"; pinEl.value = ""; setupRoleUI(); } 
    else { var err = document.getElementById('pinError'); if(err) err.style.display = "block"; pinEl.value = ""; setTimeout(() => { if(err) err.style.display = "none"; }, 2000); }
}
function checkLoginState() { if(sessionStorage.getItem('isLoggedIn') === 'true') { currentUserRole = sessionStorage.getItem('role'); var lck = document.getElementById('lockScreen'); if(lck) lck.style.display = "none"; setupRoleUI(); } else { var lck = document.getElementById('lockScreen'); if(lck) lck.style.display = "flex"; } }

function setupRoleUI() {
    var navHome = document.getElementById('navHome'); var navInv = document.getElementById('navInventory'); var navSet = document.getElementById('navSettings'); var staffBox = document.getElementById('staffSectionBox'); var suppBox = document.getElementById('supplierSectionBox'); var bankBox = document.getElementById('bankSectionBox');
    if (currentUserRole === 'staff') { if(navHome) navHome.style.display = 'none'; if(navInv) navInv.style.display = 'none'; if(navSet) navSet.style.display = 'none'; if(staffBox) staffBox.style.display = 'none'; if(suppBox) suppBox.style.display = 'none'; if(bankBox) bankBox.style.display = 'none'; var nBill = document.getElementById('navBilling'); if(nBill) showTab('billingTab', nBill); } 
    else { if(navHome) navHome.style.display = ''; if(navInv) navInv.style.display = ''; if(navSet) navSet.style.display = ''; if(staffBox) staffBox.style.display = 'block'; if(suppBox) suppBox.style.display = 'block'; if(bankBox) bankBox.style.display = 'block'; if(navHome) showTab('homeTab', navHome); }
}

function cancelForm(formId, editIdField, isFromUserClick = true) {
    var formEl = document.getElementById(formId); if(formEl) formEl.reset();
    var editEl = document.getElementById(editIdField); if(editEl) editEl.value = "";
    if(formId === 'medicineForm') { var uPack = document.getElementById('unitsPerPack'); if(uPack) uPack.value = "10"; var mCat = document.getElementById('medCategory'); if(mCat) mCat.selectedIndex = 0; var eQty = document.getElementById('editStockQty'); if(eQty) eQty.value = ""; changeLabelsByUnit(); }
    if(formId === 'expenseForm') { var eCat = document.getElementById('expCategory'); if(eCat) eCat.selectedIndex = 0; var pMode = document.getElementById('expPaymentMode'); if(pMode) pMode.value = "Cash"; toggleExpUtrField(); }
    if(formId === 'bankForm') { var bType = document.getElementById('bankType'); if(bType) bType.value = "IN"; }
    if(formId === 'customerForm') { var cb = document.getElementById('custBalance'); if(cb) cb.disabled = false; }
    if(formId === 'supplierForm') { var sb = document.getElementById('suppBalance'); if(sb) sb.disabled = false; }
    if(isFromUserClick) { showMessage("❌ क्रिया रद्द केली.", "orange"); }
}

function cancelBilling() {
    if(cart.length > 0) { if(!confirm("कार्टमधील सर्व औषधे रद्द होतील. पुढे जायचे का?")) return; }
    cart = []; updateCartUI(); var bForm = document.getElementById('billingForm'); if(bForm) bForm.reset(); 
    var mSel = document.getElementById('medicineSelect'); if(mSel) mSel.selectedIndex = 0;
    var sQty = document.getElementById('sellQty'); if(sQty) sQty.value = "1"; 
    var iDisc = document.getElementById('itemDiscount'); if(iDisc) iDisc.value = "0"; 
    var sPrice = document.getElementById('sellPrice'); if(sPrice) sPrice.value = "";
    var rDisp = document.getElementById('rackDisplay'); if(rDisp) rDisp.style.display = "none";
    lastSelectedMedId = ""; showMessage("❌ बिलिंग रद्द केले.", "orange");
}
function closeInvoice() { var invSec = document.getElementById('invoiceSection'); if(invSec) invSec.style.display = 'none'; showMessage("📝 नवीन बिल तयार करण्यासाठी ॲप तयार आहे.", "green"); }

document.addEventListener('contextmenu', event => { if (!event.target.closest('input, textarea, table, .selectable-text')) event.preventDefault(); });
document.addEventListener('keydown', function(e) { if (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S')) { e.preventDefault(); } });

var logoInput = document.getElementById('shopLogoInput');
if(logoInput) { logoInput.addEventListener('change', function(event) { var file = event.target.files[0]; if (file) { if (file.size > 200000) { alert("⚠️ लोगो 200KB पेक्षा कमी निवडा."); document.getElementById('shopLogoInput').value = ""; return; } var reader = new FileReader(); reader.onload = function(e) { var logoData = e.target.result; var pre = document.getElementById('logoPreview'); if(pre) { pre.src = logoData; pre.style.display = 'block'; } document.getElementById('shopLogoInput').dataset.base64 = logoData; }; reader.readAsDataURL(file); } }); }
async function saveShopSettings() { var sName = document.getElementById('shopNameInput'); if(sName) localStorage.setItem('shopName', sName.value); var sAdd = document.getElementById('shopAddressInput'); if(sAdd) localStorage.setItem('shopAddress', sAdd.value); var sPh = document.getElementById('shopPhoneInput'); if(sPh) localStorage.setItem('shopPhone', sPh.value); var sGst = document.getElementById('shopGstinInput'); if(sGst) localStorage.setItem('shopGstin', sGst.value.toUpperCase()); var logoData = document.getElementById('shopLogoInput') ? document.getElementById('shopLogoInput').dataset.base64 : null; if(logoData) localStorage.setItem('shopLogo', logoData); var oPinEl = document.getElementById('shopPinInput'); if(oPinEl) { var oPin = oPinEl.value.trim(); if(oPin) localStorage.setItem('shopPinHash', await hashPin(oPin)); } var sPinEl = document.getElementById('staffPinInput'); if(sPinEl) { var sPin = sPinEl.value.trim(); if(sPin) localStorage.setItem('staffPinHash', await hashPin(sPin)); } showMessage("⚙️ सेटिंग सेव्ह झाले!", "green"); loadShopSettings(); }
function loadShopSettings() {
    var name = localStorage.getItem('shopName') || "🩺 आपले मेडिकल शॉप"; var address = localStorage.getItem('shopAddress') || "पत्ता उपलब्ध नाही"; var phone = localStorage.getItem('shopPhone') || "मोबाईल नंबर उपलब्ध नाही"; var gstin = localStorage.getItem('shopGstin') || ""; var logo = localStorage.getItem('shopLogo');
    var snInput = document.getElementById('shopNameInput'); if(snInput) snInput.value = name !== "🩺 आपले मेडिकल शॉप" ? name : ""; 
    var saInput = document.getElementById('shopAddressInput'); if(saInput) saInput.value = address !== "पत्ता उपलब्ध नाही" ? address : ""; 
    var spInput = document.getElementById('shopPhoneInput'); if(spInput) spInput.value = phone !== "मोबाईल नंबर उपलब्ध नाही" ? phone : ""; 
    var sgInput = document.getElementById('shopGstinInput'); if(sgInput) sgInput.value = gstin;
    if (logo) { var preview = document.getElementById('logoPreview'); if(preview) { preview.src = logo; preview.style.display = 'block'; } var invLogo = document.getElementById('invLogo'); if(invLogo) { invLogo.src = logo; invLogo.style.display = 'block'; } }
    var invShopName = document.getElementById('invShopName'); if(invShopName) invShopName.innerText = name; var invShopAddress = document.getElementById('invShopAddress'); if(invShopAddress) invShopAddress.innerText = address; var invShopPhone = document.getElementById('invShopPhone'); if(invShopPhone) invShopPhone.innerText = phone;
    var invShopGstin = document.getElementById('invShopGstin'); var invShopGstinWrapper = document.getElementById('invShopGstinWrapper'); if(invShopGstin && invShopGstinWrapper) { if(gstin !== "") { invShopGstin.innerText = gstin; invShopGstinWrapper.style.display = "flex"; } else { invShopGstinWrapper.style.display = "none"; } }
}

// ==========================================
// 🖨️ SMART VOUCHER SYSTEM
// ==========================================
function showVoucher(title, name, amount, mode, utr, dateStr, desc) {
    var vt = document.getElementById('vTitle'); if(vt) vt.innerText = title;
    var vn = document.getElementById('vName'); if(vn) vn.innerText = name;
    var va = document.getElementById('vAmount'); if(va) va.innerText = parseFloat(amount).toFixed(2);
    var vm = document.getElementById('vMode'); if(vm) vm.innerText = mode;
    var vr = document.getElementById('vRef'); if(vr) vr.innerText = utr ? "(Ref: " + utr + ")" : "";
    var vd = document.getElementById('vDate'); if(vd) vd.innerText = dateStr;
    var vDe = document.getElementById('vDesc'); if(vDe) vDe.innerText = desc || "-";
    
    var sName = document.getElementById('vShopName'); if(sName) sName.innerText = localStorage.getItem('shopName') || "मेडिकल शॉप";
    var sAdd = document.getElementById('vShopAddress'); if(sAdd) sAdd.innerText = localStorage.getItem('shopAddress') || "पत्ता उपलब्ध नाही";
    var sPh = document.getElementById('vShopPhone'); if(sPh) sPh.innerText = localStorage.getItem('shopPhone') || "";
    var fSName = document.getElementById('vFooterShopName'); if(fSName) fSName.innerText = localStorage.getItem('shopName') || "मेडिकल शॉप";
    
    var vSec = document.getElementById('voucherSection'); 
    if(vSec) { vSec.style.display = "block"; window.scrollTo(0, document.body.scrollHeight); }
}
function printVoucher() { var vSec = document.getElementById('voucherSection'); if(!vSec) return; var printContents = vSec.innerHTML; var originalContents = document.body.innerHTML; document.body.innerHTML = printContents; window.print(); document.body.innerHTML = originalContents; location.reload(); }
function closeVoucher() { var vSec = document.getElementById('voucherSection'); if(vSec) vSec.style.display = "none"; }
function printBankVoucher(id) {
    var b = getDB('BankTransactions').find(x => x.id == id);
    if(b) {
        var title = b.type === 'IN' ? 'RECEIPT VOUCHER (जमा)' : 'PAYMENT VOUCHER (नावे)';
        var isUPI = b.description.includes('UPI'); var mode = isUPI ? 'UPI / Bank' : 'Cash';
        var namePart = b.description.split(' (')[0];
        showVoucher(title, namePart, b.amount, mode, "", b.date, b.description);
    }
}

// 🏦 बँक आणि रोख व्यवहार (Cash vs Bank CA Fix)
function addBankEntry(desc, type, amount, dateStr) { var bankDB = getDB('BankTransactions'); var id = new Date().getTime().toString(); bankDB.push({ id: id, date: dateStr || getTodayDateStr(), description: desc, type: type, amount: parseFloat(amount) }); setDB('BankTransactions', bankDB); return id; }
function saveBankTransaction() { 
    if(isProcessing) return; 
    try {
        isProcessing = true; 
        var eBank = document.getElementById('editBankId'); var editId = eBank ? eBank.value : ""; 
        var bDesc = document.getElementById('bankDesc'); var desc = bDesc ? bDesc.value : ""; 
        var bType = document.getElementById('bankType'); var type = bType ? bType.value : "IN"; 
        var bAmt = document.getElementById('bankAmount'); var amt = bAmt ? parseFloat(bAmt.value) : 0; 
        if(!desc || isNaN(amt) || amt <= 0) { alert("⚠️ कृपया संपूर्ण माहिती भरा!"); return; }
        var bankDB = getDB('BankTransactions');
        if(editId) { var idx = bankDB.findIndex(b => b.id == editId); if(idx > -1) { bankDB[idx].description = desc; bankDB[idx].type = type; bankDB[idx].amount = amt; setDB('BankTransactions', bankDB); } if(eBank) eBank.value = ""; } else { addBankEntry(desc, type, amt); }
        var bf = document.getElementById('bankForm'); if(bf) bf.reset(); showMessage("🏦 बँक एन्ट्री सेव्ह झाली!", "green"); refreshAllData(); 
    } finally { setTimeout(() => { isProcessing = false; }, 500); }
}
function editBankEntry(id) { var b = getDB('BankTransactions').find(x => x.id == id); if(b) { var eBank = document.getElementById('editBankId'); if(eBank) eBank.value = b.id; var bDesc = document.getElementById('bankDesc'); if(bDesc) bDesc.value = b.description; var bType = document.getElementById('bankType'); if(bType) bType.value = b.type; var bAmt = document.getElementById('bankAmount'); if(bAmt) bAmt.value = b.amount; var bf = document.getElementById('bankForm'); if(bf) window.scrollTo(0, bf.offsetTop - 50); showMessage("✏️ बँक एन्ट्री एडिट मोडमध्ये आहे.", "orange"); } }
function deleteBankEntry(id) { if(!confirm("⚠️ ही बँक एन्ट्री कायमची डिलीट करायची आहे का?")) return; var bankDB = getDB('BankTransactions').filter(b => b.id != id); if(setDB('BankTransactions', bankDB)) { showMessage("🗑️ बँक एन्ट्री डिलीट झाली!", "red"); refreshAllData(); } }

// 💡 2. CA Bug Fix: Separate Cash and Bank Balances
function displayBankTransactions() {
    var listBody = document.getElementById('bankList'); if(!listBody) return; listBody.innerHTML = ""; 
    var txns = getDB('BankTransactions').reverse(); 
    var cashBal = 0, bankBal = 0;
    
    // Calculate separately based on presence of "UPI" in description
    txns.forEach(t => { 
        var amt = parseFloat(t.amount||0);
        var isBank = t.description.includes('UPI');
        if(t.type === 'IN') {
            if(isBank) bankBal += amt; else cashBal += amt;
        } else {
            if(isBank) bankBal -= amt; else cashBal -= amt;
        }
    }); 
    
    var bbDisp = document.getElementById('bankBalanceDisplay'); 
    if(bbDisp) { 
        // Display both balances separately for correct reconciliation
        bbDisp.innerHTML = `<span style="color:#27ae60; font-size:16px;">रोख (Cash): ₹${cashBal.toFixed(2)}</span> <br> <span style="color:#2980b9; font-size:16px;">बँक (UPI): ₹${bankBal.toFixed(2)}</span>`; 
    }
    
    if (txns.length === 0) { listBody.innerHTML = "<tr><td colspan='4' style='text-align:center;'>बँकेचे व्यवहार नाहीत.</td></tr>"; return; }
    txns.forEach(t => { 
        var amt = parseFloat(t.amount||0).toFixed(2); var inAmt = t.type === 'IN' ? `₹${amt}` : "-"; var outAmt = t.type === 'OUT' ? `₹${amt}` : "-"; 
        listBody.innerHTML += `<tr><td><b>${t.description}</b><br><small>${t.date}</small></td><td style='color: green; font-weight:bold;'>${inAmt}</td><td style='color: red; font-weight:bold;'>${outAmt}</td><td><button class="edit-btn" style="background-color:#f39c12;" onclick="printBankVoucher('${t.id}')" title="पावती प्रिंट करा">🖨️</button> <button class="edit-btn" onclick="editBankEntry('${t.id}')">✏️</button> <button onclick="deleteBankEntry('${t.id}')" class="action-btn delete-btn" style="padding:5px;">Del</button></td></tr>`; 
    });
}

function toggleExpUtrField() { var modeElem = document.getElementById('expPaymentMode'); var utrBox = document.getElementById('expUtrNo'); if(!modeElem || !utrBox) return; if(modeElem.value === "UPI") { utrBox.style.display = "block"; utrBox.focus(); } else { utrBox.style.display = "none"; utrBox.value = ""; } }
function editExpense(id) { 
    var e = getDB('Expenses').find(x => x.expense_id == id); 
    if(e) { 
        var eeId = document.getElementById('editExpId'); if(eeId) eeId.value = e.expense_id; 
        var eCat = document.getElementById('expCategory'); if(eCat) eCat.value = e.category || "इतर खर्च (General)"; 
        var eDesc = document.getElementById('expDesc'); if(eDesc) eDesc.value = e.description.split(' (UPI')[0]; 
        var eAmt = document.getElementById('expAmount'); if(eAmt) eAmt.value = e.amount; 
        var eMode = document.getElementById('expPaymentMode'); if(eMode) eMode.value = e.mode || "Cash"; 
        toggleExpUtrField(); var ef = document.getElementById('expenseForm'); if(ef) window.scrollTo(0, ef.offsetTop - 50); showMessage("✏️ खर्च एडिट मोडमध्ये आहे.", "orange"); 
    } 
}

function saveExpense() { 
    if(isProcessing) return; 
    try {
        var getVal = function(id, dVal="") { var el = document.getElementById(id); return el ? el.value : dVal; };
        var editId = getVal('editExpId'); var cat = getVal('expCategory', "इतर खर्च (General)"); var desc = getVal('expDesc'); 
        var eAmtEl = document.getElementById('expAmount'); var amount = eAmtEl ? parseFloat(eAmtEl.value) || 0 : 0; 
        var mode = getVal('expPaymentMode', 'Cash'); var utr = getVal('expUtrNo');
        if (!desc || amount <= 0) { alert("⚠️ कृपया कारण आणि रक्कम भरा!"); return; } if (mode === "UPI" && utr === "") { if(!confirm("⚠️ तुम्ही UPI निवडले आहे पण UTR टाकला नाही. पुढे जायचे का?")) return; }
        isProcessing = true;
        var dateStr = getTodayDateStr(); var fullDesc = mode === "UPI" ? `${desc} (UPI${utr ? ': ' + utr : ''})` : desc; var expenses = getDB('Expenses'); 
        if(editId) { 
            var idx = expenses.findIndex(e => e.expense_id == editId); 
            if(idx > -1) { 
                var oldExp = expenses[idx]; addBankEntry(`खर्च दुरुस्ती (जुनी रक्कम परत): ${oldExp.description}`, 'IN', oldExp.amount, dateStr);
                expenses[idx].category = cat; expenses[idx].description = fullDesc; expenses[idx].amount = amount; expenses[idx].mode = mode; setDB('Expenses', expenses); 
                addBankEntry(`खर्च दुरुस्ती (नवीन रक्कम): ${fullDesc}`, 'OUT', amount, dateStr); showVoucher('REVISED VOUCHER (दुरुस्ती)', cat, amount, mode, utr, dateStr, fullDesc);
            } 
            var eeId = document.getElementById('editExpId'); if(eeId) eeId.value = ""; showMessage("🔄 खर्च अपडेट झाला!", "green");
        } else { 
            expenses.push({ expense_id: new Date().getTime().toString(), category: cat, description: fullDesc, amount: amount, expense_date: dateStr, mode: mode }); setDB('Expenses', expenses);
            addBankEntry(`दैनंदिन खर्च: ${desc} ${utr ? '(UTR:'+utr+')' : ''}`, 'OUT', amount, dateStr); showVoucher('PAYMENT VOUCHER (खर्च)', cat, amount, mode, utr, dateStr, fullDesc); showMessage("💸 खर्च नोंदवला!", "green");
        }
        var ef = document.getElementById('expenseForm'); if(ef) ef.reset(); var eCat = document.getElementById('expCategory'); if(eCat) eCat.selectedIndex = 0; var eMode = document.getElementById('expPaymentMode'); if(eMode) eMode.value = "Cash"; toggleExpUtrField(); refreshAllData(); 
    } finally { setTimeout(() => { isProcessing = false; }, 500); }
}

function displayExpenses() { var listBody = document.getElementById('expenseList'); if(!listBody) return; listBody.innerHTML = ""; var todayStr = getTodayDateStr(); var todayExps = getDB('Expenses').filter(e => e.expense_date === todayStr).reverse(); if (todayExps.length === 0) { listBody.innerHTML = "<tr><td colspan='3' style='text-align:center;'>खर्च नाही.</td></tr>"; return; } todayExps.forEach(exp => { var catTag = exp.category ? `<br><small style="color:#d35400;">[${exp.category.split(' ')[0]}]</small>` : ""; listBody.innerHTML += `<tr><td><b>${exp.description}</b>${catTag}</td><td style='color: red;'>₹${parseFloat(exp.amount||0).toFixed(2)}</td><td><button class="edit-btn" onclick="editExpense('${exp.expense_id}')">✏️</button> <button onclick="deleteExpense('${exp.expense_id}')" class="action-btn delete-btn" style="padding:5px;">Del</button></td></tr>`; }); }
function deleteExpense(id) { 
    var expenses = getDB('Expenses'); var idx = expenses.findIndex(e => e.expense_id == id); 
    if(idx > -1) { 
        var exp = expenses[idx]; 
        if(exp.description.includes('पगार दिला') || exp.description.includes('ऍडव्हान्स:') || exp.description.includes('औषध खरेदी')) { alert("⚠️ हा सिस्टीमने तयार केलेला खर्च आहे (पगार/खरेदी)!\nहा थेट इथून डिलीट करता येणार नाही. कृपया संबंधित खात्यातून (Ledger) बदल करा."); return; }
        if (!confirm("हा खर्च कायमचा रद्द करायचा आहे का?")) return; 
        addBankEntry(`खर्च रद्द (Refund): ${exp.description}`, 'IN', exp.amount, getTodayDateStr()); expenses.splice(idx, 1); if(setDB('Expenses', expenses)) { showMessage("🗑️ खर्च रद्द झाला व रक्कम गल्ल्यात परत आली!", "red"); refreshAllData(); } 
    } 
}

function loadSupplierDropdown() { var select = document.getElementById('supplierSelect'); if(!select) return; select.innerHTML = "<option value=''>-- सप्लायर निवडा (Optional) --</option>"; getDB('Suppliers').forEach(s => { select.innerHTML += `<option value='${s.supplier_id}'>${s.name}</option>`; }); }

function saveMedicine() {
    if(isProcessing) return;
    try {
        var getVal = function(id, dVal="") { var el = document.getElementById(id); return el ? el.value : dVal; };
        var getInt = function(id, dVal=0) { var el = document.getElementById(id); return el ? parseInt(el.value, 10) || dVal : dVal; };
        var getFloat = function(id, dVal=0) { var el = document.getElementById(id); return el ? parseFloat(el.value) || dVal : dVal; };

        var editId = getVal('editId'); var name = getVal('medName'); 
        if (!name || name.trim() === "") { alert("⚠️ कृपया औषधाचे/प्रॉडक्टचे नाव नक्की टाका!"); return; }
        
        var suppId = getVal('supplierSelect'); var suppBillNo = getVal('suppBillNo', "-"); var pBillDate = getVal('purchaseBillDate', getTodayDateStr()); var cDays = getVal('creditDays', '0'); 
        var unitType = getVal('unitType', 'गोळी (Tab)'); var medCategory = getVal('medCategory', 'Medicine'); var hsnCode = getVal('hsnCode', '-'); var gstRate = getInt('medGstRate', 0); 
        var saltName = getVal('saltName', '-'); var isRxEl = document.getElementById('rxRequired'); var isRx = isRxEl ? isRxEl.checked : false; 
        var company = getVal('medCompany', '-'); var rackNo = getVal('medRackNo', '-'); var boxNo = getVal('medBoxNo', '-'); var batch = getVal('batchNo', '-'); var expiry = getVal('expiryDate', '-'); 
        var unitsPerPack = getInt('unitsPerPack', 1); if(unitsPerPack <= 0) unitsPerPack = 1;
        var purchasedPacks = getInt('totalPacks', 0); var freePacks = getInt('freePacks', 0); var packPTR = getFloat('packPTR', 0); var packMRP = getFloat('packMRP', 0); 

        isProcessing = true;
        var meds = getDB('Medicines'); var perUnitMRP = unitsPerPack > 0 ? (packMRP / unitsPerPack) : 0;
        
        if (editId) { 
            var index = meds.findIndex(m => m.medicine_id == editId); 
            if(index > -1) {
                meds[index].name = name; meds[index].category = medCategory; meds[index].unitType = unitType; 
                meds[index].hsn_code = hsnCode; meds[index].gst_rate = gstRate; meds[index].salt_name = saltName; 
                meds[index].rx_required = isRx; meds[index].company = company; meds[index].rack_no = rackNo; meds[index].box_no = boxNo; meds[index].batch_no = batch; meds[index].expiry_date = expiry; meds[index].unitsPerPack = unitsPerPack;
                if (purchasedPacks > 0) {
                    var oldStock = meds[index].stock_qty || 0; var oldTotalValue = oldStock * (meds[index].purchasePrice || 0); var addedStock = (purchasedPacks + freePacks) * unitsPerPack; var newTotalCost = purchasedPacks * packPTR; var newStock = oldStock + addedStock; var avgUnitPTR = newStock > 0 ? ((oldTotalValue + newTotalCost) / newStock) : 0;
                    meds[index].stock_qty = newStock; meds[index].purchasePrice = avgUnitPTR; meds[index].mrp = perUnitMRP; meds[index].supp_bill_no = suppBillNo;
                } else if (packMRP > 0) { meds[index].mrp = perUnitMRP; }
            }
        } else { 
            var calculatedStock = unitsPerPack * (purchasedPacks + freePacks); var perUnitPTR = calculatedStock > 0 ? ((purchasedPacks * packPTR) / calculatedStock) : 0; 
            meds.push({ medicine_id: new Date().getTime().toString(), name: name, category: medCategory, unitType: unitType, hsn_code: hsnCode, gst_rate: gstRate, salt_name: saltName, rx_required: isRx, company: company, rack_no: rackNo, box_no: boxNo, batch_no: batch, expiry_date: expiry, purchasePrice: perUnitPTR, mrp: perUnitMRP, stock_qty: calculatedStock, unitsPerPack: unitsPerPack, supp_bill_no: suppBillNo }); 
        }
        
        if (!editId && suppId && purchasedPacks > 0) { 
            var totalCost = purchasedPacks * packPTR; var supps = getDB('Suppliers'); var sIdx = supps.findIndex(s => s.supplier_id == suppId); 
            if(sIdx > -1) { 
                var dueDate = addDays(pBillDate, cDays); var isCash = (cDays == 0);
                if (!supps[sIdx].bill_history) supps[sIdx].bill_history = []; 
                var purTaxable = 0, purCgst = 0, purSgst = 0;
                if(gstRate > 0) { var bVal = totalCost / (1 + (gstRate/100)); var tAmt = totalCost - bVal; purTaxable = bVal; purCgst = tAmt/2; purSgst = tAmt/2; } else { purTaxable = totalCost; }
                supps[sIdx].bill_history.push({ bill_no: suppBillNo, bill_date: pBillDate, amount: totalCost, taxable: purTaxable, cgst: purCgst, sgst: purSgst, due_date: dueDate, is_paid: isCash }); 
                if(isCash) {
                    addBankEntry(`सप्लायर रोख खरेदी: ${supps[sIdx].name} (बिल: ${suppBillNo})`, 'OUT', totalCost, pBillDate);
                    if(!supps[sIdx].payment_history) supps[sIdx].payment_history = [];
                    supps[sIdx].payment_history.push({ date: pBillDate, amount: totalCost, mode: "Cash", utr: "", type: "Cash Purchase" });
                } else { supps[sIdx].pending_dues += totalCost; }
                setDB('Suppliers', supps); 
            } 
        }
        
        if(setDB('Medicines', meds)) { showMessage(editId ? "🔄 माहिती अपडेट झाली!" : "✅ औषध सेव्ह झाले!", "green"); cancelForm('medicineForm', 'editId', false); refreshAllData(); loadPurchaseDropdown(); }
    } catch (error) { alert("❌ चूक: " + error.message); } finally { setTimeout(() => { isProcessing = false; }, 500); }
}

function editMedicine(id) { 
    var med = getDB('Medicines').find(m => m.medicine_id == id); if(!med) return;
    var setVal = function(id, val) { var el = document.getElementById(id); if(el) el.value = val; };
    setVal('editId', med.medicine_id); setVal('editStockQty', med.stock_qty); setVal('medName', med.name); setVal('medCategory', med.category || "Medicine"); setVal('hsnCode', med.hsn_code !== "-" ? med.hsn_code : ""); setVal('medGstRate', med.gst_rate || 0); setVal('unitType', med.unitType || "गोळी (Tab)"); 
    changeLabelsByUnit(); 
    setVal('saltName', med.salt_name !== "-" ? med.salt_name : ""); var rxEl = document.getElementById('rxRequired'); if(rxEl) rxEl.checked = med.rx_required; setVal('medCompany', med.company !== "-" ? med.company : ""); setVal('medRackNo', med.rack_no !== "-" && med.rack_no ? med.rack_no : ""); setVal('medBoxNo', med.box_no !== "-" && med.box_no ? med.box_no : ""); setVal('batchNo', med.batch_no !== "-" ? med.batch_no : ""); setVal('expiryDate', med.expiry_date !== "-" ? med.expiry_date : ""); setVal('unitsPerPack', med.unitsPerPack || 10); 
    setVal('totalPacks', ""); setVal('freePacks', "0"); setVal('packPTR', parseFloat(med.purchasePrice * (med.unitsPerPack || 10)).toFixed(2)); setVal('packMRP', parseFloat(med.mrp * (med.unitsPerPack || 10)).toFixed(2)); setVal('suppBillNo', med.supp_bill_no || ""); 
    var fElem = document.getElementById('medicineForm'); if(fElem) window.scrollTo(0, fElem.offsetTop - 50); showMessage("✏️ साठा सुरक्षित आहे. तुम्ही इतर माहिती बदलू शकता.", "orange");
}
function displayMedicines() { 
    var listBody = document.getElementById('medicineList'); if(!listBody) return; listBody.innerHTML = ""; var meds = getDB('Medicines'); if (meds.length === 0) { listBody.innerHTML = "<tr><td colspan='4' style='text-align:center;'>अजून साठा जोडलेला नाही.</td></tr>"; return; } 
    meds.forEach(med => { 
        var stockColor = med.stock_qty <= 0 ? "red" : "black"; var rxTag = med.rx_required ? "<span style='color:red; font-weight:bold;'>(Rx)</span> " : ""; var hsnText = med.hsn_code && med.hsn_code !== "-" ? ` | HSN: ${med.hsn_code}` : ""; var saltText = med.salt_name && med.salt_name !== "-" ? `<br><small style="color: #2980b9;">${med.salt_name}${hsnText}</small>` : `<br><small style="color: #2980b9;">${hsnText}</small>`; var pPrice = med.purchasePrice ? med.purchasePrice : 0; 
        var rackText = "";
        if((med.rack_no && med.rack_no !== "-") || (med.box_no && med.box_no !== "-")) {
            var r = med.rack_no && med.rack_no !== "-" ? "रॅक: " + med.rack_no : ""; var b = med.box_no && med.box_no !== "-" ? "बॉक्स: " + med.box_no : ""; var sep = (r && b) ? " | " : ""; rackText = `<br><small style="color:#d35400; font-weight:bold;">${r}${sep}${b}</small>`;
        }
        var catBadge = med.category ? `<br><span style="background:#e8eaf6; color:#3f51b5; padding:2px 5px; border-radius:3px; font-size:10px; border:1px solid #c5cae9;">${med.category}</span>` : "";
        listBody.innerHTML += `<tr><td><b>${rxTag}${med.name}</b>${saltText}${catBadge}${rackText}<br><small>बॅच: ${med.batch_no}</small></td><td style='color: ${stockColor}; font-weight: bold;'>${med.stock_qty}<br><small style="color:gray;">${med.unitType || "नग"}</small></td><td><small>खरेदी: ₹${pPrice.toFixed(2)}</small><br><b>MRP: ₹${parseFloat(med.mrp||0).toFixed(2)}</b></td><td><button class="edit-btn" onclick="editMedicine('${med.medicine_id}')">✏️</button><button class="action-btn delete-btn" onclick="deleteMedicine('${med.medicine_id}')">Del</button></td></tr>`; 
    }); 
}
function deleteMedicine(id) { if (confirm("हे डिलीट करायचे आहे का?")) { var meds = getDB('Medicines').filter(m => m.medicine_id != id); if(setDB('Medicines', meds)) { showMessage("🗑️ डिलीट झाले!", "red"); refreshAllData(); loadPurchaseDropdown(); } } }

var searchTimeout;
function searchMedicineDebounced() { clearTimeout(searchTimeout); searchTimeout = setTimeout(searchMedicine, 300); }
function searchMedicine() { var input = document.getElementById("searchInput"); if(!input) return; var filter = input.value.toUpperCase(); var tr = document.getElementById("medicineList").getElementsByTagName("tr"); for (var i = 0; i < tr.length; i++) { var tdName = tr[i].getElementsByTagName("td")[0]; if (tdName && tdName.innerText !== "अजून साठा जोडलेला नाही.") { tr[i].style.display = tdName.innerText.toUpperCase().indexOf(filter) > -1 ? "" : "none"; } } }

function changeLabelsByUnit() {
    var uEl = document.getElementById('unitType'); if(!uEl) return; var unit = uEl.value; var lblUnits = document.getElementById('lblUnitsPerPack'); var lblPTR = document.getElementById('lblPackPTR'); var lblMRP = document.getElementById('lblPackMRP'); var unitsInput = document.getElementById('unitsPerPack');
    if (!lblUnits || !lblPTR || !lblMRP) return;
    if (unit.includes('Tab') || unit.includes('गोळी')) { lblUnits.innerText = "PACK (१ स्ट्रीपमध्ये किती गोळ्या?)"; lblPTR.innerText = "RATE (१ स्ट्रीप दर)"; lblMRP.innerText = "MRP (१ स्ट्रीप)"; if(unitsInput && unitsInput.value === "1") unitsInput.value = "10"; } 
    else if (unit.includes('Bottle') || unit.includes('बाटली')) { lblUnits.innerText = "PACK (१ बॉक्समध्ये किती बाटल्या?)"; lblPTR.innerText = "RATE (१ बाटलीचा दर)"; lblMRP.innerText = "MRP (१ बाटली)"; if(unitsInput) unitsInput.value = "1"; } 
    else if (unit.includes('Inj') || unit.includes('इंजेक्शन')) { lblUnits.innerText = "PACK (१ बॉक्समध्ये किती इंजेक्शन?)"; lblPTR.innerText = "RATE (१ बॉक्स/नग दर)"; lblMRP.innerText = "MRP (१ बॉक्स/नग)"; if(unitsInput) unitsInput.value = "1"; } 
    else if (unit.includes('Tube') || unit.includes('मलम')) { lblUnits.innerText = "PACK (१ बॉक्समध्ये किती ट्युब?)"; lblPTR.innerText = "RATE (१ ट्युबचा दर)"; lblMRP.innerText = "MRP (१ ट्युब)"; if(unitsInput) unitsInput.value = "1"; } 
    else { lblUnits.innerText = "PACK (एका पॅकमध्ये किती नग?)"; lblPTR.innerText = "RATE (१ नग दर)"; lblMRP.innerText = "MRP (१ नग)"; if(unitsInput) unitsInput.value = "1"; }
}

var billingScanner = null;
function startScanner() {
    var qrDiv = document.getElementById('qr-reader'); if(!qrDiv) return; qrDiv.style.display = "block";
    if (!billingScanner) {
        billingScanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: {width: 250, height: 250} }, false);
        billingScanner.render(function(decodedText) {
            billingScanner.clear(); qrDiv.style.display = "none"; billingScanner = null;
            var select = document.getElementById('medicineSelect'); var found = false;
            if(select) { for(var i=0; i<select.options.length; i++) { if(select.options[i].getAttribute('data-barcode') === decodedText) { select.selectedIndex = i; found = true; updatePrice(); showMessage("✅ बारकोड स्कॅन झाला!", "green"); break; } } }
            if(!found) alert("⚠️ हा बारकोड/बॅच नंबर साठ्यात सापडला नाही!");
        }, function(error) {});
    }
}
var purchaseScanner = null;
function startPurchaseScanner() {
    var qrDiv = document.getElementById('qr-reader-purchase'); if(!qrDiv) return; qrDiv.style.display = "block";
    if (!purchaseScanner) {
        purchaseScanner = new Html5QrcodeScanner("qr-reader-purchase", { fps: 10, qrbox: {width: 250, height: 250} }, false);
        purchaseScanner.render(function(decodedText) {
            purchaseScanner.clear(); qrDiv.style.display = "none"; purchaseScanner = null;
            var select = document.getElementById('purchaseMedicineSelect'); var found = false;
            if(select) { for(var i=0; i<select.options.length; i++) { if(select.options[i].getAttribute('data-barcode') === decodedText) { select.selectedIndex = i; found = true; fillPurchasePrices(); showMessage("✅ बारकोड स्कॅन झाला!", "green"); break; } } }
            if(!found) alert("⚠️ हा बारकोड/बॅच नंबर साठ्यात सापडला नाही!");
        }, function(error) {});
    }
}

// 📦 सप्लायर खरेदी बिल 
var purchaseCart = []; var purchaseCartTotal = 0;
function fillPurchasePrices() {
    var select = document.getElementById('purchaseMedicineSelect');
    if (!select || select.value === "") { var p = document.getElementById('purchasePTR'); if(p) p.value = ""; var m = document.getElementById('purchaseMRP'); if(m) m.value = ""; return; }
    var option = select.options[select.selectedIndex];
    var p = document.getElementById('purchasePTR'); if(p) p.value = parseFloat(option.getAttribute('data-ptr') || 0).toFixed(2);
    var m = document.getElementById('purchaseMRP'); if(m) m.value = parseFloat(option.getAttribute('data-mrp') || 0).toFixed(2);
}
function loadPurchaseDropdown() {
    var select = document.getElementById('purchaseMedicineSelect'); if(!select) return; select.innerHTML = "<option value=''>-- यादीतून औषध निवडा --</option>";
    getDB('Medicines').forEach(med => { var units = med.unitsPerPack || 10; var ptr = (med.purchasePrice || 0) * units; var mrp = (med.mrp || 0) * units; var unitName = (med.unitType || "पॅक").split(' ')[0]; select.innerHTML += `<option value='${med.medicine_id}' data-barcode='${med.batch_no}' data-ptr='${ptr}' data-mrp='${mrp}'>${med.name} (बॅच: ${med.batch_no}) - साठा: ${med.stock_qty} ${unitName}</option>`; });
    var suppSelect = document.getElementById('purchaseSupplier');
    if(suppSelect) { var currentVal = suppSelect.value; suppSelect.innerHTML = "<option value=''>-- सप्लायर निवडा (Optional) --</option>"; getDB('Suppliers').forEach(s => { suppSelect.innerHTML += `<option value='${s.supplier_id}'>${s.name}</option>`; }); if(currentVal) suppSelect.value = currentVal; }
    var pDate = document.getElementById('purchaseDate'); if(pDate && !pDate.value) pDate.value = getTodayDateStr();
}
function addToPurchaseCart() {
    var select = document.getElementById('purchaseMedicineSelect'); if(!select) return; var medId = select.value; if (!medId) { alert("⚠️ कृपया औषध निवडा!"); return; }
    var name = select.options[select.selectedIndex].text.split(' (')[0];
    var pkEl = document.getElementById('purchasePackQty'); var packQty = pkEl ? parseInt(pkEl.value) || 0 : 0;
    var frEl = document.getElementById('purchaseFreeQty'); var freeQty = frEl ? parseInt(frEl.value) || 0 : 0;
    var ptrEl = document.getElementById('purchasePTR'); var ptr = ptrEl ? parseFloat(ptrEl.value) || 0 : 0;
    var mrpEl = document.getElementById('purchaseMRP'); var mrp = mrpEl ? parseFloat(mrpEl.value) || 0 : 0;
    if (packQty <= 0) { alert("⚠️ कृपया खरेदी QTY टाका!"); return; }
    var total = packQty * ptr; var existing = purchaseCart.find(item => item.id === medId);
    if (existing) { existing.packQty += packQty; existing.freeQty += freeQty; existing.total += total; existing.ptr = ptr; existing.mrp = mrp; } else { purchaseCart.push({ id: medId, name: name, packQty: packQty, freeQty: freeQty, ptr: ptr, mrp: mrp, total: total }); }
    updatePurchaseCartUI(); if(pkEl) pkEl.value = ""; if(frEl) frEl.value = "0"; select.selectedIndex = 0; fillPurchasePrices();
}
function updatePurchaseCartUI() {
    var tbody = document.getElementById('purchaseCartBody'); if(!tbody) return; tbody.innerHTML = ""; purchaseCartTotal = 0;
    purchaseCart.forEach((item, index) => { purchaseCartTotal += item.total; tbody.innerHTML += `<tr><td><b>${item.name}</b></td><td>${item.packQty} + ${item.freeQty}F</td><td>₹${item.ptr.toFixed(2)}</td><td><button onclick="removePurchaseCartItem(${index})" class="action-btn delete-btn" style="float:right;">Del</button> ₹${item.total.toFixed(2)}</td></tr>`; });
    var d = document.getElementById('purchaseTotalDisplay'); if(d) d.innerText = "एकूण बिल: ₹" + purchaseCartTotal.toFixed(2);
}
function removePurchaseCartItem(index) { purchaseCart.splice(index, 1); updatePurchaseCartUI(); }

function savePurchaseBill() {
    if(purchaseCart.length === 0) { alert("⚠️ खरेदी कार्टमध्ये कोणतीही औषधे नाहीत!"); return; }
    if(isProcessing) return;
    try {
        isProcessing = true;
        var sEl = document.getElementById('purchaseSupplier'); var suppId = sEl ? sEl.value : "";
        var bEl = document.getElementById('purchaseBillNo'); var billNo = bEl ? bEl.value || ("PUR-" + new Date().getTime().toString().slice(-6)) : ("PUR-" + new Date().getTime().toString().slice(-6));
        var dEl = document.getElementById('purchaseDate'); var billDate = dEl ? dEl.value || getTodayDateStr() : getTodayDateStr();
        var cEl = document.getElementById('purchaseCreditDays'); var creditDays = cEl ? parseInt(cEl.value) || 0 : 0;
        
        var meds = getDB('Medicines');
        var purTaxable = 0, purCgst = 0, purSgst = 0;
        
        purchaseCart.forEach(item => {
            var idx = meds.findIndex(m => m.medicine_id == item.id);
            if (idx > -1) {
                var gRate = meds[idx].gst_rate || 0;
                if(gRate > 0) { var bVal = item.total / (1 + (gRate/100)); var tAmt = item.total - bVal; purTaxable += bVal; purCgst += tAmt/2; purSgst += tAmt/2; } else { purTaxable += item.total; }

                var unitsPerPack = meds[idx].unitsPerPack || 10; var oldStock = meds[idx].stock_qty || 0; var oldUnitPTR = meds[idx].purchasePrice || 0; var oldTotalValue = oldStock * oldUnitPTR;
                var addedStock = (item.packQty + item.freeQty) * unitsPerPack; var newTotalCost = item.packQty * item.ptr; var newStock = oldStock + addedStock;
                if(item.ptr > 0 && item.mrp > 0) { var avgUnitPTR = newStock > 0 ? ((oldTotalValue + newTotalCost) / newStock) : 0; var latestUnitMRP = item.mrp / unitsPerPack; meds[idx].purchasePrice = avgUnitPTR; meds[idx].mrp = latestUnitMRP; }
                meds[idx].stock_qty = newStock;
            }
        });
        
        if(suppId && purchaseCartTotal > 0) {
            var supps = getDB('Suppliers'); var sIdx = supps.findIndex(s => s.supplier_id == suppId);
            if(sIdx > -1) { 
                var dueDate = addDays(billDate, creditDays); var isCash = (creditDays == 0); 
                if (!supps[sIdx].bill_history) supps[sIdx].bill_history = []; 
                supps[sIdx].bill_history.push({ bill_no: billNo, bill_date: billDate, amount: purchaseCartTotal, taxable: purTaxable, cgst: purCgst, sgst: purSgst, due_date: dueDate, is_paid: isCash }); 
                if(isCash) {
                    addBankEntry(`सप्लायर रोख खरेदी: ${supps[sIdx].name} (बिल: ${billNo})`, 'OUT', purchaseCartTotal, billDate);
                    if(!supps[sIdx].payment_history) supps[sIdx].payment_history = [];
                    supps[sIdx].payment_history.push({ date: billDate, amount: purchaseCartTotal, mode: "Cash", utr: "", type: "Cash Purchase" });
                } else { supps[sIdx].pending_dues += purchaseCartTotal; }
                setDB('Suppliers', supps); 
            }
        } else if (!suppId && purchaseCartTotal > 0) {
             if(confirm("तुम्ही सप्लायर निवडलेला नाही. हे बिल 'रोख (Cash)' खर्च म्हणून बँकेत नोंदवायचे का?")) {
                 var expenses = getDB('Expenses'); expenses.push({ expense_id: new Date().getTime().toString(), category: "इतर खर्च (General)", description: `औषध खरेदी (बिल: ${billNo})`, amount: purchaseCartTotal, expense_date: billDate, mode: "Cash" }); setDB('Expenses', expenses);
                 addBankEntry(`रोख खरेदी खर्च (बिल: ${billNo})`, 'OUT', purchaseCartTotal, billDate);
             }
        }
        setDB('Medicines', meds); showMessage("✅ खरेदी बिल सेव्ह झाले!", "green"); purchaseCart = []; updatePurchaseCartUI(); if(bEl) bEl.value = ""; refreshAllData(); loadPurchaseDropdown();
    } finally { setTimeout(() => { isProcessing = false; }, 500); }
}

// 🛒 CART & BILLING (विक्री)
var cart = []; var cartTotal = 0; var finalCartTotal = 0; var lastSelectedMedId = ""; 
function toggleUtrField() { var modeElem = document.getElementById('billPaymentMode'); var utrBox = document.getElementById('billUtrNo'); if(!modeElem || !utrBox) return; if(modeElem.value === "UPI") { utrBox.style.display = "block"; utrBox.focus(); } else { utrBox.style.display = "none"; utrBox.value = ""; } }

function loadMedicineDropdown() { 
    var select = document.getElementById('medicineSelect'); if(!select) return; select.innerHTML = "<option value=''>-- औषध निवडा --</option>"; 
    getDB('Medicines').forEach(med => { 
        var pPrice = med.purchasePrice ? med.purchasePrice : 0; var packSize = med.unitsPerPack || 1; var rxVal = med.rx_required ? 'true' : 'false'; var saltVal = med.salt_name || "-"; 
        var rackVal = med.rack_no || "-"; var boxVal = med.box_no || "-"; var gstVal = med.gst_rate || 0; 
        var unitType = med.unitType || ""; var unitName = unitType.split(' ')[0]; if(!unitName) unitName = "पॅक";
        select.innerHTML += `<option value='${med.medicine_id}' data-price='${med.mrp || 0}' data-purchase='${pPrice}' data-stock='${med.stock_qty}' data-pack='${packSize}' data-barcode='${med.batch_no}' data-expiry='${med.expiry_date}' data-rx='${rxVal}' data-hsn='${med.hsn_code||"-"}' data-gst='${gstVal}' data-rack='${rackVal}' data-box='${boxVal}' data-unit='${unitType}'>${med.name} - ₹${parseFloat((med.mrp||0) * packSize).toFixed(2)} / ${unitName}</option>`; 
    }); 
}

function updatePrice() { 
    var select = document.getElementById('medicineSelect'); var typeSelect = document.getElementById('sellType'); var rackDiv = document.getElementById('rackDisplay'); var rackTxt = document.getElementById('rackNumberTxt'); 
    if (!select || select.value === "") { var sP = document.getElementById('sellPrice'); if(sP) sP.value = ""; if(rackDiv) rackDiv.style.display = "none"; lastSelectedMedId = ""; return; } 
    
    var currentMedId = select.value; var option = select.options[select.selectedIndex]; var basePrice = parseFloat(option.getAttribute('data-price')) || 0; var packSize = parseInt(option.getAttribute('data-pack')) || 1; var unit = option.getAttribute('data-unit') || "";
    
    if (currentMedId !== lastSelectedMedId && typeSelect) {
        if (unit.includes('Bottle') || unit.includes('बाटली')) { typeSelect.innerHTML = `<option value="pack">बाटली (Bottle)</option>`; } 
        else if (unit.includes('Tube') || unit.includes('मलम')) { typeSelect.innerHTML = `<option value="pack">ट्युब / मलम</option>`; } 
        else if (unit.includes('Inj') || unit.includes('इंजेक्शन')) { if(packSize > 1) { typeSelect.innerHTML = `<option value="single">सुटे इंजेक्शन</option><option value="pack">संपूर्ण बॉक्स</option>`; } else { typeSelect.innerHTML = `<option value="pack">इंजेक्शन (Inj)</option>`; } } 
        else if (unit.includes('Tab') || unit.includes('गोळी')) { typeSelect.innerHTML = `<option value="single">सुटी गोळी</option><option value="pack">संपूर्ण स्ट्रीप</option>`; } 
        else { typeSelect.innerHTML = `<option value="single">सुटे नग</option><option value="pack">पूर्ण बॉक्स/पॅक</option>`; }
        lastSelectedMedId = currentMedId;
    }
    
    var sQEl = document.getElementById('sellQty'); var inputQty = sQEl ? parseInt(sQEl.value, 10) || 1 : 1; 
    var discEl = document.getElementById('itemDiscount'); var itemDisc = discEl ? parseFloat(discEl.value) || 0 : 0;
    var rackNo = option.getAttribute('data-rack') || "-"; var boxNo = option.getAttribute('data-box') || "-"; 
    
    var grossPrice = (typeSelect && typeSelect.value === 'pack') ? (basePrice * packSize * inputQty) : (basePrice * inputQty); 
    var finalPrice = grossPrice - (grossPrice * (itemDisc/100)); 
    var sPEl = document.getElementById('sellPrice'); if(sPEl) sPEl.value = finalPrice.toFixed(2); 
    
    if(rackDiv && rackTxt) { 
        if((rackNo !== "-" && rackNo !== "") || (boxNo !== "-" && boxNo !== "")) {
            var rText = rackNo !== "-" && rackNo !== "" ? "रॅक: " + rackNo : ""; var bText = boxNo !== "-" && boxNo !== "" ? "बॉक्स: " + boxNo : "";
            var sep = (rText && bText) ? " | " : ""; rackTxt.innerText = rText + sep + bText; rackDiv.style.display = "block"; 
        } else { rackDiv.style.display = "none"; } 
    } 
}

function applyDiscount() { finalCartTotal = cartTotal; var fDisp = document.getElementById('finalTotalDisplay'); if(fDisp) fDisp.innerText = "देय रक्कम: ₹" + finalCartTotal.toFixed(2); }

function addToCart() {
    var select = document.getElementById('medicineSelect'); if(!select) return; var medId = select.value; if (!medId) { alert("⚠️ कृपया आयटम निवडा!"); return; }
    var option = select.options[select.selectedIndex]; var rxReq = option.getAttribute('data-rx') === 'true'; var expDateStr = option.getAttribute('data-expiry'); 
    
    if(expDateStr && expDateStr !== "-") { var expDate = new Date(expDateStr); expDate = new Date(expDate.getFullYear(), expDate.getMonth() + 1, 0); var today = new Date(); today.setHours(0,0,0,0); if (expDate < today) { alert("🚨 धोक्याचा इशारा!\nहे औषध एक्सपायर झाले आहे."); return; } }
    
    var tSel = document.getElementById('sellType'); var sellType = tSel ? tSel.value : 'single'; 
    var qSel = document.getElementById('sellQty'); var inputQty = qSel ? parseInt(qSel.value, 10) : 1; if (isNaN(inputQty) || inputQty <= 0) return;
    var discEl = document.getElementById('itemDiscount'); var discPercent = discEl ? parseFloat(discEl.value) || 0 : 0;
    var packSize = parseInt(option.getAttribute('data-pack'), 10) || 1; var pPrice = parseFloat(option.getAttribute('data-purchase')) || 0; var baseMRP = parseFloat(option.getAttribute('data-price')) || 0; 
    var dEl = document.getElementById('medDosage'); var dosageStr = dEl ? dEl.value : "";
    var realQtyToDeduct = sellType === 'pack' ? (inputQty * packSize) : inputQty; var availableStock = parseInt(option.getAttribute('data-stock'), 10) || 0; 
    var hsnCode = option.getAttribute('data-hsn'); var gstRate = parseInt(option.getAttribute('data-gst')) || 0; var batch = option.getAttribute('data-barcode') || "-"; var unitType = option.getAttribute('data-unit') || ""; 
    
    var existingItem = cart.find(item => item.id === medId && item.batch === batch && item.sellType === sellType); var totalRequestedQty = existingItem ? existingItem.qty + realQtyToDeduct : realQtyToDeduct;
    if (totalRequestedQty > availableStock) { if(!confirm(`⚠️ सिस्टीममध्ये इतका साठा नाही! (उपलब्ध: ${availableStock})\nतरीही बिल बनवायचे का?`)) return; }
    
    var totalPurchaseCost = realQtyToDeduct * pPrice; 
    var grossPrice = sellType === 'pack' ? (baseMRP * packSize * inputQty) : (baseMRP * inputQty); 
    var totalPrice = grossPrice - (grossPrice * (discPercent/100)); 
    var medNameDisplay = option.text.split(' - ₹')[0].replace('(Rx) ', ''); 
    var displayTxt = "";
    if (unitType.includes('Bottle') || unitType.includes('बाटली')) displayTxt = ' बाटली'; else if (unitType.includes('Tube') || unitType.includes('मलम')) displayTxt = ' ट्युब'; else if (unitType.includes('Inj') || unitType.includes('इंजेक्शन')) displayTxt = sellType === 'pack' ? ' बॉक्स' : ' इंज'; else displayTxt = sellType === 'pack' ? ' स्ट्रीप' : ' गोळी';

    if (existingItem) { existingItem.inputQty += inputQty; existingItem.qty += realQtyToDeduct; existingItem.total += totalPrice; existingItem.totalPurchase += totalPurchaseCost; existingItem.dosage = dosageStr; existingItem.displayQty = existingItem.inputQty + displayTxt; } 
    else { cart.push({ id: medId, name: medNameDisplay, batch: batch, hsn: hsnCode, gst_rate: gstRate, expiry: expDateStr, sellType: sellType, inputQty: inputQty, qty: realQtyToDeduct, price: (sellType==='pack' ? baseMRP*packSize : baseMRP), discPercent: discPercent, total: totalPrice, totalPurchase: totalPurchaseCost, dosage: dosageStr, displayQty: inputQty + displayTxt }); } 
    updateCartUI(); if(discEl) discEl.value = "0"; 
}

function updateCartUI() { 
    var cartBody = document.getElementById('cartBody'); if(!cartBody) return; cartBody.innerHTML = ""; cartTotal = 0; 
    cart.forEach((item, index) => { 
        cartTotal += item.total; 
        cartBody.innerHTML += `<tr><td><b>${item.name}</b></td><td><b>${item.displayQty}</b></td><td>₹${parseFloat(item.price||0).toFixed(2)}</td><td style="color:#d35400; font-weight:bold;">${item.discPercent}%</td><td><button onclick="removeCartItem(${index})" class="action-btn delete-btn" style="float:right;">Del</button> ₹${parseFloat(item.total||0).toFixed(2)}</td></tr>`; 
    }); 
    finalCartTotal = cartTotal; var fDisp = document.getElementById('finalTotalDisplay'); if(fDisp) fDisp.innerText = "देय रक्कम: ₹" + finalCartTotal.toFixed(2); 
}
function removeCartItem(index) { cart.splice(index, 1); updateCartUI(); }
function formatExpDate(exp) { if(!exp || exp === "-") return "-"; var parts = exp.split('-'); if(parts.length === 3) return parts[1] + "/" + parts[0].slice(-2); return exp; }

function generateBill(isCredit = false) {
    if(isProcessing) return; 
    try {
        var cnEl = document.getElementById('customerName'); var customerName = cnEl ? cnEl.value : ""; 
        var drEl = document.getElementById('doctorName'); var drName = drEl ? drEl.value : ""; 
        var cgEl = document.getElementById('customerGstin'); var custGstin = cgEl ? cgEl.value.toUpperCase() : ""; 
        var pModeEl = document.getElementById('billPaymentMode'); var payMode = isCredit ? "Credit" : (pModeEl ? pModeEl.value : "Cash"); 
        var uEl = document.getElementById('billUtrNo'); var utrNo = uEl ? uEl.value : "";
        
        if (cart.length === 0 || !customerName) { alert("⚠️ कृपया ग्राहकाचे पूर्ण नाव आणि आयटम जोडा!"); return; } if (!isCredit && payMode === "UPI" && utrNo === "") { if(!confirm("⚠️ तुम्ही UPI निवडले आहे पण UTR टाकला नाही. पुढे जायचे का?")) return; }

        isProcessing = true; 
        var meds = getDB('Medicines'); var totalBillPurchaseCost = 0; var savedCart = JSON.parse(JSON.stringify(cart));
        var stockError = false;
        cart.forEach(item => { var m = meds.find(x => x.medicine_id == item.id); if(m) { if(m.stock_qty < item.qty) stockError = true; m.stock_qty -= item.qty; totalBillPurchaseCost += (item.totalPurchase || 0); } });
        if (stockError && !confirm("⚠️ काही औषधांचा साठा उपलब्ध नाही. (स्टॉक मायनसमध्ये जाईल). तरीही बिल बनवायचे का?")) { return; }
        
        var trueProfit = finalCartTotal - totalBillPurchaseCost; 
        var sales = getDB('Sales'); var newBillId = generateInvoiceNumber(); 
        
        sales.push({ bill_id: newBillId, customer_name: customerName, customer_gstin: custGstin, doctor_name: drName, bill_date: getTodayDateStr(), total_amount: finalCartTotal, bill_profit: trueProfit, items: savedCart, is_credit: isCredit, discount_amt: 0, payment_mode: payMode, utr_no: utrNo, is_cancelled: false });
        if(!setDB('Medicines', meds) || !setDB('Sales', sales)) { return; } 

        if (!isCredit) { addBankEntry(`विक्री जमा: ${customerName} (Bill: ${newBillId})${utrNo ? ' UTR:'+utrNo : ''}`, 'IN', finalCartTotal, getTodayDateStr()); }
        if(isCredit) { var custs = getDB('Customers'); var existingCust = custs.find(c => c.name && c.name.toLowerCase() === customerName.toLowerCase()); if(existingCust) { existingCust.ledger_balance += finalCartTotal; } else { custs.push({customer_id: new Date().getTime().toString(), name: customerName, phone: "", ledger_balance: finalCartTotal, payment_history: []}); } setDB('Customers', custs); var blbl = document.getElementById('billTypeLabel'); if(blbl) blbl.style.display = "block"; showMessage("📝 उधारीचे बिल बनवले!", "red"); } else { var blbl = document.getElementById('billTypeLabel'); if(blbl) blbl.style.display = "none"; showMessage("💵 रोख/UPI बिल यशस्वीरीत्या बनवले!", "green"); }

        var iCust = document.getElementById('invCustomer'); if(iCust) iCust.innerText = customerName; 
        var iDate = document.getElementById('invDate'); if(iDate) iDate.innerText = new Date().toLocaleDateString('en-IN'); 
        var iBill = document.getElementById('invBillNo'); if(iBill) iBill.innerText = newBillId; 
        var iShop = document.getElementById('invFooterShopName'); if(iShop) iShop.innerText = localStorage.getItem('shopName') || "मेडिकल शॉप";
        
        var iDocTxt = document.getElementById('invDoctorText'); if(iDocTxt) { if(drName) { iDocTxt.style.display = "block"; var iDoc = document.getElementById('invDoctor'); if(iDoc) iDoc.innerText = drName; } else { iDocTxt.style.display = "none"; } }
        var iGstWrap = document.getElementById('invCustGstinWrapper'); if(iGstWrap) { if(custGstin) { var iGst = document.getElementById('invCustGstin'); if(iGst) iGst.innerText = custGstin; iGstWrap.style.display = "inline"; } else { iGstWrap.style.display = "none"; } }
        var iPay = document.getElementById('invPayMode'); if(iPay) iPay.innerText = payMode; 
        var iUtrWrap = document.getElementById('invUtrWrapper'); if(iUtrWrap) { if(payMode === "UPI" && utrNo !== "") { var iUtr = document.getElementById('invUtrNo'); if(iUtr) iUtr.innerText = utrNo; iUtrWrap.style.display = "inline"; } else { iUtrWrap.style.display = "none"; } }

        var invHTML = ""; 
        var gstMap = {};
        
        cart.forEach(item => { 
            var batchTxt = item.batch && item.batch !== "-" ? `<br><small>B: ${item.batch}</small>` : "";
            invHTML += `<tr><td>${item.displayQty}</td><td><b>${item.name}</b>${batchTxt}</td><td>${parseFloat(item.price||0).toFixed(2)}</td><td>${item.discPercent}%</td><td style="text-align: right;">${parseFloat(item.total||0).toFixed(2)}</td></tr>`; 
            
            if(item.gst_rate > 0) { 
                var taxRate = item.gst_rate; var baseValue = item.total / (1 + (taxRate/100)); var taxAmt = item.total - baseValue; 
                if(!gstMap[taxRate]) gstMap[taxRate] = { base: 0, tax: 0 }; gstMap[taxRate].base += baseValue; gstMap[taxRate].tax += taxAmt; 
            }
        });
        
        var iBody = document.getElementById('invoiceBody'); if(iBody) iBody.innerHTML = invHTML; 
        var iTot = document.getElementById('invTotal'); if(iTot) iTot.innerText = finalCartTotal.toFixed(2); 
        
        var iDiscRow = document.getElementById('invDiscountRow'); if(iDiscRow) iDiscRow.style.display = "none"; 
        
        var gstKeys = Object.keys(gstMap);
        var iGstTab = document.getElementById('invGstTable');
        if(iGstTab) { if(gstKeys.length > 0) { var gstHtml = ""; gstKeys.forEach(rate => { var halfRate = parseFloat(rate)/2; var halfTax = gstMap[rate].tax / 2; gstHtml += `<tr><td>${rate}%</td><td>${gstMap[rate].base.toFixed(2)}</td><td>${halfTax.toFixed(2)}</td><td>${halfTax.toFixed(2)}</td></tr>`; }); var iGstBody = document.getElementById('invGstBody'); if(iGstBody) iGstBody.innerHTML = gstHtml; iGstTab.style.display = "table"; } else { iGstTab.style.display = "none"; } }
        
        var invSec = document.getElementById('invoiceSection'); if(invSec) invSec.style.display = "block"; 
        cancelBilling(); refreshAllData(); window.scrollTo(0, document.body.scrollHeight);
    } finally { setTimeout(() => { isProcessing = false; }, 500); }
}

function printInvoice() { var invSec = document.getElementById('invoiceSection'); if(!invSec) return; var printContents = invSec.innerHTML; var originalContents = document.body.innerHTML; document.body.innerHTML = printContents; window.print(); document.body.innerHTML = originalContents; location.reload(); }

// ==========================================
// ६. डॅशबोर्ड व रिपोर्ट 
// ==========================================
function calculateFinancialDashboard() {
    var sales = getDB('Sales'); var expenses = getDB('Expenses'); var todayStr = getTodayDateStr(); var todaySales = 0, todayExp = 0, todayProfit = 0; var totalSales = 0, totalExp = 0, totalProfit = 0; var itemSalesMap = {}; 
    sales.forEach(s => { 
        if(s.is_cancelled) return; 
        totalSales += parseFloat(s.total_amount||0); totalProfit += parseFloat(s.bill_profit||0); 
        if(s.bill_date === todayStr) { todaySales += parseFloat(s.total_amount||0); todayProfit += parseFloat(s.bill_profit||0); } 
        if(s.items) { s.items.forEach(item => { if(!itemSalesMap[item.id]) itemSalesMap[item.id] = {name: item.name, qty: 0, profit: 0}; itemSalesMap[item.id].qty += parseInt(item.qty || 0); itemSalesMap[item.id].profit += (parseFloat(item.price || 0) * parseInt(item.qty || 0)) - parseFloat(item.totalPurchase || 0); }); } 
    });
    expenses.forEach(e => { totalExp += parseFloat(e.amount||0); if(e.expense_date === todayStr) { todayExp += parseFloat(e.amount||0); } });
    var dsSales = document.getElementById('dashTodaySales'); if(dsSales) dsSales.innerText = "₹" + todaySales.toFixed(2); 
    var dsExp = document.getElementById('dashTodayExpense'); if(dsExp) dsExp.innerText = "₹" + todayExp.toFixed(2);
    var netToday = todayProfit - todayExp; var dNet = document.getElementById('dashNetProfit'); if(dNet) { dNet.innerText = "₹" + netToday.toFixed(2); dNet.style.color = netToday < 0 ? "#d32f2f" : "#00695c"; }
    var dlSales = document.getElementById('dashLifeSales'); if(dlSales) dlSales.innerText = "₹" + totalSales.toFixed(2); 
    var dlExp = document.getElementById('dashLifeExpense'); if(dlExp) dlExp.innerText = "₹" + totalExp.toFixed(2);
    var netTotal = totalProfit - totalExp; var dlProf = document.getElementById('dashLifeProfit'); if(dlProf) { dlProf.innerText = "₹" + netTotal.toFixed(2); dlProf.style.color = netTotal < 0 ? "#c62828" : "#6a1b9a"; }
}
function loadInventoryStats() {
    var dTot = document.getElementById('dashTotalMeds'); if(!dTot) return; var meds = getDB('Medicines'); var lowStockCount = 0; var expiryCount = 0; var today = new Date().getTime();
    meds.forEach(med => { if (med.stock_qty <= 0) { lowStockCount++; } var daysDiff = Math.ceil((new Date(med.expiry_date).getTime() - today) / (1000 * 3600 * 24)); if (daysDiff <= 30) { expiryCount++; } });
    dTot.innerText = meds.length; var dLow = document.getElementById('dashLowStock'); if(dLow) dLow.innerText = lowStockCount; var dExp = document.getElementById('dashExpiry'); if(dExp) dExp.innerText = expiryCount;
}
function printDashboard() { var dOver = document.getElementById('dashboardOverview'); if(!dOver) return; var printContents = dOver.innerHTML; var originalContents = document.body.innerHTML; document.body.innerHTML = "<h2 style='text-align:center;'>🩺 मेडिकल शॉप: फायनान्शियल रिपोर्ट</h2>" + printContents; window.print(); document.body.innerHTML = originalContents; location.reload(); }

function displayTodayBills() {
    var listBody = document.getElementById('todayBillsList'); if(!listBody) return; listBody.innerHTML = ""; var todayStr = getTodayDateStr(); var todaySales = getDB('Sales').filter(s => s.bill_date === todayStr).reverse();
    if (todaySales.length === 0) { listBody.innerHTML = "<tr><td colspan='3' style='text-align:center;'>आज अजून कोणतेही बिल बनवले नाही.</td></tr>"; return; }
    todaySales.forEach(sale => { 
        var isCred = sale.is_credit ? "<span style='color:red;'>(उधारी)</span>" : "<span style='color:green;'>(रोख)</span>"; var drText = sale.doctor_name ? `<br><small style="color:#8e24aa;">Dr. ${sale.doctor_name}</small>` : ""; 
        if(sale.is_cancelled) { listBody.innerHTML += `<tr class="cancelled-bill"><td><b>${sale.customer_name}</b> <small>(Cancelled)</small><br><small>${sale.bill_id}</small></td><td>₹${parseFloat(sale.total_amount||0).toFixed(2)}</td><td><span style="color:red; font-weight:bold;">Cancelled</span></td></tr>`; } 
        else { listBody.innerHTML += `<tr><td><b>${sale.customer_name}</b> ${isCred}${drText}<br><small style="color:gray;">${sale.bill_id}</small></td><td style='color: #2e7d32; font-weight: bold;'>₹${parseFloat(sale.total_amount||0).toFixed(2)}</td><td><button onclick="deleteBill('${sale.bill_id}')" class="action-btn delete-btn">रद्द</button></td></tr>`; }
    });
}
function deleteBill(billId) { 
    if (!confirm("⚠️ हे बिल रद्द करायचे आहे का?\n(साठा आणि बँकेचा व्यवहार पूर्ववत केला जाईल, पण ऑडिटसाठी बिल सिस्टीममध्ये 'Cancelled' म्हणून राहील)")) return; 
    var sales = getDB('Sales'); var billIndex = sales.findIndex(s => s.bill_id == billId); if (billIndex === -1) return; 
    var billToCancel = sales[billIndex]; if(billToCancel.is_cancelled) return; 
    
    var meds = getDB('Medicines'); if (billToCancel.items) { billToCancel.items.forEach(item => { var m = meds.find(x => x.medicine_id == item.id); if (m) m.stock_qty += (item.qty || 0); }); setDB('Medicines', meds); } 
    if(billToCancel.is_credit) { var custs = getDB('Customers'); var existingCust = custs.find(c => c.name && c.name.toLowerCase() === billToCancel.customer_name.toLowerCase()); if(existingCust) { existingCust.ledger_balance -= parseFloat(billToCancel.total_amount||0); setDB('Customers', custs); } } 
    
    if(!billToCancel.is_credit) { addBankEntry(`बिल रद्द (Refund): ${billToCancel.customer_name} (Bill: ${billId})`, 'OUT', billToCancel.total_amount, getTodayDateStr()); }
    billToCancel.is_cancelled = true; setDB('Sales', sales); showMessage("🗑️ बिल रद्द झाले (Audit Tracked)!", "red"); refreshAllData(); 
}

// ==========================================
// ७. 💳 स्मार्ट पेमेंट पॉप-अप व खातेवही 
// ==========================================
function openPaymentModal(type, id, name, defaultAmount) { 
    var pt = document.getElementById('payModalType'); if(pt) pt.value = type; 
    var pi = document.getElementById('payModalId'); if(pi) pi.value = id; 
    var pn = document.getElementById('payModalName'); if(pn) pn.value = name; 
    var title = ""; if(type === 'supplier') title = "सप्लायर पेमेंट: " + name; if(type === 'customer') title = "ग्राहक जमा: " + name; if(type === 'staff_advance') title = "कर्मचारी उचल: " + name; if(type === 'staff_salary') title = "कर्मचारी पगार वाटप: " + name; 
    var pTit = document.getElementById('payModalTitle'); if(pTit) pTit.innerText = title; 
    var pAmt = document.getElementById('payModalAmount'); if(pAmt) pAmt.value = defaultAmount > 0 ? defaultAmount : ""; 
    var pMod = document.getElementById('payModalMode'); if(pMod) pMod.value = "Cash"; 
    var pUtr = document.getElementById('payModalUtr'); if(pUtr) { pUtr.value = ""; pUtr.style.display = "none"; }
    var pModUI = document.getElementById('paymentModal'); if(pModUI) pModUI.style.display = "flex"; 
}
function closePaymentModal() { var pMod = document.getElementById('paymentModal'); if(pMod) pMod.style.display = "none"; }
function toggleModalUtr() { var modeElem = document.getElementById('payModalMode'); var utrBox = document.getElementById('payModalUtr'); if(!modeElem || !utrBox) return; utrBox.style.display = modeElem.value === "UPI" ? "block" : "none"; }
function payDues(id, name, bal) { openPaymentModal('customer', id, name, bal); }
function paySupplier(id, name, bal) { openPaymentModal('supplier', id, name, bal); }
function payAdvance(id, name) { openPaymentModal('staff_advance', id, name, 0); }
function paySalary(id, name, salary, advance) { var netPayable = salary - advance; if(netPayable < 0) { alert(`⚠️ ${name} यांची उचल (${advance}) त्यांच्या पगारापेक्षा (${salary}) जास्त आहे! आधी उचल क्लिअर करा.`); return; } openPaymentModal('staff_salary', id, name, netPayable); }

function confirmPaymentModal() {
    if(isProcessing) return; 
    try {
        var pt = document.getElementById('payModalType'); var type = pt ? pt.value : ""; 
        var pi = document.getElementById('payModalId'); var id = pi ? pi.value : ""; 
        var pn = document.getElementById('payModalName'); var name = pn ? pn.value : ""; 
        var pa = document.getElementById('payModalAmount'); var amount = pa ? parseFloat(pa.value) : 0; 
        var pm = document.getElementById('payModalMode'); var mode = pm ? pm.value : "Cash"; 
        var pu = document.getElementById('payModalUtr'); var utr = pu ? cleanText(pu.value) : "";
        if(isNaN(amount) || amount <= 0) { alert("⚠️ कृपया योग्य रक्कम टाका!"); return; } if(mode === 'UPI' && utr === "") { if(!confirm("⚠️ तुम्ही UTR नंबर टाकला नाही, तरीही सेव्ह करायचे का?")) return; }
        isProcessing = true;
        var dateStr = getTodayDateStr(); var descSuffix = mode === 'UPI' ? (utr ? ` (UPI: ${utr})` : " (UPI)") : " (Cash)"; var pEntry = { date: dateStr, amount: amount, mode: mode, utr: utr }; 
        
        if(type === 'supplier') { var supps = getDB('Suppliers'); var idx = supps.findIndex(s => s.supplier_id == id); if(idx > -1) { supps[idx].pending_dues -= amount; if(!supps[idx].payment_history) supps[idx].payment_history = []; supps[idx].payment_history.push(pEntry); if(setDB('Suppliers', supps)) { addBankEntry(`सप्लायर पेमेंट: ${name}${descSuffix}`, 'OUT', amount, dateStr); showVoucher('PAYMENT VOUCHER (नावे)', name, amount, mode, utr, dateStr, 'सप्लायर बिल पेमेंट'); } } }
        else if(type === 'customer') { var custs = getDB('Customers'); var idx = custs.findIndex(c => c.customer_id == id); if(idx > -1) { custs[idx].ledger_balance -= amount; if(!custs[idx].payment_history) custs[idx].payment_history = []; custs[idx].payment_history.push(pEntry); if(setDB('Customers', custs)) { addBankEntry(`ग्राहक जमा: ${name}${descSuffix}`, 'IN', amount, dateStr); showVoucher('RECEIPT VOUCHER (जमा)', name, amount, mode, utr, dateStr, 'उधारी जमा'); } } }
        else if(type === 'staff_advance') { var staff = getDB('Staff'); var idx = staff.findIndex(s => s.staff_id == id); if(idx > -1) { staff[idx].advance_balance += amount; if(!staff[idx].payment_history) staff[idx].payment_history = []; staff[idx].payment_history.push({ date: dateStr, amount: amount, mode: mode, utr: utr, type: 'Advance' }); if(setDB('Staff', staff)) { var expenses = getDB('Expenses'); expenses.push({expense_id: new Date().getTime().toString(), category: "पगार/मजुरी (Wages)", description: `ऍडव्हान्स: ${name}${descSuffix}`, amount: amount, expense_date: dateStr, mode: mode}); setDB('Expenses', expenses); addBankEntry(`कर्मचारी उचल: ${name}${descSuffix}`, 'OUT', amount, dateStr); showVoucher('PAYMENT VOUCHER (उचल)', name, amount, mode, utr, dateStr, 'कर्मचारी ऍडव्हान्स पेमेंट'); } } }
        else if(type === 'staff_salary') { var staff = getDB('Staff'); var idx = staff.findIndex(s => s.staff_id == id); if(idx > -1) { staff[idx].advance_balance = 0; if(!staff[idx].payment_history) staff[idx].payment_history = []; staff[idx].payment_history.push({ date: dateStr, amount: amount, mode: mode, utr: utr, type: 'Salary' }); if(setDB('Staff', staff)) { var expenses = getDB('Expenses'); expenses.push({expense_id: new Date().getTime().toString(), category: "पगार/मजुरी (Wages)", description: `पगार दिला: ${name}${descSuffix}`, amount: amount, expense_date: dateStr, mode: mode}); setDB('Expenses', expenses); addBankEntry(`कर्मचारी पगार: ${name}${descSuffix}`, 'OUT', amount, dateStr); showVoucher('PAYMENT VOUCHER (पगार)', name, amount, mode, utr, dateStr, 'कर्मचारी पगार वाटप'); } } }
        closePaymentModal(); refreshAllData(); 
    } finally { setTimeout(() => { isProcessing = false; }, 500); }
}

function editCustomer(id) { var c = getDB('Customers').find(x => x.customer_id == id); if(c) { var eC = document.getElementById('editCustId'); if(eC) eC.value = c.customer_id; var cN = document.getElementById('custName'); if(cN) cN.value = c.name; var cP = document.getElementById('custPhone'); if(cP) cP.value = c.phone || ""; var cB = document.getElementById('custBalance'); if(cB) { cB.value = c.ledger_balance; cB.disabled = true; } var cF = document.getElementById('customerForm'); if(cF) window.scrollTo(0, cF.offsetTop - 50); showMessage("✏️ ग्राहक माहिती एडिट मोडमध्ये आहे.", "orange"); } }
function saveCustomer() { 
    if(isProcessing) return; 
    try {
        var eC = document.getElementById('editCustId'); var editId = eC ? eC.value : ""; 
        var cN = document.getElementById('custName'); var name = cN ? cN.value : ""; 
        var cP = document.getElementById('custPhone'); var phone = cP ? cP.value : ""; 
        var cB = document.getElementById('custBalance'); var balance = cB ? parseFloat(cB.value) || 0 : 0; 
        if (!name) return; 
        isProcessing = true;
        var custs = getDB('Customers'); 
        if(editId) { var idx = custs.findIndex(c => c.customer_id == editId); if(idx > -1) { custs[idx].name = name; custs[idx].phone = phone; setDB('Customers', custs); } if(eC) eC.value = ""; } 
        else { if(custs.find(c => c.name && c.name.trim().toLowerCase() === name.trim().toLowerCase())) { alert("⚠️ हा ग्राहक आधीपासूनच जोडलेला आहे!"); return; } var hist = []; if(balance > 0) { hist.push({ date: getTodayDateStr(), amount: balance, mode: "Opening Balance", utr: "" }); } custs.push({customer_id: new Date().getTime().toString(), name: name.trim(), phone, ledger_balance: balance, payment_history: hist}); setDB('Customers', custs); }
        showMessage("📓 ग्राहक सेव्ह झाला!", "green"); cancelForm('customerForm', 'editCustId', false); refreshAllData(); 
    } finally { setTimeout(() => { isProcessing = false; }, 500); }
}
function displayCustomers() { 
    var listBody = document.getElementById('customerList'); if(!listBody) return; listBody.innerHTML = ""; var custs = getDB('Customers').sort((a,b) => b.ledger_balance - a.ledger_balance); if (custs.length === 0) return; 
    custs.forEach(c => { 
        var balText = c.ledger_balance <= 0 ? `₹${(Math.abs(c.ledger_balance) || 0).toFixed(2)}` : `₹${parseFloat(c.ledger_balance||0).toFixed(2)}`; var balColor = c.ledger_balance <= 0 ? "green" : "red"; var histHTML = ""; 
        if(c.payment_history && c.payment_history.length > 0) { histHTML = "<div style='margin-top:5px; border-top:1px dashed #ccc; padding-top:3px;'>"; c.payment_history.slice(-3).reverse().forEach(p => { if(p.mode === 'Opening Balance') { histHTML += `<div style="font-size:10px; color:#2980b9; font-weight:bold;">${p.date}: सुरुवातीची बाकी ₹${parseFloat(p.amount||0).toFixed(2)}</div>`; } else { var utrTxt = p.utr ? ` (${p.utr})` : ""; var icon = p.mode === 'UPI' ? '📱' : '💵'; histHTML += `<div style="font-size:10px; color:gray;">${p.date}: ${icon} ₹${parseFloat(p.amount||0).toFixed(2)}${utrTxt}</div>`; } }); histHTML += "</div>"; }
        listBody.innerHTML += `<tr><td><b>${c.name}</b> <button class="edit-btn" style="float:right;" onclick="editCustomer('${c.customer_id}')">✏️</button>${histHTML}</td><td style='color: ${balColor}; vertical-align: middle; font-weight:bold;'>${balText}</td><td style="vertical-align: middle;"><button onclick="payDues('${c.customer_id}', '${c.name}', ${c.ledger_balance})" class="btn-save" style="padding: 5px;">जमा करा</button></td></tr>`; 
    }); 
}

function editSupplier(id) { var s = getDB('Suppliers').find(x => x.supplier_id == id); if(s) { var eS = document.getElementById('editSuppId'); if(eS) eS.value = s.supplier_id; var sN = document.getElementById('suppName'); if(sN) sN.value = s.name; var sP = document.getElementById('suppPhone'); if(sP) sP.value = s.phone || ""; var sG = document.getElementById('suppGstinInput'); if(sG) sG.value = s.gstin || ""; var sB = document.getElementById('suppBalance'); if(sB) { sB.value = s.pending_dues; sB.disabled = true; } var sF = document.getElementById('supplierForm'); if(sF) window.scrollTo(0, sF.offsetTop - 50); showMessage("✏️ सप्लायर माहिती एडिट मोडमध्ये आहे.", "orange"); } }
function saveSupplier() { 
    if(isProcessing) return; 
    try {
        var eS = document.getElementById('editSuppId'); var editId = eS ? eS.value : ""; 
        var sN = document.getElementById('suppName'); var name = sN ? sN.value : ""; 
        var sP = document.getElementById('suppPhone'); var phone = sP ? sP.value : ""; 
        var sG = document.getElementById('suppGstinInput'); var gstin = sG ? sG.value.toUpperCase() : ""; 
        var sB = document.getElementById('suppBalance'); var balance = sB ? parseFloat(sB.value) || 0 : 0; 
        if (!name) return; 
        isProcessing = true;
        var supps = getDB('Suppliers'); 
        if(editId) { var idx = supps.findIndex(s => s.supplier_id == editId); if(idx > -1) { supps[idx].name = name; supps[idx].phone = phone; supps[idx].gstin = gstin; setDB('Suppliers', supps); } if(eS) eS.value = ""; } 
        else { if(supps.find(s => s.name && s.name.trim().toLowerCase() === name.trim().toLowerCase())) { alert("⚠️ हा सप्लायर आधीपासूनच जोडलेला आहे!"); return; } var bHist = []; if(balance > 0) { bHist.push({ bill_no: "OPENING", bill_date: getTodayDateStr(), amount: balance, due_date: getTodayDateStr(), is_paid: false, is_opening: true }); } supps.push({supplier_id: new Date().getTime().toString(), name: name.trim(), phone, gstin: gstin, pending_dues: balance, bill_history: bHist, payment_history: []}); setDB('Suppliers', supps); }
        showMessage("🚚 सप्लायर सेव्ह झाला!", "green"); cancelForm('supplierForm', 'editSuppId', false); loadSupplierDropdown(); refreshAllData(); 
    } finally { setTimeout(() => { isProcessing = false; }, 500); }
}
function displaySuppliers() { 
    var listBody = document.getElementById('supplierList'); if(!listBody) return; listBody.innerHTML = ""; var supps = getDB('Suppliers'); var today = getTodayDateStr();
    supps.forEach(s => { 
        var gstinHTML = s.gstin ? `<span style="font-size:10px; color:#8e24aa; font-weight:bold;">GSTIN: ${s.gstin}</span><br>` : "";
        var dueInfoHTML = ""; if (s.bill_history) { s.bill_history.forEach(bill => { if (!bill.is_paid) { if(bill.is_opening) { dueInfoHTML += `<div style="font-size: 11px; color: #2980b9; font-weight:bold; border-bottom: 1px solid #eee; padding: 5px 0;">${bill.bill_date} --- सुरुवातीची बाकी ₹${parseFloat(bill.amount||0).toFixed(2)}</div>`; } else { var isOverdue = today > bill.due_date; var color = isOverdue ? "red" : "#e67e22"; var warning = isOverdue ? "🚨 मुदत संपली!" : "⏳ देय आहे"; dueInfoHTML += `<div style="font-size: 11px; color: ${color}; border-bottom: 1px solid #eee; padding: 5px 0;">${bill.bill_date} [Bill: ${bill.bill_no}] --- ₹${parseFloat(bill.amount||0).toFixed(2)} --- <b>${bill.due_date}</b> (${warning})</div>`; } } }); }
        var histHTML = ""; if(s.payment_history && s.payment_history.length > 0) { histHTML += "<div style='margin-top:5px; border-top:1px dashed #ccc; padding-top:3px;'>"; s.payment_history.slice(-3).reverse().forEach(p => { var utrTxt = p.utr ? ` (${p.utr})` : ""; var icon = p.mode === 'UPI' ? '📱' : '💵'; histHTML += `<div style="font-size:10px; color:gray;">${p.date}: ${icon} ₹${parseFloat(p.amount||0).toFixed(2)}${utrTxt}</div>`; }); histHTML += "</div>"; }
        listBody.innerHTML += `<tr><td><b>${s.name}</b> <button class="edit-btn" style="float:right;" onclick="editSupplier('${s.supplier_id}')">✏️</button><br>${gstinHTML}${dueInfoHTML}${histHTML}</td><td style='color: red; font-weight: bold; vertical-align: middle;'>₹${parseFloat(s.pending_dues||0).toFixed(2)}</td><td style="vertical-align: middle;"><button onclick="paySupplier('${s.supplier_id}', '${s.name}', ${s.pending_dues})" class="btn-save" style="padding:5px;">पैसे द्या</button></td></tr>`; 
    }); 
}

function editStaff(id) { var s = getDB('Staff').find(x => x.staff_id == id); if(s) { var eS = document.getElementById('editStaffId'); if(eS) eS.value = s.staff_id; var sN = document.getElementById('staffName'); if(sN) sN.value = s.name; var sSal = document.getElementById('staffSalary'); if(sSal) sSal.value = s.salary || 0; var sAdv = document.getElementById('staffAdvance'); if(sAdv) sAdv.value = s.advance_balance || 0; var sF = document.getElementById('staffForm'); if(sF) window.scrollTo(0, sF.offsetTop - 50); showMessage("✏️ कर्मचारी माहिती एडिट मोडमध्ये आहे.", "orange"); } }
function saveStaff() { 
    if(isProcessing) return; 
    try {
        var eS = document.getElementById('editStaffId'); var editId = eS ? eS.value : ""; 
        var sN = document.getElementById('staffName'); var name = sN ? sN.value : ""; 
        var sSal = document.getElementById('staffSalary'); var salary = sSal ? parseFloat(sSal.value) || 0 : 0; 
        var sAdv = document.getElementById('staffAdvance'); var advance = sAdv ? parseFloat(sAdv.value) || 0 : 0; 
        if (!name) return; 
        isProcessing = true;
        var staff = getDB('Staff'); 
        if(editId) { var idx = staff.findIndex(s => s.staff_id == editId); if(idx > -1) { staff[idx].name = name; staff[idx].salary = salary; staff[idx].advance_balance = advance; setDB('Staff', staff); } if(eS) eS.value = ""; } 
        else { if(staff.find(s => s.name && s.name.trim().toLowerCase() === name.trim().toLowerCase())) { alert("⚠️ हा कर्मचारी आधीपासूनच जोडलेला आहे!"); return; } staff.push({staff_id: new Date().getTime().toString(), name: name.trim(), salary, advance_balance: advance, payment_history: []}); setDB('Staff', staff); }
        showMessage("👨‍💼 कर्मचारी सेव्ह झाला!", "green"); cancelForm('staffForm', 'editStaffId', false); refreshAllData(); 
    } finally { setTimeout(() => { isProcessing = false; }, 500); }
}
function displayStaff() { 
    var listBody = document.getElementById('staffList'); if(!listBody) return; listBody.innerHTML = ""; var staff = getDB('Staff').sort((a,b) => b.advance_balance - a.advance_balance); if (staff.length === 0) { listBody.innerHTML = "<tr><td colspan='3' style='text-align:center;'>कर्मचारी नाहीत.</td></tr>"; return; } 
    staff.forEach(s => { 
        var histHTML = ""; if(s.payment_history && s.payment_history.length > 0) { histHTML = "<div style='margin-top:5px; border-top:1px dashed #ccc; padding-top:3px;'>"; s.payment_history.slice(-3).reverse().forEach(p => { var txt = p.type === 'Salary' ? `पगार दिला` : `उचल दिली`; var icon = p.mode === 'UPI' ? '📱' : '💵'; histHTML += `<div style="font-size:10px; color:gray;">${p.date}: ${icon} ${txt} ₹${parseFloat(p.amount||0).toFixed(2)}</div>`; }); histHTML += "</div>"; }
        listBody.innerHTML += `<tr><td><b>${s.name}</b> <button class="edit-btn" style="float:right;" onclick="editStaff('${s.staff_id}')">✏️</button><br><small>पगार: ₹${parseFloat(s.salary||0).toFixed(2)}</small>${histHTML}</td><td style='color: ${s.advance_balance > 0 ? "red" : "green"}; vertical-align: middle; font-weight:bold;'>₹${parseFloat(s.advance_balance||0).toFixed(2)}</td><td style="vertical-align: middle;"><button onclick="payAdvance('${s.staff_id}', '${s.name}')" class="btn-save" style="background-color: #00897b; padding: 5px; width: 100%; margin-bottom: 5px;">उचल द्या</button><br><button onclick="paySalary('${s.staff_id}', '${s.name}', ${s.salary || 0}, ${s.advance_balance || 0})" class="btn-save" style="background-color: #2980b9; padding: 5px; width: 100%;">पगार द्या</button></td></tr>`; 
    }); 
}

function downloadRealFile(content, fileName, mimeType) {
    var a = document.createElement('a');
    var blob = new Blob([content], {type: mimeType});
    var url = URL.createObjectURL(blob);
    a.href = url; a.download = fileName;
    document.body.appendChild(a); a.click();
    setTimeout(function() { document.body.removeChild(a); window.URL.revokeObjectURL(url); }, 0);
}

// 💡 3. CA Excel Data Export Bug Fixes
function exportCAExcel() {
    var sales = getDB('Sales'); var expenses = getDB('Expenses'); var meds = getDB('Medicines'); var bank = getDB('BankTransactions'); var supps = getDB('Suppliers');
    
    // GSTR-1 Sales Report
    var tsvContent = "--- SALES REPORT (GST Format / GSTR-1) ---\nDate\tBill No\tSale Type\tCustomer\tGSTIN\tDoctor\tPayment Mode\tUTR\tStatus\tTaxable Amt\tCGST Amt\tSGST Amt\tTotal Amt\tNet Profit\n";
    var hsnSummary = {}; 
    
    sales.forEach(function(s) { 
        var dr = s.doctor_name ? s.doctor_name : "-"; var cust = s.customer_name; var type = s.payment_mode || (s.is_credit ? "Credit" : "Cash"); var utr = s.utr_no || "-"; var cGstin = s.customer_gstin ? s.customer_gstin : "-"; 
        var status = s.is_cancelled ? "CANCELLED" : "OK";
        var saleType = cGstin !== "-" ? "B2B" : "B2CS"; 
        
        var totalTaxable = 0; var totalCgst = 0; var totalSgst = 0;
        if(!s.is_cancelled && s.items) { 
            s.items.forEach(item => { 
                var baseVal = item.total;
                if(item.gst_rate > 0) { 
                    baseVal = item.total / (1 + (item.gst_rate/100)); var taxAmt = item.total - baseVal; 
                    totalTaxable += baseVal; totalCgst += taxAmt/2; totalSgst += taxAmt/2; 
                } else { totalTaxable += item.total; }
                
                var hsn = item.hsn && item.hsn !== "-" ? item.hsn : "No HSN";
                if(!hsnSummary[hsn]) hsnSummary[hsn] = { taxable: 0, cgst: 0, sgst: 0, total: 0 };
                hsnSummary[hsn].taxable += baseVal;
                if(item.gst_rate > 0) { hsnSummary[hsn].cgst += (item.total - baseVal)/2; hsnSummary[hsn].sgst += (item.total - baseVal)/2; }
                hsnSummary[hsn].total += item.total;
            }); 
        }
        tsvContent += `${s.bill_date}\t${s.bill_id}\t${saleType}\t${cust}\t${cGstin}\t${dr}\t${type}\t${utr}\t${status}\t${totalTaxable.toFixed(2)}\t${totalCgst.toFixed(2)}\t${totalSgst.toFixed(2)}\t${parseFloat(s.total_amount||0).toFixed(2)}\t${parseFloat(s.bill_profit||0).toFixed(2)}\n`; 
    });
    
    // GSTR-2 Purchase Report
    tsvContent += "\n--- PURCHASE REGISTER (Input Tax Credit / GSTR-2) ---\nDate\tSupplier Name\tSupplier GSTIN\tSupplier Bill No\tStatus\tTaxable Amt\tCGST\tSGST\tTotal Amount\n";
    supps.forEach(function(s) { 
        var sGstin = s.gstin || "-"; 
        if(s.bill_history) { 
            s.bill_history.forEach(b => { 
                if(!b.is_opening) { 
                    var st = b.is_paid ? "Cash Paid" : "Unpaid";
                    var tVal = b.taxable ? parseFloat(b.taxable).toFixed(2) : "-"; var cg = b.cgst ? parseFloat(b.cgst).toFixed(2) : "-"; var sg = b.sgst ? parseFloat(b.sgst).toFixed(2) : "-";
                    tsvContent += `${b.bill_date}\t${s.name}\t${sGstin}\t${b.bill_no}\t${st}\t${tVal}\t${cg}\t${sg}\t${parseFloat(b.amount||0).toFixed(2)}\n`; 
                } 
            }); 
        } 
    });

    tsvContent += "\n--- EXPENSE REPORT (खर्च अहवाल) ---\nतारीख (Date)\tCategory\tखर्चाचे कारण (Description)\tपेमेंट मोड\tरक्कम (Amount)\n";
    expenses.forEach(function(e) { var eMode = e.mode || "Cash"; var cat = e.category || "-"; tsvContent += `${e.expense_date}\t${cat}\t${e.description}\t${eMode}\t${parseFloat(e.amount||0).toFixed(2)}\n`; });
    
    // HSN Summary (GSTR-1 Mandatory)
    tsvContent += "\n--- HSN SUMMARY (Outward Supplies) ---\nHSN Code\tTaxable Value\tCGST Amount\tSGST Amount\tTotal Value\n";
    Object.keys(hsnSummary).forEach(function(k) { tsvContent += `${k}\t${hsnSummary[k].taxable.toFixed(2)}\t${hsnSummary[k].cgst.toFixed(2)}\t${hsnSummary[k].sgst.toFixed(2)}\t${hsnSummary[k].total.toFixed(2)}\n`; });

    // CA Cash vs Bank (Balance Sheet Logic)
    tsvContent += "\n--- DAYBOOK / BANK STATEMENT (बँक व रोख खाते) ---\nतारीख (Date)\tव्यवहाराचे कारण (Description)\tरोख जमा (Cash IN)\tरोख नावे (Cash OUT)\tबँक जमा (Bank IN)\tबँक नावे (Bank OUT)\n";
    var tCash = 0, tBank = 0; 
    bank.forEach(b => { 
        var isBank = b.description.includes('UPI'); var amt = parseFloat(b.amount||0);
        if(b.type === 'IN') {
            if(isBank) { tBank += amt; tsvContent += `${b.date}\t${b.description}\t-\t-\t${amt.toFixed(2)}\t-\n`; } else { tCash += amt; tsvContent += `${b.date}\t${b.description}\t${amt.toFixed(2)}\t-\t-\t-\n`; }
        } else {
            if(isBank) { tBank -= amt; tsvContent += `${b.date}\t${b.description}\t-\t-\t-\t${amt.toFixed(2)}\n`; } else { tCash -= amt; tsvContent += `${b.date}\t${b.description}\t-\t${amt.toFixed(2)}\t-\t-\n`; }
        }
    }); 
    tsvContent += `\tएकूण (Total Balances):\t\tरोख (Cash): ${tCash.toFixed(2)}\tबँक (Bank): ${tBank.toFixed(2)}\n`;
    
    // Inventory Valuation (AS-2: Cost Price for Positive Stock Only)
    var totalStockValue = 0; tsvContent += "\n--- CLOSING INVENTORY (शिल्लक साठा) ---\nऔषध (Item Name)\tप्रकार (Category)\tHSN (HSN Code)\tबॅच (Batch)\tरॅक (Rack)\tएक्सपायरी (Expiry)\tशिल्लक नग (Qty)\tखरेदी दर (PTR)\tएकूण किंमत (Stock Value)\n";
    meds.forEach(function(m) { 
        var qty = m.stock_qty > 0 ? m.stock_qty : 0; // Negative stock should not be valued
        var val = qty * (m.purchasePrice || 0); totalStockValue += val; 
        var cat = m.category || "Medicine"; var hsn = m.hsn_code || "-"; var rack = m.rack_no || "-"; 
        tsvContent += `${m.name}\t${cat}\t${hsn}\t${m.batch_no}\t${rack}\t${m.expiry_date}\t${qty}\t${parseFloat(m.purchasePrice||0).toFixed(2)}\t${val.toFixed(2)}\n`; 
    });
    tsvContent += `\t\t\t\t\t\t\t\tएकूण साठा मूल्य (Total Value):\t${totalStockValue.toFixed(2)}\n`; 
    
    downloadRealFile(tsvContent, "CA_Audit_Report.xls", "application/vnd.ms-excel");
    showMessage("✅ CA रिपोर्ट फाईल डाऊनलोड झाली!", "green");
}

function exportData() { 
    var backupData = { medicines: getDB('Medicines'), sales: getDB('Sales'), customers: getDB('Customers'), suppliers: getDB('Suppliers'), expenses: getDB('Expenses'), staff: getDB('Staff'), bank: getDB('BankTransactions'), lastInvoiceNo: localStorage.getItem('lastInvoiceNo') || '0' }; 
    var dataStr = JSON.stringify(backupData); 
    downloadRealFile(dataStr, "MedicalApp_Backup.json", "application/json");
    showMessage("✅ संपूर्ण डेटाबेस फाईल डाऊनलोड झाली!", "green");
}

function importData() { 
    var fileInput = document.getElementById('backupFile'); if(!fileInput) return; var file = fileInput.files[0]; if(!file) return; 
    if(confirm("⚠️ जुना डेटा रिस्टोअर करायचा? तुमचा आत्ताचा सर्व डेटा जाईल.")) { 
        var reader = new FileReader(); 
        reader.onload = function(e) { 
            try { 
                var data = JSON.parse(e.target.result); 
                if(data.medicines && Array.isArray(data.medicines)) localStorage.setItem('Medicines', JSON.stringify(data.medicines)); 
                if(data.sales && Array.isArray(data.sales)) localStorage.setItem('Sales', JSON.stringify(data.sales)); 
                if(data.customers && Array.isArray(data.customers)) localStorage.setItem('Customers', JSON.stringify(data.customers)); 
                if(data.suppliers && Array.isArray(data.suppliers)) localStorage.setItem('Suppliers', JSON.stringify(data.suppliers)); 
                if(data.expenses && Array.isArray(data.expenses)) localStorage.setItem('Expenses', JSON.stringify(data.expenses)); 
                if(data.staff && Array.isArray(data.staff)) localStorage.setItem('Staff', JSON.stringify(data.staff)); 
                if(data.bank && Array.isArray(data.bank)) localStorage.setItem('BankTransactions', JSON.stringify(data.bank)); 
                if(data.lastInvoiceNo) localStorage.setItem('lastInvoiceNo', data.lastInvoiceNo); 
                alert("✅ संपूर्ण डेटा अचूक रिस्टोअर झाला!"); location.reload(); 
            } catch(err) { showMessage("❌ फाईल चुकीची आहे किंवा करप्ट झाली आहे!", "red"); } 
        }; 
        reader.readAsText(file); 
    } 
}

function showTab(tabId, element) { if (currentUserRole === 'staff' && tabId !== 'billingTab' && tabId !== 'ledgerTab') { alert("🔒 कर्मचाऱ्यांना हा विभाग पाहण्याची परवानगी नाही."); return; } var tabs = document.getElementsByClassName('tab-content'); for(var i=0; i<tabs.length; i++) { tabs[i].classList.remove('active-tab'); } var selectedTab = document.getElementById(tabId); if(selectedTab) selectedTab.classList.add('active-tab'); var navBtns = document.querySelectorAll('.bottom-nav button'); for(var i=0; i<navBtns.length; i++) { navBtns[i].classList.remove('active-nav'); } if(element) { element.classList.add('active-nav'); } window.scrollTo(0,0); }

window.onload = function() { 
    upgradeLegacyHashes().then(() => {
        checkActivation().then(activated => {
            if(activated) checkLoginState();
        });
        loadShopSettings(); refreshAllData(); setTimeout(loadMedicineDropdown, 500); setTimeout(loadPurchaseDropdown, 500); setTimeout(loadSupplierDropdown, 500); checkStorageLimit();
    });
};

document.addEventListener('input', function(e) {
    if (e.target.tagName.toLowerCase() === 'input' || e.target.tagName.toLowerCase() === 'textarea') {
        var originalValue = e.target.value;
        var englishOnlyValue = originalValue.replace(/[^\x00-\x7F]/g, ""); 
        if (originalValue !== englishOnlyValue) {
            e.target.value = englishOnlyValue;
        }
    }
});
