const API_BASE_URL = 'http://127.0.0.1:8000/api';

let accessToken = localStorage.getItem('accessToken');
let refreshToken = localStorage.getItem('refreshToken');


//controlling page sections start
function checkAuthStatus() {
    if (accessToken) {
        showAuthenticatedView();
        showProfile(); // default page
        loadProfile();
        loadTasks();
    } else {
        showUnauthenticatedView();
    }
}

function showAuthenticatedView() {
    $('#auth-section').addClass('hidden');
    $('#user-info').removeClass('hidden');
}

function showUnauthenticatedView() {
    $('#auth-section').removeClass('hidden');
    $('#profile-section').addClass('hidden');
    $('#notes-section').addClass('hidden');
    $('#user-info').addClass('hidden');
}


//controlling page sections end

function handleUnauthorized() {
    if (refreshToken) {
        // Try to refresh token
        $.ajax({
            url: `${API_BASE_URL}/auth/token/refresh/`,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                refresh: refreshToken
            }),
            success: function(response) {
                accessToken = response.access;
                localStorage.setItem('accessToken', accessToken);
                // Retry the original request
                location.reload();
            },
            error: function() {
                logout();
                showMessage('auth-message', 'Session expired. Please login again.', 'error');
            }
        });
    } else {
        logout();
        showMessage('auth-message', 'Session expired. Please login again.', 'error');
    }
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text ? text.replace(/[&<>"']/g, m => map[m]) : '';
}

$(document).ready(function() {
    checkAuthStatus();

    $('#registerForm').on('submit', function(e) {
        e.preventDefault();
        register();
    });

    $('#loginForm').on('submit', function(e) {
        e.preventDefault();
        login();
    });

     $('#profileForm').on('submit', function(e) {
        e.preventDefault();
        updateProfile();
    });

     $('#passwordForm').on('submit', function(e) {
        e.preventDefault();
        resetPassword();
    });

     $('#noteForm').on('submit', function(e) {
        e.preventDefault();
        saveTasks();
    });


});

//Register start
function showRegister() {
    $('#login-form').addClass('hidden');
    $('#register-form').removeClass('hidden');
}

function register() {
    const username = $('#reg-username').val();
    const email = $('#reg-email').val();
    const password = $('#reg-password').val();
    const password2 = $('#reg-password2').val();

    if (password !== password2) {
        showMessage('auth-message', 'Passwords do not match', 'error');
        return;
    }

    $.ajax({
        url: `${API_BASE_URL}/auth/register/`,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            username: username,
            email: email,
            password: password,
            password2: password2
        }),
        success: function(response) {
            localStorage.setItem('accessToken', response.tokens.access);
            localStorage.setItem('refreshToken', response.tokens.refresh);
            accessToken = response.tokens.access;
            refreshToken = response.tokens.refresh;
            showMessage('auth-message', 'Registration successful!', 'success');
            setTimeout(() => {
                checkAuthStatus();
            }, 1000);
        },
        error: function(xhr) {
            const error = xhr.responseJSON ?
                (xhr.responseJSON.error || JSON.stringify(xhr.responseJSON)) :
                'Registration failed';
            showMessage('auth-message', error, 'error');
        }
    });
}

//register end

function showMessage(containerId, message, type) {
    const container = $(`#${containerId}`);
    const messageClass = type === 'success' ? 'message-success' : 'message-error';
    container.html(`<div class="message ${messageClass}">${escapeHtml(message)}</div>`);
    setTimeout(() => {
        container.empty();
    }, 5000);
}

//login start
function showLogin() {
    $('#register-form').addClass('hidden');
    $('#login-form').removeClass('hidden');
}

function login() {
    const username = $('#login-username').val();
    const password = $('#login-password').val();

    $.ajax({
        url: `${API_BASE_URL}/auth/login/`,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            username: username,
            password: password
        }),
        success: function(response) {
            localStorage.setItem('accessToken', response.access);
            localStorage.setItem('refreshToken', response.refresh);
            accessToken = response.access;
            refreshToken = response.refresh;
            showMessage('auth-message', 'Login successful!', 'success');
            $('#username-display').text(username);
            setTimeout(() => {
                checkAuthStatus();
            }, 1000);
        },
        error: function(xhr) {
            const error = xhr.responseJSON ?
                (xhr.responseJSON.detail || JSON.stringify(xhr.responseJSON)) :
                'Login failed';
            showMessage('auth-message', error, 'error');
        }
    });
}

//login end

