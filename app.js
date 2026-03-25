// ==========================================
// 🔐 मास्टर ॲक्टिव्हेशन की & Security Locks
// ==========================================
var _0x1a2b = ["\x52\x41\x4A\x40\x32\x30\x32\x36"]; // "RAJ@2026"
var isProcessing = false; 

// 🟢 NEW FIX: Missing showMessage Function
function showMessage(msg, color) {
    var m = document.getElementById('message');
    if(m) {
        m.innerText = msg;
        m.style.background = color === 'red' ? '#e74c3c' : '#27ae60';
        m.style.color = 'white';
        m.style.padding = '12px';
        m.style.textAlign = 'center';
        m.style.position = 'fixed';
        m.style.top = '20px';
        m.style.width = '90%';
        m.style.left = '5%';
        m.style.zIndex = '99999';
        m.style.borderRadius = '8px';
        m.style.fontWeight = 'bold';
        m.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
        m.style.display = 'block';
        setTimeout(() => { m.style.display = 'none'; }, 3000);
    } else {
        alert(msg);
    }
}

// 🚪 लॉगआउट
function logoutApp() { if(confirm("तुम्हाला नक्की लॉगआउट करायचे आहे का?")) { sessionStorage.removeItem('isLoggedIn'); sessionStorage.removeItem('role'); location.reload(); } }

// 🎤 Voice Typing
function startDictation(targetId) {
    try {
        var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) { alert("⚠️ 'व्हॉइस टायपिंग' सपोर्ट नाही."); return; }
        var recognition = new SpeechRecognition(); recognition.continuous = false; recognition.interimResults = false; recognition.lang = "mr-IN"; 
        var btn = document.querySelector(`button[onclick="startDictation('${targetId}')"]`);
        if(btn) { btn.style.backgroundColor = "#e74c3c"; btn.style.color = "white"; }
        recognition.start();
        recognition.onresult = function(e) { var transcript = e.results[0][0].transcript; if(transcript) { document.getElementById(targetId).value = transcript; } recognition.stop(); if(btn) { btn.style.backgroundColor = "#e8f8f5"; btn.style.color = "black"; } if(targetId === 'searchInput') { searchMedicine(); } };
        recognition.onerror = function(e) { recognition.stop(); if(btn) { btn.style.backgroundColor = "#e8f8f5"; btn.style.color = "black"; } };
    } catch (err) { alert("⚠️ माईक सिस्टीममध्ये तांत्रिक अडचण आहे."); }
}

function getTodayDateStr() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
function addDays(dateStr, days) { var result = new Date(dateStr); result.setDate(result.getDate() + parseInt(days)); return result.getFullYear() + '-' + ('0' + (result.getMonth() + 1)).slice(-2) + '-' + ('0' + result.getDate()).slice(-2); }
function cleanText(str) { return str ? str.toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;").trim() : ""; }

// 🚨 Security: SHA-256 Hashing
async function hashPin(pin){ const msgBuffer = new TextEncoder().encode(pin); const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer); return btoa(String.fromCharCode(...new Uint8Array(hashBuffer))); }

// 🚨 Centralized XSS Validation Layer
function sanitizeData(data) {
    if (typeof data === 'string') { return data.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim(); } 
    else if (Array.isArray(data)) { return data.map(item => sanitizeData(item)); } 
    else if (typeof data === 'object' && data !== null) { let sanitizedObj = {}; for (let key in data) { sanitizedObj[key] = sanitizeData(data[key]); } return sanitizedObj; }
    return data; 
}

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
        var safeData = sanitizeData(rawData); 
        localStorage.setItem(table, JSON.stringify(safeData)); 
        checkStorageLimit(); 
        return true; 
    } catch(e) { 
        alert("❌ ॲपची मेमरी फुल झाली आहे! कृपया जुना डेटा डिलीट करा किंवा बॅकअप घ्या."); 
        return false; 
    } 
}

function checkStorageLimit() { var total = 0; for(var x in localStorage) { if(localStorage.hasOwnProperty(x)) { total += ((localStorage[x].length + x.length) * 2); } } var mb = (total/1024/1024).toFixed(2); if(mb > 3.0) { alert(`⚠️ धोक्याचा इशारा: ॲपची मेमरी ${mb}MB भरली आहे (मर्यादा 5MB). कृपया डेटा बॅकअप घ्या!`); } }
function refreshAllData() { calculateFinancialDashboard(); loadInventoryStats(); displayTodayBills(); displayExpenses(); displayMedicines(); displayCustomers(); displaySuppliers(); displayStaff(); displayBankTransactions(); }
function generateInvoiceNumber() { var lastNo = parseInt(localStorage.getItem('lastInvoiceNo')) || 0; var newNo = lastNo + 1; localStorage.setItem('lastInvoiceNo', newNo.toString()); var year = new Date().getFullYear().toString().slice(-2); return `INV-${year}-${('0000' + newNo).slice(-4)}`; }

// २. 🚫 अँटी-पायरसी & ३. लॉगिन
async function checkActivation() { var authHash = localStorage.getItem('appAuthHash'); var expectedHash = await hashPin('activated_true'); if(authHash !== expectedHash) { document.getElementById('activationScreen').style.display = "flex"; document.getElementById('lockScreen').style.display = "none"; return false; } else { document.getElementById('activationScreen').style.display = "none"; return true; } }
async function activateApp() { var key = document.getElementById('activationKey').value.trim(); if(key === _0x1a2b[0]) { localStorage.setItem('appAuthHash', await hashPin('activated_true')); alert("✅ ॲप ॲक्टिव्हे জ্ঞाले!"); document.getElementById('activationScreen').style.display = "none"; document.getElementById('lockScreen').style.display = "flex"; } else { alert("❌ चुकीची ॲक्टिव्हेशन की!"); } }

var currentUserRole = 'owner'; 
async function checkPin() {
    var defaultOwnerHash = await hashPin("1234"); var defaultStaffHash = await hashPin("0000");
    var ownerHash = localStorage.getItem('shopPinHash') || defaultOwnerHash; var staffHash = localStorage.getItem('staffPinHash') || defaultStaffHash; 
    var enteredPin = document.getElementById('loginPin').value.trim(); var enteredHash = await hashPin(enteredPin);
    
    if (enteredHash === ownerHash) { currentUserRole = 'owner'; sessionStorage.setItem('isLoggedIn', 'true'); sessionStorage.setItem('role', 'owner'); document.getElementById('lockScreen').style.display = "none"; document.getElementById('loginPin').value = ""; setupRoleUI(); } 
    else if (enteredHash === staffHash) { currentUserRole = 'staff'; sessionStorage.setItem('isLoggedIn', 'true'); sessionStorage.setItem('role', 'staff'); document.getElementById('lockScreen').style.display = "none"; document.getElementById('loginPin').value = ""; setupRoleUI(); } 
    else { document.getElementById('pinError').style.display = "block"; document.getElementById('loginPin').value = ""; setTimeout(() => { document.getElementById('pinError').style.display = "none"; }, 2000); }
}
function checkLoginState() { if(sessionStorage.getItem('isLoggedIn') === 'true') { currentUserRole = sessionStorage.getItem('role'); document.getElementById('lockScreen').style.display = "none"; setupRoleUI(); } else { document.getElementById('lockScreen').style.display = "flex"; } }

function setupRoleUI() {
    var navHome = document.getElementById('navHome'); var navInv = document.getElementById('navInventory'); var navSet = document.getElementById('navSettings'); var staffBox = document.getElementById('staffSectionBox'); var suppBox = document.getElementById('supplierSectionBox'); var bankBox = document.getElementById('bankSectionBox');
    if (currentUserRole === 'staff') { 
        if(navHome) navHome.style.display = 'none'; if(navInv) navInv.style.display = 'none'; if(navSet) navSet.style.display = 'none'; if(staffBox) staffBox.style.display = 'none'; if(suppBox) suppBox.style.display = 'none'; if(bankBox) bankBox.style.display = 'none'; showTab('billingTab', document.getElementById('navBilling')); 
    } else { 
        if(navHome) navHome.style.display = ''; if(navInv) navInv.style.display = ''; if(navSet) navSet.style.display = ''; if(staffBox) staffBox.style.display = 'block'; if(suppBox) suppBox.style.display = 'block'; if(bankBox) bankBox.style.display = 'block'; showTab('homeTab', navHome); 
    }
}

