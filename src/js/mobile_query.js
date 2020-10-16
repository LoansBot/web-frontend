(function() {
    let queryParams = new URLSearchParams(window.location.search);
    let checkId = queryParams.get('checkid');
    if (checkId !== null && checkId !== undefined && !isNaN(parseInt(checkId))) {
        let handled = false;
        api_fetch(
            `/api/users/${checkId}`
        ).then((resp) => {
            if (!resp.ok) {
                window.location.href = '/loans.html';
                handled = true;
                return;
            }
            return resp.json();
        }).then((json) => {
            if (handled) { return; }
            handled = true;
            window.location.href = `/loans.html?username=${json.username}`;
        }).catch(() => {
            if (handled) { return; }
            handled = true;
            window.location.href = '/loans.html';
        });
        return;
    }

    let checkName = queryParams.get('checkname');
    if (checkName !== null && checkName !== undefined) {
        window.location.href = `/loans.html?username=${checkName}`;
        return;
    }
    window.location.href = '/loans.html';
})();