//profile update start
function loadProfile() {
    $.ajax({
        url: `${API_BASE_URL}/auth/profile/`,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        },
        success: function(response) {
            $('#profile-username').val(response.username);
            $('#profile-email').val(response.email);
            $('#profile-fullname').val(response.full_name || '');
            $('#profile-dob').val(response.date_of_birth || '');
            $('#profile-gender').val(response.gender || '');
            $('#profile-mobile').val(response.mobile_number || '');
            $('#profile-address').val(response.address || '');
            $('#username-display').text(response.username);
        },
        error: function(xhr) {
            if (xhr.status === 401) {
                handleUnauthorized();
            } else {
                showMessage('profile-message', 'Failed to load profile', 'error');
            }
        }
    });
}

function editProfile() {
    $('#profile-view').addClass('hidden');
    $('#profile-edit').removeClass('hidden');

    $('#edit-fullname').val($('#profile-fullname').val());
    $('#edit-dob').val($('#profile-dob').val());
    $('#edit-gender').val($('#profile-gender').val());
    $('#edit-mobile').val($('#profile-mobile').val());
    $('#edit-address').val($('#profile-address').val());
}

function updateProfile() {
    const data = {
        full_name: $('#edit-fullname').val(),
        date_of_birth: $('#edit-dob').val(),
        gender: $('#edit-gender').val(),
        mobile_number: $('#edit-mobile').val(),
        address: $('#edit-address').val()
    };

    $.ajax({
        url: `${API_BASE_URL}/auth/profile/update/`,
        method: 'PUT',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        },
        data: JSON.stringify(data),
        success: function(response) {
            showMessage('profile-message', 'Profile updated successfully!', 'success');
            cancelEdit();
            loadProfile();
        },
        error: function(xhr) {
            if (xhr.status === 401) {
                handleUnauthorized();
            } else {
                const error = xhr.responseJSON ?
                    JSON.stringify(xhr.responseJSON) :
                    'Failed to update profile';
                showMessage('profile-message', error, 'error');
            }
        }
    });
}

function cancelEdit() {
    $('#profile-edit').addClass('hidden');
    $('#profile-view').removeClass('hidden');
}

function resetPassword() {
    const oldPassword = $('#old-password').val();
    const newPassword = $('#new-password').val();
    const newPassword2 = $('#new-password2').val();

    if (newPassword !== newPassword2) {
        showMessage('profile-message', 'New passwords do not match', 'error');
        return;
    }

    $.ajax({
        url: `${API_BASE_URL}/auth/reset-password/`,
        method: 'POST',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        },
        data: JSON.stringify({
            old_password: oldPassword,
            new_password: newPassword,
            new_password2: newPassword2
        }),
        success: function(response) {
            showMessage('profile-message', 'Password reset successfully!', 'success');
            $('#passwordForm')[0].reset();
        },
        error: function(xhr) {
            if (xhr.status === 401) {
                handleUnauthorized();
            } else {
                const error = xhr.responseJSON ?
                    (xhr.responseJSON.error || JSON.stringify(xhr.responseJSON)) :
                    'Failed to reset password';
                showMessage('profile-message', error, 'error');
            }
        }
    });
}

function logout() {
    if (refreshToken) {
        $.ajax({
            url: `${API_BASE_URL}/auth/logout/`,
            method: 'POST',
            contentType: 'application/json',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            data: JSON.stringify({
                refresh_token: refreshToken
            }),
            complete: function() {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                accessToken = null;
                refreshToken = null;
                showUnauthenticatedView();
                showMessage('auth-message', 'Logged out successfully', 'success');
            }
        });
    } else {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        accessToken = null;
        refreshToken = null;
        showUnauthenticatedView();
    }
}

//profile update end

//Tasks sectiion starts
function showNoteForm() {
    $('#note-form').removeClass('hidden');
    $('#note-form-title').text('Create Task');
    $('#noteForm')[0].reset();
    $('#note-id').val('');
}