var logoInput = document.getElementById('shopLogoInput');
if(logoInput) { logoInput.addEventListener('change', function(event) { var file = event.target.files[0]; if (file) { if (file.size > 200000) { alert("⚠️ लोगो 200KB पेक्षा कमी निवडा."); document.getElementById('shopLogoInput').value = ""; return; } var reader = new FileReader(); reader.onload = function(e) { var logoData = e.target.result; document.getElementById('logoPreview').src = logoData; document.getElementById('logoPreview').style.display = 'block'; document.getElementById('shopLogoInput').dataset.base64 = logoData; }; reader.readAsDataURL(file); } }); }
async function saveShopSettings() { localStorage.setItem('shopName', cleanText(document.getElementById('shopNameInput').value)); localStorage.setItem('shopAddress', cleanText(document.getElementById('shopAddressInput').value)); localStorage.setItem('shopPhone', cleanText(document.getElementById('shopPhoneInput').value)); localStorage.setItem('shopGstin', cleanText(document.getElementById('shopGstinInput').value).toUpperCase()); var logoData = document.getElementById('shopLogoInput').dataset.base64; if(logoData) localStorage.setItem('shopLogo', logoData); var oPin = document.getElementById('shopPinInput').value.trim(); if(oPin) localStorage.setItem('shopPinHash', await hashPin(oPin)); var sPin = document.getElementById('staffPinInput').value.trim(); if(sPin) localStorage.setItem('staffPinHash', await hashPin(sPin)); showMessage("⚙️ सेटिंग सेव्ह झाले!", "green"); loadShopSettings(); }
function loadShopSettings() {
    var name = localStorage.getItem('shopName') || "🩺 आपले मेडिकल शॉप"; var address = localStorage.getItem('shopAddress') || "पत्ता उपलब्ध नाही"; var phone = localStorage.getItem('shopPhone') || "मोबाईल नंबर उपलब्ध नाही"; var gstin = localStorage.getItem('shopGstin') || ""; var logo = localStorage.getItem('shopLogo');
    if(document.getElementById('shopNameInput')) { document.getElementById('shopNameInput').value = name !== "🩺 आपले मेडिकल शॉप" ? name : ""; document.getElementById('shopAddressInput').value = address !== "पत्ता उपलब्ध नाही" ? address : ""; document.getElementById('shopPhoneInput').value = phone !== "मोबाईल नंबर उपलब्ध नाही" ? phone : ""; document.getElementById('shopGstinInput').value = gstin; }
    if (logo) { var preview = document.getElementById('logoPreview'); if(preview) { preview.src = logo; preview.style.display = 'block'; } var invLogo = document.getElementById('invLogo'); if(invLogo) { invLogo.src = logo; invLogo.style.display = 'block'; } }
    var invShopName = document.getElementById('invShopName'); if(invShopName) invShopName.innerText = name; var invShopAddress = document.getElementById('invShopAddress'); if(invShopAddress) invShopAddress.innerText = address; var invShopPhone = document.getElementById('invShopPhone'); if(invShopPhone) invShopPhone.innerText = phone;
    var invShopGstin = document.getElementById('invShopGstin'); var invShopGstinWrapper = document.getElementById('invShopGstinWrapper'); if(invShopGstin && invShopGstinWrapper) { if(gstin !== "") { invShopGstin.innerText = gstin; invShopGstinWrapper.style.display = "flex"; } else { invShopGstinWrapper.style.display = "none"; } }
}

// ==========================================
// ४. 🏦 बँक व्यवहार
// ==========================================
function addBankEntry(desc, type, amount, dateStr) { var bankDB = getDB('BankTransactions'); bankDB.push({ id: new Date().getTime().toString(), date: dateStr || getTodayDateStr(), description: desc, type: type, amount: parseFloat(amount) }); setDB('BankTransactions', bankDB); }
function saveBankTransaction() { 
    if(isProcessing) return; 
    try {
        isProcessing = true; 
        var editId = document.getElementById('editBankId').value; var desc = cleanText(document.getElementById('bankDesc').value); var type = document.getElementById('bankType').value; var amt = parseFloat(document.getElementById('bankAmount').value); 
        if(!desc || isNaN(amt) || amt <= 0) return; 
        var bankDB = getDB('BankTransactions');
        if(editId) { var idx = bankDB.findIndex(b => b.id == editId); if(idx > -1) { bankDB[idx].description = desc; bankDB[idx].type = type; bankDB[idx].amount = amt; setDB('BankTransactions', bankDB); } document.getElementById('editBankId').value = ""; } else { addBankEntry(desc, type, amt); }
        document.getElementById('bankForm').reset(); showMessage("🏦 बँक एन्ट्री सेव्ह झाली!", "green"); refreshAllData(); 
    } finally { setTimeout(() => { isProcessing = false; }, 500); }
}
function editBankEntry(id) { var b = getDB('BankTransactions').find(x => x.id == id); if(b) { document.getElementById('editBankId').value = b.id; document.getElementById('bankDesc').value = b.description; document.getElementById('bankType').value = b.type; document.getElementById('bankAmount').value = b.amount; window.scrollTo(0, document.getElementById('bankForm').offsetTop - 50); showMessage("✏️ बँक एन्ट्री एडिट मोडमध्ये आहे.", "orange"); } }
function deleteBankEntry(id) { if(!confirm("⚠️ ही बँक एन्ट्री कायमची डिलीट करायची आहे का?")) return; var bankDB = getDB('BankTransactions').filter(b => b.id != id); if(setDB('BankTransactions', bankDB)) { showMessage("🗑️ बँक एन्ट्री डिलीट झाली!", "red"); refreshAllData(); } }
function displayBankTransactions() {
    var listBody = document.getElementById('bankList'); if(!listBody) return; listBody.innerHTML = ""; var txns = getDB('BankTransactions').reverse(); var balance = 0;
    getDB('BankTransactions').forEach(t => { if(t.type === 'IN') balance += parseFloat(t.amount||0); else balance -= parseFloat(t.amount||0); }); document.getElementById('bankBalanceDisplay').innerText = "₹" + balance.toFixed(2); document.getElementById('bankBalanceDisplay').style.color = balance < 0 ? "red" : "#1565c0";
    if (txns.length === 0) { listBody.innerHTML = "<tr><td colspan='4' style='text-align:center;'>बँकेचे व्यवहार नाहीत.</td></tr>"; return; }
    txns.forEach(t => { var amt = parseFloat(t.amount||0).toFixed(2); var inAmt = t.type === 'IN' ? `₹${amt}` : "-"; var outAmt = t.type === 'OUT' ? `₹${amt}` : "-"; listBody.innerHTML += `<tr><td><b>${t.description}</b><br><small>${t.date}</small></td><td style='color: green; font-weight:bold;'>${inAmt}</td><td style='color: red; font-weight:bold;'>${outAmt}</td><td><button class="edit-btn" onclick="editBankEntry('${t.id}')">✏️</button> <button onclick="deleteBankEntry('${t.id}')" class="action-btn delete-btn" style="padding:5px;">Del</button></td></tr>`; });
}

// ==========================================
// 💸 दैनंदिन खर्च
// ==========================================
function toggleExpUtrField() { var modeElem = document.getElementById('expPaymentMode'); var utrBox = document.getElementById('expUtrNo'); if(!modeElem || !utrBox) return; if(modeElem.value === "UPI") { utrBox.style.display = "block"; utrBox.focus(); } else { utrBox.style.display = "none"; utrBox.value = ""; } }
function editExpense(id) { var e = getDB('Expenses').find(x => x.expense_id == id); if(e) { document.getElementById('editExpId').value = e.expense_id; document.getElementById('expCategory').value = e.category || "इतर खर्च (General)"; document.getElementById('expDesc').value = e.description.split(' (UPI')[0]; document.getElementById('expAmount').value = e.amount; document.getElementById('expPaymentMode').value = e.mode || "Cash"; toggleExpUtrField(); window.scrollTo(0, document.getElementById('expenseForm').offsetTop - 50); showMessage("✏️ खर्च एडिट मोडमध्ये आहे.", "orange"); } }
function saveExpense() { 
    if(isProcessing) return; 
    try {
        isProcessing = true;
        var editId = document.getElementById('editExpId').value; var cat = document.getElementById('expCategory').value; var desc = cleanText(document.getElementById('expDesc').value); var amount = parseFloat(document.getElementById('expAmount').value) || 0; var mode = document.getElementById('expPaymentMode').value; var utr = cleanText(document.getElementById('expUtrNo').value);
        if (!desc || amount <= 0) return; if (mode === "UPI" && utr === "") { if(!confirm("⚠️ तुम्ही UPI निवडले आहे पण UTR टाकला नाही. पुढे जायचे का?")) return; }
        
        var dateStr = getTodayDateStr(); var fullDesc = mode === "UPI" ? `${desc} (UPI${utr ? ': ' + utr : ''})` : desc; var expenses = getDB('Expenses'); 
        if(editId) { var idx = expenses.findIndex(e => e.expense_id == editId); if(idx > -1) { expenses[idx].category = cat; expenses[idx].description = fullDesc; expenses[idx].amount = amount; expenses[idx].mode = mode; setDB('Expenses', expenses); } document.getElementById('editExpId').value = ""; } 
        else { expenses.push({ expense_id: new Date().getTime().toString(), category: cat, description: fullDesc, amount: amount, expense_date: dateStr, mode: mode }); if(setDB('Expenses', expenses) && mode === "UPI") { addBankEntry(`दैनंदिन खर्च: ${desc} ${utr ? '(UTR:'+utr+')' : ''}`, 'OUT', amount, dateStr); } }
        showMessage("💸 खर्च नोंदवला!", "green"); document.getElementById('expenseForm').reset(); document.getElementById('expCategory').selectedIndex = 0; document.getElementById('expPaymentMode').value = "Cash"; toggleExpUtrField(); refreshAllData(); 
    } finally { setTimeout(() => { isProcessing = false; }, 500); }
}
function displayExpenses() { var listBody = document.getElementById('expenseList'); if(!listBody) return; listBody.innerHTML = ""; var todayStr = getTodayDateStr(); var todayExps = getDB('Expenses').filter(e => e.expense_date === todayStr).reverse(); if (todayExps.length === 0) { listBody.innerHTML = "<tr><td colspan='3' style='text-align:center;'>खर्च नाही.</td></tr>"; return; } todayExps.forEach(exp => { var catTag = exp.category ? `<br><small style="color:#d35400;">[${exp.category.split(' ')[0]}]</small>` : ""; listBody.innerHTML += `<tr><td><b>${exp.description}</b>${catTag}</td><td style='color: red;'>₹${parseFloat(exp.amount||0).toFixed(2)}</td><td><button class="edit-btn" onclick="editExpense('${exp.expense_id}')">✏️</button> <button onclick="deleteExpense('${exp.expense_id}')" class="action-btn delete-btn" style="padding:5px;">Del</button></td></tr>`; }); }
function deleteExpense(id) { if (!confirm("हा खर्च रद्द करायचा आहे का?")) return; var expenses = getDB('Expenses'); var idx = expenses.findIndex(e => e.expense_id == id); if(idx > -1) { var exp = expenses[idx]; if(exp.mode === 'UPI') { addBankEntry(`खर्च रद्द (Refund): ${exp.description}`, 'IN', exp.amount, getTodayDateStr()); } expenses.splice(idx, 1); if(setDB('Expenses', expenses)) { showMessage("🗑️ खर्च रद्द झाला!", "red"); refreshAllData(); } } }

