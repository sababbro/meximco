// ================================================
// MEXIMCO ADMIN — HYDROSPHERE CONTROL PANEL JS
// (PHP Backend Version)
// ================================================
const API_BASE = CONFIG.API_URL;
const EP = CONFIG.endpoints;
let token = localStorage.getItem('meximco_token');

// ==================== AUTH ====================
const loginScreen = document.getElementById('loginScreen');
const adminWrapper = document.getElementById('adminWrapper');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');

function showAdmin() {
    loginScreen.style.display = 'none';
    adminWrapper.style.display = 'flex';
    loadDashboard();
}

function showLogin() {
    loginScreen.style.display = 'flex';
    adminWrapper.style.display = 'none';
    token = null;
    localStorage.removeItem('meximco_token');
}

// Check existing token
if (token) {
    fetch(API_BASE + EP.verify, { headers: { Authorization: 'Bearer ' + token } })
        .then(r => { if (r.ok) showAdmin(); else showLogin(); })
        .catch(() => showLogin());
} else {
    showLogin();
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.textContent = '';
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    try {
        const res = await fetch(API_BASE + EP.login, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok) {
            token = data.token;
            localStorage.setItem('meximco_token', token);
            document.getElementById('adminName').textContent = data.email.split('@')[0];
            showAdmin();
        } else {
            loginError.textContent = data.error || 'Login failed';
        }
    } catch (err) {
        loginError.textContent = 'Server error. Please try again.';
    }
});

document.getElementById('logoutBtn').addEventListener('click', showLogin);

// ==================== NAVIGATION ====================
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.content-section');
const pageTitle = document.getElementById('pageTitle');
const sectionNames = { dashboard: 'Dashboard', inbox: 'Inbox', blogs: 'Blog Manager', team: 'Team Manager' };

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const sec = item.dataset.section;
        navItems.forEach(n => n.classList.remove('active'));
        item.classList.add('active');
        sections.forEach(s => s.classList.remove('active'));
        document.getElementById('section-' + sec).classList.add('active');
        pageTitle.textContent = sectionNames[sec] || 'Dashboard';

        if (sec === 'inbox') loadMessages();
        if (sec === 'blogs') loadBlogs();
        if (sec === 'team') loadTeam();

        document.getElementById('sidebar').classList.remove('open');
    });
});

document.getElementById('sidebarToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
});

// ==================== HELPERS ====================
function authHeaders() {
    return { Authorization: 'Bearer ' + token };
}

