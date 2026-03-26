// App State
let isAdminMode = false;
let contacts = [];
let activeCategory = "all";
let searchQuery = "";

// Configuration
const ADMIN_PASSWORD_HASH = btoa("admin123");

// Categories data
const categories = [
  { value: "all", label: "📋 All Categories", icon: "fas fa-list-ul", iconColor: "text-gray-400" },
  { value: "Hospital", label: "🏥 Hospital", icon: "fas fa-hospital", iconColor: "text-red-500" },
  { value: "Electrician", label: "⚡ Electrician", icon: "fas fa-bolt", iconColor: "text-yellow-500" },
  { value: "Plumber", label: "🔧 Plumber", icon: "fas fa-wrench", iconColor: "text-blue-500" },
  { value: "Painter", label: "🎨 Painter", icon: "fas fa-paint-brush", iconColor: "text-purple-500" },
  { value: "Carpenter", label: "🪚 Carpenter", icon: "fas fa-hammer", iconColor: "text-amber-500" },
  { value: "Gas Booking", label: "⛽ Gas Booking", icon: "fas fa-gas-pump", iconColor: "text-emerald-500" },
  { value: "Mechanic", label: "🔧 Mechanic", icon: "fas fa-car", iconColor: "text-orange-500" },
  { value: "Teacher", label: "📚 Teacher", icon: "fas fa-chalkboard-user", iconColor: "text-blue-600" },
  { value: "Gas Service", label: "⛽ Gas Service", icon: "fas fa-fire", iconColor: "text-orange-600" },
  { value: "AC Repair", label: "❄️ AC Repair", icon: "fas fa-snowflake", iconColor: "text-cyan-500" },
  { value: "Security", label: "🛡️ Security", icon: "fas fa-shield-hooded", iconColor: "text-gray-600" },
  { value: "Cleaner", label: "🧹 Cleaner", icon: "fas fa-hand-sparkles", iconColor: "text-teal-500" },
  { value: "Gardener", label: "🌿 Gardener", icon: "fas fa-leaf", iconColor: "text-green-500" }
];

// Default contacts
const defaultContacts = [
  { id: crypto.randomUUID ? crypto.randomUUID() : Date.now()+'-1', name: "City Central Hospital", category: "Hospital", phone: "+91 22 4567 8901", address: "MG Road, Dombivli East", notes: "24/7 emergency" },
  { id: crypto.randomUUID ? crypto.randomUUID() : Date.now()+'-2', name: "Sharma Electricians", category: "Electrician", phone: "+91 98765 43210", address: "Near Railway Station", notes: "24hr service" },
  { id: crypto.randomUUID ? crypto.randomUUID() : Date.now()+'-3', name: "Precision Plumbers", category: "Plumber", phone: "+91 99887 66554", address: "Nehru Nagar", notes: "Pipeline expert" },
  { id: crypto.randomUUID ? crypto.randomUUID() : Date.now()+'-4', name: "Creative Painters", category: "Painter", phone: "+91 88990 11223", address: "Ganpati Chowk", notes: "Free estimate" },
  { id: crypto.randomUUID ? crypto.randomUUID() : Date.now()+'-5', name: "Woodcraft Carpentry", category: "Carpenter", phone: "+91 77788 99000", address: "Tilak Nagar", notes: "Custom furniture" },
  { id: crypto.randomUUID ? crypto.randomUUID() : Date.now()+'-6', name: "Indane Gas Agency", category: "Gas Booking", phone: "+91 1800 233 4455", address: "Sector 12", notes: "Book online" },
  { id: crypto.randomUUID ? crypto.randomUUID() : Date.now()+'-7', name: "Quick Mechanic Services", category: "Mechanic", phone: "+91 98765 12345", address: "Industrial Area", notes: "Car & bike repair" },
  { id: crypto.randomUUID ? crypto.randomUUID() : Date.now()+'-8', name: "Elite Tutors", category: "Teacher", phone: "+91 99887 11223", address: "Education Hub", notes: "All subjects" }
];

// Storage functions
function loadContactsFromStorage() {
  const stored = localStorage.getItem("guardian_contacts");
  if (stored) {
    contacts = JSON.parse(stored);
  } else {
    contacts = defaultContacts;
    saveToLocalStorage();
  }
}

function saveToLocalStorage() {
  localStorage.setItem("guardian_contacts", JSON.stringify(contacts));
}

function generateId() {
  return crypto.randomUUID ? crypto.randomUUID() : Date.now() + '-' + Math.random().toString(36);
}

// CRUD operations
function addContact(contactData) {
  const newContact = { ...contactData, id: generateId() };
  contacts.push(newContact);
  saveToLocalStorage();
  return newContact;
}

