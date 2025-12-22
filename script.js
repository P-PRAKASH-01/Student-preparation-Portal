// ===================================
// Student Skill Preparation Portal
// Main Application Logic
// ===================================

// ===================================
// Data Structure & State Management
// ===================================

let appState = {
  companies: [],
  currentView: 'dashboard',
  currentCompany: null,
  userSkills: [] // Skills the student already has
};



// ===================================
// LocalStorage Management
// ===================================

function saveToLocalStorage() {
  localStorage.setItem('prepHubState', JSON.stringify(appState));
}

function loadFromLocalStorage() {
  const saved = localStorage.getItem('prepHubState');
  if (saved) {
    appState = JSON.parse(saved);
  } else {
    // Initialize with empty data
    appState.companies = [];
    appState.userSkills = [];
    saveToLocalStorage();
  }
}

// ===================================
// View Management
// ===================================

function switchView(viewName) {
  // Hide all views
  document.querySelectorAll('.view-container').forEach(view => {
    view.classList.add('hidden');
  });

  // Update navigation active state
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.dataset.view === viewName) {
      link.classList.add('active');
    }
  });

  // Show selected view
  appState.currentView = viewName;

  switch (viewName) {
    case 'dashboard':
      document.getElementById('dashboardView').classList.remove('hidden');
      renderDashboard();
      break;
    case 'companies':
      document.getElementById('companiesView').classList.remove('hidden');
      renderCompanies();
      break;
    case 'skills':
      document.getElementById('skillsView').classList.remove('hidden');
      renderSkillGapAnalysis();
      break;
    case 'progress':
      document.getElementById('progressView').classList.remove('hidden');
      renderProgress();
      break;
  }

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===================================
// Dashboard Rendering
// ===================================

function renderDashboard() {
  // Update stats
  const totalCompanies = appState.companies.length;
  const favoriteCount = appState.companies.filter(c => c.isFavorite).length;

  // Calculate unique skills needed
  const allRequiredSkills = new Set();
  appState.companies.forEach(company => {
    company.requiredSkills.forEach(skill => allRequiredSkills.add(skill));
  });

  const skillsNeeded = Array.from(allRequiredSkills).filter(
    skill => !appState.userSkills.includes(skill)
  ).length;

  // Calculate overall progress
  const totalSkillsNeeded = allRequiredSkills.size;
  const skillsAcquired = Array.from(allRequiredSkills).filter(
    skill => appState.userSkills.includes(skill)
  ).length;
  const overallProgress = totalSkillsNeeded > 0
    ? Math.round((skillsAcquired / totalSkillsNeeded) * 100)
    : 0;

  document.getElementById('totalCompanies').textContent = totalCompanies > 0 ? totalCompanies : '';
  document.getElementById('favoriteCount').textContent = totalCompanies > 0 ? favoriteCount : '';
  document.getElementById('skillsNeeded').textContent = totalCompanies > 0 ? skillsNeeded : '';
  document.getElementById('overallProgress').textContent = totalCompanies > 0 ? overallProgress + '%' : '';

  // Render favorite companies
  const favorites = appState.companies.filter(c => c.isFavorite);
  const favoritesSection = document.getElementById('favoritesSection');
  const favoritesGrid = document.getElementById('favoritesGrid');

  if (favorites.length > 0) {
    favoritesSection.classList.remove('hidden');
    favoritesGrid.innerHTML = favorites.map(company => createCompanyCard(company)).join('');
  } else {
    favoritesSection.classList.add('hidden');
  }
}

// ===================================
// Companies View
// ===================================

function renderCompanies() {
  const grid = document.getElementById('companiesGrid');
  const empty = document.getElementById('emptyCompanies');

  if (appState.companies.length === 0) {
    grid.classList.add('hidden');
    empty.classList.remove('hidden');
  } else {
    grid.classList.remove('hidden');
    empty.classList.add('hidden');
    grid.innerHTML = appState.companies.map(company => createCompanyCard(company)).join('');
  }
}

