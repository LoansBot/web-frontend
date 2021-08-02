let authToken = AuthHelper.getAuthToken();

AuthHelper.clearAuthToken();

if (authToken !== null) {
    api_fetch(
        `/api/users/logout`,
        {
            method: 'POST',
            credentials: 'omit',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                token: authToken
            })
        }
    ).finally(function() {
        window.location.href = "/";
    });
}else {
    window.location.href = "/";
}
