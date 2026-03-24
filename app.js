// ==========================================
// 🔐 मास्टर ॲक्टिव्हेशन की 
// ==========================================
var MASTER_ACTIVATION_KEY = "RAJ@2026"; 

// ==========================================
// 🎤 Voice Typing Logic (माईक - English Update)
// ==========================================
function startDictation(targetId) {
    try {
        var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("⚠️ तुमच्या मोबाईलचे सिस्टीम ॲप 'व्हॉइस टायपिंग' ला सपोर्ट करत नाही. (कृपया Google Chrome वापरा)");
            return;
        }
        var recognition = new SpeechRecognition();
        recognition.continuous = false; 
        recognition.interimResults = false; 
        // 👇 येथे बदल केला आहे: आता भाषा Indian English आहे
        recognition.lang = "en-IN"; 
        
        var btn = document.querySelector(`button[onclick="startDictation('${targetId}')"]`);
        if(btn) { btn.style.backgroundColor = "#e74c3c"; btn.style.color = "white"; }
        
        recognition.start();
        
        recognition.onresult = function(e) { 
            var transcript = e.results[0][0].transcript;
            if(transcript) { document.getElementById(targetId).value = transcript; }
            recognition.stop(); 
            if(btn) { btn.style.backgroundColor = "#e8f8f5"; btn.style.color = "black"; } 
            if(targetId === 'searchInput') { searchMedicine(); } 
        };
        
        recognition.onerror = function(e) { 
            recognition.stop(); 
            if(btn) { btn.style.backgroundColor = "#e8f8f5"; btn.style.color = "black"; } 
            alert("माईक एरर: आवाज ओळखता आला नाही किंवा परवानगी नाही."); 
        };
    } catch (err) {
        alert("⚠️ माईक सिस्टीममध्ये तांत्रिक अडचण आहे.");
    }
}

// ==========================================
// १. अचूक तारीख आणि डेटाबेस 
// ==========================================
function getTodayDateStr() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }

if(!localStorage.getItem('Medicines')) localStorage.setItem('Medicines', '[]'); if(!localStorage.getItem('Sales')) localStorage.setItem('Sales', '[]');
if(!localStorage.getItem('Customers')) localStorage.setItem('Customers', '[]'); if(!localStorage.getItem('Suppliers')) localStorage.setItem('Suppliers', '[]');
if(!localStorage.getItem('Expenses')) localStorage.setItem('Expenses', '[]'); if(!localStorage.getItem('Staff')) localStorage.setItem('Staff', '[]'); 

if(localStorage.getItem('shopPin')) { localStorage.setItem('shopPinHash', btoa(localStorage.getItem('shopPin'))); localStorage.removeItem('shopPin'); }
if(localStorage.getItem('staffPin')) { localStorage.setItem('staffPinHash', btoa(localStorage.getItem('staffPin'))); localStorage.removeItem('staffPin'); }
if(localStorage.getItem('isActivated') === "true") { localStorage.setItem('appAuthHash', btoa('activated_true')); localStorage.removeItem('isActivated'); }

