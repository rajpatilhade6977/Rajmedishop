// ==========================================
// 🔐 मास्टर ॲक्टिव्हेशन की & Security 
// ==========================================
var _0x1a2b = ["\x52\x41\x4A\x40\x32\x30\x32\x36"]; // "RAJ@2026"
var isProcessing = false; 

function logoutApp() { if(confirm("तुम्हाला नक्की लॉगआउट करायचे आहे का?")) { sessionStorage.removeItem('isLoggedIn'); sessionStorage.removeItem('role'); location.reload(); } }

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
function cleanText(str) { return str ? str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;").trim() : ""; }

async function hashPin(pin){ const msgBuffer = new TextEncoder().encode(pin); const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer); return btoa(String.fromCharCode(...new Uint8Array(hashBuffer))); }

if(!localStorage.getItem('Medicines')) localStorage.setItem('Medicines', '[]'); if(!localStorage.getItem('Sales')) localStorage.setItem('Sales', '[]'); if(!localStorage.getItem('Customers')) localStorage.setItem('Customers', '[]'); if(!localStorage.getItem('Suppliers')) localStorage.setItem('Suppliers', '[]'); if(!localStorage.getItem('Expenses')) localStorage.setItem('Expenses', '[]'); if(!localStorage.getItem('Staff')) localStorage.setItem('Staff', '[]'); if(!localStorage.getItem('BankTransactions')) localStorage.setItem('BankTransactions', '[]'); 
// 🔴 CA Update: Invoice Number Initialization
if(!localStorage.getItem('lastInvoiceNo')) localStorage.setItem('lastInvoiceNo', '0'); 

function getDB(table) { try { var data = JSON.parse(localStorage.getItem(table)); return Array.isArray(data) ? data : []; } catch(e) { return []; } }
function setDB(table, data) { try { localStorage.setItem(table, JSON.stringify(data)); checkStorageLimit(); return true; } catch(e) { alert("❌ ॲपची मेमरी फुल झाली आहे! कृपया जुना डेटा डिलीट करा."); return false; } }
function checkStorageLimit() { var total = 0; for(var x in localStorage) { if(localStorage.hasOwnProperty(x)) { total += ((localStorage[x].length + x.length) * 2); } } var mb = (total/1024/1024).toFixed(2); if(mb > 3.0) { alert(`⚠️ धोक्याचा इशारा: ॲपची मेमरी ${mb}MB भरली आहे (मर्यादा 5MB). कृपया डेटा बॅकअप घ्या!`); } }

function refreshAllData() { calculateFinancialDashboard(); loadInventoryStats(); displayTodayBills(); displayExpenses(); displayMedicines(); displayCustomers(); displaySuppliers(); displayStaff(); displayBankTransactions(); }

// 🔴 CA Update: Generate Sequential Invoice Number (e.g. INV-26-0001)
function generateInvoiceNumber() {
    var lastNo = parseInt(localStorage.getItem('lastInvoiceNo'));
    var newNo = lastNo + 1;
    localStorage.setItem('lastInvoiceNo', newNo.toString());
    var year = new Date().getFullYear().toString().slice(-2);
    return `INV-${year}-${('0000' + newNo).slice(-4)}`;
}

// ... (Login, Bank, Customer, Staff functions remain the same as previous code) ...

// ==========================================
// 🔴 CA Update: Expense Categories
// ==========================================
function toggleExpUtrField() { var mode = document.getElementById('expPaymentMode').value; var utrBox = document.getElementById('expUtrNo'); if(mode === "UPI") { utrBox.style.display = "block"; utrBox.focus(); } else { utrBox.style.display = "none"; utrBox.value = ""; } }
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
function displayExpenses() { var listBody = document.getElementById('expenseList'); if(!listBody) return; listBody.innerHTML = ""; var todayStr = getTodayDateStr(); var todayExps = getDB('Expenses').filter(e => e.expense_date === todayStr).reverse(); if (todayExps.length === 0) { listBody.innerHTML = "<tr><td colspan='3' style='text-align:center;'>खर्च नाही.</td></tr>"; return; } todayExps.forEach(exp => { var catTag = exp.category ? `<br><small style="color:#d35400;">[${exp.category.split(' ')[0]}]</small>` : ""; listBody.innerHTML += `<tr><td><b>${exp.description}</b>${catTag}</td><td style='color: red;'>₹${(exp.amount || 0).toFixed(2)}</td><td><button class="edit-btn" onclick="editExpense('${exp.expense_id}')">✏️</button> <button onclick="deleteExpense('${exp.expense_id}')" class="action-btn delete-btn" style="padding:5px;">Del</button></td></tr>`; }); }
function deleteExpense(id) { if (!confirm("हा खर्च रद्द करायचा आहे का?")) return; var expenses = getDB('Expenses'); var idx = expenses.findIndex(e => e.expense_id == id); if(idx > -1) { var exp = expenses[idx]; if(exp.mode === 'UPI') { addBankEntry(`खर्च रद्द (Refund): ${exp.description}`, 'IN', exp.amount, getTodayDateStr()); } expenses.splice(idx, 1); if(setDB('Expenses', expenses)) { showMessage("🗑️ खर्च रद्द झाला!", "red"); refreshAllData(); } } }