function createCompanyCard(company) {
  const skillsPreview = company.requiredSkills.slice(0, 3);
  const moreSkills = company.requiredSkills.length - 3;

  return `
    <div class="company-card fade-in" onclick="viewCompanyDetail(${company.id})">
      <div class="company-header">
        <div class="company-info">
          <h3>${company.name}</h3>
          <div class="company-role">${company.role}</div>
        </div>
        <button class="favorite-btn ${company.isFavorite ? 'active' : ''}" 
                onclick="event.stopPropagation(); toggleFavorite(${company.id})">
          ${company.isFavorite ? '⭐' : '☆'}
        </button>
      </div>
      
      <div class="company-tags">
        ${skillsPreview.map(skill => `<span class="tag">${skill}</span>`).join('')}
        ${moreSkills > 0 ? `<span class="tag">+${moreSkills} more</span>` : ''}
      </div>
      
      <div class="company-meta">
        <div class="meta-item">
          <span>📍</span>
          <span>${company.location}</span>
        </div>
        <div class="meta-item">
          <span>📝</span>
          <span>${company.type}</span>
        </div>
        ${company.notes ? '<div class="meta-item"><span>📄</span><span>Has notes</span></div>' : ''}
      </div>
    </div>
  `;
}

// ===================================
// Company Detail View
// ===================================

function viewCompanyDetail(companyId) {
  const company = appState.companies.find(c => c.id === companyId);
  if (!company) return;

  appState.currentCompany = company;

  // Categorize skills
  const proficientSkills = company.requiredSkills.filter(skill =>
    appState.userSkills.includes(skill)
  );
  const neededSkills = company.requiredSkills.filter(skill =>
    !appState.userSkills.includes(skill)
  );

  const detailHTML = `
    <div class="company-detail fade-in">
      <div class="detail-header">
        <div class="detail-title">
          <h2>${company.name}</h2>
          <div class="detail-subtitle">${company.role}</div>
        </div>
        <div class="detail-actions">
          <button class="btn btn-secondary" onclick="switchView('companies')">
            <span>←</span>
            <span>Back</span>
          </button>
          <button class="btn ${company.isFavorite ? 'btn-primary' : 'btn-outline'}" 
                  onclick="toggleFavorite(${company.id}); viewCompanyDetail(${company.id})">
            <span>${company.isFavorite ? '⭐' : '☆'}</span>
            <span>${company.isFavorite ? 'Favorited' : 'Add to Favorites'}</span>
          </button>
        </div>
      </div>
      
      <div class="skills-section">
        <h3>Required Skills (${company.requiredSkills.length})</h3>
        <div class="skills-grid">
          ${proficientSkills.map(skill =>
    `<div class="skill-chip proficient" title="You have this skill">✓ ${skill}</div>`
  ).join('')}
          ${neededSkills.map(skill =>
    `<div class="skill-chip needed" title="Skill gap - need to learn">! ${skill}</div>`
  ).join('')}
        </div>
      </div>
      
      ${neededSkills.length > 0 ? `
        <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: var(--radius-lg); padding: var(--spacing-lg); margin-bottom: var(--spacing-xl);">
          <h4 style="color: var(--color-danger); margin-bottom: var(--spacing-sm);">⚠️ Skill Gaps Identified</h4>
          <p style="color: var(--color-text-secondary);">You need to learn ${neededSkills.length} skill${neededSkills.length > 1 ? 's' : ''} for this role. Focus your preparation on: ${neededSkills.slice(0, 3).join(', ')}${neededSkills.length > 3 ? ', ...' : ''}.</p>
        </div>
      ` : `
        <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: var(--radius-lg); padding: var(--spacing-lg); margin-bottom: var(--spacing-xl);">
          <h4 style="color: var(--color-success); margin-bottom: var(--spacing-sm);">✓ You're Ready!</h4>
          <p style="color: var(--color-text-secondary);">You have all the required skills for this role. Review your preparation notes and you're good to apply!</p>
        </div>
      `}
      
      <div class="notes-section">
        <h3>📝 Your Preparation Notes</h3>
        <textarea 
          class="notes-textarea" 
          id="companyNotes"
          placeholder="Add your notes here... (e.g., preparation strategy, resources to study, important deadlines, interview tips)"
          oninput="autoSaveNotes(${company.id})"
        >${company.notes || ''}</textarea>
        <div class="notes-meta">
          <span id="notesSaveStatus">All changes saved</span>
          <span>${company.notes ? company.notes.length : 0} characters</span>
        </div>
      </div>
      
      <div style="margin-top: var(--spacing-xl); padding: var(--spacing-lg); background: var(--color-bg-tertiary); border-radius: var(--radius-lg);">
        <h4 style="margin-bottom: var(--spacing-sm);">📋 Company Details</h4>
        <div style="display: grid; gap: var(--spacing-sm); color: var(--color-text-secondary);">
          <div><strong>Location:</strong> ${company.location}</div>
          <div><strong>Type:</strong> ${company.type}</div>
          <div><strong>Added:</strong> ${new Date(company.addedDate).toLocaleDateString()}</div>
          ${company.deadline ? `<div><strong>Deadline:</strong> ${new Date(company.deadline).toLocaleDateString()}</div>` : ''}
        </div>
      </div>
      
      <div style="margin-top: var(--spacing-xl); padding: var(--spacing-lg); background: rgba(99, 102, 241, 0.05); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: var(--radius-lg);">
        <h4 style="margin-bottom: var(--spacing-sm); color: var(--color-primary-light);">💡 Next Steps</h4>
        <ol style="color: var(--color-text-secondary); padding-left: var(--spacing-lg); line-height: 1.8;">
          <li>Review all required skills and identify your gaps</li>
          <li>Create a preparation plan in your notes</li>
          <li>Practice and learn the missing skills</li>
          <li>Track your progress in the Progress section</li>
          <li>When ready, apply on the company's website (external)</li>
        </ol>
      </div>
    </div>
  `;

  const detailView = document.getElementById('companyDetailView');
  detailView.innerHTML = detailHTML;
  detailView.classList.remove('hidden');

  // Hide other views
  document.querySelectorAll('.view-container:not(#companyDetailView)').forEach(view => {
    view.classList.add('hidden');
  });
}