function formatDate(d) {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ==================== DASHBOARD ====================
async function loadDashboard() {
    try {
        const res = await fetch(API_BASE + EP.stats, { headers: authHeaders() });
        const stats = await res.json();
        document.getElementById('statUnread').textContent = stats.messages?.unread || 0;
        document.getElementById('statBlogs').textContent = stats.blogs || 0;
        document.getElementById('statTeam').textContent = stats.team || 0;
        document.getElementById('inboxBadge').textContent = stats.messages?.unread || 0;
    } catch (e) { console.error('Stats error:', e); }

    // Recent messages
    try {
        const res = await fetch(API_BASE + EP.messages, { headers: authHeaders() });
        const msgs = await res.json();
        const container = document.getElementById('dashboardMessages');
        if (msgs.length === 0) {
            container.innerHTML = '<p class="empty-state">No messages yet.</p>';
        } else {
            container.innerHTML = `<table class="data-table"><thead><tr><th>Name</th><th>Email</th><th>Interest</th><th>Date</th></tr></thead><tbody>${
                msgs.slice(0, 5).map(m => `<tr><td>${m.name}</td><td>${m.email}</td><td>${m.interest || '-'}</td><td>${formatDate(m.created_at)}</td></tr>`).join('')
            }</tbody></table>`;
        }
    } catch (e) { console.error(e); }

    // Recent blogs
    try {
        const res = await fetch(API_BASE + EP.blogs, { headers: authHeaders() });
        const blogs = await res.json();
        const container = document.getElementById('dashboardBlogs');
        if (blogs.length === 0) {
            container.innerHTML = '<p class="empty-state">No blogs yet. Create your first post!</p>';
        } else {
            container.innerHTML = blogs.slice(0, 3).map(b =>
                `<div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.04)">
                    <div style="width:40px;height:40px;border-radius:8px;background:var(--surface-high);overflow:hidden;flex-shrink:0">
                        ${b.image_url ? `<img src="${b.image_url}" style="width:100%;height:100%;object-fit:cover">` : ''}
                    </div>
                    <div><strong style="font-size:13px">${b.title}</strong><br><span style="font-size:11px;color:var(--gray)">${b.category} · ${formatDate(b.created_at)}</span></div>
                </div>`
            ).join('');
        }
    } catch (e) { console.error(e); }
}

// ==================== MESSAGES / INBOX ====================
let allMessages = [];

async function loadMessages() {
    try {
        const res = await fetch(API_BASE + EP.messages, { headers: authHeaders() });
        allMessages = await res.json();
        renderMessages();
    } catch (e) { console.error(e); }
}

function renderMessages() {
    const tbody = document.getElementById('messagesBody');
    const empty = document.getElementById('messagesEmpty');
    if (allMessages.length === 0) {
        tbody.innerHTML = '';
        empty.style.display = 'block';
        return;
    }
    empty.style.display = 'none';
    tbody.innerHTML = allMessages.map(m => `
        <tr onclick="openMessage(${m.id})">
            <td><span class="status-dot ${m.status}"></span>${m.status}</td>
            <td><strong>${m.name}</strong></td>
            <td>${m.company || '-'}</td>
            <td>${m.email}</td>
            <td>${m.interest || '-'}</td>
            <td>${formatDate(m.created_at)}</td>
            <td>
                ${m.status === 'unread' ? `<button class="btn-sm mark-read" onclick="event.stopPropagation();markRead(${m.id})">Mark Read</button>` : ''}
                <button class="btn-sm delete" onclick="event.stopPropagation();deleteMessage(${m.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

window.openMessage = function(id) {
    const m = allMessages.find(x => x.id === id);
    if (!m) return;
    document.getElementById('modalName').textContent = m.name;
    document.getElementById('modalCompany').textContent = m.company || 'No company';
    document.getElementById('modalEmail').textContent = m.email;
    document.getElementById('modalInterest').textContent = m.interest || 'General';
    document.getElementById('modalDate').textContent = formatDate(m.created_at);
    document.getElementById('modalMessage').textContent = m.message || 'No message content.';
    document.getElementById('modalReplyBtn').href = `mailto:${m.email}?subject=RE: MEXIMCO Inquiry`;
    document.getElementById('modalDeleteBtn').onclick = () => { deleteMessage(m.id); document.getElementById('messageModal').style.display = 'none'; };
    document.getElementById('messageModal').style.display = 'flex';
    if (m.status === 'unread') markRead(m.id);
};

document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('messageModal').style.display = 'none';
});

window.markRead = async function(id) {
    await fetch(API_BASE + EP.messages + `?id=${id}`, {
        method: 'PATCH',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'read' })
    });
    loadMessages(); loadDashboard();
};

window.deleteMessage = async function(id) {
    if (!confirm('Delete this message?')) return;
    await fetch(API_BASE + EP.messages + `?id=${id}`, { method: 'DELETE', headers: authHeaders() });
    loadMessages(); loadDashboard();
};

// ==================== BLOGS ====================
let allBlogs = [];

document.getElementById('newBlogBtn').addEventListener('click', () => {
    document.getElementById('blogFormCard').style.display = 'block';
    document.getElementById('blogFormTitle').textContent = 'Create New Blog Post';
    document.getElementById('blogForm').reset();
    document.getElementById('blogId').value = '';
    document.getElementById('blogImagePreview').style.display = 'none';
});
document.getElementById('cancelBlogBtn').addEventListener('click', () => {
    document.getElementById('blogFormCard').style.display = 'none';
});

document.getElementById('blogImageInput').addEventListener('change', function() {
    if (this.files[0]) {
        const reader = new FileReader();
        reader.onload = e => {
            const preview = document.getElementById('blogImagePreview');
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(this.files[0]);
    }
});

document.getElementById('blogForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('blogId').value;
    const formData = new FormData();
    formData.append('title', document.getElementById('blogTitleInput').value);
    formData.append('category', document.getElementById('blogCategory').value);
    formData.append('author', document.getElementById('blogAuthor').value);
    formData.append('excerpt', document.getElementById('blogExcerpt').value);
    formData.append('content', document.getElementById('blogContent').value);
    const imageFile = document.getElementById('blogImageInput').files[0];
    if (imageFile) formData.append('image', imageFile);

    const url = id ? API_BASE + EP.blogs + `?id=${id}&_method=PUT` : API_BASE + EP.blogs;

    try {
        const res = await fetch(url, { method: 'POST', headers: authHeaders(), body: formData });
        if (res.ok) {
            document.getElementById('blogFormCard').style.display = 'none';
            loadBlogs(); loadDashboard();
        }
    } catch (e) { console.error(e); }
});

async function loadBlogs() {
    try {
        const res = await fetch(API_BASE + EP.blogs, { headers: authHeaders() });
        allBlogs = await res.json();
        renderBlogs();
    } catch (e) { console.error(e); }
}

function renderBlogs() {
    const grid = document.getElementById('blogsGrid');
    if (allBlogs.length === 0) {
        grid.innerHTML = '<p class="empty-state">No blog posts yet. Click "+ New Blog Post" to create one!</p>';
        return;
    }
    grid.innerHTML = allBlogs.map(b => `
        <div class="blog-admin-card">
            <div class="card-image">
                ${b.image_url ? `<img src="${b.image_url}" alt="${b.title}">` : '<div style="height:100%;display:flex;align-items:center;justify-content:center;color:var(--gray-dark)">No Image</div>'}
            </div>
            <div class="card-body">
                <span class="cat">${b.category}</span>
                <h4>${b.title}</h4>
                <p>${b.excerpt || ''}</p>
                <div class="card-actions">
                    <button class="btn-sm edit" onclick="editBlog(${b.id})">Edit</button>
                    <button class="btn-sm delete" onclick="deleteBlog(${b.id})">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

window.editBlog = function(id) {
    const b = allBlogs.find(x => x.id === id);
    if (!b) return;
    document.getElementById('blogFormCard').style.display = 'block';
    document.getElementById('blogFormTitle').textContent = 'Edit Blog Post';
    document.getElementById('blogId').value = b.id;
    document.getElementById('blogTitleInput').value = b.title;
    document.getElementById('blogCategory').value = b.category;
    document.getElementById('blogAuthor').value = b.author;
    document.getElementById('blogExcerpt').value = b.excerpt || '';
    document.getElementById('blogContent').value = b.content || '';
    if (b.image_url) {
        const preview = document.getElementById('blogImagePreview');
        preview.src = b.image_url;
        preview.style.display = 'block';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteBlog = async function(id) {
    if (!confirm('Delete this blog post?')) return;
    await fetch(API_BASE + EP.blogs + `?id=${id}`, { method: 'DELETE', headers: authHeaders() });
    loadBlogs(); loadDashboard();
};

// ==================== TEAM ====================
let allTeam = [];

document.getElementById('newTeamBtn').addEventListener('click', () => {
    document.getElementById('teamFormCard').style.display = 'block';
    document.getElementById('teamFormTitle').textContent = 'Add Team Member';
    document.getElementById('teamForm').reset();
    document.getElementById('teamMemberId').value = '';
    document.getElementById('teamPhotoPreview').style.display = 'none';
    document.getElementById('teamCvName').style.display = 'none';
});
document.getElementById('cancelTeamBtn').addEventListener('click', () => {
    document.getElementById('teamFormCard').style.display = 'none';
});

document.getElementById('teamPhotoInput').addEventListener('change', function() {
    if (this.files[0]) {
        const reader = new FileReader();
        reader.onload = e => {
            const preview = document.getElementById('teamPhotoPreview');
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(this.files[0]);
    }
});

document.getElementById('teamCvInput').addEventListener('change', function() {
    if (this.files[0]) {
        const nameEl = document.getElementById('teamCvName');
        nameEl.textContent = '📄 ' + this.files[0].name;
        nameEl.style.display = 'block';
    }
});

document.getElementById('teamForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('teamMemberId').value;
    const formData = new FormData();
    formData.append('name', document.getElementById('teamName').value);
    formData.append('role', document.getElementById('teamRole').value);
    formData.append('bio', document.getElementById('teamBio').value);
    formData.append('order_index', document.getElementById('teamOrder').value);
    const photoFile = document.getElementById('teamPhotoInput').files[0];
    const cvFile = document.getElementById('teamCvInput').files[0];
    if (photoFile) formData.append('photo', photoFile);
    if (cvFile) formData.append('cv', cvFile);

    const url = id ? API_BASE + EP.team + `?id=${id}&_method=PUT` : API_BASE + EP.team;

    try {
        const res = await fetch(url, { method: 'POST', headers: authHeaders(), body: formData });
        if (res.ok) {
            document.getElementById('teamFormCard').style.display = 'none';
            loadTeam(); loadDashboard();
        }
    } catch (e) { console.error(e); }
});

async function loadTeam() {
    try {
        const res = await fetch(API_BASE + EP.team, { headers: authHeaders() });
        allTeam = await res.json();
        renderTeam();
    } catch (e) { console.error(e); }
}

function renderTeam() {
    const grid = document.getElementById('teamGrid');
    if (allTeam.length === 0) {
        grid.innerHTML = '<p class="empty-state">No team members yet. Click "+ Add Member" to get started!</p>';
        return;
    }
    grid.innerHTML = allTeam.map(m => `
        <div class="team-admin-card">
            ${m.photo_url ?
                `<img src="${m.photo_url}" alt="${m.name}" class="member-photo">` :
                `<div class="member-photo-placeholder">${m.name.charAt(0)}</div>`
            }
            <h4>${m.name}</h4>
            <p class="member-role">${m.role}</p>
            <p class="member-bio">${m.bio || ''}</p>
            ${m.cv_url ? `<a href="${m.cv_url}" target="_blank" class="cv-link">📄 View CV</a>` : ''}
            <div class="card-actions">
                <button class="btn-sm edit" onclick="editTeam(${m.id})">Edit</button>
                <button class="btn-sm delete" onclick="deleteTeam(${m.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

window.editTeam = function(id) {
    const m = allTeam.find(x => x.id === id);
    if (!m) return;
    document.getElementById('teamFormCard').style.display = 'block';
    document.getElementById('teamFormTitle').textContent = 'Edit Team Member';
    document.getElementById('teamMemberId').value = m.id;
    document.getElementById('teamName').value = m.name;
    document.getElementById('teamRole').value = m.role;
    document.getElementById('teamBio').value = m.bio || '';
    document.getElementById('teamOrder').value = m.order_index || 0;
    if (m.photo_url) {
        const preview = document.getElementById('teamPhotoPreview');
        preview.src = m.photo_url;
        preview.style.display = 'block';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteTeam = async function(id) {
    if (!confirm('Remove this team member?')) return;
    await fetch(API_BASE + EP.team + `?id=${id}`, { method: 'DELETE', headers: authHeaders() });
    loadTeam(); loadDashboard();
};