// ==========================================
// 💊 औषधे व्यवस्थापन 
// ==========================================
function loadSupplierDropdown() { var select = document.getElementById('supplierSelect'); if(!select) return; select.innerHTML = "<option value=''>-- सप्लायर निवडा (Optional) --</option>"; getDB('Suppliers').forEach(s => { select.innerHTML += `<option value='${s.supplier_id}'>${s.name}</option>`; }); }
function saveMedicine() {
    if(isProcessing) return;
    try {
        isProcessing = true;
        var editId = document.getElementById('editId').value; var name = cleanText(document.getElementById('medName').value); var suppId = document.getElementById('supplierSelect').value; var pBillDate = document.getElementById('purchaseBillDate').value; var cDays = document.getElementById('creditDays').value; var unitType = document.getElementById('unitType').value; 
        var hsnCode = document.getElementById('hsnCode') ? cleanText(document.getElementById('hsnCode').value) : "-"; var gstRate = parseInt(document.getElementById('medGstRate').value) || 0; 
        var saltName = document.getElementById('saltName') ? cleanText(document.getElementById('saltName').value) : "-"; var isRx = document.getElementById('rxRequired') ? document.getElementById('rxRequired').checked : false; var company = cleanText(document.getElementById('medCompany').value) || "-"; var rackNo = cleanText(document.getElementById('medRackNo').value) || "-"; var batch = cleanText(document.getElementById('batchNo').value) || "-"; var expiry = document.getElementById('expiryDate').value; var unitsPerPack = parseInt(document.getElementById('unitsPerPack').value, 10) || 1; var purchasedPacks = parseInt(document.getElementById('totalPacks').value, 10) || 0; var freePacks = parseInt(document.getElementById('freePacks').value, 10) || 0; var packPTR = parseFloat(document.getElementById('packPTR').value) || 0; var packMRP = parseFloat(document.getElementById('packMRP').value) || 0; 
        if (!name || !pBillDate) { alert("⚠️ कृपया औषधाचे नाव आणि सप्लायर बिल तारीख टाका!"); return; } if (purchasedPacks <= 0 || packPTR <= 0 || packMRP <= 0) { alert("⚠️ कृपया QTY आणि RATE योग्य टाका!"); return; } if (!expiry) { alert("⚠️ कृपया EXP DATE टाका!"); return; }
        
        var totalCost = purchasedPacks * packPTR; var calculatedStock = unitsPerPack * (purchasedPacks + freePacks); var perUnitPTR = calculatedStock > 0 ? (totalCost / calculatedStock) : 0; var perUnitMRP = unitsPerPack > 0 ? (packMRP / unitsPerPack) : 0; 
        var meds = getDB('Medicines'); var medObj = { medicine_id: editId || new Date().getTime().toString(), name: name, unitType: unitType, hsn_code: hsnCode, gst_rate: gstRate, salt_name: saltName, rx_required: isRx, company: company, rack_no: rackNo, batch_no: batch, expiry_date: expiry, purchasePrice: perUnitPTR, mrp: perUnitMRP, stock_qty: calculatedStock, unitsPerPack: unitsPerPack };
        if (editId) { var index = meds.findIndex(m => m.medicine_id == editId); if(index > -1) meds[index] = medObj; } else { meds.push(medObj); }
        
        if (!editId && suppId && totalCost > 0) { var supps = getDB('Suppliers'); var sIdx = supps.findIndex(s => s.supplier_id == suppId); if(sIdx > -1) { var dueDate = addDays(pBillDate, cDays); if (!supps[sIdx].bill_history) supps[sIdx].bill_history = []; supps[sIdx].bill_history.push({ bill_date: pBillDate, amount: totalCost, due_date: dueDate, is_paid: false }); supps[sIdx].pending_dues += totalCost; setDB('Suppliers', supps); } }
        if(setDB('Medicines', meds)) { showMessage(editId ? "🔄 औषध अपडेट झाले!" : "✅ औषध सेव्ह झाले!", "green"); document.getElementById('medicineForm').reset(); document.getElementById('unitsPerPack').value = "10"; document.getElementById('editId').value = ""; refreshAllData(); }
    } catch (error) { alert("❌ चूक: " + error.message); } finally { setTimeout(() => { isProcessing = false; }, 500); }
}
function editMedicine(id) { 
    var med = getDB('Medicines').find(m => m.medicine_id == id); if(!med) return;
    document.getElementById('editId').value = med.medicine_id; document.getElementById('medName').value = med.name; document.getElementById('hsnCode').value = med.hsn_code !== "-" ? med.hsn_code : ""; document.getElementById('medGstRate').value = med.gst_rate || 0; document.getElementById('unitType').value = med.unitType || "गोळी (Tab)"; document.getElementById('saltName').value = med.salt_name !== "-" ? med.salt_name : ""; document.getElementById('rxRequired').checked = med.rx_required; document.getElementById('medCompany').value = med.company !== "-" ? med.company : ""; document.getElementById('medRackNo').value = med.rack_no !== "-" ? med.rack_no : ""; document.getElementById('batchNo').value = med.batch_no !== "-" ? med.batch_no : ""; document.getElementById('expiryDate').value = med.expiry_date; document.getElementById('unitsPerPack').value = med.unitsPerPack || 10; document.getElementById('totalPacks').value = Math.floor(med.stock_qty / (med.unitsPerPack || 10)); document.getElementById('freePacks').value = 0; document.getElementById('packPTR').value = med.purchasePrice * (med.unitsPerPack || 10); document.getElementById('packMRP').value = med.mrp * (med.unitsPerPack || 10);
    window.scrollTo(0, document.getElementById('medicineForm').offsetTop - 50); showMessage("✏️ औषध एडिट मोडमध्ये आहे.", "orange");
}
function displayMedicines() { 
    var listBody = document.getElementById('medicineList'); if(!listBody) return; listBody.innerHTML = ""; var meds = getDB('Medicines'); if (meds.length === 0) { listBody.innerHTML = "<tr><td colspan='4' style='text-align:center;'>अजून औषधे जोडलेली नाहीत.</td></tr>"; return; } 
    meds.forEach(med => { 
        var stockColor = med.stock_qty <= 0 ? "red" : "black"; var rxTag = med.rx_required ? "<span style='color:red; font-weight:bold;'>(Rx)</span> " : ""; var hsnText = med.hsn_code && med.hsn_code !== "-" ? ` | HSN: ${med.hsn_code}` : ""; var saltText = med.salt_name && med.salt_name !== "-" ? `<br><small style="color: #2980b9;">${med.salt_name}${hsnText}</small>` : `<br><small style="color: #2980b9;">${hsnText}</small>`; var pPrice = med.purchasePrice ? med.purchasePrice : 0; var rackText = med.rack_no && med.rack_no !== "-" ? `<br><small style="color:#d35400; font-weight:bold;">रॅक: ${med.rack_no}</small>` : "";
        listBody.innerHTML += `<tr><td><b>${rxTag}${med.name}</b>${saltText}${rackText}<br><small>बॅच: ${med.batch_no}</small></td><td style='color: ${stockColor}; font-weight: bold;'>${med.stock_qty}<br><small style="color:gray;">${med.unitType || "नग"}</small></td><td><small>खरेदी: ₹${pPrice.toFixed(2)}</small><br><b>MRP: ₹${parseFloat(med.mrp||0).toFixed(2)}</b></td><td><button class="edit-btn" onclick="editMedicine('${med.medicine_id}')">✏️</button><button class="action-btn delete-btn" onclick="deleteMedicine('${med.medicine_id}')">Del</button></td></tr>`; 
    }); 
}
function deleteMedicine(id) { if (confirm("हे औषध डिलीट करायचे आहे का?")) { var meds = getDB('Medicines').filter(m => m.medicine_id != id); if(setDB('Medicines', meds)) { showMessage("🗑️ औषध डिलीट झाले!", "red"); refreshAllData(); } } }
function searchMedicine() { var input = document.getElementById("searchInput"); if(!input) return; var filter = cleanText(input.value.toUpperCase()); var tr = document.getElementById("medicineList").getElementsByTagName("tr"); for (var i = 0; i < tr.length; i++) { var tdName = tr[i].getElementsByTagName("td")[0]; if (tdName && tdName.innerText !== "अजून औषधे जोडलेली नाहीत.") { tr[i].style.display = tdName.innerText.toUpperCase().indexOf(filter) > -1 ? "" : "none"; } } }