function updateContact(id, updatedData) {
  const index = contacts.findIndex(c => c.id === id);
  if (index !== -1) {
    contacts[index] = { ...contacts[index], ...updatedData };
    saveToLocalStorage();
    return true;
  }
  return false;
}

function deleteContact(id) {
  const filtered = contacts.filter(c => c.id !== id);
  if (filtered.length !== contacts.length) {
    contacts = filtered;
    saveToLocalStorage();
    return true;
  }
  return false;
}

// Filter contacts
function filterContacts() {
  let filtered = [...contacts];
  if (activeCategory !== "all") {
    filtered = filtered.filter(c => c.category === activeCategory);
  }
  if (searchQuery.trim() !== "") {
    const q = searchQuery.trim().toLowerCase();
    filtered = filtered.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.phone.toLowerCase().includes(q) || 
      (c.address && c.address.toLowerCase().includes(q))
    );
  }
  return filtered;
}

function escapeHtml(str) { 
  if(!str) return ''; 
  return str.replace(/[&<>]/g, function(m){ 
    if(m === '&') return '&amp;'; 
    if(m === '<') return '&lt;'; 
    if(m === '>') return '&gt;'; 
    return m;
  });
}

// Render contacts
function renderContacts() {
  const container = document.getElementById("contactsContainer");
  const filtered = filterContacts();
  
  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100 animate-scale-in">
        <i class="fas fa-address-card text-5xl text-gray-300 mb-3"></i>
        <p class="text-gray-500 font-medium">No contacts</p>
        <p class="text-sm text-gray-400 mt-1">Add a new contact</p>
        ${isAdminMode ? `<button id="emptyAddBtn" class="mt-4 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-sm font-semibold inline-flex items-center gap-1"><i class="fas fa-plus"></i> Add</button>` : ''}
      </div>
    `;
    if (isAdminMode && document.getElementById("emptyAddBtn")) {
      document.getElementById("emptyAddBtn").addEventListener("click", () => openModalForAdd());
    }
    return;
  }
  
  let html = '';
  filtered.forEach(contact => {
    let catColor = "bg-gray-100 text-gray-700";
    if (contact.category === "Hospital") catColor = "bg-red-100 text-red-700";
    else if (contact.category === "Electrician") catColor = "bg-yellow-100 text-yellow-800";
    else if (contact.category === "Plumber") catColor = "bg-blue-100 text-blue-700";
    else if (contact.category === "Painter") catColor = "bg-purple-100 text-purple-700";
    else if (contact.category === "Carpenter") catColor = "bg-amber-100 text-amber-700";
    else if (contact.category === "Gas Booking") catColor = "bg-emerald-100 text-emerald-700";
    else if (contact.category === "Mechanic") catColor = "bg-orange-100 text-orange-700";
    else if (contact.category === "Teacher") catColor = "bg-blue-100 text-blue-700";
    else if (contact.category === "Gas Service") catColor = "bg-emerald-100 text-emerald-700";
    else if (contact.category === "AC Repair") catColor = "bg-cyan-100 text-cyan-700";
    else if (contact.category === "Security") catColor = "bg-gray-100 text-gray-700";
    else if (contact.category === "Cleaner") catColor = "bg-teal-100 text-teal-700";
    else if (contact.category === "Gardener") catColor = "bg-green-100 text-green-700";
    
    const actionButtons = isAdminMode ? `
      <div class="flex gap-1 ml-2">
        <button data-id="${contact.id}" class="edit-contact-btn text-indigo-500 hover:bg-indigo-50 p-1.5 rounded-full transition-all duration-300 hover:scale-110" title="Edit"><i class="fas fa-edit text-sm"></i></button>
        <button data-id="${contact.id}" class="delete-contact-btn text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-all duration-300 hover:scale-110" title="Delete"><i class="fas fa-trash-alt text-sm"></i></button>
      </div>
    ` : `<div class="ml-2 text-gray-400"><i class="fas fa-lock text-xs"></i></div>`;
    
    html += `
      <div class="contact-card bg-white rounded-2xl shadow-sm border border-gray-100 p-3 md:p-4 transition-all duration-300">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div class="flex flex-wrap items-center gap-1.5 mb-1">
              <h3 class="font-bold text-base md:text-lg text-gray-800">${escapeHtml(contact.name)}</h3>
              <span class="text-xs ${catColor} px-2 py-0.5 rounded-full font-medium">${escapeHtml(contact.category === "Gas Booking" ? "Gas" : contact.category)}</span>
            </div>
            <div class="flex items-center gap-2 text-gray-600 text-xs md:text-sm mt-1.5">
              <i class="fas fa-phone-alt text-indigo-500 text-xs"></i>
              <a href="tel:${escapeHtml(contact.phone)}" class="hover:text-indigo-700">${escapeHtml(contact.phone)}</a>
            </div>
            ${contact.address ? `<div class="flex items-start gap-2 text-gray-500 text-xs md:text-sm mt-1"><i class="fas fa-map-marker-alt text-gray-400 text-xs mt-0.5"></i><span class="truncate">${escapeHtml(contact.address)}</span></div>` : ''}
          </div>
          ${actionButtons}
        </div>
        <div class="mt-2">
          <a href="tel:${escapeHtml(contact.phone)}" class="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs md:text-sm font-medium px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-all duration-300"><i class="fas fa-phone"></i> Call</a>
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
  
  if (isAdminMode) {
    document.querySelectorAll('.edit-contact-btn').forEach(btn => {
      btn.addEventListener('click', () => openModalForEdit(btn.getAttribute('data-id')));
    });
    document.querySelectorAll('.delete-contact-btn').forEach(btn => {
      btn.addEventListener('click', () => confirmAndDelete(btn.getAttribute('data-id')));
    });
  }
}