// ===================================
// Skill Gap Analysis
// ===================================

function renderSkillGapAnalysis() {
  const container = document.getElementById('gapAnalysisContainer');
  const empty = document.getElementById('emptySkills');

  if (appState.companies.length === 0) {
    container.classList.add('hidden');
    empty.classList.remove('hidden');
    return;
  }

  container.classList.remove('hidden');
  empty.classList.add('hidden');

  // Collect all required skills
  const allRequiredSkills = new Set();
  appState.companies.forEach(company => {
    company.requiredSkills.forEach(skill => allRequiredSkills.add(skill));
  });

  // Categorize skills
  const proficientSkills = Array.from(allRequiredSkills).filter(skill =>
    appState.userSkills.includes(skill)
  );
  const neededSkills = Array.from(allRequiredSkills).filter(skill =>
    !appState.userSkills.includes(skill)
  );

  container.innerHTML = `
    <div class="gap-analysis">
      ${neededSkills.length > 0 ? `
        <div class="gap-category missing fade-in">
          <h3>
            <span>⚠️</span>
            <span>Skills to Learn (${neededSkills.length})</span>
          </h3>
          <p style="color: var(--color-text-secondary); margin-bottom: var(--spacing-lg);">
            These skills are required by companies you're tracking but you haven't learned yet. Focus your preparation here!
          </p>
          <div class="gap-skills">
            ${neededSkills.map(skill => {
    const count = appState.companies.filter(c => c.requiredSkills.includes(skill)).length;
    return `<div class="skill-chip needed">${skill} <span style="opacity: 0.6;">(${count} ${count > 1 ? 'companies' : 'company'})</span></div>`;
  }).join('')}
          </div>
        </div>
      ` : ''}
      
      ${proficientSkills.length > 0 ? `
        <div class="gap-category proficient fade-in">
          <h3>
            <span>✓</span>
            <span>Skills You Have (${proficientSkills.length})</span>
          </h3>
          <p style="color: var(--color-text-secondary); margin-bottom: var(--spacing-lg);">
            Great! You already possess these skills required by the companies you're tracking.
          </p>
          <div class="gap-skills">
            ${proficientSkills.map(skill => {
    const count = appState.companies.filter(c => c.requiredSkills.includes(skill)).length;
    return `<div class="skill-chip proficient">${skill} <span style="opacity: 0.6;">(${count} ${count > 1 ? 'companies' : 'company'})</span></div>`;
  }).join('')}
          </div>
        </div>
      ` : ''}
      
      <div style="background: var(--color-bg-card); border: 1px solid var(--color-border); border-radius: var(--radius-xl); padding: var(--spacing-xl); margin-top: var(--spacing-lg);">
        <h3 style="margin-bottom: var(--spacing-md);">📊 Your Skill Overview</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--spacing-lg);">
          <div>
            <div style="font-size: 2rem; font-weight: bold; color: var(--color-success);">${proficientSkills.length}</div>
            <div style="color: var(--color-text-secondary); font-size: 0.875rem;">Skills Acquired</div>
          </div>
          <div>
            <div style="font-size: 2rem; font-weight: bold; color: var(--color-danger);">${neededSkills.length}</div>
            <div style="color: var(--color-text-secondary); font-size: 0.875rem;">Skills to Learn</div>
          </div>
          <div>
            <div style="font-size: 2rem; font-weight: bold; color: var(--color-primary-light);">${Math.round((proficientSkills.length / (proficientSkills.length + neededSkills.length)) * 100)}%</div>
            <div style="color: var(--color-text-secondary); font-size: 0.875rem;">Skill Readiness</div>
          </div>
        </div>
      </div>
      
      <div style="background: rgba(99, 102, 241, 0.05); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: var(--radius-lg); padding: var(--spacing-lg); margin-top: var(--spacing-lg);">
        <h4 style="margin-bottom: var(--spacing-md); color: var(--color-primary-light);">🎯 Manage Your Skills</h4>
        <p style="color: var(--color-text-secondary); margin-bottom: var(--spacing-md);">
          Keep your skill list updated to get accurate gap analysis.
        </p>
        <button class="btn btn-primary" onclick="showManageSkillsModal()">
          <span>✏️</span>
          <span>Update Your Skills</span>
        </button>
      </div>
    </div>
  `;
}