// ==========================================
// 🔴 CA Update: औषधे व्यवस्थापन (GST % Added)
// ==========================================
function saveMedicine() {
    if(isProcessing) return;
    try {
        isProcessing = true;
        var editId = document.getElementById('editId').value; var name = cleanText(document.getElementById('medName').value); var suppId = document.getElementById('supplierSelect').value; var pBillDate = document.getElementById('purchaseBillDate').value; var cDays = document.getElementById('creditDays').value; var unitType = document.getElementById('unitType').value; 
        var hsnCode = document.getElementById('hsnCode') ? cleanText(document.getElementById('hsnCode').value) : "-"; 
        var gstRate = parseInt(document.getElementById('medGstRate').value) || 0; // 🔴 GST %
        var saltName = document.getElementById('saltName') ? cleanText(document.getElementById('saltName').value) : "-"; var isRx = document.getElementById('rxRequired') ? document.getElementById('rxRequired').checked : false; var company = cleanText(document.getElementById('medCompany').value) || "-"; var rackNo = cleanText(document.getElementById('medRackNo').value) || "-"; var batch = cleanText(document.getElementById('batchNo').value) || "-"; var expiry = document.getElementById('expiryDate').value; var unitsPerPack = parseInt(document.getElementById('unitsPerPack').value, 10) || 1; var purchasedPacks = parseInt(document.getElementById('totalPacks').value, 10) || 0; var freePacks = parseInt(document.getElementById('freePacks').value, 10) || 0; var packPTR = parseFloat(document.getElementById('packPTR').value) || 0; var packMRP = parseFloat(document.getElementById('packMRP').value) || 0; 
        if (!name || !pBillDate) { alert("⚠️ कृपया औषधाचे नाव आणि सप्लायर बिल तारीख टाका!"); return; } if (purchasedPacks <= 0 || packPTR <= 0 || packMRP <= 0) { alert("⚠️ कृपया QTY आणि RATE योग्य टाका!"); return; } if (!expiry) { alert("⚠️ कृपया EXP DATE टाका!"); return; }
        
        var totalCost = purchasedPacks * packPTR; var calculatedStock = unitsPerPack * (purchasedPacks + freePacks); var perUnitPTR = calculatedStock > 0 ? (totalCost / calculatedStock) : 0; var perUnitMRP = unitsPerPack > 0 ? (packMRP / unitsPerPack) : 0; 
        var meds = getDB('Medicines'); var medObj = { medicine_id: editId || new Date().getTime().toString(), name: name, unitType: unitType, hsn_code: hsnCode, gst_rate: gstRate, salt_name: saltName, rx_required: isRx, company: company, rack_no: rackNo, batch_no: batch, expiry_date: expiry, purchasePrice: perUnitPTR, mrp: perUnitMRP, stock_qty: calculatedStock, unitsPerPack: unitsPerPack };
        if (editId) { var index = meds.findIndex(m => m.medicine_id == editId); if(index > -1) meds[index] = medObj; } else { meds.push(medObj); }
        
        if (!editId && suppId && totalCost > 0) { var supps = getDB('Suppliers'); var sIdx = supps.findIndex(s => s.supplier_id == suppId); if(sIdx > -1) { var dueDate = addDays(pBillDate, cDays); if (!supps[sIdx].bill_history) supps[sIdx].bill_history = []; supps[sIdx].bill_history.push({ bill_date: pBillDate, amount: totalCost, due_date: dueDate, is_paid: false }); supps[sIdx].pending_dues += totalCost; setDB('Suppliers', supps); } }
        if(setDB('Medicines', meds)) { showMessage(editId ? "🔄 औषध अपडेट झाले!" : "✅ औषध सेव्ह झाले!", "green"); document.getElementById('medicineForm').reset(); document.getElementById('unitsPerPack').value = "10"; document.getElementById('editId').value = ""; refreshAllData(); }
    } catch (error) { alert("❌ चूक: " + error.message); } finally { setTimeout(() => { isProcessing = false; }, 500); }
}

