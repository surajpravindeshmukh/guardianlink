// App State
let isAdminMode = false;
let contacts = [];
let categories = [];
let activeCategory = "all";
let searchQuery = "";

// Initialize app
async function initApp() {
  await loadCategories();
  await loadContacts();
  setupEventListeners();
  updateUIBasedOnMode();
}

// Load categories from Supabase
async function loadCategories() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    
    if (error) throw error;
    
    categories = data;
    return categories;
  } catch (error) {
    console.error('Error loading categories:', error);
    showToast('Failed to load categories', 'error');
    return [];
  }
}

// Load contacts from Supabase
async function loadContacts() {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select(`
        *,
        categories (
          name,
          icon,
          icon_color
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    contacts = data;
    renderContacts();
    return contacts;
  } catch (error) {
    console.error('Error loading contacts:', error);
    showToast('Failed to load contacts', 'error');
    return [];
  }
}

// Add contact to Supabase
async function addContact(contactData) {
  try {
    // Find category ID
    const category = categories.find(c => c.name === contactData.category);
    if (!category) throw new Error('Category not found');
    
    const { data, error } = await supabase
      .from('contacts')
      .insert([{
        name: contactData.name,
        category_id: category.id,
        phone: contactData.phone,
        address: contactData.address,
        notes: contactData.notes
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    contacts.unshift(data);
    renderContacts();
    return { success: true, data };
  } catch (error) {
    console.error('Error adding contact:', error);
    showToast('Failed to add contact', 'error');
    return { success: false, error: error.message };
  }
}

// Update contact in Supabase
async function updateContact(id, updatedData) {
  try {
    // Find category ID
    const category = categories.find(c => c.name === updatedData.category);
    if (!category) throw new Error('Category not found');
    
    const { data, error } = await supabase
      .from('contacts')
      .update({
        name: updatedData.name,
        category_id: category.id,
        phone: updatedData.phone,
        address: updatedData.address,
        notes: updatedData.notes
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    const index = contacts.findIndex(c => c.id === id);
    if (index !== -1) contacts[index] = data;
    renderContacts();
    return { success: true, data };
  } catch (error) {
    console.error('Error updating contact:', error);
    showToast('Failed to update contact', 'error');
    return { success: false, error: error.message };
  }
}

// Delete contact from Supabase
async function deleteContact(id) {
  try {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    contacts = contacts.filter(c => c.id !== id);
    renderContacts();
    return { success: true };
  } catch (error) {
    console.error('Error deleting contact:', error);
    showToast('Failed to delete contact', 'error');
    return { success: false, error: error.message };
  }
}

// Filter contacts
function filterContacts() {
  let filtered = [...contacts];
  if (activeCategory !== "all") {
    filtered = filtered.filter(c => c.categories?.name === activeCategory);
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
async function renderContacts() {
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
    const category = contact.categories;
    let catColor = "bg-gray-100 text-gray-700";
    if (category) {
      catColor = category.icon_color?.replace('text-', 'bg-')?.replace('500', '100') + ' ' + category.icon_color || "bg-gray-100 text-gray-700";
    }
    
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
              <span class="text-xs ${catColor} px-2 py-0.5 rounded-full font-medium">${escapeHtml(category?.name || 'Unknown')}</span>
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

async function enableAdminMode() {
  isAdminMode = true;
  updateCompactStatusBadge();
  showToast("✅ Admin mode active", "success");
  updateUIBasedOnMode();
  await loadContacts();
}

function disableAdminMode() {
  isAdminMode = false;
  updateCompactStatusBadge();
  showToast("👁️ Viewer mode", "info");
  updateUIBasedOnMode();
  renderContacts();
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
function setupEventListeners() {
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
  
  document.getElementById('openAddModalBtn')?.addEventListener('click', () => openModalForAdd());
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