// ==========================================
// 🛒 CART & BILLING 
// ==========================================
var cart = []; var cartTotal = 0; var finalCartTotal = 0;
function toggleUtrField() { var modeElem = document.getElementById('billPaymentMode'); var utrBox = document.getElementById('billUtrNo'); if(!modeElem || !utrBox) return; if(modeElem.value === "UPI") { utrBox.style.display = "block"; utrBox.focus(); } else { utrBox.style.display = "none"; utrBox.value = ""; } }
function loadMedicineDropdown() { var select = document.getElementById('medicineSelect'); if(!select) return; select.innerHTML = "<option value=''>-- औषध निवडा --</option>"; getDB('Medicines').forEach(med => { var pPrice = med.purchasePrice ? med.purchasePrice : 0; var packSize = med.unitsPerPack || 1; var rxVal = med.rx_required ? 'true' : 'false'; var saltVal = med.salt_name || "-"; var rackVal = med.rack_no || "-"; var gstVal = med.gst_rate || 0; select.innerHTML += `<option value='${med.medicine_id}' data-price='${med.mrp || 0}' data-purchase='${pPrice}' data-stock='${med.stock_qty}' data-pack='${packSize}' data-barcode='${med.batch_no}' data-expiry='${med.expiry_date}' data-rx='${rxVal}' data-hsn='${med.hsn_code||"-"}' data-gst='${gstVal}' data-rack='${rackVal}'>${med.name} - ₹${parseFloat((med.mrp||0) * packSize).toFixed(2)} / पॅक</option>`; }); }
function updatePrice() { var select = document.getElementById('medicineSelect'); var typeSelect = document.getElementById('sellType'); var rackDiv = document.getElementById('rackDisplay'); var rackTxt = document.getElementById('rackNumberTxt'); if (select.value === "") { document.getElementById('sellPrice').value = ""; if(rackDiv) rackDiv.style.display = "none"; return; } var basePrice = parseFloat(select.options[select.selectedIndex].getAttribute('data-price')) || 0; var packSize = parseInt(select.options[select.selectedIndex].getAttribute('data-pack')) || 1; var inputQty = parseInt(document.getElementById('sellQty').value, 10) || 1; var rackNo = select.options[select.selectedIndex].getAttribute('data-rack') || "-"; var finalPrice = typeSelect.value === 'pack' ? (basePrice * packSize * inputQty) : (basePrice * inputQty); document.getElementById('sellPrice').value = finalPrice.toFixed(2); if(rackDiv) { if(rackNo !== "-" && rackNo !== "") { rackTxt.innerText = rackNo; rackDiv.style.display = "block"; } else { rackDiv.style.display = "none"; } } }
function applyDiscount() { var discPercent = parseFloat(document.getElementById('billDiscount').value) || 0; if(discPercent < 0) discPercent = 0; if(discPercent > 100) discPercent = 100; finalCartTotal = cartTotal - (cartTotal * (discPercent / 100)); document.getElementById('finalTotalDisplay').innerText = "देय रक्कम: ₹" + finalCartTotal.toFixed(2); }
function addToCart() {
    var select = document.getElementById('medicineSelect'); var medId = select.value; if (!medId) { alert("⚠️ कृपया औषध निवडा!"); return; }
    var option = select.options[select.selectedIndex]; var rxReq = option.getAttribute('data-rx') === 'true'; var drName = document.getElementById('doctorName') ? cleanText(document.getElementById('doctorName').value) : "";
    var expDateStr = option.getAttribute('data-expiry'); if(expDateStr && expDateStr !== "-") { var expDate = new Date(expDateStr); var today = new Date(); today.setHours(0,0,0,0); if (expDate < today) { alert("🚨 धोक्याचा इशारा!\nहे औषध एक्सपायर झाले आहे."); return; } }
    var sellType = document.getElementById('sellType').value; var inputQty = parseInt(document.getElementById('sellQty').value, 10); if (isNaN(inputQty) || inputQty <= 0) return;
    var packSize = parseInt(option.getAttribute('data-pack'), 10) || 1; var pPrice = parseFloat(option.getAttribute('data-purchase')) || 0; var baseMRP = parseFloat(option.getAttribute('data-price')) || 0; var dosageStr = document.getElementById('medDosage') ? document.getElementById('medDosage').value : "";
    var realQtyToDeduct = sellType === 'pack' ? (inputQty * packSize) : inputQty; var availableStock = parseInt(option.getAttribute('data-stock'), 10) || 0; 
    var hsnCode = option.getAttribute('data-hsn'); var gstRate = parseInt(option.getAttribute('data-gst')) || 0; var batch = option.getAttribute('data-barcode') || "-";
    
    var existingItem = cart.find(item => item.id === medId && item.batch === batch && item.sellType === sellType); var totalRequestedQty = existingItem ? existingItem.qty + realQtyToDeduct : realQtyToDeduct;
    if (totalRequestedQty > availableStock) { if(!confirm(`⚠️ सिस्टीममध्ये इतका साठा नाही! (उपलब्ध: ${availableStock})\nतरीही बिल बनवायचे का?`)) return; }
    
    var totalPurchaseCost = realQtyToDeduct * pPrice; var totalPrice = realQtyToDeduct * baseMRP; var medNameDisplay = option.text.split(' - ₹')[0].replace('(Rx) ', ''); 
    if (existingItem) { existingItem.inputQty += inputQty; existingItem.qty += realQtyToDeduct; existingItem.total += totalPrice; existingItem.totalPurchase += totalPurchaseCost; existingItem.dosage = dosageStr; existingItem.displayQty = existingItem.inputQty + (sellType === 'pack' ? ' PAC' : ' TAB'); } 
    else { cart.push({ id: medId, name: medNameDisplay, batch: batch, hsn: hsnCode, gst_rate: gstRate, expiry: expDateStr, sellType: sellType, inputQty: inputQty, qty: realQtyToDeduct, price: (sellType==='pack' ? baseMRP*packSize : baseMRP), total: totalPrice, totalPurchase: totalPurchaseCost, dosage: dosageStr, displayQty: inputQty + (sellType === 'pack' ? ' PAC' : ' TAB') }); } updateCartUI();
}
function updateCartUI() { var cartBody = document.getElementById('cartBody'); if(!cartBody) return; cartBody.innerHTML = ""; cartTotal = 0; cart.forEach((item, index) => { cartTotal += item.total; cartBody.innerHTML += `<tr><td><b>${item.name}</b></td><td><b>${item.displayQty}</b></td><td>₹${parseFloat(item.price||0).toFixed(2)}</td><td><span onclick="removeCartItem(${index})" style="cursor:pointer; color:red;">❌</span> ₹${parseFloat(item.total||0).toFixed(2)}</td></tr>`; }); document.getElementById('cartTotalDisplay').innerText = "मूळ रक्कम: ₹" + cartTotal.toFixed(2); applyDiscount(); }
function removeCartItem(index) { cart.splice(index, 1); updateCartUI(); }
function formatExpDate(exp) { if(!exp || exp === "-") return "-"; var parts = exp.split('-'); if(parts.length === 3) return parts[1] + "/" + parts[0].slice(-2); return exp; }

function generateBill(isCredit = false) {
    if(isProcessing) return; 
    try {
        var customerName = cleanText(document.getElementById('customerName').value); var drName = document.getElementById('doctorName') ? cleanText(document.getElementById('doctorName').value) : ""; var custGstin = document.getElementById('customerGstin') ? cleanText(document.getElementById('customerGstin').value).toUpperCase() : ""; var payMode = isCredit ? "Credit" : document.getElementById('billPaymentMode').value; var utrNo = document.getElementById('billUtrNo') ? cleanText(document.getElementById('billUtrNo').value) : "";
        if (cart.length === 0 || !customerName) { alert("⚠️ कृपया ग्राहकाचे पूर्ण नाव आणि औषध जोडा!"); return; } if (!isCredit && payMode === "UPI" && utrNo === "") { if(!confirm("⚠️ तुम्ही UPI निवडले आहे पण UTR टाकला नाही. पुढे जायचे का?")) return; }

        isProcessing = true; 
        var meds = getDB('Medicines'); var totalBillPurchaseCost = 0; var savedCart = JSON.parse(JSON.stringify(cart));
        cart.forEach(item => { var m = meds.find(x => x.medicine_id == item.id); if(m) m.stock_qty -= item.qty; totalBillPurchaseCost += (item.totalPurchase || 0); });
        
        var discPercent = parseFloat(document.getElementById('billDiscount').value) || 0; var discountAmt = cartTotal * (discPercent / 100); var trueProfit = finalCartTotal - totalBillPurchaseCost; var sales = getDB('Sales'); 
        var newBillId = generateInvoiceNumber(); 
        
        sales.push({ bill_id: newBillId, customer_name: customerName, customer_gstin: custGstin, doctor_name: drName, bill_date: getTodayDateStr(), total_amount: finalCartTotal, bill_profit: trueProfit, items: savedCart, is_credit: isCredit, discount_amt: discountAmt, payment_mode: payMode, utr_no: utrNo });
        if(!setDB('Medicines', meds) || !setDB('Sales', sales)) { return; } 

        if (!isCredit && payMode === "UPI") { addBankEntry(`बिल जमा: ${customerName} ${utrNo ? '(UTR:'+utrNo+')' : ''}`, 'IN', finalCartTotal, getTodayDateStr()); }
        if(isCredit) { var custs = getDB('Customers'); var existingCust = custs.find(c => c.name && c.name.toLowerCase() === customerName.toLowerCase()); if(existingCust) { existingCust.ledger_balance += finalCartTotal; } else { custs.push({customer_id: new Date().getTime().toString(), name: customerName, phone: "", ledger_balance: finalCartTotal, payment_history: []}); } setDB('Customers', custs); document.getElementById('billTypeLabel').style.display = "block"; showMessage("📝 उधारीचे बिल बनवले!", "red"); } else { document.getElementById('billTypeLabel').style.display = "none"; showMessage("💵 रोख/UPI बिल यशस्वीरीत्या बनवले!", "green"); }

        document.getElementById('invCustomer').innerText = customerName; document.getElementById('invDate').innerText = new Date().toLocaleDateString('en-IN'); document.getElementById('invBillNo').innerText = newBillId; document.getElementById('invFooterShopName').innerText = localStorage.getItem('shopName') || "मेडिकल शॉप";
        if(drName) { document.getElementById('invDoctorText').style.display = "block"; document.getElementById('invDoctor').innerText = drName; } else { document.getElementById('invDoctorText').style.display = "none"; }
        var invCustGstinWrapper = document.getElementById('invCustGstinWrapper'); if(custGstin && invCustGstinWrapper) { document.getElementById('invCustGstin').innerText = custGstin; invCustGstinWrapper.style.display = "inline"; } else { if(invCustGstinWrapper) invCustGstinWrapper.style.display = "none"; }
        document.getElementById('invPayMode').innerText = payMode; if(payMode === "UPI" && utrNo !== "") { document.getElementById('invUtrNo').innerText = utrNo; document.getElementById('invUtrWrapper').style.display = "inline"; } else { document.getElementById('invUtrWrapper').style.display = "none"; }

        var invHTML = ""; var gstMap = {}; 
        cart.forEach(item => { 
            var expFormatted = formatExpDate(item.expiry); var hsnTxt = item.hsn && item.hsn !== "-" ? item.hsn : "";
            invHTML += `<tr><td>${item.displayQty}</td><td><b>${item.name}</b></td><td>${item.batch}</td><td>${hsnTxt}</td><td style="text-align: right;">${parseFloat(item.total||0).toFixed(2)}</td></tr>`; 
            if(item.gst_rate > 0) { var taxRate = item.gst_rate; var baseValue = item.total / (1 + (taxRate/100)); var taxAmt = item.total - baseValue; if(!gstMap[taxRate]) gstMap[taxRate] = { base: 0, tax: 0 }; gstMap[taxRate].base += baseValue; gstMap[taxRate].tax += taxAmt; }
        });
        
        document.getElementById('invoiceBody').innerHTML = invHTML; document.getElementById('invTaxableVal').innerText = cartTotal.toFixed(2);
        if(discountAmt > 0) { document.getElementById('invDiscountRow').style.display = "flex"; document.getElementById('invDiscountAmt').innerText = "- ₹" + discountAmt.toFixed(2); } else { document.getElementById('invDiscountRow').style.display = "none"; }
        
        var gstKeys = Object.keys(gstMap);
        if(gstKeys.length > 0) { var gstHtml = ""; gstKeys.forEach(rate => { var halfRate = parseFloat(rate)/2; var halfTax = gstMap[rate].tax / 2; gstHtml += `<tr><td>${rate}%</td><td>${gstMap[rate].base.toFixed(2)}</td><td>${halfTax.toFixed(2)} (${halfRate}%)</td><td>${halfTax.toFixed(2)} (${halfRate}%)</td></tr>`; }); document.getElementById('invGstBody').innerHTML = gstHtml; document.getElementById('invGstTable').style.display = "table"; } else { document.getElementById('invGstTable').style.display = "none"; }
        
        document.getElementById('invTotal').innerText = finalCartTotal.toFixed(2); document.getElementById('invoiceSection').style.display = "block"; 
        
        cart = []; updateCartUI(); document.getElementById('customerName').value = ""; document.getElementById('doctorName').value = ""; if(document.getElementById('customerGstin')) document.getElementById('customerGstin').value = ""; document.getElementById('medicineSelect').selectedIndex = 0; document.getElementById('sellQty').value = "1"; document.getElementById('sellPrice').value = ""; document.getElementById('billDiscount').value = "0"; document.getElementById('billPaymentMode').value = "Cash"; toggleUtrField(); if(document.getElementById('medDosage')) document.getElementById('medDosage').selectedIndex = 0; if(document.getElementById('rackDisplay')) document.getElementById('rackDisplay').style.display = "none";
        refreshAllData(); window.scrollTo(0, document.body.scrollHeight);
    } finally { setTimeout(() => { isProcessing = false; }, 500); }
}