// ===================================
// Progress Tracking
// ===================================

function renderProgress() {
  const container = document.getElementById('progressContainer');
  const empty = document.getElementById('emptyProgress');

  if (appState.companies.length === 0) {
    container.classList.add('hidden');
    empty.classList.remove('hidden');
    return;
  }

  container.classList.remove('hidden');
  empty.classList.add('hidden');

  const progressItems = appState.companies.map(company => {
    const totalSkills = company.requiredSkills.length;
    const acquiredSkills = company.requiredSkills.filter(skill =>
      appState.userSkills.includes(skill)
    ).length;
    const percentage = Math.round((acquiredSkills / totalSkills) * 100);

    return {
      company,
      totalSkills,
      acquiredSkills,
      percentage
    };
  });

  // Sort by percentage (lowest first - needs most work)
  progressItems.sort((a, b) => a.percentage - b.percentage);

  container.innerHTML = progressItems.map(item => `
    <div class="progress-item fade-in" onclick="viewCompanyDetail(${item.company.id})" style="cursor: pointer;">
      <div class="progress-header">
        <div class="progress-title">
          ${item.company.isFavorite ? '⭐ ' : ''}${item.company.name} - ${item.company.role}
        </div>
        <div class="progress-percentage">${item.percentage}%</div>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar" style="width: ${item.percentage}%"></div>
      </div>
      <div style="margin-top: var(--spacing-sm); color: var(--color-text-secondary); font-size: 0.875rem;">
        ${item.acquiredSkills} of ${item.totalSkills} skills acquired
        ${item.percentage < 100 ? ` • ${item.totalSkills - item.acquiredSkills} skills remaining` : ' • Ready to apply!'}
      </div>
    </div>
  `).join('');
}

