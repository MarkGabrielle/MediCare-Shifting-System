
const ACCOUNT_KEY = "medicareAccounts";

function getAccounts() {
    try {
        return JSON.parse(localStorage.getItem(ACCOUNT_KEY)) || [];
    } catch (error) {
        return [];
    }
}

function saveAccounts(accounts) {
    localStorage.setItem(ACCOUNT_KEY, JSON.stringify(accounts));
}

function showAccountMessage(elementID, message, color) {
    const element = document.getElementById(elementID);

    if (element) {
        element.textContent = message;
        element.style.color = color;
    }
}

function initializeAccountsPage() {
    const setupSection = document.getElementById("setupSection");
    const accountSection = document.getElementById("accountSection");
    const setupForm = document.getElementById("setupForm");
    const accountForm = document.getElementById("accountForm");

    if (!setupSection || !accountSection) return;

    const accounts = getAccounts();

    // Show initial setup only when no account exists.
    if (accounts.length === 0) {
        setupSection.style.display = "block";
        accountSection.style.display = "none";
    } else {
        setupSection.style.display = "none";

        const role = sessionStorage.getItem("account");

        if (sessionStorage.getItem("loggedIn") !== "true" ||
            !["Admin", "HR"].includes(role)) {
            accountSection.style.display = "none";
            alert("Only Admin or HR can manage accounts.");
            window.location.href = "schedule.html";
            return;
        }

        accountSection.style.display = "block";
        populateAccountStaff();
    }

    displayAccounts();

    if (setupForm) {
        setupForm.addEventListener("submit", function(event) {
            event.preventDefault();

            const username = document.getElementById("setupUsername").value.trim();
            const password = document.getElementById("setupPassword").value;
            const confirmPassword = document.getElementById("setupConfirmPassword").value;

            if (password !== confirmPassword) {
                showAccountMessage(
                    "setupMessage",
                    "Passwords do not match.",
                    "red"
                );
                return;
            }

            if (getAccounts().length > 0) {
                showAccountMessage(
                    "setupMessage",
                    "An account has already been created.",
                    "red"
                );
                return;
            }

            const newAccount = {
                id: Date.now(),
                username: username,
                password: password,
                role: "Admin",
                staffID: "ADMIN",
                staffName: "System Administrator"
            };

            saveAccounts([newAccount]);

            alert("Admin account created successfully. Please log in.");

            window.location.href = "login.html";
        });
    }

    if (accountForm) {
        accountForm.addEventListener("submit", function(event) {
            event.preventDefault();

            const staffID = document.getElementById("accountStaff").value;
            const username = document.getElementById("newUsername").value.trim();
            const password = document.getElementById("newPassword").value;
            const confirmPassword = document.getElementById("confirmPassword").value;

            const staff = staffMembers.find(person => person.id === staffID);

            if (!staff) {
                showAccountMessage(
                    "accountMessage",
                    "Please select a valid staff member.",
                    "red"
                );
                return;
            }

            if (password !== confirmPassword) {
                showAccountMessage(
                    "accountMessage",
                    "Passwords do not match.",
                    "red"
                );
                return;
            }

            const currentAccounts = getAccounts();

            const usernameExists = currentAccounts.some(account =>
                account.username.toLowerCase() === username.toLowerCase()
            );

            const staffAlreadyHasAccount = currentAccounts.some(account =>
                account.staffID === staffID
            );

            if (usernameExists) {
                showAccountMessage(
                    "accountMessage",
                    "That username is already taken.",
                    "red"
                );
                return;
            }

            if (staffAlreadyHasAccount) {
                showAccountMessage(
                    "accountMessage",
                    "This staff member already has an account.",
                    "red"
                );
                return;
            }

            const newAccount = {
                id: Date.now(),
                username: username,
                password: password,
                role: staff.position,
                staffID: staff.id,
                staffName: staff.name
            };

            currentAccounts.push(newAccount);
            saveAccounts(currentAccounts);

            accountForm.reset();

            showAccountMessage(
                "accountMessage",
                "Account created successfully!",
                "green"
            );

            displayAccounts();
        });
    }
}

function populateAccountStaff() {
    const select = document.getElementById("accountStaff");

    if (!select) return;

    const accounts = getAccounts();

    const availableStaff = staffMembers.filter(staff =>
        !accounts.some(account => account.staffID === staff.id)
    );

    select.innerHTML = '<option value="">Select staff member</option>';

    availableStaff.forEach(staff => {
        const option = document.createElement("option");

        option.value = staff.id;
        option.textContent =
            `${staff.id} - ${staff.name} (${staff.position})`;

        select.appendChild(option);
    });
}

function displayAccounts() {
    const container = document.getElementById("accountList");

    if (!container) return;

    const accounts = getAccounts();

    if (accounts.length === 0) {
        container.innerHTML = "<p>No accounts registered yet.</p>";
        return;
    }

    container.innerHTML = accounts.map(account => `
        <div class="account-card">
            <p><strong>Name:</strong> ${escapeHTML(account.staffName)}</p>
            <p><strong>Username:</strong> ${escapeHTML(account.username)}</p>
            <p><strong>Role:</strong> ${escapeHTML(account.role)}</p>
            <p><strong>Staff ID:</strong> ${escapeHTML(account.staffID)}</p>
        </div>
    `).join("");
}

document.addEventListener("DOMContentLoaded", initializeAccountsPage);