function saveTasks() {
    const noteId = $('#note-id').val();
    const attachment = $('#note-attachment')[0].files[0];
    const hasFile = attachment !== undefined;

    // Use FormData if there's a file, otherwise use JSON
    let data, contentType, processData;

    if (hasFile || !noteId) {
        // Use FormData for file uploads or new notes
        data = new FormData();
        data.append('title', $('#note-title').val());
        data.append('description', $('#note-description').val());
        if (attachment) {
            data.append('attachment', attachment);
        }
        contentType = false;
        processData = false;
    } else {
        // Use JSON for updates without files
        data = JSON.stringify({
            title: $('#note-title').val(),
            description: $('#note-description').val()
        });
        contentType = 'application/json';
        processData = true;
    }

    const url = noteId ?
        `${API_BASE_URL}/tasks/${noteId}/` :
        `${API_BASE_URL}/tasks/`;
    const method = noteId ? 'PATCH' : 'POST';

    const ajaxOptions = {
        url: url,
        method: method,
        headers: {
            'Authorization': `Bearer ${accessToken}`
        },
        data: data,
        success: function(response) {
            showMessage('notes-message', 'Note saved successfully!', 'success');
            cancelNoteForm();
            loadTasks();
        },
        error: function(xhr) {
            if (xhr.status === 401) {
                handleUnauthorized();
            } else {
                const error = xhr.responseJSON ?
                    JSON.stringify(xhr.responseJSON) :
                    'Failed to save note';
                showMessage('notes-message', error, 'error');
            }
        }
    };

    if (contentType !== undefined) {
        ajaxOptions.contentType = contentType;
    }
    if (processData !== undefined) {
        ajaxOptions.processData = processData;
    }

    $.ajax(ajaxOptions);
}

function loadTasks() {
    $.ajax({
        url: `${API_BASE_URL}/tasks/`,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        },
        success: function(response) {
            displayTasks(response.results || response);
        },
        error: function(xhr) {
            if (xhr.status === 401) {
                handleUnauthorized();
            } else {
                showMessage('notes-message', 'Failed to load notes', 'error');
            }
        }
    });
}

function displayTasks(notes) {
    const grid = $('#notes-grid');
    grid.empty();

    if (notes.length === 0) {
        grid.html('<p>No notes found. Create your first note!</p>');
        return;
    }

    notes.forEach(function(note) {
        const card = $(`
            <div class="note-card">
                <h3>${escapeHtml(note.title)}</h3>
                <p>${escapeHtml(note.description || 'No description')}</p>
                <div class="note-meta">
                    Created: ${new Date(note.created_at).toLocaleString()}<br>
                    Modified: ${new Date(note.modified_at).toLocaleString()}
                </div>
                ${note.attachment_url ? `<p><a href="${note.attachment_url}" target="_blank">View Attachment</a></p>` : ''}
                <div class="note-actions">
                    <button class="btn btn-primary" onclick="edittasks(${note.id})">Edit</button>
                    <button class="btn btn-danger" onclick="deletetasks(${note.id})">Delete</button>
                </div>
            </div>
        `);
        grid.append(card);
    });
}

function cancelNoteForm() {
    $('#note-form').addClass('hidden');
    $('#noteForm')[0].reset();
    $('#note-id').val('');
}

function edittasks(noteId) {
    $.ajax({
        url: `${API_BASE_URL}/tasks/${noteId}/`,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        },
        success: function(response) {
            $('#note-id').val(response.id);
            $('#note-title').val(response.title);
            $('#note-description').val(response.description || '');
            $('#note-form-title').text('Edit Tasks');
            $('#note-form').removeClass('hidden');
        },
        error: function(xhr) {
            if (xhr.status === 401) {
                handleUnauthorized();
            } else {
                showMessage('notes-message', 'Failed to load note', 'error');
            }
        }
    });
}

function deletetasks(noteId) {
    if (!confirm('Are you sure you want to delete this note?')) {
        return;
    }

    $.ajax({
        url: `${API_BASE_URL}/tasks/${noteId}/`,
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        },
        success: function() {
            showMessage('notes-message', 'Note deleted successfully!', 'success');
            loadTasks();
        },
        error: function(xhr) {
            if (xhr.status === 401) {
                handleUnauthorized();
            } else {
                showMessage('notes-message', 'Failed to delete note', 'error');
            }
        }
    });
}


//page fix
function hideAllSections() {
    $('#profile-section').addClass('hidden');
    $('#notes-section').addClass('hidden');
    $('#reset-password-section').addClass('hidden');
}

function showProfile() {
    hideAllSections();
    $('#profile-section').removeClass('hidden');
    $('#profile-main').removeClass('hidden');
    $('#reset-password-section').addClass('hidden');
}

function showResetPassword() {
    hideAllSections();
    $('#profile-section').addClass('hidden');
    $('#profile-main').addClass('hidden');
    $('#reset-password-section').removeClass('hidden');
}

function showTasks() {
    hideAllSections();
    $('#notes-section').removeClass('hidden');
}