// ===================================
// Company Management Functions
// ===================================

function toggleFavorite(companyId) {
  const company = appState.companies.find(c => c.id === companyId);
  if (company) {
    company.isFavorite = !company.isFavorite;
    saveToLocalStorage();

    // Re-render current view
    if (appState.currentView === 'companies') {
      renderCompanies();
    } else if (appState.currentView === 'dashboard') {
      renderDashboard();
    }
  }
}

function autoSaveNotes(companyId) {
  const company = appState.companies.find(c => c.id === companyId);
  if (company) {
    const notesTextarea = document.getElementById('companyNotes');
    company.notes = notesTextarea.value;
    saveToLocalStorage();

    // Show save status
    const status = document.getElementById('notesSaveStatus');
    status.textContent = 'Saving...';
    setTimeout(() => {
      status.textContent = 'All changes saved';
    }, 500);
  }
}

// ===================================
// Modal Functions
// ===================================

function showAddCompanyModal() {
  const modal = document.getElementById('modalOverlay');
  const content = document.getElementById('modalContent');

  content.innerHTML = `
    <div style="margin-bottom: var(--spacing-lg);">
      <h2 style="font-size: 1.75rem; margin-bottom: var(--spacing-sm);">Add New Company</h2>
      <p style="color: var(--color-text-secondary);">Track a new company and role you're interested in.</p>
    </div>
    
    <form id="addCompanyForm" onsubmit="handleAddCompany(event)">
      <div style="display: flex; flex-direction: column; gap: var(--spacing-lg);">
        <div>
          <label style="display: block; margin-bottom: var(--spacing-xs); font-weight: 600;">Company Name *</label>
          <input type="text" name="companyName" required 
                 style="width: 100%; padding: var(--spacing-sm); background: var(--color-bg-primary); border: 1px solid var(--color-border); border-radius: var(--radius-md); color: var(--color-text-primary); font-family: var(--font-family);"
                 placeholder="e.g., Apple">
        </div>
        
        <div>
          <label style="display: block; margin-bottom: var(--spacing-xs); font-weight: 600;">Role/Position *</label>
          <input type="text" name="role" required 
                 style="width: 100%; padding: var(--spacing-sm); background: var(--color-bg-primary); border: 1px solid var(--color-border); border-radius: var(--radius-md); color: var(--color-text-primary); font-family: var(--font-family);"
                 placeholder="e.g., Backend Developer Intern">
        </div>
        
        <div>
          <label style="display: block; margin-bottom: var(--spacing-xs); font-weight: 600;">Required Skills (comma-separated) *</label>
          <input type="text" name="skills" required 
                 style="width: 100%; padding: var(--spacing-sm); background: var(--color-bg-primary); border: 1px solid var(--color-border); border-radius: var(--radius-md); color: var(--color-text-primary); font-family: var(--font-family);"
                 placeholder="e.g., Python, Django, PostgreSQL, Docker">
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);">
          <div>
            <label style="display: block; margin-bottom: var(--spacing-xs); font-weight: 600;">Location</label>
            <input type="text" name="location" 
                   style="width: 100%; padding: var(--spacing-sm); background: var(--color-bg-primary); border: 1px solid var(--color-border); border-radius: var(--radius-md); color: var(--color-text-primary); font-family: var(--font-family);"
                   placeholder="e.g., Remote">
          </div>
          
          <div>
            <label style="display: block; margin-bottom: var(--spacing-xs); font-weight: 600;">Type</label>
            <select name="type" 
                    style="width: 100%; padding: var(--spacing-sm); background: var(--color-bg-primary); border: 1px solid var(--color-border); border-radius: var(--radius-md); color: var(--color-text-primary); font-family: var(--font-family);">
              <option value="Internship">Internship</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
            </select>
          </div>
        </div>
        
        <div>
          <label style="display: block; margin-bottom: var(--spacing-xs); font-weight: 600;">Application Deadline (Optional)</label>
          <input type="date" name="deadline" 
                 style="width: 100%; padding: var(--spacing-sm); background: var(--color-bg-primary); border: 1px solid var(--color-border); border-radius: var(--radius-md); color: var(--color-text-primary); font-family: var(--font-family);">
        </div>
        
        <div style="display: flex; gap: var(--spacing-md); justify-content: flex-end; margin-top: var(--spacing-md);">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Add Company</button>
        </div>
      </div>
    </form>
  `;

  modal.classList.remove('hidden');
}