// ==========================================
// 🔴 CA Update: Invoice Generation with GST Breakup
// ==========================================
var cart = []; var cartTotal = 0; var finalCartTotal = 0;
function toggleUtrField() { var mode = document.getElementById('billPaymentMode').value; var utrBox = document.getElementById('billUtrNo'); if(mode === "UPI") { utrBox.style.display = "block"; utrBox.focus(); } else { utrBox.style.display = "none"; utrBox.value = ""; } }
function loadMedicineDropdown() { var select = document.getElementById('medicineSelect'); if(!select) return; select.innerHTML = "<option value=''>-- औषध निवडा --</option>"; getDB('Medicines').forEach(med => { var pPrice = med.purchasePrice ? med.purchasePrice : 0; var packSize = med.unitsPerPack || 1; var rxVal = med.rx_required ? 'true' : 'false'; var saltVal = med.salt_name || "-"; var rackVal = med.rack_no || "-"; var gstVal = med.gst_rate || 0; select.innerHTML += `<option value='${med.medicine_id}' data-price='${med.mrp || 0}' data-purchase='${pPrice}' data-stock='${med.stock_qty}' data-pack='${packSize}' data-barcode='${med.batch_no}' data-expiry='${med.expiry_date}' data-rx='${rxVal}' data-hsn='${med.hsn_code||"-"}' data-gst='${gstVal}' data-rack='${rackVal}'>${med.name} - ₹${((med.mrp || 0) * packSize).toFixed(2)} / पॅक</option>`; }); }
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
function updateCartUI() { var cartBody = document.getElementById('cartBody'); if(!cartBody) return; cartBody.innerHTML = ""; cartTotal = 0; cart.forEach((item, index) => { cartTotal += item.total; cartBody.innerHTML += `<tr><td><b>${item.name}</b></td><td><b>${item.displayQty}</b></td><td>₹${item.price.toFixed(2)}</td><td><span onclick="removeCartItem(${index})" style="cursor:pointer; color:red;">❌</span> ₹${item.total.toFixed(2)}</td></tr>`; }); document.getElementById('cartTotalDisplay').innerText = "मूळ रक्कम: ₹" + cartTotal.toFixed(2); applyDiscount(); }
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
        
        var newBillId = generateInvoiceNumber(); // 🔴 CA Update: Sequential Invoice
        
        sales.push({ bill_id: newBillId, customer_name: customerName, customer_gstin: custGstin, doctor_name: drName, bill_date: getTodayDateStr(), total_amount: finalCartTotal, bill_profit: trueProfit, items: savedCart, is_credit: isCredit, discount_amt: discountAmt, payment_mode: payMode, utr_no: utrNo });
        if(!setDB('Medicines', meds) || !setDB('Sales', sales)) { return; } 

        if (!isCredit && payMode === "UPI") { addBankEntry(`बिल जमा: ${customerName} ${utrNo ? '(UTR:'+utrNo+')' : ''}`, 'IN', finalCartTotal, getTodayDateStr()); }
        if(isCredit) { var custs = getDB('Customers'); var existingCust = custs.find(c => c.name.toLowerCase() === customerName.toLowerCase()); if(existingCust) { existingCust.ledger_balance += finalCartTotal; } else { custs.push({customer_id: new Date().getTime().toString(), name: customerName, phone: "", ledger_balance: finalCartTotal, payment_history: []}); } setDB('Customers', custs); document.getElementById('billTypeLabel').style.display = "block"; showMessage("📝 उधारीचे बिल बनवले!", "red"); } else { document.getElementById('billTypeLabel').style.display = "none"; showMessage("💵 रोख/UPI बिल यशस्वीरीत्या बनवले!", "green"); }

        document.getElementById('invCustomer').innerText = customerName; document.getElementById('invDate').innerText = new Date().toLocaleDateString('en-IN'); document.getElementById('invBillNo').innerText = newBillId; document.getElementById('invFooterShopName').innerText = localStorage.getItem('shopName') || "मेडिकल शॉप";
        if(drName) { document.getElementById('invDoctorText').style.display = "block"; document.getElementById('invDoctor').innerText = drName; } else { document.getElementById('invDoctorText').style.display = "none"; }
        var invCustGstinWrapper = document.getElementById('invCustGstinWrapper'); if(custGstin && invCustGstinWrapper) { document.getElementById('invCustGstin').innerText = custGstin; invCustGstinWrapper.style.display = "inline"; } else { if(invCustGstinWrapper) invCustGstinWrapper.style.display = "none"; }
        document.getElementById('invPayMode').innerText = payMode; if(payMode === "UPI" && utrNo !== "") { document.getElementById('invUtrNo').innerText = utrNo; document.getElementById('invUtrWrapper').style.display = "inline"; } else { document.getElementById('invUtrWrapper').style.display = "none"; }

        // 🔴 CA Update: Print Invoice with HSN & GST Calculation
        var invHTML = ""; 
        var gstMap = {}; // To group taxes by %
        
        cart.forEach(item => { 
            var expFormatted = formatExpDate(item.expiry); 
            var hsnTxt = item.hsn && item.hsn !== "-" ? item.hsn : "";
            invHTML += `<tr><td>${item.displayQty}</td><td><b>${item.name}</b></td><td>${item.batch}</td><td>${hsnTxt}</td><td style="text-align: right;">${item.total.toFixed(2)}</td></tr>`; 
            
            // Reverse calculate basic value if MRP is inclusive of GST
            if(item.gst_rate > 0) {
                var taxRate = item.gst_rate;
                var baseValue = item.total / (1 + (taxRate/100));
                var taxAmt = item.total - baseValue;
                if(!gstMap[taxRate]) gstMap[taxRate] = { base: 0, tax: 0 };
                gstMap[taxRate].base += baseValue;
                gstMap[taxRate].tax += taxAmt;
            }
        });
        
        document.getElementById('invoiceBody').innerHTML = invHTML; 
        document.getElementById('invTaxableVal').innerText = cartTotal.toFixed(2);
        if(discountAmt > 0) { document.getElementById('invDiscountRow').style.display = "flex"; document.getElementById('invDiscountAmt').innerText = "- ₹" + discountAmt.toFixed(2); } else { document.getElementById('invDiscountRow').style.display = "none"; }
        
        // Print GST Breakup Table
        var gstKeys = Object.keys(gstMap);
        if(gstKeys.length > 0) {
            var gstHtml = "";
            gstKeys.forEach(rate => {
                var halfRate = parseFloat(rate)/2;
                var halfTax = gstMap[rate].tax / 2;
                gstHtml += `<tr><td>${rate}%</td><td>${gstMap[rate].base.toFixed(2)}</td><td>${halfTax.toFixed(2)} (${halfRate}%)</td><td>${halfTax.toFixed(2)} (${halfRate}%)</td></tr>`;
            });
            document.getElementById('invGstBody').innerHTML = gstHtml;
            document.getElementById('invGstTable').style.display = "table";
        } else {
            document.getElementById('invGstTable').style.display = "none";
        }
        
        document.getElementById('invTotal').innerText = finalCartTotal.toFixed(2); 
        document.getElementById('invoiceSection').style.display = "block"; 
        
        cart = []; updateCartUI(); document.getElementById('customerName').value = ""; document.getElementById('doctorName').value = ""; if(document.getElementById('customerGstin')) document.getElementById('customerGstin').value = ""; document.getElementById('medicineSelect').selectedIndex = 0; document.getElementById('sellQty').value = "1"; document.getElementById('sellPrice').value = ""; document.getElementById('billDiscount').value = "0"; document.getElementById('billPaymentMode').value = "Cash"; toggleUtrField(); if(document.getElementById('medDosage')) document.getElementById('medDosage').selectedIndex = 0; if(document.getElementById('rackDisplay')) document.getElementById('rackDisplay').style.display = "none";
        refreshAllData(); window.scrollTo(0, document.body.scrollHeight);
    } finally { setTimeout(() => { isProcessing = false; }, 500); }
}

