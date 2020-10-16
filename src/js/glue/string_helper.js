const [lpad] = (() => {
    /**
     * Creates a new string formed by padding the given string with the
     * given padding character on the left until it reaches the desired
     * length.
     *
     * @param {string} stringToPad The string which should be padded
     * @param {number} desiredLength The desired length after padding
     * @param {string} paddingCharacter The character to pad with
     */
    function lpad(stringToPad, desiredLength, paddingCharacter) {
        if (typeof(stringToPad) !== 'string') {
            if (stringToPad === null || stringToPad === undefined) {
                stringToPad = '';
            } else {
                stringToPad = stringToPad.toString();
            }
        }

        let numberOfPads = desiredLength - stringToPad.length;
        let result = '';
        for (let i = 0; i < numberOfPads; i++) {
            result += paddingCharacter;
        }

        result += stringToPad;
        return result;
    }

    return [lpad];
})();
