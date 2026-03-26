// Modal Management
let currentEditId = null;

// Create modal HTML
function createModals() {
  const modalsContainer = document.getElementById('modalsContainer');
  
  // Contact Modal
  const contactModal = `
    <div id="contactModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[2000] px-4 transition-all hidden">
      <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden modal-content">
        <div class="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 id="modalTitle" class="font-bold text-xl text-gray-800">Add Contact</h3>
          <button id="closeModalBtn" class="text-gray-400 hover:text-gray-600 text-xl transition-transform hover:scale-110 active:scale-95"><i class="fas fa-times"></i></button>
        </div>
        <div class="p-5 space-y-4">
          <input type="hidden" id="editId" value="">
          <div class="transform transition-all duration-300 focus-within:scale-[1.02]">
            <label class="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input type="text" id="contactName" placeholder="e.g., City Hospital" class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-300 outline-none transition-all duration-300">
          </div>
          <div class="transform transition-all duration-300 focus-within:scale-[1.02]">
            <label class="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select id="contactCategory" class="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-300 outline-none transition-all duration-300">
              ${categories.filter(c => c.value !== "all").map(cat => `<option value="${cat.value}">${cat.label}</option>`).join('')}
            </select>
          </div>
          <div class="transform transition-all duration-300 focus-within:scale-[1.02]">
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
            <input type="tel" id="contactPhone" placeholder="+91 9876543210" class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-300 outline-none transition-all duration-300">
          </div>
          <div class="transform transition-all duration-300 focus-within:scale-[1.02]">
            <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input type="text" id="contactAddress" placeholder="Street, city" class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-300 outline-none transition-all duration-300">
          </div>
          <div class="transform transition-all duration-300 focus-within:scale-[1.02]">
            <label class="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <textarea id="contactNotes" rows="2" placeholder="e.g., 24/7 emergency" class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-300 outline-none transition-all duration-300"></textarea>
          </div>
        </div>
        <div class="px-5 py-4 bg-gray-50 flex justify-end gap-3">
          <button id="cancelModalBtn" class="px-5 py-2 rounded-xl border border-gray-300 text-gray-700 font-medium transition-all duration-300 hover:bg-gray-100 hover:scale-105 active:scale-95">Cancel</button>
          <button id="saveContactBtn" class="ripple px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md active:scale-95">Save</button>
        </div>
      </div>
    </div>
  `;
  
  // Password Modal
  const passwordModal = `
    <div id="passwordModal" class="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-[2000] px-4 transition-all hidden">
      <div class="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 modal-content">
        <div class="text-center mb-4">
          <i class="fas fa-lock text-4xl text-indigo-500 mb-2 animate-pulse"></i>
          <h3 class="text-xl font-bold text-gray-800">Admin Access</h3>
          <p class="text-sm text-gray-500 mt-1">Enter password to edit</p>
        </div>
        <div class="mb-5">
          <input type="password" id="adminPasswordInput" placeholder="Enter password" 
                 class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none text-center text-lg tracking-wider transition-all duration-300 focus:scale-[1.02]">
          <div id="passwordError" class="text-red-500 text-xs mt-2 hidden text-center animate-shake">❌ Wrong password</div>
        </div>
        <div class="flex gap-3">
          <button id="cancelPasswordBtn" class="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium transition-all duration-300 hover:bg-gray-100 hover:scale-105 active:scale-95">Cancel</button>
          <button id="submitPasswordBtn" class="ripple flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-md active:scale-95">Unlock</button>
        </div>
        <div class="text-center text-xs text-gray-400 mt-4">
          <i class="fas fa-key"></i> Default: admin123
        </div>
      </div>
    </div>
  `;
  
  modalsContainer.innerHTML = contactModal + passwordModal;
}

