const [UserAjax, UserSelectFormWithAjaxAndView] = (function() {
    /**
     * Shows a description of a particular permission alongside some controls
     * for that permission.
     *
     * @param {string} name The name for this permission.
     * @param {string} description The description for this permission.
     * @param {string} applyStyle A string which acts as an enum to determine
     *   if the user can apply/revoke this permission. Takes one of the
     *   following values:
     *   - grant: Show a button to grant this permission
     *   - revoke: Show a button to revoke this permission
     *   - neither: Do not show a button to grant/revoke this permission.
     * @param {function} onApply A function which we call when the apply button
     *   is pressed.
     */
    class Permission extends React.Component {

    };

    /**
     * Loads a permission from its name using an Ajax call to get the other
     * properties and then renders it.
     *
     * @param {string} name The name for this permission
     * @param {string} applyStyle See Permission.
     * @param {function} onApply See Permission.
     */
    class PermissionAjax extends React.Component {

    };

    /**
     * Allows the user to select from one of many permissions.
     *
     * @param {list} permissions The list of permissions to show, where each
     *   item is the name of a permission.
     * @param {string} initialPermission The initial permission to have
     *   selected; no effect when updating the component.
     * @param {function} permissionSet A function we call with a function which
     *   accepts a name of a permission and sets that value within this form.
     * @param {function} permissionQuery A function we call with a function
     *   that returns the name of the currently selected permission.
     * @param {function} permissionChanged A function we call whenever the
     *   selected permission changes with the newly selected permission.
     */
    class PermissionSelectForm extends React.Component {

    };

    /**
     * Allows the user to select any of the permissions which are either
     * currently granted to the given authentication method or could be granted
     * by the logged in user. This wraps the function queries from the
     * underlying select form to distinguish granted vs available.
     *
     * @param {number} authenticationMethodId The primary key of the
     *   authentication method to fetch permissions for.
     * @param {function} permissionSet A function we call with a function
     *   which accepts a name of a permission and sets the value within this
     *   form.
     * @param {function} permissionQuery A function we call with a function
     *   which returns an array with two values; the first of which is the
     *   name of the selected permission and the second of which is true if
     *   the permission is already granted and false if the permission is
     *   available but not granted.
     * @param {function} permissionChanged A function we call whenever the
     *   selected permission changes with an array with two values; the first
     *   of which is the name of the selected permission and the second is
     *   true if the permission is already granted and false if the
     *   permission is available but not granted.
     */
    class PermissionSelectFormWithAjax extends React.Component {

    };

    /**
     * Allows the user to select of the permissions on a particular
     * authentication method for the purpose of viewing them. This will handle
     * granting or revoking the permission.
     *
     * @param {number} authenticationMethodId The primary key for the
     *   authentication method whose permissions should be managed.
     */
    class PermissionSelectFormWithAjaxAndView extends React.Component {

    };

    /**
     * Shows some information about a particular authentication method. There
     * are two types of authentication methods - the main human method (which
     * require a captcha) and the secondary grants (which don't require a
     * method). The human password cannot be reset except via the reset your
     * password flow which verifies you still have access to the underlying
     * reddit account, whereas secondary grants can be reset at any time.
     *
     * @param {number} id The primary key for this authentication method.
     * @param {boolean} main True if this is the main grant, false if this is
     *   a secondary grant. For main grants password reset fields will not be
     *   shown.
     * @param {boolean} deleted True if this authentication method has been
     *   deleted, false otherwise.
     * @param {number} activeGrants The number of live tokens with this
     *   authentication method.
     * @param {list} history The history of this authentication method. Each
     *   item in this list should be a dictionary with the following keys:
     *   - {string} eventType: The type of event this is. Acts as an enum and
     *     takes one of following values:
     *     + created: This authentication method was created. No extra keys.
     *     + deleted: This authentication method was soft-deleted. No extra
     *       keys.
     *     + permissionGranted: A permission was granted to this authentication
     *       method. Has the following extra keys:
     *       * {string} permission: The name of the permission that was
     *         granted.
     *     + permissionRevoked: A permission was revoked from this
     *       authentication method. Has the following extra keys:
     *       * {string} permission: The name of the permission revoked
     *     + passwordChanged: The password was changed. No extra keys.
     *   - {string} reason The reason provided for the change.
     *   - {string} username If the user who made this change was given to us,
     *     this is that users username. To avoid unnecessary drama, this value,
     *     if different from the logged in user, is usually hidden from non-
     *     admins.
     *   - {Date} occurredAt When this event occurred at.
     * @param {string} password If we just randomly generated a password this
     *   should be set to the password for this authentication method,
     *   otherwise this should be null. This is only known when we, the client,
     *   just reset the password on this authentication method. The server will
     *   still salt and hash passwords for secondary grants, although with
     *   fewer iterations than main grants.
     * @param {function} reasonQuery The user is given a reason text field to
     *   fill in before using any of the change functions. This function is
     *   called with a function which returns the currently filled reason.
     * @param {function} reasonSet Called with a function which accepts a
     *   string and sets the reason text field value to the specified reason.
     *   Usually used for clearing the reason after an operation.
     * @param {function} onPasswordReset A function we call when the user
     *   clicks to reset their password. This should randomly generate a new
     *   password, save it remotely, and update this component with the
     *   generated password. It should not be possible to determine this
     *   password once the page is refreshed.
     * @param {function} onDelete A function we call when the user clicks to
     *   delete this authentication method. Only called if deleted is false.
     * @param {function} onRevokeAll A function we call when the user clicks to
     *   revoke all permissions on this authentication method. Only called if
     *   deleted is false.
     * @param {function} onLogoutAll A function we call when the user clicks to
     *   immediately revoke all active tokens for this authentication method.
     *   Only called if deleted is false.
     */
    class AuthenticationMethod extends React.Component {
        // probably want to initially hide history + show w/ toggle?
    };

    /**
     * Shows information on a certain authentication method and handles all the
     * AJAX calls for operations available on authentication methods.
     *
     * @param {number} authenticationMethodId The primary key of the
     *   authetnication method to show and manage.
     */
    class AuthenticationMethodAjax extends React.Component {

    };

    /**
     * Shows a form for selecting one of a number of authentication methods.
     *
     * @param {list} authenticationMethodIds The list of authentication methods
     *   to choose from. Each value should just be a number.
     * @param {number} initialAuthenticationMethodId The initially selected
     *   authorization method. Has no effect when updating the component.
     * @param {function} authMethodQuery A function we call with a function
     *   which returns the id of the currently selected authentication method.
     * @param {function} authMethodSet A function we call with a function which
     *   sets the the currently seelcted authentication method to the specified
     *   numeric id.
     * @param {function} authMethodChanged A function we call with the newly
     *   selected authenticaton method id when it changes.
     */
    class AuthenticationMethodSelectForm extends React.Component {

    };

    /**
     * Uses ajax to fetch all the authentication methods on a given user, then
     * allows the user to select amongst them.
     *
     * @param {number} userId The primary key of the user whose authentication
     *   methods should be listed.
     * @param {function} authMethodQuery Same as AuthenticationMethodSelectForm
     * @param {function} authMethodSet Same as AuthenticationMethodSelectForm
     * @param {function} authMethodChanged Same as AuthenticationMethodSelectForm
     */
    class AuthenticationMethodSelectFormWithAjax extends React.Component {

    };

    /**
     * Uses ajax to handle fetching all authentication methods on a user, and
     * then when they select one allows them to manipulate the authentication
     * method at a high level or at the specific permission level.
     *
     * @param {number} userId The primary key of the user whose authentication
     *   methods and their corresponding permissions should be managed.
     */
    class AuthenticationMethodSelectFormWithAjaxAndView extends React.Component {

    };

    /**
     * Shows a users currently selected settings with callbacks for actually
     * changing them. Although it's assumed that they have permission to view
     * all of the settings, it's not assumed that all the settings can be
     * modified. For example, only admins can edit ratelimits in general.
     *
     * @param {boolean} disabled True if all inputs are disabled because we
     *   are still processing a change, false otherwise.
     * @param {number} id The id of the user these settings are for.
     * @param {string} username The username of the user these settings are
     *   for.
     * @param {list} history The history of this users settings. We trade off
     *   some comprehensiveness in order to not make this too painful. Each
     *   item is a dict with the following keys:
     *   - {string} name: The name of the setting that was changed.
     *   - {any} oldValue: The old value of the setting
     *   - {any} newValue: The new value for the setting
     *   - {string} username: The username of the user who made the change, if
     *     available. We typically don't share admin usernames for specific
     *     changes to non-admins to avoid unnecessary drama.
     *   - {Date} occurredAt When this change occurred.
     * @param {boolean} moreHistory True if more history is available, false if
     *   we've already loaded all the history.
     * @param {function} onHistoryShowMore Invoked if and only if moreHistory
     *   is true; show load more history.
     * @param {boolean} canModifyNonReqResponseOptOut True if the user is
     *   allowed to modify the non-req-response-opt-out setting.
     * @param {boolean} nonReqResponseOptOut True if the user has opted out of
     *   the automatic response to non-request threads, false if they have not.
     * @param {function} nonReqResponseOptOutChanged A function which we call
     *   when the user changes the value of the non-req-response-opt-out
     *   checkbox with the new value.
     * @param {boolean} canModifyBorrowerReqPMOptOut True if the user is
     *   allowed to modify the borrower-req-pm-opt-out setting.
     * @param {boolean} borrowerReqPMOptOut True if the user has opted out of
     *   receiving a PM when a borrower from one of their active loans makes a
     *   request thread, false if they have not.
     * @param {function} borrowerReqPMOptOutChanged A function which we call
     *   when the user changes the value of the borrower-req-pm-opt-out
     *   checkbox with the new value.
     * @param {boolean} canModifyRatelimit True if the authenticated user is
     *   allowed to change the users ratelimit, false if they are not
     * @param {boolean} globalRatelimitApplies True if the global ratelimit
     *   applies to this user, false if it does not.
     * @param {boolean} userSpecificRatelimit True if this user as a custom
     *   user ratelimit, false if they use the default user ratelimit.
     * @param {number} ratelimitMaxTokens The maximum number of API tokens this
     *   user can accumulate.
     * @param {number} ratelimitRefillAmount The amount of API tokens the user
     *   receives on each refill.
     * @param {number} ratelimitRefillTimeMS The number of milliseconds between
     *   API token refills.
     * @param {boolean} ratelimitStrict True if attempting to consume API
     *   tokens which are not available resets the refill timer, false if it
     *   does not.
     * @param {function} ratelimitChanged A function we call after the user
     *   confirms changes to the ratelimit. We pass 6 parameters - the new
     *   values for globalRatelimitApplies, userSpecificRatelimit,
     *   ratelimitMaxTokens, ratelimitRefillAMount, ratelimitRefillTimeMS,
     *   and ratelimitStrict respectively.
     */
    class UserSettings extends React.Component {
        // Probably want to make showing the history
    };

    /**
     * Handles showing and editing a users settings from just their id, using
     * Ajax calls to fetch information or update settings.
     *
     * @param {number} userId The primary key of the user whose settings should
     *   be shown.
     */
    class UserSettingsWithAjax extends React.Component {

    };

    /**
     * Show everything about a user, fetching required information from Ajax
     * calls. Also allows modification of the user where the authenticated
     * user is allowed to do so.
     *
     * @param {number} userId The primary key of the user to show.
     */
    class UserAjax extends React.Component {
        /* AuthenticationMethodSelectFormWithAjaxAndView */
        /* UserSettingsWithAjax */
    };

    /**
     * Shows a text input to search for a user by their username. This will
     * attempt to autocomplete the username to one of the users we know,
     * and because of that it doesn't make much sense to show without the
     * ajax calls.
     *
     * @param {number} userIdQuery A function which we call with a function
     *   which returns null if no user id is selected, otherwise the id of the
     *   currently selected user.
     * @param {number} userIdChanged A function which we call when a user id
     *   of an existing user is properly selected. We call it with the newly
     *   selected user id.
     */
    class UserSelectFormWithAjax extends React.Component {
        // Create a component with the CSS for
        // https://www.w3schools.com/howto/howto_js_autocomplete.asp
    };

    /**
     * Allows selecting a user in a somewhat convienent fashion, then renders
     * the necessary components to view and manage the users settings. This
     * should only be shown on accounts which the necessary permissions to at
     * least view other users accounts.
     */
    class UserSelectFormWithAjaxAndView extends React.Component {

    };

    return [UserAjax, UserSelectFormWithAjaxAndView];
})();
