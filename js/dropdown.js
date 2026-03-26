// Category Dropdown Management
async function initCategoryDropdown() {
  // Populate category list from Supabase
  const categoryList = document.getElementById('categoryList');
  
  // Add "All Categories" option
  const allCategoriesHtml = `
    <button data-cat="all" class="category-option w-full text-left px-4 py-3 text-sm hover:bg-indigo-50 transition-all duration-200 flex items-center gap-2">
      <i class="fas fa-list-ul text-gray-400 text-xs"></i>
      <span>📋 All Categories</span>
      <i class="fas fa-check ml-auto text-indigo-600 opacity-0 category-check"></i>
    </button>
  `;
  
  // Add category options
  const categoriesHtml = categories.map(cat => `
    <button data-cat="${cat.name}" class="category-option w-full text-left px-4 py-3 text-sm hover:bg-indigo-50 transition-all duration-200 flex items-center gap-2">
      <i class="${cat.icon} ${cat.icon_color} text-xs"></i>
      <span>${cat.name}</span>
      <i class="fas fa-check ml-auto text-indigo-600 opacity-0 category-check"></i>
    </button>
  `).join('');
  
  categoryList.innerHTML = allCategoriesHtml + categoriesHtml;
  
  const dropdownBtn = document.getElementById('categoryDropdownBtn');
  const dropdown = document.getElementById('categoryDropdown');
  const categoryOptions = document.querySelectorAll('.category-option');
  const selectedText = document.getElementById('selectedCategoryText');
  const chevronIcon = dropdownBtn.querySelector('.fa-chevron-down');
  
  // Set initial selected text
  selectedText.innerText = "All Categories";
  
  dropdownBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('hidden');
    chevronIcon.style.transform = dropdown.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
  });
  
  categoryOptions.forEach(option => {
    option.addEventListener('click', () => {
      const catValue = option.getAttribute('data-cat');
      const catText = option.querySelector('span').innerText;
      
      activeCategory = catValue;
      selectedText.innerText = catText;
      
      // Update checkmark visibility
      categoryOptions.forEach(opt => {
        const checkmark = opt.querySelector('.category-check');
        if (opt.getAttribute('data-cat') === catValue) {
          checkmark.style.opacity = '1';
        } else {
          checkmark.style.opacity = '0';
        }
      });
      
      dropdown.classList.add('hidden');
      chevronIcon.style.transform = 'rotate(0deg)';
      renderContacts();
    });
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!dropdownBtn.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.add('hidden');
      chevronIcon.style.transform = 'rotate(0deg)';
    }
  });
}

// Override the init function to include category dropdown
const originalInit = initApp;
window.initApp = async function() {
  await originalInit();
  await initCategoryDropdown();
};
