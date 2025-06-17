// 1. DOM Elements Selection

const addGuestForm = document.getElementById('addGuestForm'); // The form used to add new guests
const guestNameInput = document.getElementById('guestName'); // The input field for the guest's name
const guestCategoryInput = document.getElementById('guestCategory'); // The input/select for guest category
const guestListUl = document.getElementById('guestList'); // The unordered list (<ul>) where guest items will be displayed
const guestCountSpan = document.getElementById('guestCount'); // A <span> element to display the total number of guests
const messageBox = document.getElementById('messageBox'); // The container for temporary user messages (e.g., success/error)
const messageText = document.getElementById('messageText'); // The <span> inside messageBox where the actual message text goes
const searchInput = document.getElementById('searchInput'); // The input field for filtering/searching guests

// 2. Application State Variables
// These variables define the core data and configuration that the application manages.
let guests = []; // The main array holding all guest objects. Each guest is an object.
const MAX_GUESTS = 10; 
let currentFilter = ''; 

const createElement = (tag, classes = [], textContent = '', attributes = {}) => {
    const el = document.createElement(tag);
    if (classes.length) el.classList.add(...classes); 
    if (textContent) el.textContent = textContent;
    for (const key in attributes) {
        el.setAttribute(key, attributes[key]);
    }
    return el; 
};

// 3. Utility Function: showMessage()
function showMessage(message, type = 'info', duration = 3000) {
    messageText.textContent = message; 
    messageBox.className = `message-box show ${type}`;
    messageBox.classList.remove('hidden'); 
    setTimeout(() => {
        messageBox.classList.remove('show'); 
        messageBox.classList.add('hidden'); 
    }, duration);
}

// 4. Core Rendering Function: renderGuests()
function renderGuests() {
    guestListUl.innerHTML = ''; 
    guestCountSpan.textContent = guests.length; 
    const filteredGuests = guests.filter(guest => {
        const searchTerm = currentFilter.toLowerCase();
        return guest.name.toLowerCase().includes(searchTerm) ||
               guest.category.toLowerCase().includes(searchTerm);
    });

    // If no guests are found after filtering 
    if (filteredGuests.length === 0) {
        const msg = guests.length === 0 ?
            'No guests added yet. Start by adding one!' :
            'No guests found matching your search criteria.'; 
        guestListUl.appendChild(createElement('li', ['empty-list-message'], msg));
        return;
    }

    // Iterate over the filtered guests and create/append their HTML representation
    filteredGuests.forEach(guest => {
        // Destructure guest object properties for easier access
        const { id, name, status, category, timestamp } = guest;
        const listItem = createElement('li', ['guest-list-item'], '', { id: `guest-${id}` });

        // a span to display the guest's name
        const guestNameDisplay = createElement('span', ['guest-name-display'], name);
        const categoryTag = createElement('span', ['category-tag', `category-${category.toLowerCase()}`], category);
        const timestampSpan = createElement('span', [], `Added: ${new Date(timestamp).toLocaleString()}`);
        const guestMeta = createElement('div', ['guest-meta']);
        guestMeta.append(categoryTag, timestampSpan);

        // Group guest name and info
        const guestInfo = createElement('div', ['guest-info']);
        guestInfo.append(guestNameDisplay, guestMeta);

        //RSVP toggle button
        const toggleRsvpBtn = createElement('button', ['button', 'rsvp', `status-${status.toLowerCase().replace(' ', '-')}`], status);
        toggleRsvpBtn.addEventListener('click', () => toggleRsvp(id));

        // Edit button
        const editBtn = createElement('button', ['button', 'edit'], 'Edit');
        editBtn.addEventListener('click', () => editGuest(id, guestNameDisplay));

        //Remove button
        const removeBtn = createElement('button', ['button', 'remove'], 'Remove');
        removeBtn.addEventListener('click', () => removeGuest(id));

        const actionsDiv = createElement('div', ['actions-div']);
        actionsDiv.append(toggleRsvpBtn, editBtn, removeBtn);

        
        listItem.append(guestInfo, actionsDiv);
        guestListUl.appendChild(listItem);
    });
}


// 5. Event Listener:Guest Form Submission
addGuestForm.addEventListener('submit', (event) => {
    event.preventDefault(); 

    const guestName = guestNameInput.value.trim(); 
    const guestCategory = guestCategoryInput.value; 
    if (!guestName) {
        showMessage('Please enter a guest name.', 'error'); 
        return; // Stop the function execution
    }

    // Check if the guest list has reached its maximum allowed limit
    if (guests.length >= MAX_GUESTS) {
        showMessage(`Guest list limit of ${MAX_GUESTS} reached! Cannot add more guests.`, 'error');
        return; 
    }

    // new guest object with a unique ID, default status, and timestamp
    const newGuest = {
        id: crypto.randomUUID(), // Generates a universally unique identifier for the guest
        name: guestName,
        status: 'Attending',
        category: guestCategory,
        timestamp: new Date().toISOString() 
    };

    guests.push(newGuest); 
    renderGuests(); 
    guestNameInput.value = ''; 
    showMessage('Guest added successfully!', 'success'); 
});

// 6. Action Function: removeGuest()
function removeGuest(id) {
    guests = guests.filter(guest => guest.id !== id);
    renderGuests(); 
    showMessage('Guest removed.', 'info'); 
}

// 7. Action Function: toggleRsvp()
function toggleRsvp(id) {
    const guest = guests.find(g => g.id === id); 
    if (guest) { 
        guest.status = guest.status === 'Attending' ? 'Not Attending' : 'Attending';
        renderGuests(); 
        showMessage(`Guest RSVP changed to '${guest.status}'.`, 'info'); 
    }
}

// 8. Action Function: editGuest()
function editGuest(id, guestNameDisplayElement) {
    const guest = guests.find(g => g.id === id); // Find the guest object by its ID
    if (!guest) return; 
    const listItem = document.getElementById(`guest-${id}`);
    const actionsDiv = listItem.querySelector('.actions-div');

    const editInputField = createElement('input', ['input-field', 'edit-guest-input'], '', { type: 'text', value: guest.name });
    const saveBtn = createElement('button', ['button', 'save'], 'Save');
    guestNameDisplayElement.replaceWith(editInputField);
    actionsDiv.innerHTML = '';
    actionsDiv.append(saveBtn);

    editInputField.focus();

    // Inner function to handle saving the changes after editing
    const saveChanges = () => {
        const newName = editInputField.value.trim(); 
        if (!newName) { 
            showMessage('Guest name cannot be empty.', 'error');
            editInputField.focus(); 
            return; 
        }
        guest.name = newName; 
        renderGuests(); 
                       
        showMessage('Guest name updated successfully!', 'success'); 
    };

    //event listeners to trigger `saveChanges()`
    saveBtn.addEventListener('click', saveChanges); 
    editInputField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { 
            saveChanges();
        }
    });
}

// 9. Search Functionality

searchInput.addEventListener('input', (event) => {
    currentFilter = event.target.value; 
    renderGuests(); 
});

renderGuests();