function showManageSkillsModal() {
  const modal = document.getElementById('modalOverlay');
  const content = document.getElementById('modalContent');

  content.innerHTML = `
    <div style="margin-bottom: var(--spacing-lg);">
      <h2 style="font-size: 1.75rem; margin-bottom: var(--spacing-sm);">Manage Your Skills</h2>
      <p style="color: var(--color-text-secondary);">Update the skills you currently possess for accurate gap analysis.</p>
    </div>
    
    <form id="manageSkillsForm" onsubmit="handleUpdateSkills(event)">
      <div>
        <label style="display: block; margin-bottom: var(--spacing-sm); font-weight: 600;">Your Current Skills (comma-separated)</label>
        <textarea name="skills" required 
                  style="width: 100%; min-height: 150px; padding: var(--spacing-md); background: var(--color-bg-primary); border: 1px solid var(--color-border); border-radius: var(--radius-md); color: var(--color-text-primary); font-family: var(--font-family); resize: vertical;"
                  placeholder="e.g., JavaScript, Python, React, Git">${appState.userSkills.join(', ')}</textarea>
        <div style="margin-top: var(--spacing-xs); color: var(--color-text-tertiary); font-size: 0.875rem;">
          Separate each skill with a comma
        </div>
      </div>
      
      <div style="display: flex; gap: var(--spacing-md); justify-content: flex-end; margin-top: var(--spacing-xl);">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">Update Skills</button>
      </div>
    </form>
  `;

  modal.classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.add('hidden');
}

function handleAddCompany(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);

  const newCompany = {
    id: Date.now(),
    name: formData.get('companyName'),
    role: formData.get('role'),
    requiredSkills: formData.get('skills').split(',').map(s => s.trim()).filter(s => s),
    location: formData.get('location') || 'Not specified',
    type: formData.get('type'),
    isFavorite: false,
    notes: '',
    addedDate: new Date().toISOString(),
    deadline: formData.get('deadline') || null
  };

  appState.companies.push(newCompany);
  saveToLocalStorage();
  closeModal();

  // Navigate to companies view and render
  switchView('companies');
}

function handleUpdateSkills(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);

  appState.userSkills = formData.get('skills')
    .split(',')
    .map(s => s.trim())
    .filter(s => s);

  saveToLocalStorage();
  closeModal();

  // Re-render current view
  if (appState.currentView === 'skills') {
    renderSkillGapAnalysis();
  } else if (appState.currentView === 'dashboard') {
    renderDashboard();
  }
}

// ===================================
// Event Listeners
// ===================================

document.addEventListener('DOMContentLoaded', () => {
  // Load data from localStorage
  loadFromLocalStorage();

  // Set up navigation
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const view = link.dataset.view;
      if (view) {
        switchView(view);
      }
    });
  });

  // Get started button
  const getStartedBtn = document.getElementById('getStartedBtn');
  if (getStartedBtn) {
    getStartedBtn.addEventListener('click', () => {
      switchView('companies');
    });
  }

  // Add company buttons
  const addCompanyBtn = document.getElementById('addCompanyBtn');
  const addCompanyCard = document.getElementById('addCompanyCard');

  if (addCompanyBtn) {
    addCompanyBtn.addEventListener('click', showAddCompanyModal);
  }
  if (addCompanyCard) {
    addCompanyCard.addEventListener('click', showAddCompanyModal);
  }

  // Close modal on overlay click
  document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'modalOverlay') {
      closeModal();
    }
  });

  // Initial render
  renderDashboard();
});