// UI State Management
function updateCompactStatusBadge() {
  const statusIcon = document.getElementById('statusIcon');
  const statusText = document.getElementById('statusText');
  const adminToggleBtn = document.getElementById('adminModeToggleBtn');
  const adminIcon = document.getElementById('adminIcon');
  const adminModeText = document.getElementById('adminModeText');
  
  if (isAdminMode) {
    adminToggleBtn.style.background = "#10b981";
    adminToggleBtn.style.borderColor = "#10b981";
    adminIcon.className = "fas fa-user-shield text-white text-xs md:text-sm";
    adminModeText.className = "font-semibold text-white";
    adminModeText.innerText = "Admin";
    statusIcon.className = "fas fa-shield-alt text-green-600 text-xs";
    statusText.innerText = "Active";
    statusText.className = "text-green-700 font-medium";
    document.getElementById('adminStatusBadge').style.background = "#dcfce7";
  } else {
    adminToggleBtn.style.background = "white";
    adminToggleBtn.style.borderColor = "#e5e7eb";
    adminIcon.className = "fas fa-user-cog text-gray-500 text-xs md:text-sm";
    adminModeText.innerText = "Admin";
    adminModeText.className = "font-medium text-gray-700";
    statusIcon.className = "fas fa-eye text-gray-500 text-xs";
    statusText.innerText = "Viewer";
    statusText.className = "text-gray-600";
    document.getElementById('adminStatusBadge').style.background = "#f3f4f6";
  }
}

function updateUIBasedOnMode() {
  const addBtn = document.getElementById('openAddModalBtn');
  if (isAdminMode) {
    if (addBtn) { addBtn.classList.remove('disabled-btn'); addBtn.style.pointerEvents = 'auto'; addBtn.style.opacity = '1'; }
  } else {
    if (addBtn) { addBtn.classList.add('disabled-btn'); addBtn.style.pointerEvents = 'none'; addBtn.style.opacity = '0.6'; }
  }
}

function enableAdminMode() {
  isAdminMode = true;
  updateCompactStatusBadge();
  showToast("✅ Admin mode active", "success");
  updateUIBasedOnMode();
  renderContacts();
}

function disableAdminMode() {
  isAdminMode = false;
  updateCompactStatusBadge();
  showToast("👁️ Viewer mode", "info");
  updateUIBasedOnMode();
  renderContacts();
}

function verifyPassword(inputPassword) {
  return btoa(inputPassword) === ADMIN_PASSWORD_HASH;
}

// Toast notification
function showToast(msg, type) { 
  const toast = document.getElementById('actionToast'); 
  const toastSpan = document.getElementById('toastMsg'); 
  let icon = "ℹ️"; 
  if(type === "success") icon = "✅"; 
  else if(type === "error") icon = "❌"; 
  else if(type === "delete") icon = "🗑️"; 
  toastSpan.innerText = `${icon} ${msg}`; 
  toast.classList.remove('hidden'); 
  setTimeout(() => { toast.classList.add('hidden'); }, 2000); 
}

// Event Listeners
document.getElementById('adminModeToggleBtn')?.addEventListener('click', () => {
  if (isAdminMode) { 
    disableAdminMode(); 
  } else { 
    showPasswordModal(); 
  }
});

document.getElementById('searchInput')?.addEventListener('input', (e) => { 
  searchQuery = e.target.value; 
  renderContacts(); 
});

// Initialize app
function init() {
  loadContactsFromStorage();
  renderContacts();
  updateCompactStatusBadge();
  updateUIBasedOnMode();
  initCategoryDropdown();
  initModals();
}

// Call init when DOM is ready
document.addEventListener('DOMContentLoaded', init);