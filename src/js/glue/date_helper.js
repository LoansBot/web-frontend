const [formatDateISO8601, getCurrentDate] = (() => {
    /**
     * Formats the given date as an iso-8601 date string, rather than as a
     * iso-8601 date time string. Requires string_helper.js
     *
     * @param {Date} date The date to format as a date-only string
     */
    function formatDateISO8601(date) {
        return (
            lpad(date.getFullYear(), 4, '0')
            + '-' + lpad(date.getMonth() + 1, 2, '0')
            + '-' + lpad(date.getDate(), 2, '0')
        );
    }

    /**
     * Get the current date in the local time.
     *
     * @return {Date} The current date at the beginning of today in local time
     */
    function getCurrentDate() {
        let now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    return [formatDateISO8601, getCurrentDate];
})();
