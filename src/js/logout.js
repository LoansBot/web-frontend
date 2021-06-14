let authToken = sessionStorage.getItem('rl-authtoken');

sessionStorage.setItem('rl-authtoken', null);
sessionStorage.setItem('rl-user-id', null);

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