function printInvoice() { var printContents = document.getElementById('invoiceSection').innerHTML; var originalContents = document.body.innerHTML; document.body.innerHTML = printContents; window.print(); document.body.innerHTML = originalContents; location.reload(); }
function sendWhatsAppBill() { var custName = document.getElementById('invCustomer').innerText; var total = document.getElementById('invTotal').innerText; var isCredit = document.getElementById('billTypeLabel').style.display === "block" ? "(उधारी)" : "(रोख)"; var text = `*🩺 मेडिकल शॉप ${isCredit}*\nनमस्कार ${custName},\nतुमची आजची खरेदी:\n`; var rows = document.querySelectorAll('#invoiceBody tr'); rows.forEach(row => { var cols = row.querySelectorAll('td'); if(cols.length >= 5) { text += `🔸 ${cols[1].innerText.split('\n')[0]} - ${cols[0].innerText} x ₹${cols[4].innerText}\n`; } }); if(document.getElementById('invDiscountRow').style.display === "block" || document.getElementById('invDiscountRow').style.display === "flex") { text += `\n*Discount:* ${document.getElementById('invDiscountAmt').innerText}`; } text += `\n*एकूण रक्कम: ${total}*\n\nखरेदी केल्याबद्दल धन्यवाद! 🙏`; window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank'); }

// ==========================================
// ६. डॅशबोर्ड
// ==========================================
function calculateFinancialDashboard() {
    var sales = getDB('Sales'); var expenses = getDB('Expenses'); var todayStr = getTodayDateStr(); var todaySales = 0, todayExp = 0, todayProfit = 0; var totalSales = 0, totalExp = 0, totalProfit = 0; var itemSalesMap = {}; 
    sales.forEach(s => { totalSales += parseFloat(s.total_amount||0); totalProfit += parseFloat(s.bill_profit||0); if(s.bill_date === todayStr) { todaySales += parseFloat(s.total_amount||0); todayProfit += parseFloat(s.bill_profit||0); } if(s.items) { s.items.forEach(item => { if(!itemSalesMap[item.id]) itemSalesMap[item.id] = {name: item.name, qty: 0, profit: 0}; itemSalesMap[item.id].qty += parseInt(item.qty || 0); itemSalesMap[item.id].profit += (parseFloat(item.price || 0) * parseInt(item.qty || 0)) - parseFloat(item.totalPurchase || 0); }); } });
    expenses.forEach(e => { totalExp += parseFloat(e.amount||0); if(e.expense_date === todayStr) { todayExp += parseFloat(e.amount||0); } });
    if(document.getElementById('dashTodaySales')) document.getElementById('dashTodaySales').innerText = "₹" + todaySales.toFixed(2); if(document.getElementById('dashTodayExpense')) document.getElementById('dashTodayExpense').innerText = "₹" + todayExp.toFixed(2);
    var netToday = todayProfit - todayExp; if(document.getElementById('dashNetProfit')) { document.getElementById('dashNetProfit').innerText = "₹" + netToday.toFixed(2); document.getElementById('dashNetProfit').style.color = netToday < 0 ? "#d32f2f" : "#00695c"; }
    if(document.getElementById('dashLifeSales')) document.getElementById('dashLifeSales').innerText = "₹" + totalSales.toFixed(2); if(document.getElementById('dashLifeExpense')) document.getElementById('dashLifeExpense').innerText = "₹" + totalExp.toFixed(2);
    var netTotal = totalProfit - totalExp; if(document.getElementById('dashLifeProfit')) { document.getElementById('dashLifeProfit').innerText = "₹" + netTotal.toFixed(2); document.getElementById('dashLifeProfit').style.color = netTotal < 0 ? "#c62828" : "#6a1b9a"; }
    var topMedsList = document.getElementById('topMedsList'); if(topMedsList) { topMedsList.innerHTML = ""; var topArr = Object.values(itemSalesMap).sort((a,b) => b.qty - a.qty).slice(0, 5); if(topArr.length === 0) { topMedsList.innerHTML = "<tr><td colspan='3' style='text-align:center;'>डेटा उपलब्ध नाही</td></tr>"; } else { topArr.forEach(m => { topMedsList.innerHTML += `<tr><td><b>${m.name.replace(' 🛑', '')}</b></td><td>${m.qty} नग</td><td style='color:#00695c;'>₹${m.profit.toFixed(2)}</td></tr>`; }); } }
}
function loadInventoryStats() {
    if(!document.getElementById('dashTotalMeds')) return; var meds = getDB('Medicines'); var lowStockCount = 0; var expiryCount = 0; var alertText = "<b>⚠️ महत्त्वाचे अलर्ट्स:</b><br>"; var hasAlerts = false; var today = new Date().getTime();
    meds.forEach(med => { if (med.stock_qty <= 0) { lowStockCount++; alertText += `🔸 <b>${med.name}</b> साठा संपला आहे!<br>`; hasAlerts = true; } var daysDiff = Math.ceil((new Date(med.expiry_date).getTime() - today) / (1000 * 3600 * 24)); if (daysDiff <= 30 && daysDiff >= 0) { expiryCount++; alertText += `⏳ <b>${med.name}</b> ${daysDiff} दिवसांत एक्सपायर होईल.<br>`; hasAlerts = true; } else if (daysDiff < 0) { expiryCount++; alertText += `❌ <b>${med.name}</b> एक्सपायर झाली आहे!<br>`; hasAlerts = true; } });
    document.getElementById('dashTotalMeds').innerText = meds.length; document.getElementById('dashLowStock').innerText = lowStockCount; document.getElementById('dashExpiry').innerText = expiryCount;
    var alertBox = document.getElementById('alertMessages'); if (hasAlerts) { alertBox.innerHTML = alertText; alertBox.style.display = "block"; } else { alertBox.style.display = "none"; }
}
function printDashboard() { var printContents = document.getElementById('dashboardOverview').innerHTML; var originalContents = document.body.innerHTML; document.body.innerHTML = "<h2 style='text-align:center;'>🩺 मेडिकल शॉप: फायनान्शियल रिपोर्ट</h2>" + printContents; window.print(); document.body.innerHTML = originalContents; location.reload(); }
function shareDashboardWhatsApp() { var text = `*📊 मेडिकल शॉप फायनान्शियल रिपोर्ट*\nतारीख: ${new Date().toLocaleDateString('en-IN')}\n\n*🔹 आजचा हिशोब:*\nविक्री: ${document.getElementById('dashTodaySales').innerText} | खर्च: ${document.getElementById('dashTodayExpense').innerText}\n*आजचा खरा नफा: ${document.getElementById('dashNetProfit').innerText}*\n\n_Generated securely by App_`; window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank'); }

function displayTodayBills() {
    var listBody = document.getElementById('todayBillsList'); if(!listBody) return; listBody.innerHTML = ""; var todayStr = getTodayDateStr(); var todaySales = getDB('Sales').filter(s => s.bill_date === todayStr).reverse();
    if (todaySales.length === 0) { listBody.innerHTML = "<tr><td colspan='3' style='text-align:center;'>आज अजून कोणतेही बिल बनवले नाही.</td></tr>"; return; }
    todaySales.forEach(sale => { var isCred = sale.is_credit ? "<span style='color:red;'>(उधारी)</span>" : "<span style='color:green;'>(रोख)</span>"; var drText = sale.doctor_name ? `<br><small style="color:#8e24aa;">Dr. ${sale.doctor_name}</small>` : ""; listBody.innerHTML += `<tr><td><b>${sale.customer_name}</b> ${isCred}${drText}<br><small style="color:gray;">${sale.bill_id}</small></td><td style='color: #2e7d32; font-weight: bold;'>₹${parseFloat(sale.total_amount||0).toFixed(2)}</td><td><button onclick="deleteBill('${sale.bill_id}')" class="action-btn delete-btn">रद्द</button></td></tr>`; });
}
function deleteBill(billId) { 
    if (!confirm("⚠️ हे बिल रद्द करायचे आहे का?\n(साठा आणि बँकेचा व्यवहार पूर्ववत केला जाईल)")) return; 
    var sales = getDB('Sales'); var billIndex = sales.findIndex(s => s.bill_id == billId); if (billIndex === -1) return; 
    var billToCancel = sales[billIndex]; var meds = getDB('Medicines'); 
    if (billToCancel.items) { billToCancel.items.forEach(item => { var m = meds.find(x => x.medicine_id == item.id); if (m) m.stock_qty += (item.qty || 0); }); setDB('Medicines', meds); } 
    if(billToCancel.is_credit) { var custs = getDB('Customers'); var existingCust = custs.find(c => c.name && c.name.toLowerCase() === billToCancel.customer_name.toLowerCase()); if(existingCust) { existingCust.ledger_balance -= parseFloat(billToCancel.total_amount||0); setDB('Customers', custs); } } 
    if(!billToCancel.is_credit && billToCancel.payment_mode === "UPI") { addBankEntry(`बिल रद्द (Refund): ${billToCancel.customer_name} (Bill ID: ${billId})`, 'OUT', billToCancel.total_amount, getTodayDateStr()); }
    sales.splice(billIndex, 1); setDB('Sales', sales); showMessage("🗑️ बिल रद्द झाले आणि स्टॉक/बँक रिफंड झाला!", "red"); refreshAllData(); 
}

// ==========================================
// ७. 💳 स्मार्ट पेमेंट पॉप-अप व खातेवही 
// ==========================================
function openPaymentModal(type, id, name, defaultAmount) { document.getElementById('payModalType').value = type; document.getElementById('payModalId').value = id; document.getElementById('payModalName').value = name; var title = ""; if(type === 'supplier') title = "सप्लायर पेमेंट: " + name; if(type === 'customer') title = "ग्राहक जमा: " + name; if(type === 'staff_advance') title = "कर्मचारी उचल: " + name; if(type === 'staff_salary') title = "कर्मचारी पगार वाटप: " + name; document.getElementById('payModalTitle').innerText = title; document.getElementById('payModalAmount').value = defaultAmount > 0 ? defaultAmount : ""; document.getElementById('payModalMode').value = "Cash"; document.getElementById('payModalUtr').value = ""; document.getElementById('payModalUtr').style.display = "none"; document.getElementById('paymentModal').style.display = "flex"; }
function closePaymentModal() { document.getElementById('paymentModal').style.display = "none"; }
function toggleModalUtr() { var modeElem = document.getElementById('payModalMode'); var utrBox = document.getElementById('payModalUtr'); if(!modeElem || !utrBox) return; utrBox.style.display = modeElem.value === "UPI" ? "block" : "none"; }
function payDues(id, name, bal) { openPaymentModal('customer', id, name, bal); }
function paySupplier(id, name, bal) { openPaymentModal('supplier', id, name, bal); }
function payAdvance(id, name) { openPaymentModal('staff_advance', id, name, 0); }
function paySalary(id, name, salary, advance) { var netPayable = salary - advance; if(netPayable < 0) { alert(`⚠️ ${name} यांची उचल (${advance}) त्यांच्या पगारापेक्षा (${salary}) जास्त आहे! आधी उचल क्लिअर करा.`); return; } openPaymentModal('staff_salary', id, name, netPayable); }

function confirmPaymentModal() {
    if(isProcessing) return; 
    try {
        isProcessing = true;
        var type = document.getElementById('payModalType').value; var id = document.getElementById('payModalId').value; var name = document.getElementById('payModalName').value; var amount = parseFloat(document.getElementById('payModalAmount').value); var mode = document.getElementById('payModalMode').value; var utr = cleanText(document.getElementById('payModalUtr').value);
        if(isNaN(amount) || amount <= 0) { alert("⚠️ कृपया योग्य रक्कम टाका!"); return; } if(mode === 'UPI' && utr === "") { if(!confirm("⚠️ तुम्ही UTR नंबर टाकला नाही, तरीही सेव्ह करायचे का?")) return; }
        
        var dateStr = getTodayDateStr(); var descSuffix = mode === 'UPI' ? (utr ? ` (UPI: ${utr})` : " (UPI)") : " (Cash)"; var pEntry = { date: dateStr, amount: amount, mode: mode, utr: utr }; 
        
        if(type === 'supplier') { var supps = getDB('Suppliers'); var idx = supps.findIndex(s => s.supplier_id == id); if(idx > -1) { supps[idx].pending_dues -= amount; if(!supps[idx].payment_history) supps[idx].payment_history = []; supps[idx].payment_history.push(pEntry); if(setDB('Suppliers', supps)) { if(mode === 'UPI') addBankEntry(`सप्लायर पेमेंट: ${name}${descSuffix}`, 'OUT', amount, dateStr); showMessage("✅ पेमेंट यशस्वी नोंदवले!", "green"); } } }
        else if(type === 'customer') { var custs = getDB('Customers'); var idx = custs.findIndex(c => c.customer_id == id); if(idx > -1) { custs[idx].ledger_balance -= amount; if(!custs[idx].payment_history) custs[idx].payment_history = []; custs[idx].payment_history.push(pEntry); if(setDB('Customers', custs)) { if(mode === 'UPI') addBankEntry(`ग्राहक जमा: ${name}${descSuffix}`, 'IN', amount, dateStr); showMessage("✅ जमा यशस्वी नोंदवले!", "green"); } } }
        else if(type === 'staff_advance') { var staff = getDB('Staff'); var idx = staff.findIndex(s => s.staff_id == id); if(idx > -1) { staff[idx].advance_balance += amount; if(!staff[idx].payment_history) staff[idx].payment_history = []; staff[idx].payment_history.push({ date: dateStr, amount: amount, mode: mode, utr: utr, type: 'Advance' }); if(setDB('Staff', staff)) { var expenses = getDB('Expenses'); expenses.push({expense_id: new Date().getTime().toString(), category: "पगार/मजुरी (Wages)", description: `ऍडव्हान्स: ${name}${descSuffix}`, amount: amount, expense_date: dateStr, mode: mode}); setDB('Expenses', expenses); if(mode === 'UPI') addBankEntry(`कर्मचारी उचल: ${name}${descSuffix}`, 'OUT', amount, dateStr); showMessage("✅ उचल यशस्वी नोंदवली!", "green"); } } }
        else if(type === 'staff_salary') { var staff = getDB('Staff'); var idx = staff.findIndex(s => s.staff_id == id); if(idx > -1) { staff[idx].advance_balance = 0; if(!staff[idx].payment_history) staff[idx].payment_history = []; staff[idx].payment_history.push({ date: dateStr, amount: amount, mode: mode, utr: utr, type: 'Salary' }); if(setDB('Staff', staff)) { var expenses = getDB('Expenses'); expenses.push({expense_id: new Date().getTime().toString(), category: "पगार/मजुरी (Wages)", description: `पगार दिला: ${name}${descSuffix}`, amount: amount, expense_date: dateStr, mode: mode}); setDB('Expenses', expenses); if(mode === 'UPI') addBankEntry(`कर्मचारी पगार: ${name}${descSuffix}`, 'OUT', amount, dateStr); showMessage("✅ पगार यशस्वीरित्या दिला!", "green"); } } }
        closePaymentModal(); refreshAllData(); 
    } finally { setTimeout(() => { isProcessing = false; }, 500); }
}

function editCustomer(id) { var c = getDB('Customers').find(x => x.customer_id == id); if(c) { document.getElementById('editCustId').value = c.customer_id; document.getElementById('custName').value = c.name; document.getElementById('custPhone').value = c.phone || ""; document.getElementById('custBalance').value = c.ledger_balance; window.scrollTo(0, document.getElementById('customerForm').offsetTop - 50); showMessage("✏️ ग्राहक माहिती एडिट मोडमध्ये आहे.", "orange"); } }
function saveCustomer() { 
    if(isProcessing) return; 
    try {
        isProcessing = true;
        var editId = document.getElementById('editCustId').value; var name = cleanText(document.getElementById('custName').value); var phone = cleanText(document.getElementById('custPhone').value); var balance = parseFloat(document.getElementById('custBalance').value) || 0; if (!name) return; 
        var custs = getDB('Customers'); 
        if(editId) { var idx = custs.findIndex(c => c.customer_id == editId); if(idx > -1) { custs[idx].name = name; custs[idx].phone = phone; custs[idx].ledger_balance = balance; setDB('Customers', custs); } document.getElementById('editCustId').value = ""; } 
        else { if(custs.find(c => c.name && c.name.trim().toLowerCase() === name.trim().toLowerCase())) { alert("⚠️ हा ग्राहक आधीपासूनच जोडलेला आहे!"); return; } var hist = []; if(balance > 0) { hist.push({ date: getTodayDateStr(), amount: balance, mode: "Opening Balance", utr: "" }); } custs.push({customer_id: new Date().getTime().toString(), name: name.trim(), phone, ledger_balance: balance, payment_history: hist}); setDB('Customers', custs); }
        showMessage("📓 ग्राहक सेव्ह झाला!", "green"); document.getElementById('customerForm').reset(); refreshAllData(); 
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

function editSupplier(id) { var s = getDB('Suppliers').find(x => x.supplier_id == id); if(s) { document.getElementById('editSuppId').value = s.supplier_id; document.getElementById('suppName').value = s.name; document.getElementById('suppPhone').value = s.phone || ""; document.getElementById('suppBalance').value = s.pending_dues; window.scrollTo(0, document.getElementById('supplierForm').offsetTop - 50); showMessage("✏️ सप्लायर माहिती एडिट मोडमध्ये आहे.", "orange"); } }
function saveSupplier() { 
    if(isProcessing) return; 
    try {
        isProcessing = true;
        var editId = document.getElementById('editSuppId').value; var name = cleanText(document.getElementById('suppName').value); var phone = cleanText(document.getElementById('suppPhone').value); var balance = parseFloat(document.getElementById('suppBalance').value) || 0; if (!name) return; 
        var supps = getDB('Suppliers'); 
        if(editId) { var idx = supps.findIndex(s => s.supplier_id == editId); if(idx > -1) { supps[idx].name = name; supps[idx].phone = phone; supps[idx].pending_dues = balance; setDB('Suppliers', supps); } document.getElementById('editSuppId').value = ""; } 
        else { if(supps.find(s => s.name && s.name.trim().toLowerCase() === name.trim().toLowerCase())) { alert("⚠️ हा सप्लायर आधीपासूनच जोडलेला आहे!"); return; } var bHist = []; if(balance > 0) { bHist.push({ bill_date: getTodayDateStr(), amount: balance, due_date: getTodayDateStr(), is_paid: false, is_opening: true }); } supps.push({supplier_id: new Date().getTime().toString(), name: name.trim(), phone, pending_dues: balance, bill_history: bHist, payment_history: []}); setDB('Suppliers', supps); }
        showMessage("🚚 सप्लायर सेव्ह झाला!", "green"); document.getElementById('supplierForm').reset(); loadSupplierDropdown(); refreshAllData(); 
    } finally { setTimeout(() => { isProcessing = false; }, 500); }
}
function displaySuppliers() { 
    var listBody = document.getElementById('supplierList'); if(!listBody) return; listBody.innerHTML = ""; var supps = getDB('Suppliers'); var today = getTodayDateStr();
    supps.forEach(s => { 
        var dueInfoHTML = ""; if (s.bill_history) { s.bill_history.forEach(bill => { if (!bill.is_paid) { if(bill.is_opening) { dueInfoHTML += `<div style="font-size: 11px; color: #2980b9; font-weight:bold; border-bottom: 1px solid #eee; padding: 5px 0;">${bill.bill_date} --- सुरुवातीची बाकी ₹${parseFloat(bill.amount||0).toFixed(2)}</div>`; } else { var isOverdue = today > bill.due_date; var color = isOverdue ? "red" : "#e67e22"; var warning = isOverdue ? "🚨 मुदत संपली!" : "⏳ देय आहे"; dueInfoHTML += `<div style="font-size: 11px; color: ${color}; border-bottom: 1px solid #eee; padding: 5px 0;">${bill.bill_date} --- ₹${parseFloat(bill.amount||0).toFixed(2)} --- <b>${bill.due_date}</b> (${warning})</div>`; } } }); }
        var histHTML = ""; if(s.payment_history && s.payment_history.length > 0) { histHTML += "<div style='margin-top:5px; border-top:1px dashed #ccc; padding-top:3px;'>"; s.payment_history.slice(-3).reverse().forEach(p => { var utrTxt = p.utr ? ` (${p.utr})` : ""; var icon = p.mode === 'UPI' ? '📱' : '💵'; histHTML += `<div style="font-size:10px; color:gray;">${p.date}: ${icon} ₹${parseFloat(p.amount||0).toFixed(2)}${utrTxt}</div>`; }); histHTML += "</div>"; }
        listBody.innerHTML += `<tr><td><b>${s.name}</b> <button class="edit-btn" style="float:right;" onclick="editSupplier('${s.supplier_id}')">✏️</button><br>${dueInfoHTML}${histHTML}</td><td style='color: red; font-weight: bold; vertical-align: middle;'>₹${parseFloat(s.pending_dues||0).toFixed(2)}</td><td style="vertical-align: middle;"><button onclick="paySupplier('${s.supplier_id}', '${s.name}', ${s.pending_dues})" class="btn-save" style="padding:5px;">पैसे द्या</button></td></tr>`; 
    }); 
}

function editStaff(id) { var s = getDB('Staff').find(x => x.staff_id == id); if(s) { document.getElementById('editStaffId').value = s.staff_id; document.getElementById('staffName').value = s.name; document.getElementById('staffSalary').value = s.salary || 0; document.getElementById('staffAdvance').value = s.advance_balance || 0; window.scrollTo(0, document.getElementById('staffForm').offsetTop - 50); showMessage("✏️ कर्मचारी माहिती एडिट मोडमध्ये आहे.", "orange"); } }
function saveStaff() { 
    if(isProcessing) return; 
    try {
        isProcessing = true;
        var editId = document.getElementById('editStaffId').value; var name = cleanText(document.getElementById('staffName').value); var salary = parseFloat(document.getElementById('staffSalary').value) || 0; var advance = parseFloat(document.getElementById('staffAdvance').value) || 0; if (!name) return; 
        var staff = getDB('Staff'); 
        if(editId) { var idx = staff.findIndex(s => s.staff_id == editId); if(idx > -1) { staff[idx].name = name; staff[idx].salary = salary; staff[idx].advance_balance = advance; setDB('Staff', staff); } document.getElementById('editStaffId').value = ""; } 
        else { if(staff.find(s => s.name && s.name.trim().toLowerCase() === name.trim().toLowerCase())) { alert("⚠️ हा कर्मचारी आधीपासूनच जोडलेला आहे!"); return; } staff.push({staff_id: new Date().getTime().toString(), name: name.trim(), salary, advance_balance: advance, payment_history: []}); setDB('Staff', staff); }
        showMessage("👨‍💼 कर्मचारी सेव्ह झाला!", "green"); document.getElementById('staffForm').reset(); refreshAllData(); 
    } finally { setTimeout(() => { isProcessing = false; }, 500); }
}
function displayStaff() { 
    var listBody = document.getElementById('staffList'); if(!listBody) return; listBody.innerHTML = ""; var staff = getDB('Staff').sort((a,b) => b.advance_balance - a.advance_balance); if (staff.length === 0) { listBody.innerHTML = "<tr><td colspan='3' style='text-align:center;'>कर्मचारी नाहीत.</td></tr>"; return; } 
    staff.forEach(s => { 
        var histHTML = ""; if(s.payment_history && s.payment_history.length > 0) { histHTML = "<div style='margin-top:5px; border-top:1px dashed #ccc; padding-top:3px;'>"; s.payment_history.slice(-3).reverse().forEach(p => { var txt = p.type === 'Salary' ? `पगार दिला` : `उचल दिली`; var icon = p.mode === 'UPI' ? '📱' : '💵'; histHTML += `<div style="font-size:10px; color:gray;">${p.date}: ${icon} ${txt} ₹${parseFloat(p.amount||0).toFixed(2)}</div>`; }); histHTML += "</div>"; }
        listBody.innerHTML += `<tr><td><b>${s.name}</b> <button class="edit-btn" style="float:right;" onclick="editStaff('${s.staff_id}')">✏️</button><br><small>पगार: ₹${parseFloat(s.salary||0).toFixed(2)}</small>${histHTML}</td><td style='color: ${s.advance_balance > 0 ? "red" : "green"}; vertical-align: middle; font-weight:bold;'>₹${parseFloat(s.advance_balance||0).toFixed(2)}</td><td style="vertical-align: middle;"><button onclick="payAdvance('${s.staff_id}', '${s.name}')" class="btn-save" style="background-color: #00897b; padding: 5px; width: 100%; margin-bottom: 5px;">उचल द्या</button><br><button onclick="paySalary('${s.staff_id}', '${s.name}', ${s.salary || 0}, ${s.advance_balance || 0})" class="btn-save" style="background-color: #2980b9; padding: 5px; width: 100%;">पगार द्या</button></td></tr>`; 
    }); 
}

// ==========================================
// ८. स्कॅनर्स 
// ==========================================
function updateStockQty() { var select = document.getElementById('purchaseMedicineSelect'); var medId = select.value; var purchasedPacks = parseInt(document.getElementById('purchasePackQty').value, 10); var freePacks = parseInt(document.getElementById('purchaseFreeQty').value, 10) || 0; if(!medId || isNaN(purchasedPacks) || purchasedPacks <= 0) return; var meds = getDB('Medicines'); var idx = meds.findIndex(m => m.medicine_id == medId); if(idx > -1) { var packMultiplier = meds[idx].unitsPerPack || 1; var totalNewPacks = purchasedPacks + freePacks; meds[idx].stock_qty += (totalNewPacks * packMultiplier); if(setDB('Medicines', meds)) { showMessage(`📦 साठा वाढवला! (+${totalNewPacks * packMultiplier} नग)`, "green"); document.getElementById('purchasePackQty').value = ""; document.getElementById('purchaseFreeQty').value = "0"; select.selectedIndex = 0; refreshAllData(); } } }
var html5QrcodeScanner; var purchaseScanner;
function startScanner() { if(typeof Html5QrcodeScanner === 'undefined') { alert("❌ इंटरनेट किंवा स्कॅनर फाईल तपासा!"); return; } document.getElementById("qr-reader").style.display = "block"; html5QrcodeScanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 250 }); html5QrcodeScanner.render(function(decodedText) { html5QrcodeScanner.clear(); document.getElementById("qr-reader").style.display = "none"; var select = document.getElementById('medicineSelect'); var found = false; for (var i = 0; i < select.options.length; i++) { if (select.options[i].getAttribute('data-barcode') === decodedText) { select.selectedIndex = i; updatePrice(); document.getElementById('sellQty').value = "1"; addToCart(); showMessage("✅ थेट बिलात जोडले!", "green"); found = true; break; } } if(!found) alert("⚠️ औषध सापडले नाही!"); }, function(){}); }
function loadPurchaseDropdown() { var select = document.getElementById('purchaseMedicineSelect'); if(!select) return; select.innerHTML = "<option value=''>-- यादीतून औषध निवडा --</option>"; getDB('Medicines').forEach(med => { select.innerHTML += `<option value='${med.medicine_id}' data-barcode='${med.batch_no}'>${med.name} (साठा: ${med.stock_qty})</option>`; }); }
function startPurchaseScanner() { if(typeof Html5QrcodeScanner === 'undefined') { alert("❌ स्कॅनर सुरु करण्यासाठी scanner.js फाईल जोडलेली नाही!"); return; } document.getElementById("qr-reader-purchase").style.display = "block"; purchaseScanner = new Html5QrcodeScanner("qr-reader-purchase", { fps: 10, qrbox: 250 }); purchaseScanner.render(function(decodedText) { purchaseScanner.clear(); document.getElementById("qr-reader-purchase").style.display = "none"; var select = document.getElementById('purchaseMedicineSelect'); var found = false; for (var i = 0; i < select.options.length; i++) { if (select.options[i].getAttribute('data-barcode') === decodedText) { select.selectedIndex = i; document.getElementById('purchasePackQty').focus(); found = true; break; } } if(!found) alert("⚠️ औषध सापडले नाही!"); }, function(){}); }

// ==========================================
// ९. 👨‍💼 CA ऑडिट रिपोर्ट 
// ==========================================
function safeCopyText(text, successMessage) { var textArea = document.createElement("textarea"); textArea.value = text; textArea.style.position = "fixed"; textArea.style.left = "-9999px"; document.body.appendChild(textArea); textArea.focus(); textArea.select(); try { document.execCommand('copy'); alert("✅ " + successMessage + " कॉपी झाला आहे!\n\nआता मोबाईलमध्ये Excel किंवा Google Sheets ॲप उघडा आणि पहिल्या डब्यात (Cell A1 मध्ये) 'Paste' करा. सर्व डेटा बरोबर रकान्यात बसेल!"); } catch (err) { alert("❌ एरर: कॉपी करता आले नाही."); } document.body.removeChild(textArea); }

function exportCAExcel() {
    var sales = getDB('Sales'); var expenses = getDB('Expenses'); var meds = getDB('Medicines'); var bank = getDB('BankTransactions');
    var tsvContent = "--- SALES REPORT (विक्री अहवाल) ---\nतारीख (Date)\tबिल क्र. (Bill ID)\tग्राहक (Customer)\tग्राहक GSTIN\tडॉक्टर (Doctor)\tपेमेंट मोड\tUTR नंबर\tएकूण रक्कम (Amount)\tखरा नफा (Profit)\n";
    sales.forEach(function(s) { var dr = s.doctor_name ? s.doctor_name : "-"; var cust = s.customer_name; var type = s.payment_mode || (s.is_credit ? "Credit" : "Cash"); var utr = s.utr_no || "-"; var cGstin = s.customer_gstin ? s.customer_gstin : "-"; tsvContent += `${s.bill_date}\t${s.bill_id}\t${cust}\t${cGstin}\t${dr}\t${type}\t${utr}\t${parseFloat(s.total_amount||0).toFixed(2)}\t${parseFloat(s.bill_profit||0).toFixed(2)}\n`; });
    
    tsvContent += "\n--- EXPENSE REPORT (खर्च अहवाल) ---\nतारीख (Date)\tखर्चाचे कारण (Description)\tपेमेंट मोड\tरक्कम (Amount)\n";
    expenses.forEach(function(e) { var eMode = e.mode || "Cash"; tsvContent += `${e.expense_date}\t${e.description}\t${eMode}\t${parseFloat(e.amount||0).toFixed(2)}\n`; });
    
    tsvContent += "\n--- BANK STATEMENT (बँक खाते) ---\nतारीख (Date)\tव्यवहाराचे कारण (Description)\tजमा (IN)\tनावे (OUT)\n";
    var bankBal = 0;
    bank.forEach(b => { if(b.type === 'IN') { bankBal += parseFloat(b.amount||0); tsvContent += `${b.date}\t${b.description}\t${parseFloat(b.amount||0).toFixed(2)}\t-\n`; } else { bankBal -= parseFloat(b.amount||0); tsvContent += `${b.date}\t${b.description}\t-\t${parseFloat(b.amount||0).toFixed(2)}\n`; } });
    tsvContent += `\tएकूण बँक बॅलन्स (Total Bank Balance):\t\t${bankBal.toFixed(2)}\n`;
    
    var totalStockValue = 0; tsvContent += "\n--- CLOSING INVENTORY (शिल्लक साठा) ---\nऔषध (Medicine Name)\tHSN (HSN Code)\tबॅच (Batch)\tरॅक (Rack)\tएक्सपायरी (Expiry)\tशिल्लक नग (Qty)\tखरेदी दर (PTR)\tएकूण किंमत (Stock Value)\n";
    meds.forEach(function(m) { var val = m.stock_qty > 0 ? (m.stock_qty * m.purchasePrice) : 0; totalStockValue += val; var hsn = m.hsn_code || "-"; var rack = m.rack_no || "-"; tsvContent += `${m.name}\t${hsn}\t${m.batch_no}\t${rack}\t${m.expiry_date}\t${m.stock_qty}\t${parseFloat(m.purchasePrice||0).toFixed(2)}\t${val.toFixed(2)}\n`; });
    tsvContent += `\t\t\t\t\t\t\tएकूण साठा मूल्य (Total Value):\t${totalStockValue.toFixed(2)}\n`; 
    safeCopyText(tsvContent, "CA ऑडिट रिपोर्ट (Excel Format)");
}

function exportData() { var backupData = { medicines: getDB('Medicines'), sales: getDB('Sales'), customers: getDB('Customers'), suppliers: getDB('Suppliers'), expenses: getDB('Expenses'), staff: getDB('Staff'), bank: getDB('BankTransactions'), lastInvoiceNo: localStorage.getItem('lastInvoiceNo') || '0' }; var dataStr = JSON.stringify(backupData); safeCopyText(dataStr, "संपूर्ण डेटाबेस (Backup JSON)"); }
function importData() { var fileInput = document.getElementById('backupFile'); var file = fileInput.files[0]; if(!file) return; if(confirm("⚠️ जुना डेटा रिस्टोअर करायचा? तुमचा आत्ताचा सर्व डेटा जाईल.")) { var reader = new FileReader(); reader.onload = function(e) { try { var data = JSON.parse(e.target.result); if(data.medicines) setDB('Medicines', data.medicines); if(data.sales) setDB('Sales', data.sales); if(data.customers) setDB('Customers', data.customers); if(data.suppliers) setDB('Suppliers', data.suppliers); if(data.expenses) setDB('Expenses', data.expenses); if(data.staff) setDB('Staff', data.staff); if(data.bank) setDB('BankTransactions', data.bank); if(data.lastInvoiceNo) localStorage.setItem('lastInvoiceNo', data.lastInvoiceNo); alert("✅ संपूर्ण डेटा अचूक रिस्टोअर झाला!"); location.reload(); } catch(err) { showMessage("❌ फाईल चुकीची आहे!", "red"); } }; reader.readAsText(file); } }

// ==========================================
// १०. UI आणि बॉटम टॅब्स 
// ==========================================
function showTab(tabId, element) { if (currentUserRole === 'staff' && tabId !== 'billingTab' && tabId !== 'ledgerTab') { alert("🔒 कर्मचाऱ्यांना हा विभाग पाहण्याची परवानगी नाही."); return; } var tabs = document.getElementsByClassName('tab-content'); for(var i=0; i<tabs.length; i++) { tabs[i].classList.remove('active-tab'); } var selectedTab = document.getElementById(tabId); if(selectedTab) selectedTab.classList.add('active-tab'); var navBtns = document.querySelectorAll('.bottom-nav button'); for(var i=0; i<navBtns.length; i++) { navBtns[i].classList.remove('active-nav'); } if(element) { element.classList.add('active-nav'); } window.scrollTo(0,0); }

window.onload = function() { 
    upgradeLegacyHashes().then(() => {
        checkActivation().then(activated => {
            if(activated) checkLoginState();
        });
        loadShopSettings(); refreshAllData(); setTimeout(loadMedicineDropdown, 500); setTimeout(loadPurchaseDropdown, 500); checkStorageLimit();
    });
};