function getDB(table) { try { var data = JSON.parse(localStorage.getItem(table)); return Array.isArray(data) ? data : []; } catch(e) { return []; } }
function setDB(table, data) { try { localStorage.setItem(table, JSON.stringify(data)); return true; } catch(e) { alert("❌ अत्यंत महत्त्वाचे: ॲपची मेमरी फुल झाली आहे! कृपया सेटिंग्ज मधून जुना डेटा डिलीट करा किंवा बॅकअप घ्या."); return false; } }
function cleanText(str) { return str ? str.replace(/['"<>]/g, "").trim() : ""; }

// ==========================================
// २. 🚫 अँटी-पायरसी
// ==========================================
function checkActivation() { var authHash = localStorage.getItem('appAuthHash'); if(authHash !== btoa('activated_true')) { document.getElementById('activationScreen').style.display = "flex"; document.getElementById('lockScreen').style.display = "none"; return false; } else { document.getElementById('activationScreen').style.display = "none"; return true; } }
function activateApp() { var key = document.getElementById('activationKey').value.trim(); if(key === MASTER_ACTIVATION_KEY) { localStorage.setItem('appAuthHash', btoa('activated_true')); alert("✅ ॲप ॲक्टिव्हेट झाले!"); document.getElementById('activationScreen').style.display = "none"; document.getElementById('lockScreen').style.display = "flex"; } else { alert("❌ चुकीची ॲक्टिव्हेशन की!"); } }

// ==========================================
// ३. ड्युअल लॉगिन 
// ==========================================
var currentUserRole = 'owner'; 
function checkPin() {
    var ownerHash = localStorage.getItem('shopPinHash') || btoa("1234"); var staffHash = localStorage.getItem('staffPinHash') || btoa("0000"); var enteredPin = document.getElementById('loginPin').value.trim();
    if (btoa(enteredPin) === ownerHash) { currentUserRole = 'owner'; sessionStorage.setItem('isLoggedIn', 'true'); sessionStorage.setItem('role', 'owner'); document.getElementById('lockScreen').style.display = "none"; document.getElementById('loginPin').value = ""; setupRoleUI(); } 
    else if (btoa(enteredPin) === staffHash) { currentUserRole = 'staff'; sessionStorage.setItem('isLoggedIn', 'true'); sessionStorage.setItem('role', 'staff'); document.getElementById('lockScreen').style.display = "none"; document.getElementById('loginPin').value = ""; setupRoleUI(); } 
    else { document.getElementById('pinError').style.display = "block"; document.getElementById('loginPin').value = ""; setTimeout(() => { document.getElementById('pinError').style.display = "none"; }, 2000); }
}
function checkLoginState() { if(sessionStorage.getItem('isLoggedIn') === 'true') { currentUserRole = sessionStorage.getItem('role'); document.getElementById('lockScreen').style.display = "none"; setupRoleUI(); } else { document.getElementById('lockScreen').style.display = "flex"; } }
function setupRoleUI() {
    var navHome = document.getElementById('navHome'); var navInv = document.getElementById('navInventory'); var navSet = document.getElementById('navSettings'); var staffBox = document.getElementById('staffSectionBox'); var suppBox = document.getElementById('supplierSectionBox');
    if (currentUserRole === 'staff') { if(navHome) navHome.style.display = 'none'; if(navInv) navInv.style.display = 'none'; if(navSet) navSet.style.display = 'none'; if(staffBox) staffBox.style.display = 'none'; if(suppBox) suppBox.style.display = 'none'; showTab('billingTab', document.getElementById('navBilling')); } 
    else { if(navHome) navHome.style.display = 'block'; if(navInv) navInv.style.display = 'block'; if(navSet) navSet.style.display = 'block'; if(staffBox) staffBox.style.display = 'block'; if(suppBox) suppBox.style.display = 'block'; showTab('homeTab', navHome); }
}

// दुकानाची माहिती सेव्ह करणे
var logoInput = document.getElementById('shopLogoInput');
if(logoInput) { logoInput.addEventListener('change', function(event) { var file = event.target.files[0]; if (file) { if (file.size > 200000) { alert("⚠️ लोगो 200KB पेक्षा कमी निवडा."); document.getElementById('shopLogoInput').value = ""; return; } var reader = new FileReader(); reader.onload = function(e) { var logoData = e.target.result; document.getElementById('logoPreview').src = logoData; document.getElementById('logoPreview').style.display = 'block'; document.getElementById('shopLogoInput').dataset.base64 = logoData; }; reader.readAsDataURL(file); } }); }
function saveShopSettings() { localStorage.setItem('shopName', cleanText(document.getElementById('shopNameInput').value)); localStorage.setItem('shopAddress', cleanText(document.getElementById('shopAddressInput').value)); localStorage.setItem('shopPhone', cleanText(document.getElementById('shopPhoneInput').value)); localStorage.setItem('shopGstin', cleanText(document.getElementById('shopGstinInput').value).toUpperCase()); var logoData = document.getElementById('shopLogoInput').dataset.base64; if(logoData) localStorage.setItem('shopLogo', logoData); var oPin = document.getElementById('shopPinInput').value.trim(); if(oPin) localStorage.setItem('shopPinHash', btoa(oPin)); var sPin = document.getElementById('staffPinInput').value.trim(); if(sPin) localStorage.setItem('staffPinHash', btoa(sPin)); showMessage("⚙️ सेटिंग सेव्ह झाले!", "green"); loadShopSettings(); }
function loadShopSettings() {
    var name = localStorage.getItem('shopName') || "🩺 आपले मेडिकल शॉप"; var address = localStorage.getItem('shopAddress') || "पत्ता उपलब्ध नाही"; var phone = localStorage.getItem('shopPhone') || "मोबाईल नंबर उपलब्ध नाही"; var gstin = localStorage.getItem('shopGstin') || ""; var logo = localStorage.getItem('shopLogo');
    if(document.getElementById('shopNameInput')) { document.getElementById('shopNameInput').value = name !== "🩺 आपले मेडिकल शॉप" ? name : ""; document.getElementById('shopAddressInput').value = address !== "पत्ता उपलब्ध नाही" ? address : ""; document.getElementById('shopPhoneInput').value = phone !== "मोबाईल नंबर उपलब्ध नाही" ? phone : ""; document.getElementById('shopGstinInput').value = gstin; }
    if (logo) { var preview = document.getElementById('logoPreview'); if(preview) { preview.src = logo; preview.style.display = 'block'; } var invLogo = document.getElementById('invLogo'); if(invLogo) { invLogo.src = logo; invLogo.style.display = 'block'; } }
    var invShopName = document.getElementById('invShopName'); if(invShopName) invShopName.innerText = name; var invShopAddress = document.getElementById('invShopAddress'); if(invShopAddress) invShopAddress.innerText = address; var invShopPhone = document.getElementById('invShopPhone'); if(invShopPhone) invShopPhone.innerText = phone;
    var invShopGstin = document.getElementById('invShopGstin'); var invShopGstinWrapper = document.getElementById('invShopGstinWrapper'); if(invShopGstin && invShopGstinWrapper) { if(gstin !== "") { invShopGstin.innerText = gstin; invShopGstinWrapper.style.display = "flex"; } else { invShopGstinWrapper.style.display = "none"; } }
}

// ==========================================
// ४. औषधे व्यवस्थापन 
// ==========================================
function loadSupplierDropdown() { var select = document.getElementById('supplierSelect'); if(!select) return; select.innerHTML = "<option value=''>-- सप्लायर निवडा (Optional) --</option>"; getDB('Suppliers').forEach(s => { select.innerHTML += `<option value='${s.supplier_id}'>${s.name}</option>`; }); }

function saveMedicine() {
    try {
        var editId = document.getElementById('editId').value; var name = cleanText(document.getElementById('medName').value); var unitType = document.getElementById('unitType').value; var hsnCode = document.getElementById('hsnCode') ? cleanText(document.getElementById('hsnCode').value) : "-"; var saltName = document.getElementById('saltName') ? cleanText(document.getElementById('saltName').value) : "-"; var isRx = document.getElementById('rxRequired') ? document.getElementById('rxRequired').checked : false; var company = cleanText(document.getElementById('medCompany').value) || "-"; var batch = cleanText(document.getElementById('batchNo').value) || "-"; var expiry = document.getElementById('expiryDate').value; 
        var unitsPerPack = parseInt(document.getElementById('unitsPerPack').value, 10) || 1; var purchasedPacks = parseInt(document.getElementById('totalPacks').value, 10) || 0; var freePacks = parseInt(document.getElementById('freePacks').value, 10) || 0; var packPTR = parseFloat(document.getElementById('packPTR').value) || 0; var packMRP = parseFloat(document.getElementById('packMRP').value) || 0; 
        
        if (!name) { alert("⚠️ कृपया औषधाचे नाव टाका!"); return; } if (purchasedPacks <= 0 || packPTR <= 0 || packMRP <= 0) { alert("⚠️ कृपया QTY आणि RATE योग्य टाका!"); return; } if (!expiry) { alert("⚠️ कृपया EXP DATE टाका!"); return; }
        
        var totalPacksReceived = purchasedPacks + freePacks; var calculatedStock = unitsPerPack * totalPacksReceived; var totalCost = purchasedPacks * packPTR; 
        var perUnitPTR = calculatedStock > 0 ? (totalCost / calculatedStock) : 0; var perUnitMRP = unitsPerPack > 0 ? (packMRP / unitsPerPack) : 0; 
        if(isNaN(perUnitPTR)) perUnitPTR = 0; if(isNaN(perUnitMRP)) perUnitMRP = 0;

        var meds = getDB('Medicines'); var medObj = { medicine_id: editId || new Date().getTime().toString(), name: name, unitType: unitType, hsn_code: hsnCode, salt_name: saltName, rx_required: isRx, company: company, batch_no: batch, expiry_date: expiry, purchasePrice: perUnitPTR, mrp: perUnitMRP, stock_qty: calculatedStock, unitsPerPack: unitsPerPack };
        if (editId) { var index = meds.findIndex(m => m.medicine_id == editId); if(index > -1) meds[index] = medObj; } else { meds.push(medObj); }
        
        if (!editId) { var suppId = document.getElementById('supplierSelect').value; if(suppId) { var supps = getDB('Suppliers'); var sIdx = supps.findIndex(s => s.supplier_id == suppId); if(sIdx > -1) { supps[sIdx].pending_dues += totalCost; setDB('Suppliers', supps); } } }

        if(setDB('Medicines', meds)) { showMessage(editId ? "🔄 औषध अपडेट झाले!" : "✅ औषध सेव्ह झाले!", "green"); document.getElementById('medicineForm').reset(); document.getElementById('unitsPerPack').value = "10"; document.getElementById('editId').value = ""; refreshAllData(); }
    } catch (error) { alert("❌ चूक: " + error.message); }
}
function displayMedicines() { var listBody = document.getElementById('medicineList'); if(!listBody) return; listBody.innerHTML = ""; var meds = getDB('Medicines'); if (meds.length === 0) { listBody.innerHTML = "<tr><td colspan='4' style='text-align:center;'>अजून औषधे जोडलेली नाहीत.</td></tr>"; return; } meds.forEach(med => { var stockColor = med.stock_qty <= 0 ? "red" : "black"; var rxTag = med.rx_required ? "<span style='color:red; font-weight:bold;'>(Rx)</span> " : ""; var hsnText = med.hsn_code && med.hsn_code !== "-" ? ` | HSN: ${med.hsn_code}` : ""; var saltText = med.salt_name && med.salt_name !== "-" ? `<br><small style="color: #2980b9;">${med.salt_name}${hsnText}</small>` : `<br><small style="color: #2980b9;">${hsnText}</small>`; var pPrice = med.purchasePrice ? med.purchasePrice : 0; listBody.innerHTML += `<tr><td><b>${rxTag}${med.name}</b>${saltText}<br><small>बॅच: ${med.batch_no}</small></td><td style='color: ${stockColor}; font-weight: bold;'>${med.stock_qty}<br><small style="color:gray;">${med.unitType || "नग"}</small></td><td><small>खरेदी: ₹${pPrice.toFixed(2)}</small><br><b>MRP: ₹${(med.mrp || 0).toFixed(2)}</b></td><td><button class="action-btn delete-btn" onclick="deleteMedicine('${med.medicine_id}')">Del</button></td></tr>`; }); }
function deleteMedicine(id) { if (confirm("हे औषध डिलीट करायचे आहे का?")) { var meds = getDB('Medicines').filter(m => m.medicine_id != id); if(setDB('Medicines', meds)) { showMessage("🗑️ औषध डिलीट झाले!", "red"); refreshAllData(); } } }
function searchMedicine() { var input = document.getElementById("searchInput"); if(!input) return; var filter = cleanText(input.value.toUpperCase()); var tr = document.getElementById("medicineList").getElementsByTagName("tr"); for (var i = 0; i < tr.length; i++) { var tdName = tr[i].getElementsByTagName("td")[0]; if (tdName && tdName.innerText !== "अजून औषधे जोडलेली नाहीत.") { tr[i].style.display = tdName.innerText.toUpperCase().indexOf(filter) > -1 ? "" : "none"; } } }

// ==========================================
// ५. बिलिंग आणि कार्ट 
// ==========================================
var cart = []; var cartTotal = 0; var finalCartTotal = 0;

function loadMedicineDropdown() { var select = document.getElementById('medicineSelect'); if(!select) return; select.innerHTML = "<option value=''>-- औषध निवडा --</option>"; getDB('Medicines').forEach(med => { var pPrice = med.purchasePrice ? med.purchasePrice : 0; var packSize = med.unitsPerPack || 1; var rxVal = med.rx_required ? 'true' : 'false'; var saltVal = med.salt_name || "-"; var hsnVal = med.hsn_code || "-"; select.innerHTML += `<option value='${med.medicine_id}' data-price='${med.mrp || 0}' data-purchase='${pPrice}' data-stock='${med.stock_qty}' data-pack='${packSize}' data-barcode='${med.batch_no}' data-expiry='${med.expiry_date}' data-rx='${rxVal}' data-salt='${saltVal}' data-hsn='${hsnVal}'>${med.rx_required ? '(Rx) ' : ''}${med.name} - ₹${((med.mrp || 0) * packSize).toFixed(2)} / पॅक (उपलब्ध: ${med.stock_qty})</option>`; }); }
function updatePrice() { var select = document.getElementById('medicineSelect'); var typeSelect = document.getElementById('sellType'); if (select.value === "") { document.getElementById('sellPrice').value = ""; return; } var basePrice = parseFloat(select.options[select.selectedIndex].getAttribute('data-price')) || 0; var packSize = parseInt(select.options[select.selectedIndex].getAttribute('data-pack')) || 1; var inputQty = parseInt(document.getElementById('sellQty').value, 10) || 1; var finalPrice = typeSelect.value === 'pack' ? (basePrice * packSize * inputQty) : (basePrice * inputQty); document.getElementById('sellPrice').value = finalPrice.toFixed(2); }

function applyDiscount() {
    var discPercent = parseFloat(document.getElementById('billDiscount').value) || 0;
    if(discPercent < 0) discPercent = 0; if(discPercent > 100) discPercent = 100;
    finalCartTotal = cartTotal - (cartTotal * (discPercent / 100));
    document.getElementById('finalTotalDisplay').innerText = "देय रक्कम: ₹" + finalCartTotal.toFixed(2);
}

function addToCart() {
    var select = document.getElementById('medicineSelect'); var medId = select.value; if (!medId) { alert("⚠️ कृपया औषध निवडा!"); return; }
    var option = select.options[select.selectedIndex]; var rxReq = option.getAttribute('data-rx') === 'true'; var drName = document.getElementById('doctorName') ? cleanText(document.getElementById('doctorName').value) : "";
    if (rxReq && drName === "") { alert("🛑 हे प्रतिबंधित (Rx) औषध आहे!\nकृपया बिलिंग फॉर्ममध्ये 'डॉक्टरांचे नाव' टाका."); return; }
    var expDateStr = option.getAttribute('data-expiry'); if(expDateStr && expDateStr !== "-") { var expDate = new Date(expDateStr); var today = new Date(); today.setHours(0,0,0,0); if (expDate < today) { alert("🚨 धोक्याचा इशारा!\nहे औषध एक्सपायर झाले आहे."); return; } }
    
    var sellType = document.getElementById('sellType').value; var inputQty = parseInt(document.getElementById('sellQty').value, 10); if (isNaN(inputQty) || inputQty <= 0) { alert("⚠️ कृपया योग्य संख्या टाका!"); return; }
    var packSize = parseInt(option.getAttribute('data-pack'), 10) || 1; var pPrice = parseFloat(option.getAttribute('data-purchase')) || 0; var baseMRP = parseFloat(option.getAttribute('data-price')) || 0; var dosageStr = document.getElementById('medDosage') ? document.getElementById('medDosage').value : "";
    var realQtyToDeduct = sellType === 'pack' ? (inputQty * packSize) : inputQty; var availableStock = parseInt(option.getAttribute('data-stock'), 10) || 0; var saltName = option.getAttribute('data-salt'); var hsnCode = option.getAttribute('data-hsn'); var batch = option.getAttribute('data-barcode') || "-";
    
    var existingItem = cart.find(item => item.id === medId && item.batch === batch && item.sellType === sellType); var totalRequestedQty = existingItem ? existingItem.qty + realQtyToDeduct : realQtyToDeduct;
    if (totalRequestedQty > availableStock) { var alertMsg = `⚠️ सिस्टीममध्ये इतका साठा नाही! (उपलब्ध: ${availableStock})\n\n💡 तरीही बिल बनवायचे का?`; if(saltName && saltName !== "-") { var substitutes = getDB('Medicines').filter(m => m.salt_name.toLowerCase() === saltName.toLowerCase() && m.medicine_id !== medId && m.stock_qty > 0); if(substitutes.length > 0) { alertMsg += "\n\n💡 पर्यायी औषधे उपलब्ध:\n" + substitutes.map(s => `🔸 ${s.name} (उपलब्ध: ${s.stock_qty})`).join("\n"); } } if(!confirm(alertMsg)) return; }
    
    var totalPurchaseCost = realQtyToDeduct * pPrice; var totalPrice = realQtyToDeduct * baseMRP; var medNameDisplay = option.text.split(' - ₹')[0].replace('(Rx) ', ''); 
    if (existingItem) { existingItem.inputQty += inputQty; existingItem.qty += realQtyToDeduct; existingItem.total += totalPrice; existingItem.totalPurchase += totalPurchaseCost; existingItem.dosage = dosageStr; existingItem.displayQty = existingItem.inputQty + (sellType === 'pack' ? ' PAC' : ' TAB'); } 
    else { cart.push({ id: medId, name: medNameDisplay, hsn: hsnCode, batch: batch, expiry: expDateStr, sellType: sellType, inputQty: inputQty, qty: realQtyToDeduct, price: (sellType==='pack' ? baseMRP*packSize : baseMRP), total: totalPrice, totalPurchase: totalPurchaseCost, dosage: dosageStr, displayQty: inputQty + (sellType === 'pack' ? ' PAC' : ' TAB') }); }
    updateCartUI();
}

function updateCartUI() { 
    var cartBody = document.getElementById('cartBody'); if(!cartBody) return; cartBody.innerHTML = ""; cartTotal = 0; 
    cart.forEach(item => { cartTotal += item.total; var doseDisplay = item.dosage ? `<br><small style="color:#8e24aa; font-weight:bold;">${item.dosage}</small>` : ""; cartBody.innerHTML += `<tr><td><b>${item.name}</b>${doseDisplay}</td><td><b>${item.displayQty}</b></td><td>₹${item.price.toFixed(2)}</td><td>₹${item.total.toFixed(2)}</td></tr>`; }); 
    document.getElementById('cartTotalDisplay').innerText = "मूळ रक्कम: ₹" + cartTotal.toFixed(2); applyDiscount(); 
}

function formatExpDate(exp) { if(!exp || exp === "-") return "-"; var parts = exp.split('-'); if(parts.length === 3) return parts[1] + "/" + parts[0].slice(-2); return exp; }

function generateBill(isCredit = false) {
    var customerName = cleanText(document.getElementById('customerName').value); var drName = document.getElementById('doctorName') ? cleanText(document.getElementById('doctorName').value) : ""; var custGstin = document.getElementById('customerGstin') ? cleanText(document.getElementById('customerGstin').value).toUpperCase() : ""; 
    if (cart.length === 0 || !customerName) { alert("⚠️ कृपया ग्राहकाचे पूर्ण नाव आणि औषध जोडा!"); return; }

    var meds = getDB('Medicines'); var totalBillPurchaseCost = 0; var savedCart = JSON.parse(JSON.stringify(cart));
    cart.forEach(item => { var m = meds.find(x => x.medicine_id == item.id); if(m) m.stock_qty -= item.qty; totalBillPurchaseCost += (item.totalPurchase || 0); });
    
    var discPercent = parseFloat(document.getElementById('billDiscount').value) || 0; var discountAmt = cartTotal * (discPercent / 100);
    var trueProfit = finalCartTotal - totalBillPurchaseCost; 
    var sales = getDB('Sales'); var newBillId = new Date().getTime().toString();
    sales.push({ bill_id: newBillId, customer_name: customerName, customer_gstin: custGstin, doctor_name: drName, bill_date: getTodayDateStr(), total_amount: finalCartTotal, bill_profit: trueProfit, items: savedCart, is_credit: isCredit, discount_amt: discountAmt });
    
    if(!setDB('Medicines', meds) || !setDB('Sales', sales)) return; 

    if(isCredit) {
        var custs = getDB('Customers'); var existingCust = custs.find(c => c.name.toLowerCase() === customerName.toLowerCase());
        if(existingCust) { existingCust.ledger_balance += finalCartTotal; } else { custs.push({customer_id: new Date().getTime().toString(), name: customerName, phone: "", ledger_balance: finalCartTotal}); }
        setDB('Customers', custs); document.getElementById('billTypeLabel').style.display = "block"; showMessage("📝 उधारीचे बिल बनवले!", "red");
    } else { document.getElementById('billTypeLabel').style.display = "none"; showMessage("💵 रोख बिल यशस्वीरीत्या बनवले!", "green"); }

    document.getElementById('invCustomer').innerText = customerName; document.getElementById('invDate').innerText = new Date().toLocaleDateString('en-IN'); document.getElementById('invBillNo').innerText = newBillId.slice(-5); document.getElementById('invFooterShopName').innerText = localStorage.getItem('shopName') || "मेडिकल शॉप";
    if(drName) { document.getElementById('invDoctorText').style.display = "block"; document.getElementById('invDoctor').innerText = drName; } else { document.getElementById('invDoctorText').style.display = "none"; }
    var invCustGstinWrapper = document.getElementById('invCustGstinWrapper'); if(custGstin && invCustGstinWrapper) { document.getElementById('invCustGstin').innerText = custGstin; invCustGstinWrapper.style.display = "inline"; } else { if(invCustGstinWrapper) invCustGstinWrapper.style.display = "none"; }

    var invHTML = "";
    cart.forEach(item => { var expFormatted = formatExpDate(item.expiry); var doseDisplay = item.dosage ? `<br><small style="font-size:10px;">${item.dosage}</small>` : ""; invHTML += `<tr><td>${item.displayQty}</td><td><b>${item.name}</b>${doseDisplay}</td><td>${item.batch}</td><td>${expFormatted}</td><td style="text-align: right;">${item.total.toFixed(2)}</td></tr>`; });
    
    if(discountAmt > 0) { document.getElementById('invDiscountRow').style.display = "block"; document.getElementById('invDiscountAmt').innerText = "- ₹" + discountAmt.toFixed(2); } else { document.getElementById('invDiscountRow').style.display = "none"; }
    document.getElementById('invTotal').innerText = finalCartTotal.toFixed(2); document.getElementById('invoiceBody').innerHTML = invHTML; document.getElementById('invoiceSection').style.display = "block"; 
    
    cart = []; updateCartUI(); document.getElementById('customerName').value = ""; document.getElementById('doctorName').value = ""; if(document.getElementById('customerGstin')) document.getElementById('customerGstin').value = ""; document.getElementById('medicineSelect').selectedIndex = 0; document.getElementById('sellQty').value = "1"; document.getElementById('sellPrice').value = ""; document.getElementById('billDiscount').value = "0"; if(document.getElementById('medDosage')) document.getElementById('medDosage').selectedIndex = 0; refreshAllData(); window.scrollTo(0, document.body.scrollHeight);
}
function printInvoice() { var printContents = document.getElementById('invoiceSection').innerHTML; var originalContents = document.body.innerHTML; document.body.innerHTML = printContents; window.print(); document.body.innerHTML = originalContents; location.reload(); }
function sendWhatsAppBill() {
    var custName = document.getElementById('invCustomer').innerText; var total = document.getElementById('invTotal').innerText; var isCredit = document.getElementById('billTypeLabel').style.display === "block" ? "(उधारी)" : "(रोख)";
    var text = `*🩺 मेडिकल शॉप ${isCredit}*\nनमस्कार ${custName},\nतुमची आजची खरेदी:\n`;
    var rows = document.querySelectorAll('#invoiceBody tr'); rows.forEach(row => { var cols = row.querySelectorAll('td'); if(cols.length >= 5) { text += `🔸 ${cols[1].innerText.split('\n')[0]} - ${cols[0].innerText} x ₹${cols[4].innerText}\n`; } });
    if(document.getElementById('invDiscountRow').style.display === "block") { text += `\n*Discount:* ${document.getElementById('invDiscountAmt').innerText}`; }
    text += `\n*एकूण रक्कम: ${total}*\n\nखरेदी केल्याबद्दल धन्यवाद! 🙏`; window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

// ==========================================
// ६. डॅशबोर्ड व ७. खर्च 
// ==========================================
function calculateFinancialDashboard() {
    var sales = getDB('Sales'); var expenses = getDB('Expenses'); var todayStr = getTodayDateStr(); var todaySales = 0, todayExp = 0, todayProfit = 0; var totalSales = 0, totalExp = 0, totalProfit = 0; var itemSalesMap = {}; 
    sales.forEach(s => { totalSales += (s.total_amount || 0); totalProfit += (s.bill_profit || 0); if(s.bill_date === todayStr) { todaySales += (s.total_amount || 0); todayProfit += (s.bill_profit || 0); } if(s.items) { s.items.forEach(item => { if(!itemSalesMap[item.id]) itemSalesMap[item.id] = {name: item.name, qty: 0, profit: 0}; itemSalesMap[item.id].qty += (item.qty || 0); itemSalesMap[item.id].profit += ((item.price || 0) * (item.qty || 0)) - (item.totalPurchase || 0); }); } });
    expenses.forEach(e => { totalExp += (e.amount || 0); if(e.expense_date === todayStr) { todayExp += (e.amount || 0); } });
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
    todaySales.forEach(sale => { var isCred = sale.is_credit ? "<span style='color:red;'>(उधारी)</span>" : "<span style='color:green;'>(रोख)</span>"; var drText = sale.doctor_name ? `<br><small style="color:#8e24aa;">Dr. ${sale.doctor_name}</small>` : ""; listBody.innerHTML += `<tr><td><b>${sale.customer_name}</b> ${isCred}${drText}<br><small style="color:gray;">ID: ${sale.bill_id.slice(-4)}</small></td><td style='color: #2e7d32; font-weight: bold;'>₹${(sale.total_amount || 0).toFixed(2)}</td><td><button onclick="deleteBill('${sale.bill_id}')" class="action-btn delete-btn">रद्द</button></td></tr>`; });
}
function deleteBill(billId) { if (!confirm("⚠️ हे बिल रद्द करायचे आहे का?\n(साठा परत जोडला जाईल)")) return; var sales = getDB('Sales'); var billIndex = sales.findIndex(s => s.bill_id == billId); if (billIndex === -1) return; var billToCancel = sales[billIndex]; var meds = getDB('Medicines'); if (billToCancel.items) { billToCancel.items.forEach(item => { var m = meds.find(x => x.medicine_id == item.id); if (m) m.stock_qty += (item.qty || 0); }); setDB('Medicines', meds); } if(billToCancel.is_credit) { var custs = getDB('Customers'); var existingCust = custs.find(c => c.name.toLowerCase() === billToCancel.customer_name.toLowerCase()); if(existingCust) { existingCust.ledger_balance -= (billToCancel.total_amount || 0); setDB('Customers', custs); } } sales.splice(billIndex, 1); setDB('Sales', sales); showMessage("🗑️ बिल रद्द झाले!", "red"); refreshAllData(); }
function saveExpense() { var desc = cleanText(document.getElementById('expDesc').value); var amount = parseFloat(document.getElementById('expAmount').value) || 0; if (!desc || amount <= 0) return; var expenses = getDB('Expenses'); expenses.push({expense_id: new Date().getTime().toString(), description: desc, amount: amount, expense_date: getTodayDateStr()}); if(setDB('Expenses', expenses)) { showMessage("💸 खर्च नोंदवला!", "green"); document.getElementById('expenseForm').reset(); refreshAllData(); } }
function displayExpenses() { var listBody = document.getElementById('expenseList'); if(!listBody) return; listBody.innerHTML = ""; var todayStr = getTodayDateStr(); var todayExps = getDB('Expenses').filter(e => e.expense_date === todayStr).reverse(); if (todayExps.length === 0) { listBody.innerHTML = "<tr><td colspan='3' style='text-align:center;'>खर्च नाही.</td></tr>"; return; } todayExps.forEach(exp => { listBody.innerHTML += `<tr><td><b>${exp.description}</b></td><td style='color: red;'>₹${(exp.amount || 0).toFixed(2)}</td><td><button onclick="deleteExpense('${exp.expense_id}')" class="action-btn delete-btn">Del</button></td></tr>`; }); }
function deleteExpense(id) { if (confirm("खर्च डिलीट करायचा?")) { var expenses = getDB('Expenses').filter(e => e.expense_id != id); if(setDB('Expenses', expenses)) refreshAllData(); } }

// ==========================================
// ७. खातेवही 
// ==========================================
function saveCustomer() { var name = cleanText(document.getElementById('custName').value); var phone = cleanText(document.getElementById('custPhone').value); var balance = parseFloat(document.getElementById('custBalance').value) || 0; if (!name) return; var custs = getDB('Customers'); custs.push({customer_id: new Date().getTime().toString(), name, phone, ledger_balance: balance}); if(setDB('Customers', custs)) { showMessage("📓 ग्राहक सेव्ह झाला!", "green"); document.getElementById('customerForm').reset(); displayCustomers(); } }
function displayCustomers() { var listBody = document.getElementById('customerList'); if(!listBody) return; listBody.innerHTML = ""; var custs = getDB('Customers').sort((a,b) => b.ledger_balance - a.ledger_balance); if (custs.length === 0) return; custs.forEach(c => { var balText = c.ledger_balance < 0 ? `Advance (जमा)<br>₹${Math.abs(c.ledger_balance).toFixed(2)}` : `₹${(c.ledger_balance || 0).toFixed(2)}`; var balColor = c.ledger_balance <= 0 ? "green" : "red"; listBody.innerHTML += `<tr><td><b>${c.name}</b></td><td style='color: ${balColor};'>${balText}</td><td><button onclick="payDues('${c.customer_id}', '${c.name}', ${c.ledger_balance})" class="btn-save" style="padding: 5px;">जमा करा</button></td></tr>`; }); }
function payDues(id, name, bal) { var payAmount = prompt(name + " यांची बाकी ₹" + bal + " आहे.\nकिती रुपये जमा करत आहेत? (ॲडव्हान्स द्यायचा असल्यास रक्कम टाका)", "0"); if (payAmount !== null && !isNaN(parseFloat(payAmount)) && parseFloat(payAmount) > 0) { var custs = getDB('Customers'); var idx = custs.findIndex(c => c.customer_id == id); if(idx > -1) { custs[idx].ledger_balance -= parseFloat(payAmount); if(setDB('Customers', custs)) displayCustomers(); } } }

function saveSupplier() { var name = cleanText(document.getElementById('suppName').value); var phone = cleanText(document.getElementById('suppPhone').value); var balance = parseFloat(document.getElementById('suppBalance').value) || 0; if (!name) return; var supps = getDB('Suppliers'); supps.push({supplier_id: new Date().getTime().toString(), name, phone, pending_dues: balance}); if(setDB('Suppliers', supps)) { document.getElementById('supplierForm').reset(); displaySuppliers(); loadSupplierDropdown(); } }
function displaySuppliers() { var listBody = document.getElementById('supplierList'); if(!listBody) return; listBody.innerHTML = ""; var supps = getDB('Suppliers').sort((a,b) => b.pending_dues - a.pending_dues); supps.forEach(s => { listBody.innerHTML += `<tr><td><b>${s.name}</b></td><td style='color: ${s.pending_dues > 0 ? "red" : "green"};'>₹${(s.pending_dues || 0).toFixed(2)}</td><td><button onclick="paySupplier('${s.supplier_id}', '${s.name}', ${s.pending_dues})" style="background-color:#ff9800; color:white; border:none; padding:5px;">पैसे द्या</button></td></tr>`; }); }
function paySupplier(id, name, bal) { if (bal <= 0) return; var payAmount = prompt(name + " यांना ₹" + bal + " देणे बाकी आहे.\nकिती रुपये देत आहात?", bal); if (payAmount !== null && !isNaN(parseFloat(payAmount)) && parseFloat(payAmount) > 0 && parseFloat(payAmount) <= bal) { var supps = getDB('Suppliers'); var idx = supps.findIndex(s => s.supplier_id == id); if(idx > -1) { supps[idx].pending_dues -= parseFloat(payAmount); if(setDB('Suppliers', supps)) displaySuppliers(); } } }

function saveStaff() { var name = cleanText(document.getElementById('staffName').value); var salary = parseFloat(document.getElementById('staffSalary').value) || 0; var advance = parseFloat(document.getElementById('staffAdvance').value) || 0; if (!name) return; var staff = getDB('Staff'); staff.push({staff_id: new Date().getTime().toString(), name, salary, advance_balance: advance}); if(setDB('Staff', staff)) { showMessage("👨‍💼 कर्मचारी सेव्ह झाला!", "green"); document.getElementById('staffForm').reset(); displayStaff(); } }
function displayStaff() { var listBody = document.getElementById('staffList'); if(!listBody) return; listBody.innerHTML = ""; var staff = getDB('Staff').sort((a,b) => b.advance_balance - a.advance_balance); if (staff.length === 0) { listBody.innerHTML = "<tr><td colspan='3' style='text-align:center;'>कर्मचारी नाहीत.</td></tr>"; return; } staff.forEach(s => { listBody.innerHTML += `<tr><td><b>${s.name}</b><br><small>पगार: ₹${(s.salary || 0)}</small></td><td style='color: ${s.advance_balance > 0 ? "red" : "green"};'>₹${(s.advance_balance || 0).toFixed(2)}</td><td><button onclick="payAdvance('${s.staff_id}', '${s.name}')" class="btn-save" style="background-color: #00897b; padding: 5px;">उचल द्या</button></td></tr>`; }); }
function payAdvance(id, name) { var payAmount = prompt(name + " यांना किती ऍडव्हान्स (उचल) देत आहात?", "0"); if (payAmount !== null && !isNaN(parseFloat(payAmount)) && parseFloat(payAmount) > 0) { var staff = getDB('Staff'); var idx = staff.findIndex(s => s.staff_id == id); if(idx > -1) { staff[idx].advance_balance += parseFloat(payAmount); if(setDB('Staff', staff)) { displayStaff(); var expenses = getDB('Expenses'); expenses.push({expense_id: new Date().getTime().toString(), description: "ऍडव्हान्स: " + name, amount: parseFloat(payAmount), expense_date: getTodayDateStr()}); setDB('Expenses', expenses); refreshAllData(); alert("✅ उचल दिली आणि गल्ल्याच्या खर्चात नोंदवली गेली!"); } } } }

// ==========================================
// ८. स्कॅनर्स 
// ==========================================
function updateStockQty() { var select = document.getElementById('purchaseMedicineSelect'); var medId = select.value; var purchasedPacks = parseInt(document.getElementById('purchasePackQty').value, 10); var freePacks = parseInt(document.getElementById('purchaseFreeQty').value, 10) || 0; if(!medId || isNaN(purchasedPacks) || purchasedPacks <= 0) return; var meds = getDB('Medicines'); var idx = meds.findIndex(m => m.medicine_id == medId); if(idx > -1) { var packMultiplier = meds[idx].unitsPerPack || 1; var totalNewPacks = purchasedPacks + freePacks; meds[idx].stock_qty += (totalNewPacks * packMultiplier); if(setDB('Medicines', meds)) { showMessage(`📦 साठा वाढवला! (+${totalNewPacks * packMultiplier} नग)`, "green"); document.getElementById('purchasePackQty').value = ""; document.getElementById('purchaseFreeQty').value = "0"; select.selectedIndex = 0; refreshAllData(); } } }
var html5QrcodeScanner; var purchaseScanner;
function startScanner() { if(typeof Html5QrcodeScanner === 'undefined') { alert("❌ इंटरनेट किंवा स्कॅनर फाईल तपासा!"); return; } document.getElementById("qr-reader").style.display = "block"; html5QrcodeScanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 250 }); html5QrcodeScanner.render(function(decodedText) { html5QrcodeScanner.clear(); document.getElementById("qr-reader").style.display = "none"; var select = document.getElementById('medicineSelect'); var found = false; for (var i = 0; i < select.options.length; i++) { if (select.options[i].getAttribute('data-barcode') === decodedText) { select.selectedIndex = i; updatePrice(); document.getElementById('sellQty').value = "1"; addToCart(); showMessage("✅ थेट बिलात जोडले!", "green"); found = true; break; } } if(!found) alert("⚠️ औषध सापडले नाही!"); }, function(){}); }
function loadPurchaseDropdown() { var select = document.getElementById('purchaseMedicineSelect'); if(!select) return; select.innerHTML = "<option value=''>-- यादीतून औषध निवडा --</option>"; getDB('Medicines').forEach(med => { select.innerHTML += `<option value='${med.medicine_id}' data-barcode='${med.batch_no}'>${med.name} (साठा: ${med.stock_qty})</option>`; }); }
function startPurchaseScanner() { if(typeof Html5QrcodeScanner === 'undefined') { alert("❌ स्कॅनर सुरु करण्यासाठी scanner.js फाईल जोडलेली नाही!"); return; } document.getElementById("qr-reader-purchase").style.display = "block"; purchaseScanner = new Html5QrcodeScanner("qr-reader-purchase", { fps: 10, qrbox: 250 }); purchaseScanner.render(function(decodedText) { purchaseScanner.clear(); document.getElementById("qr-reader-purchase").style.display = "none"; var select = document.getElementById('purchaseMedicineSelect'); var found = false; for (var i = 0; i < select.options.length; i++) { if (select.options[i].getAttribute('data-barcode') === decodedText) { select.selectedIndex = i; document.getElementById('purchasePackQty').focus(); found = true; break; } } if(!found) alert("⚠️ औषध सापडले नाही!"); }, function(){}); }

// // ==========================================
// ९. 👨‍💼 CA ऑडिट रिपोर्ट (Tab-Separated for Excel Paste)
// ==========================================
function safeCopyText(text, successMessage) { var textArea = document.createElement("textarea"); textArea.value = text; textArea.style.position = "fixed"; textArea.style.left = "-9999px"; document.body.appendChild(textArea); textArea.focus(); textArea.select(); try { document.execCommand('copy'); alert("✅ " + successMessage + " कॉपी झाला आहे!\n\nआता मोबाईलमध्ये Excel किंवा Google Sheets ॲप उघडा आणि पहिल्या डब्यात (Cell A1 मध्ये) 'Paste' करा. सर्व डेटा बरोबर रकान्यात बसेल!"); } catch (err) { alert("❌ एरर: कॉपी करता आले नाही."); } document.body.removeChild(textArea); }

function exportCAExcel() {
    var sales = getDB('Sales'); var expenses = getDB('Expenses'); var meds = getDB('Medicines');
    
    // '\t' म्हणजे Excel चा नवीन कॉलम (Column Break)
    var tsvContent = "--- SALES REPORT (विक्री अहवाल) ---\nतारीख (Date)\tबिल क्र. (Bill ID)\tग्राहक (Customer)\tग्राहक GSTIN\tडॉक्टर (Doctor)\tरोख/उधारी (Type)\tएकूण रक्कम (Amount)\tखरा नफा (Profit)\n";
    
    sales.forEach(function(s) { 
        var dr = s.doctor_name ? s.doctor_name : "-"; 
        var cust = s.customer_name; 
        var type = s.is_credit ? "उधारी" : "रोख"; 
        var cGstin = s.customer_gstin ? s.customer_gstin : "-"; 
        tsvContent += `${s.bill_date}\t${s.bill_id}\t${cust}\t${cGstin}\t${dr}\t${type}\t${(s.total_amount || 0).toFixed(2)}\t${(s.bill_profit || 0).toFixed(2)}\n`; 
    });
    
    tsvContent += "\n--- EXPENSE REPORT (खर्च अहवाल) ---\nतारीख (Date)\tखर्चाचे कारण (Description)\tरक्कम (Amount)\n";
    
    expenses.forEach(function(e) { 
        tsvContent += `${e.expense_date}\t${e.description}\t${(e.amount || 0).toFixed(2)}\n`; 
    });
    
    var totalStockValue = 0; 
    tsvContent += "\n--- CLOSING INVENTORY (शिल्लक साठा) ---\nऔषध (Medicine Name)\tHSN (HSN Code)\tबॅच (Batch)\tएक्सपायरी (Expiry)\tशिल्लक नग (Qty)\tखरेदी दर (PTR)\tएकूण किंमत (Stock Value)\n";
    
    meds.forEach(function(m) { 
        var val = m.stock_qty > 0 ? (m.stock_qty * m.purchasePrice) : 0; 
        totalStockValue += val; 
        var hsn = m.hsn_code || "-"; 
        tsvContent += `${m.name}\t${hsn}\t${m.batch_no}\t${m.expiry_date}\t${m.stock_qty}\t${(m.purchasePrice || 0).toFixed(2)}\t${val.toFixed(2)}\n`; 
    });
    
    tsvContent += `\t\t\t\t\tएकूण साठा मूल्य (Total Value):\t${totalStockValue.toFixed(2)}\n`; 
    
    safeCopyText(tsvContent, "CA ऑडिट रिपोर्ट (Excel Format)");
}

function exportData() { var backupData = { medicines: getDB('Medicines'), sales: getDB('Sales'), customers: getDB('Customers'), suppliers: getDB('Suppliers'), expenses: getDB('Expenses'), staff: getDB('Staff') }; var dataStr = JSON.stringify(backupData); safeCopyText(dataStr, "संपूर्ण डेटाबेस (Backup JSON)"); }
function importData() { var fileInput = document.getElementById('backupFile'); var file = fileInput.files[0]; if(!file) return; if(confirm("⚠️ जुना डेटा रिस्टोअर करायचा? तुमचा आत्ताचा सर्व डेटा जाईल.")) { var reader = new FileReader(); reader.onload = function(e) { try { var data = JSON.parse(e.target.result); if(data.medicines) setDB('Medicines', data.medicines); if(data.sales) setDB('Sales', data.sales); if(data.customers) setDB('Customers', data.customers); if(data.suppliers) setDB('Suppliers', data.suppliers); if(data.expenses) setDB('Expenses', data.expenses); if(data.staff) setDB('Staff', data.staff); alert("✅ संपूर्ण डेटा अचूक रिस्टोअर झाला!"); location.reload(); } catch(err) { showMessage("❌ फाईल चुकीची आहे!", "red"); } }; reader.readAsText(file); } }

// ==========================================
// १०. UI आणि बॉटम टॅब्स 
// ==========================================
function showTab(tabId, element) { if (currentUserRole === 'staff' && tabId !== 'billingTab' && tabId !== 'ledgerTab') { alert("🔒 कर्मचाऱ्यांना हा विभाग पाहण्याची परवानगी नाही."); return; } var tabs = document.getElementsByClassName('tab-content'); for(var i=0; i<tabs.length; i++) { tabs[i].classList.remove('active-tab'); } var selectedTab = document.getElementById(tabId); if(selectedTab) selectedTab.classList.add('active-tab'); var navBtns = document.querySelectorAll('.bottom-nav button'); for(var i=0; i<navBtns.length; i++) { navBtns[i].classList.remove('active-nav'); } if(element) { element.classList.add('active-nav'); } window.scrollTo(0,0); }

window.onload = function() { 
    if(checkActivation()) { checkLoginState(); }
    loadShopSettings(); displayMedicines(); loadInventoryStats(); calculateFinancialDashboard(); displayCustomers(); displaySuppliers(); loadSupplierDropdown(); displayExpenses(); displayTodayBills(); displayStaff(); setTimeout(loadMedicineDropdown, 500); setTimeout(loadPurchaseDropdown, 500); 
};
