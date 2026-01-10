const API_BASE_URL = 'http://127.0.0.1:8000/api';

let accessToken = localStorage.getItem('accessToken');
let refreshToken = localStorage.getItem('refreshToken');


//controlling page sections start
function checkAuthStatus() {
    if (accessToken) {
        showAuthenticatedView();
        loadProfile();
//        loadNotes();
    } else {
        showUnauthenticatedView();
    }
}

function showAuthenticatedView() {
    $('#auth-section').addClass('hidden');
    $('#profile-section').removeClass('hidden');
    $('#notes-section').removeClass('hidden');
    $('#user-info').removeClass('hidden');
}

function showUnauthenticatedView()
{
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

//    register
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