function printInvoice() { var printContents = document.getElementById('invoiceSection').innerHTML; var originalContents = document.body.innerHTML; document.body.innerHTML = printContents; window.print(); document.body.innerHTML = originalContents; location.reload(); }
function sendWhatsAppBill() { var custName = document.getElementById('invCustomer').innerText; var total = document.getElementById('invTotal').innerText; var isCredit = document.getElementById('billTypeLabel').style.display === "block" ? "(उधारी)" : "(रोख)"; var text = `*🩺 मेडिकल शॉप ${isCredit}*\nनमस्कार ${custName},\nतुमची आजची खरेदी:\n`; var rows = document.querySelectorAll('#invoiceBody tr'); rows.forEach(row => { var cols = row.querySelectorAll('td'); if(cols.length >= 5) { text += `🔸 ${cols[1].innerText.split('\n')[0]} - ${cols[0].innerText} x ₹${cols[4].innerText}\n`; } }); if(document.getElementById('invDiscountRow').style.display === "block" || document.getElementById('invDiscountRow').style.display === "flex") { text += `\n*Discount:* ${document.getElementById('invDiscountAmt').innerText}`; } text += `\n*एकूण रक्कम: ${total}*\n\nखरेदी केल्याबद्दल धन्यवाद! 🙏`; window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank'); }

// (बाकीचा सर्व कोड जसाच्या तसा...)

window.onload = function() { 
    upgradeLegacyHashes().then(() => {
        if(checkActivation()) { checkLoginState(); }
        loadShopSettings(); refreshAllData(); setTimeout(loadMedicineDropdown, 500); checkStorageLimit();
    });
};