function initModals() {
  createModals();
  
  // Modal elements
  const contactModal = document.getElementById('contactModal');
  const passwordModal = document.getElementById('passwordModal');
  const passwordInput = document.getElementById('adminPasswordInput');
  const passwordErrorDiv = document.getElementById('passwordError');
  
  // Contact modal handlers
  document.getElementById('closeModalBtn')?.addEventListener('click', closeModal);
  document.getElementById('cancelModalBtn')?.addEventListener('click', closeModal);
  document.getElementById('saveContactBtn')?.addEventListener('click', saveContactFromModal);
  
  // Password modal handlers
  document.getElementById('submitPasswordBtn')?.addEventListener('click', handlePasswordSubmit);
  document.getElementById('cancelPasswordBtn')?.addEventListener('click', closePasswordModal);
  passwordInput?.addEventListener('keypress', (e) => { if(e.key === 'Enter') handlePasswordSubmit(); });
  
  // Close modals on backdrop click
  contactModal?.addEventListener('click', (e) => { if(e.target === contactModal) closeModal(); });
  passwordModal?.addEventListener('click', (e) => { if(e.target === passwordModal) closePasswordModal(); });
  
  function handlePasswordSubmit() { 
    const enteredPass = passwordInput.value; 
    if (verifyPassword(enteredPass)) { 
      closePasswordModal(); 
      enableAdminMode(); 
    } else { 
      passwordErrorDiv.classList.remove('hidden'); 
      passwordInput.classList.add('border-red-400'); 
      setTimeout(() => { passwordInput.classList.remove('border-red-400'); }, 1000); 
    } 
  }
  
  function closePasswordModal() { 
    passwordModal.classList.add('hidden'); 
  }
}

function openModalForAdd() { 
  if (!isAdminMode) { showToast("Admin mode required", "error"); return; } 
  resetModalFields(); 
  document.getElementById('modalTitle').innerText = 'Add Contact'; 
  currentEditId = null; 
  document.getElementById('contactModal').classList.remove('hidden'); 
}

function openModalForEdit(id) { 
  if (!isAdminMode) { showToast("Admin mode required", "error"); return; } 
  const contact = contacts.find(c => c.id === id); 
  if (!contact) return; 
  resetModalFields(); 
  currentEditId = id; 
  document.getElementById('modalTitle').innerText = 'Edit Contact'; 
  document.getElementById('contactName').value = contact.name; 
  document.getElementById('contactCategory').value = contact.category; 
  document.getElementById('contactPhone').value = contact.phone; 
  document.getElementById('contactAddress').value = contact.address || ''; 
  document.getElementById('contactNotes').value = contact.notes || ''; 
  document.getElementById('editId').value = id; 
  document.getElementById('contactModal').classList.remove('hidden'); 
}

function resetModalFields() { 
  document.getElementById('editId').value = ''; 
  document.getElementById('contactName').value = ''; 
  document.getElementById('contactPhone').value = ''; 
  document.getElementById('contactAddress').value = ''; 
  document.getElementById('contactNotes').value = ''; 
  document.getElementById('contactCategory').value = 'Hospital'; 
  currentEditId = null; 
}

function saveContactFromModal() { 
  if (!isAdminMode) { closeModal(); showToast("Unauthorized", "error"); return; } 
  const name = document.getElementById('contactName').value.trim(); 
  const category = document.getElementById('contactCategory').value; 
  const phone = document.getElementById('contactPhone').value.trim(); 
  const address = document.getElementById('contactAddress').value.trim(); 
  const notes = document.getElementById('contactNotes').value.trim(); 
  if (!name || !phone) { alert("Please fill required fields"); return; } 
  const payload = { name, category, phone, address, notes }; 
  if (currentEditId) { 
    updateContact(currentEditId, payload); 
    showToast("Contact updated", "success"); 
  } else { 
    addContact(payload); 
    showToast("Contact added", "success"); 
  } 
  closeModal(); 
  renderContacts(); 
}

function confirmAndDelete(id) { 
  if (!isAdminMode) return; 
  const contactToDel = contacts.find(c => c.id === id); 
  if (confirm(`Delete "${contactToDel?.name}"?`)) { 
    deleteContact(id); 
    renderContacts(); 
    showToast("Contact deleted", "delete"); 
  } 
}

function closeModal() { 
  document.getElementById('contactModal').classList.add('hidden'); 
  resetModalFields(); 
}

function showPasswordModal() { 
  const passwordModal = document.getElementById('passwordModal');
  const passwordInput = document.getElementById('adminPasswordInput');
  const passwordErrorDiv = document.getElementById('passwordError');
  passwordInput.value = ''; 
  passwordErrorDiv.classList.add('hidden'); 
  passwordModal.classList.remove('hidden'); 
  passwordInput.focus(); 
}