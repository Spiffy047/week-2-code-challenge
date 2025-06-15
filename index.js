
// 1. DOM Elements Selection
// We select all the necessary HTML elements by their IDs.
// This makes it easier to access and manipulate them in the JavaScript code.
const addGuestForm = document.getElementById('addGuestForm'); // The form to add guests
const guestNameInput = document.getElementById('guestName'); // Input field for guest name
const guestListUl = document.getElementById('guestList'); // The unordered list where guests will be displayed
const guestCountSpan = document.getElementById('guestCount'); // Span to display current guest count
const messageBox = document.getElementById('messageBox'); // The notification message box
const messageText = document.getElementById('messageText'); // Text content within the message box

// 2. Application State Variables
// The guests array starts empty. Guests will only appear
// on the page after they are submitted through the form.
let guests = [];
const MAX_GUESTS = 10; // Constant for the maximum number of guests allowed.

// 3. Utility Function: showMessage()
/**
 * Displays a custom message box at the top of the screen.
 * This is used for user feedback (e.g., success, error, info messages).
 * @param {string} message - The text content to display in the message box.
 * @param {'success' | 'error' | 'info'} type - The type of message, which determines its styling (color).
 * @param {number} duration - How long the message should be visible in milliseconds (default to 3 seconds).
 */
function showMessage(message, type = 'info', duration = 3000) {
    messageText.textContent = message; // Set the message text
    // Apply appropriate CSS classes based on the message type to style it.
    // The 'show' class makes it visible, and type (e.g., 'success') adds color.
    messageBox.className = `message-box show ${type}`;
    messageBox.classList.remove('hidden'); // Ensure the message box is visible

    // Set a timeout to hide the message box after the specified duration.
    setTimeout(() => {
        messageBox.classList.remove('show'); // Fade out
        messageBox.classList.add('hidden'); // Hide completely
    }, duration);
}

// 4. Core Rendering Function: renderGuests()
/**
 * Renders (or re-renders) the entire guest list in the DOM based on the 'guests' array.
 * This function is called whenever the 'guests' array is modified (add, remove, toggle).
 */
function renderGuests() {
    guestListUl.innerHTML = ''; // Clear all existing guest list items to avoid duplicates.
    guestCountSpan.textContent = guests.length; // Update the guest count display.

    // If there are no guests, display a friendly message.
    if (guests.length === 0) {
        const emptyMessage = document.createElement('li'); // Create a new list item element
        emptyMessage.className = 'empty-list-message'; // Apply styling for empty message
        emptyMessage.textContent = 'No guests added yet. Start by adding one!'; // Set message text
        guestListUl.appendChild(emptyMessage); // Add to the guest list
        return; // Exit the function
    }

    // Iterate over each guest in the 'guests' array to create their corresponding DOM elements.
    guests.forEach(guest => {
        const listItem = document.createElement('li'); // Create a list item for each guest
        listItem.id = `guest-${guest.id}`; // Assign a unique ID to the list item for easy reference
        listItem.className = 'guest-list-item'; // Apply styling for list item

        // Create a div for guest information (name)
        const guestInfo = document.createElement('div');
        guestInfo.className = 'guest-info';

        const guestNameElement = document.createElement('span'); // Span for guest's name
        guestNameElement.textContent = guest.name;
        guestInfo.appendChild(guestNameElement);

        // Create a div for action buttons (RSVP, Remove)
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'actions-div';

        // Create and configure the RSVP Toggle Button
        const toggleRsvpBtn = document.createElement('button');
        toggleRsvpBtn.textContent = guest.status === 'Attending' ? 'Attending' : 'Not Attending';
        // Dynamically apply CSS classes for RSVP status styling.
        toggleRsvpBtn.className = `button rsvp ${guest.status === 'Attending' ? 'status-attending' : 'status-not-attending'}`;
        // Add an event listener to toggle RSVP status when clicked.
        toggleRsvpBtn.addEventListener('click', () => toggleRsvp(guest.id));

        // Create and configure the Remove Button
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.className = 'button remove'; // Apply styling for remove button
        // Add an event listener to remove the guest when clicked.
        removeBtn.addEventListener('click', () => removeGuest(guest.id));

        actionsDiv.appendChild(toggleRsvpBtn);
        actionsDiv.appendChild(removeBtn);

        listItem.appendChild(guestInfo);
        listItem.appendChild(actionsDiv);

        
        guestListUl.appendChild(listItem);
    });
}

// 5. Event Listener: Add Guest Form Submission
/**
 * Handles the submission of the "Add Guest" form.
 * This function prevents default form behavior (page reload) and adds a new guest.
 */
addGuestForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent the browser from reloading the page on form submission.

    const guestName = guestNameInput.value.trim(); // Get guest name and remove leading/trailing whitespace.

    // Input validation: Check if guest name is empty.
    if (guestName === '') {
        showMessage('Please enter a guest name.', 'error');
        return; // Stop execution if validation fails.
    }

    // Limit check: Ensure guest list does not exceed MAX_GUESTS.
    if (guests.length >= MAX_GUESTS) {
        showMessage(`Guest list limit of ${MAX_GUESTS} reached! Cannot add more guests.`, 'error');
        return; // Stop execution if limit is reached.
    }

    // Create a new guest object with a unique ID, name, default status.
    const newGuest = {
        id: crypto.randomUUID(), // Generates a universally unique identifier (UUID) for the guest.
        name: guestName,
        status: 'Attending', // Default RSVP status
    };

    guests.push(newGuest); // Add the new guest object to the 'guests' array.
    renderGuests(); // Re-render the guest list to show the newly added guest.
    guestNameInput.value = ''; // Clear the guest name input field.
    showMessage('Guest added successfully!', 'success'); // Show a success message.
});

// 6. Action Function: removeGuest()
/**
 * Removes a guest from the list based on their unique ID.
 * @param {string} id - The ID of the guest to be removed.
 */
function removeGuest(id) {
    // Filter out the guest with the matching ID, effectively removing them from the array.
    guests = guests.filter(guest => guest.id !== id);
    renderGuests(); // Re-render the guest list to reflect the removal.
    showMessage('Guest removed.', 'info'); // Show an informational message.
}

// 7. Action Function: toggleRsvp()
/**
 * Toggles the RSVP status of a guest between 'Attending' and 'Not Attending'.
 * @param {string} id - The ID of the guest whose RSVP status is to be toggled.
 */
function toggleRsvp(id) {
    // Find the index of the guest in the 'guests' array.
    const guestIndex = guests.findIndex(guest => guest.id === id);
    if (guestIndex > -1) { // Check if the guest was found
        // Toggle the status: if 'Attending', change to 'Not Attending', otherwise change to 'Attending'.
        guests[guestIndex].status = guests[guestIndex].status === 'Attending' ? 'Not Attending' : 'Attending';
        renderGuests(); // Re-render the guest list to update the status display.
        showMessage(`Guest RSVP changed to '${guests[guestIndex].status}'.`, 'info'); // Show confirmation.
    }
}

// 8. Initial Render
// This function call ensures that the guest list is rendered when the page first loads.
// Since 'guests' array starts empty, it will display the "No guests added yet" message initially.
renderGuests();
