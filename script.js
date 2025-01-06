// Function to create the list of items with radio buttons
function createItemList(items) {
    const itemList = document.getElementById("item-list");

    items.forEach((item, index) => {
        const itemDiv = document.createElement("div");
        itemDiv.classList.add("item");

        const itemLabel = document.createElement("span");
        itemLabel.innerText = item;

        // Create radio buttons for each option and set default to 'Have'
        const haveRadio = createRadioButton(item, index, 'Have', true); // default "Have"
        const costcoRadio = createRadioButton(item, index, 'Costco');
        const harrisRadio = createRadioButton(item, index, 'Harris Teeter');

        // Grouping radio buttons for each item in one row
        const radioGroup = document.createElement("div");
        radioGroup.classList.add("radio-group");
        radioGroup.appendChild(haveRadio);
        radioGroup.appendChild(costcoRadio);
        radioGroup.appendChild(harrisRadio);

        // Append label and radio buttons to the item container
        itemDiv.appendChild(itemLabel);
        itemDiv.appendChild(radioGroup);

        itemList.appendChild(itemDiv);
    });
}

// Helper function to create a radio button
function createRadioButton(item, index, value, isChecked = false) {
    const label = document.createElement("label");
    label.innerText = value;

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = `status_${index}`; // Ensure all radio buttons for this item are grouped
    radio.value = value;
    radio.id = `${item}_${value}`;
    if (isChecked) {
        radio.checked = true; // Set default value as "Have"
    }

    radio.addEventListener('change', function() {
        // Update the status whenever a radio button is selected
        updateItemStatus(item, value);
    });

    const radioContainer = document.createElement("div");
    radioContainer.appendChild(radio);
    radioContainer.appendChild(label);

    return radioContainer;
}

// Function to update the status of each item
function updateItemStatus(item, value) {
    // Store the selected status for each item in the local storage or another state management
    let savedData = JSON.parse(localStorage.getItem("itemStatus")) || {};

    // Update the status of the item in savedData
    savedData[item] = value;

    // Save back to local storage
    localStorage.setItem("itemStatus", JSON.stringify(savedData));
}

// Function to fetch and parse CSV file
function fetchItems() {
    fetch('items.csv')
        .then(response => response.text())
        .then(csvData => {
            // Parse the CSV data using PapaParse
            Papa.parse(csvData, {
                complete: function(results) {
                    // Extract items from the first column (assuming the first column contains the items)
                    const items = results.data.map(row => row[0]);
                    createItemList(items); // Call the function to create the item list
                }
            });
        })
        .catch(error => {
            console.error("Error fetching the CSV file:", error);
        });
}

// Function to save selected items into CSV files
function saveChanges() {
    const savedData = JSON.parse(localStorage.getItem("itemStatus")) || {};
    const costcoItems = [];
    const harrisTeeterItems = [];

    // Loop through savedData and separate the items based on their status
    for (const item in savedData) {
        if (savedData[item] === 'Costco') {
            costcoItems.push(item);
        } else if (savedData[item] === 'Harris Teeter') {
            harrisTeeterItems.push(item);
        }
    }

    // Convert the arrays to CSV format
    const costcoCsv = convertToCsv(costcoItems);
    const harrisTeeterCsv = convertToCsv(harrisTeeterItems);

    // Create downloadable CSV files
    downloadCsv('costco.csv', costcoCsv);
    downloadCsv('harris_teeter.csv', harrisTeeterCsv);
}

// Function to convert an array of items to CSV format
function convertToCsv(items) {
    let csv = 'Item\n'; // Adding header
    items.forEach(item => {
        csv += `${item}\n`;
    });
    return csv;
}

// Function to trigger the download of a CSV file
function downloadCsv(filename, csvContent) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) { // Feature detection
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Wait for the DOM to load before fetching items
document.addEventListener("DOMContentLoaded", fetchItems);

// Add an event listener for the "Save Changes" button
document.getElementById("save-button").addEventListener("click", saveChanges);
